import { defineConfig, devices } from "@playwright/test";

/**
 * Dedicated visual-regression config — the full 7-screen x 2-viewport x
 * 2-theme matrix (plus the Feedback correct/incorrect variants). Kept as
 * its own command (`npm run test:visual`) rather than folded into normal
 * CI: running the complete cross-browser visual matrix on every small
 * commit would meaningfully slow ordinary CI for marginal benefit, since
 * visual regression is only meant to answer "did the approved design
 * unexpectedly change," not "does every commit still build" (that's
 * covered by the faster typecheck/unit/E2E-smoke steps in the normal CI
 * config). Chromium only, deliberately: cross-browser rendering
 * differences would otherwise produce false-positive diffs unrelated to
 * an actual design regression. See docs/design-system/TESTING-STRATEGY.md.
 */
export default defineConfig({
  testDir: "tests/frontend/visual",
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5173"
  },
  projects: [{ name: "chromium-visual", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
