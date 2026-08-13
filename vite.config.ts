import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: /^lodash$/, replacement: "lodash-es" },
      { find: /^lodash\/(.*)$/, replacement: "lodash-es/$1" },
      {
        find: "eventemitter3",
        replacement: path.resolve(__dirname, "./eventemitter3-shim.js"),
      },
    ],
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
    minify: false,
    commonjsOptions: {
      transformMixedEsModules: true,
      requireReturnsDefault: "auto",
      include: [/eventemitter3/, /node_modules/],
    },
  },
});