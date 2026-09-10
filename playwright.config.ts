import { defineConfig, devices } from "@playwright/test";
import { TEST_BASE_URL, TEST_PORT } from "./tests/frontend/test-server";

/**
 * Normal CI-scoped Playwright config: functional E2E smoke + accessibility
 * checks, Chromium + Firefox. Deliberately excludes the full visual-
 * regression matrix — see playwright.visual.config.ts and the Phase 5B
 * report's CI section for why they're kept separate.
 *
 * Runs the dev server on a DEDICATED TEST PORT (see test-server.ts), not
 * the normal developer port — Phase 10B-1 fix. `reuseExistingServer` (on
 * by default outside CI) happily reuses ANY server already answering on
 * the configured port, including an unrelated project's dev server left
 * running from earlier. A dedicated port makes that collision far less
 * likely; `globalSetup` additionally verifies the server answering there
 * is actually this app before any test runs, so a remaining collision
 * fails fast with a clear diagnosis instead of a wall of unrelated
 * failures.
 */
export default defineConfig({
  testDir: "tests/frontend/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  globalSetup: "./tests/frontend/global-setup.ts",
  use: {
    baseURL: TEST_BASE_URL,
    trace: "retain-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } }
  ],
  webServer: {
    command: `VITE_PORT=${TEST_PORT} npm run dev`,
    url: TEST_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
