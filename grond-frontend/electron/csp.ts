/**
 * CSP policy builder for Grond Electron.
 * Extracted from main.ts so it can be unit-tested independently.
 */

export function buildCSP(isDev: boolean, apiOrigin: string): string {
  if (isDev) {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' http://localhost:* https://*",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
    ].join("; ");
  }

  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `connect-src 'self' ${apiOrigin}`,
    "img-src 'self' data:",
    "font-src 'self' data:",
  ].join("; ");
}

/**
 * Validates that VITE_API_URL is present in production builds.
 * Throws if missing — called from electron.vite.config.ts at build time.
 */
export function validateApiUrl(apiUrl: string | undefined): asserts apiUrl is string {
  if (!apiUrl) {
    throw new Error(
      "VITE_API_URL is not set for production build. " +
        "Add it to .env.production, e.g.: VITE_API_URL=http://localhost:8000",
    );
  }
}
