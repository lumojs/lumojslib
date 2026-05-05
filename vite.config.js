import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "lumo",
      formats: ["iife", "es"],
      fileName: (format) =>
        format === "es" ? "lumo.esm.js" : "lumo.min.js"
    },
    rollupOptions: {
      output: {
        extend: true,
        globals: {}
      }
    },
    minify: "terser"
  }
});