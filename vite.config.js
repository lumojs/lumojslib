import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "lumo", // 👈 global name
      formats: ["iife", "es"], // CDN + modern दोनों
      fileName: (format) => `lumo.${format}.js`
    },
    rollupOptions: {
      output: {
        extend: true
      }
    },
    minify: "terser" // 👈 CDN के लिए minified build
  }
});