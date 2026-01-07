import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    host: true,
  },
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure CSS is properly extracted and minified
    cssCodeSplit: true,
    cssMinify: true,
    // Generate manifest for better caching
    manifest: true,
  },
});
