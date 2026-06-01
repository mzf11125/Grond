/**
 * Grond Electron — Main Process
 *
 * ┌─────────────────────────────────────────────────┐
 * │                   MAIN (Node.js)                │
 * │  ┌─────────────┐     ┌──────────────────────┐   │
 * │  │ BrowserWindow│────▶│ onHeadersReceived    │   │
 * │  │ creation     │     │ → CSP injection      │   │
 * │  │ 1280×800    │     │ → VITE_API_URL only   │   │
 * │  └──────┬──────┘     └──────────────────────┘   │
 * │         │                                       │
 * │  ┌──────▼──────┐     ┌──────────────────────┐   │
 * │  │ preload.js  │     │ app lifecycle         │   │
 * │  │ contextBridge│    │ ready / closed /      │   │
 * │  │ (empty)     │     │ activate              │   │
 * │  └──────┬──────┘     └──────────────────────┘   │
 * └─────────┼───────────────────────────────────────┘
 *           │  contextBridge
 * ┌─────────▼───────────────────────────────────────┐
 * │               PRELOAD (sandboxed)               │
 * │  window.grond = {}  (empty, reserved for IPC)    │
 * └─────────┬───────────────────────────────────────┘
 *           │  DOM / window
 * ┌─────────▼───────────────────────────────────────┐
 * │              RENDERER (React + Vite)            │
 * │  BrowserRouter  │  fetch(VITE_API_URL/...)     │
 * │  All Grond UI   │  CSP-enforced boundaries     │
 * └─────────────────────────────────────────────────┘
 */

import { app, shell, BrowserWindow, session, protocol, net } from "electron";
import { join } from "path";
import { buildCSP } from "./csp";

// Register custom app:// protocol so BrowserRouter works with local files.
// Must be called BEFORE app.whenReady().
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

// In dev/CI, restrict Electron to a single OS process.
// This avoids GPU process spawn failures on machines without
// hardware GPU drivers (headless servers, containers, VMs).
// Production packaging uses the full multi-process model.
if (!app.isPackaged || process.env["CI"]) {
  app.commandLine.appendSwitch("single-process");
  app.commandLine.appendSwitch("disable-dev-shm-usage");
  app.commandLine.appendSwitch("no-sandbox");
}

const isDev = !app.isPackaged;

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Grond — Evidence-First OSINT Platform",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, "../preload/preload.mjs"),
    },
  });

  const apiOrigin = process.env["VITE_API_URL"] || "http://localhost:8000";

  // CSP: strict in prod, permissive in dev (Vite needs unsafe-eval for HMR)
  const csp = buildCSP(isDev, apiOrigin);

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [csp],
      },
    });
  });

  mainWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription) => {
      console.error(
        `[grond] Renderer failed to load: ${errorCode} — ${errorDescription}`,
      );
    },
  );

  // Open external URLs in the system browser (not inside Electron)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:") || url.startsWith("http:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  if (isDev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadURL("app://renderer/index.html");
  }
}

app.whenReady().then(() => {
  // Map app://renderer/ → out/renderer/ directory
  const rendererDir = join(__dirname, "../renderer");
  protocol.handle("app", (request) => {
    const urlPath = request.url.replace("app://renderer", "");
    return net.fetch("file://" + join(rendererDir, urlPath || "index.html"));
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
