import { defineConfig, devices } from "@playwright/test";
import { TEST_BASE_URL, TEST_PORT } from "./tests/frontend/test-server";

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
 *
 * Same dedicated-test-port + server-identity strategy as playwright.config.ts
 * (Phase 10B-1 port-collision fix) — see test-server.ts / global-setup.ts.
 */
export default defineConfig({
  testDir: "tests/frontend/visual",
  fullyParallel: false,
  // HTML report only in CI (Phase 8A) — a browsable artifact for
  // diagnosing a visual-diff failure without re-running locally; the
  // per-test actual/expected/diff PNGs Playwright already writes to
  // test-results/ on any failure need no extra reporter config.
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  globalSetup: "./tests/frontend/global-setup.visual.ts",
  use: {
    baseURL: TEST_BASE_URL
  },
  projects: [{ name: "chromium-visual", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // QA fixtures explicitly enabled — every screen in this suite is
    // reached via the Prototype/QA switcher (product-environment
    // follow-up: see docs/architecture/PRODUCT-ENVIRONMENT-FOLLOW-UP.md).
    command: `VITE_PORT=${TEST_PORT} VITE_ENABLE_QA_FIXTURES=true npm run dev`,
    url: TEST_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
