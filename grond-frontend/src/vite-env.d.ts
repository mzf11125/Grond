/// <reference types="vite/client" />

// Fix for React Bits Pro components that use NodeJS namespace
declare namespace NodeJS {
  type Timeout = ReturnType<typeof setTimeout>;
  type Timer = ReturnType<typeof setInterval>;
}

// Electron preload IPC bridge (reserved for future use)
declare global {
  interface Window {
    grond: Record<string, never>;
  }
}
