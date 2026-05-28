/**
 * Grond Electron — Preload Script
 *
 * This file runs in a sandboxed context with access to a subset of
 * Node.js APIs via `contextBridge`. It is the ONLY bridge between
 * the renderer (React) and the main process (Node.js).
 *
 * Currently empty — no IPC methods are needed. The renderer communicates
 * with the Grond backend exclusively over HTTP via fetch().
 *
 * When IPC is needed (e.g., native file dialogs, OS notifications, or
 * spawning local tool processes), add methods here:
 *
 *   contextBridge.exposeInMainWorld("grond", {
 *     openFile: () => ipcRenderer.invoke("dialog:openFile"),
 *     getVersion: () => ipcRenderer.invoke("app:getVersion"),
 *   })
 *
 * Then declare the types in `src/vite-env.d.ts`:
 *
 *   declare global {
 *     interface Window {
 *       grond: { openFile(): Promise<string>; ... }
 *     }
 *   }
 */

import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("grond", {
  // Reserved for future IPC methods
});
