import { defineConfig, devices } from "@playwright/test";

/**
 * Normal CI-scoped Playwright config: functional E2E smoke + accessibility
 * checks, Chromium + Firefox. Deliberately excludes the full visual-
 * regression matrix — see playwright.visual.config.ts and the Phase 5B
 * report's CI section for why they're kept separate.
 */
export default defineConfig({
  testDir: "tests/frontend/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } }
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
