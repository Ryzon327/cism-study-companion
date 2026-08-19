import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// Deliberately separate from vite.config.ts (whose `root: "app"` is for the
// dev server/build only). Vitest needs to discover tests under
// tests/frontend/unit, outside app/, so it gets its own root-level config.
export default defineConfig({
  plugins: [preact()],
  test: {
    environment: "jsdom",
    include: ["tests/frontend/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/frontend/setup.ts"],
    globals: false
  }
});
