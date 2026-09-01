import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plain .mjs avoids Vite writing vite.config.ts.timestamp-*.mjs (helps with EPERM on Windows).
export default defineConfig({
  // Absolute base so /staff-dashboard/* loads /assets/* (relative ./assets breaks SPA deep links).
  base: "/",

  cacheDir: path.resolve(__dirname, "node_modules/.vite"),
  server: {
    host: true,
    port: 8080,
    strictPort: false,
    hmr: {
      clientPort: 8080,
    },
    allowedHosts: [
      "craniometric-nonmentally-julee.ngrok-free.dev",
      ".ngrok-free.dev",
      ".ngrok.io",
      ".ngrok.app",
      "localhost",
    ],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
