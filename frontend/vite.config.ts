import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // Base public path when served in production
  // Use './' for relative paths (works in subdirectories)
  // Use '/' for absolute paths (root domain)
  base: "./",
  server: {
    port: 3000,
    host: true,
  },
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure assets are generated with relative paths
    assetsDir: "assets",
    // Generate manifest for better caching
    manifest: true,
    // Ensure CSS is properly extracted
    cssCodeSplit: true,
  },
});
