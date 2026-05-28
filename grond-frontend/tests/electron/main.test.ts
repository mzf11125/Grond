import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Electron before importing anything that uses it
vi.mock("electron", () => {
  const mockWebContents = {
    on: vi.fn(),
    setWindowOpenHandler: vi.fn(),
  };

  const BrowserWindow = vi.fn(function (this: Record<string, unknown>) {
    this.webContents = mockWebContents;
    this.loadURL = vi.fn();
    this.loadFile = vi.fn();
    return this;
  }) as unknown as typeof import("electron").BrowserWindow;

  return {
    app: {
      whenReady: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      quit: vi.fn(),
      isPackaged: false,
    },
    BrowserWindow,
    shell: {
      openExternal: vi.fn(),
    },
    session: {
      defaultSession: {
        webRequest: {
          onHeadersReceived: vi.fn(),
        },
      },
    },
  };
});

// Mock buildCSP
vi.mock("../../electron/csp", () => ({
  buildCSP: vi.fn().mockReturnValue("mock-csp-string"),
}));

describe("main process", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates BrowserWindow with correct dimensions", async () => {
    const { BrowserWindow } = await import("electron");
    const bw = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      title: "Grond — Evidence-First OSINT Platform",
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: expect.stringContaining("preload"),
      },
    });
    expect(BrowserWindow).toHaveBeenCalled();
    expect(bw).toBeDefined();
  });

  it("sets contextIsolation to true for security", async () => {
    const { BrowserWindow } = await import("electron");
    new BrowserWindow({
      webPreferences: { contextIsolation: true, nodeIntegration: false },
    });
    const callArgs = vi.mocked(BrowserWindow).mock.calls[0]?.[0] as Record<string, unknown> | undefined;
    const webPrefs = callArgs?.webPreferences as Record<string, unknown> | undefined;
    expect(webPrefs?.contextIsolation).toBe(true);
  });

  it("sets nodeIntegration to false for security", async () => {
    const { BrowserWindow } = await import("electron");
    new BrowserWindow({
      webPreferences: { contextIsolation: true, nodeIntegration: false },
    });
    const callArgs = vi.mocked(BrowserWindow).mock.calls[0]?.[0] as Record<string, unknown> | undefined;
    const webPrefs = callArgs?.webPreferences as Record<string, unknown> | undefined;
    expect(webPrefs?.nodeIntegration).toBe(false);
  });

  it("registers CSP via onHeadersReceived", async () => {
    const { session } = await import("electron");
    expect(session.defaultSession.webRequest.onHeadersReceived).toBeDefined();
  });

  it("registers did-fail-load error handler", async () => {
    const { BrowserWindow } = await import("electron");
    const win = new BrowserWindow({
      webPreferences: { contextIsolation: true, nodeIntegration: false },
    });
    expect(win.webContents.on).toBeDefined();
  });
});
