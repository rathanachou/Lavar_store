import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
    "process.env": {},             
  },
  optimizeDeps: {
    include: [
      "axios",
      "recharts",
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
    ],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true, 
    },
  },
});