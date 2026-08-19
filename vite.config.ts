import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// Root is app/ so the existing prototype's root-level index.html is never
// touched or shadowed by the new build. The new app has its own entry at
// app/index.html. See docs/design-system/ and the Phase 5A decision.
export default defineConfig({
  root: "app",
  plugins: [preact()],
  build: {
    outDir: "../dist",
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
});
