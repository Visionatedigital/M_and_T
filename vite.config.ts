import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Allow external connections
    port: 8080,
    strictPort: false,
    hmr: {
      clientPort: 8080,
    },
    // Explicitly allow ngrok domains
    allowedHosts: [
      'craniometric-nonmentally-julee.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io',
      '.ngrok.app',
      'localhost',
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
