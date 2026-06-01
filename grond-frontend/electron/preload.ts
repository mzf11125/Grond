/**
 * Grond Electron — Preload Script
 *
 * This file runs in a sandboxed context. No ESM imports allowed.
 * Uses Electron's global `contextBridge` (available in preload scope).
 *
 * Currently empty — no IPC methods needed. The renderer communicates
 * with the Grond backend exclusively over HTTP via fetch().
 *
 * When IPC is needed, add:
 *   contextBridge.exposeInMainWorld("grond", { ... })
 *
 * Then declare types in `src/vite-env.d.ts`:
 *   interface Window { grond: { ... } }
 */

// contextBridge is available as a global in the preload sandbox
// No imports needed — keep this file ESM-import-free for sandbox compat

