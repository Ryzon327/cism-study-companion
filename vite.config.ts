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
    // VITE_PORT lets Playwright (playwright.config.ts / playwright.visual.config.ts)
    // launch this same dev server on a dedicated test port (5183) instead
    // of the normal developer port — Phase 10B-1 port-collision fix: an
    // unrelated already-running dev server on 5173 must never be mistaken
    // for this app during automated browser testing. Plain `npm run dev`
    // is unaffected and still binds 5173 by default.
    port: Number(process.env.VITE_PORT) || 5173
  }
});
