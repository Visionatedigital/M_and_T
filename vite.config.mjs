import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plain .mjs avoids Vite writing vite.config.ts.timestamp-*.mjs (helps with EPERM on Windows).
export default defineConfig(({ mode }) => ({
  // Required for Electron: loadFile("dist/index.html") uses file:// — absolute "/assets/..." would break.
  base: "./",
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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
