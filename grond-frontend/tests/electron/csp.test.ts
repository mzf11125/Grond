import { describe, it, expect } from "vitest";
import { buildCSP, validateApiUrl } from "../../electron/csp";

describe("buildCSP", () => {
  it("returns permissive CSP in dev mode", () => {
    const csp = buildCSP(true, "http://localhost:8000");
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("http://localhost:*");
    expect(csp).toContain("https://*");
  });

  it("returns strict CSP in prod mode", () => {
    const csp = buildCSP(false, "http://localhost:8000");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("http://localhost:*");
    expect(csp).not.toContain("https://*");
  });

  it("includes API origin in prod connect-src", () => {
    const csp = buildCSP(false, "https://api.grond.daemonprotocol.com");
    expect(csp).toContain("connect-src 'self' https://api.grond.daemonprotocol.com");
  });

  it("includes default API origin when no env var set", () => {
    const csp = buildCSP(false, "http://localhost:8000");
    expect(csp).toContain("connect-src 'self' http://localhost:8000");
  });

  it("dev CSP allows images from HTTPS origins", () => {
    const csp = buildCSP(true, "http://localhost:8000");
    expect(csp).toContain("img-src 'self' data: https:");
  });

  it("prod CSP restricts images to self + data only", () => {
    const csp = buildCSP(false, "http://localhost:8000");
    expect(csp).toContain("img-src 'self' data:");
    expect(csp).not.toContain("https:");
  });
});

describe("validateApiUrl", () => {
  it("does not throw when VITE_API_URL is set", () => {
    expect(() => validateApiUrl("http://localhost:8000")).not.toThrow();
  });

  it("throws when VITE_API_URL is undefined", () => {
    expect(() => validateApiUrl(undefined)).toThrow("VITE_API_URL is not set");
  });

  it("throws when VITE_API_URL is empty string", () => {
    expect(() => validateApiUrl("")).toThrow("VITE_API_URL is not set");
  });
});
