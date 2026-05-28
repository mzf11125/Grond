import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  // Build-time guard: fail early if VITE_API_URL is missing in production
  const env = loadEnv(mode, process.cwd(), "VITE_");
  if (mode === "production" && !env.VITE_API_URL) {
    throw new Error(
      "VITE_API_URL is not set for production build. " +
        "Add it to .env.production, e.g.: VITE_API_URL=http://localhost:8000",
    );
  }

  return {
    main: {
      envPrefix: "VITE_",
      build: {
        externalizeDeps: true,
        rollupOptions: {
          input: resolve(__dirname, "electron/main.ts"),
        },
      },
    },
    preload: {
      build: {
        externalizeDeps: true,
        rollupOptions: {
          input: resolve(__dirname, "electron/preload.ts"),
        },
      },
    },
    renderer: {
      root: __dirname,
      envPrefix: "VITE_",
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          "@": resolve(__dirname, "src"),
        },
      },
      build: {
        outDir: resolve(__dirname, "out/renderer"),
        rollupOptions: {
          input: resolve(__dirname, "index.html"),
        },
      },
    },
  };
});
