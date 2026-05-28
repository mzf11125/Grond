import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { Plugin } from "vite";

function linkHeadersPlugin(): Plugin {
  return {
    name: "grond-link-headers",
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader(
          "Link",
          [
            '</apis.json>; rel="service-desc"; type="application/json"',
            '</openapi.yaml>; rel="service-desc"; type="application/yaml"',
            '</sitemap.xml>; rel="sitemap"; type="application/xml"',
          ].join(", "),
        );
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), linkHeadersPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
    allowedHosts: true,
  },
});
