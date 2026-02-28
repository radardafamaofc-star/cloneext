import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
<<<<<<< HEAD
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
=======
>>>>>>> e3fd1b4d313c26a6313701959086485dcf57776b

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
<<<<<<< HEAD
      "@shared": path.resolve(__dirname, "./shared"),
=======
>>>>>>> e3fd1b4d313c26a6313701959086485dcf57776b
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  server: {
<<<<<<< HEAD
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: "all",
=======
    host: "::",
    port: 8080,
>>>>>>> e3fd1b4d313c26a6313701959086485dcf57776b
  },
});
