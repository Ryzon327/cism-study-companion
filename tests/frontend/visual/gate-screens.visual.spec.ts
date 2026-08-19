import { test, expect } from "@playwright/test";

/**
 * Visual Prototype Gate — docs/design-system/TESTING-STRATEGY.md.
 *
 * Generates the baseline screenshots for the seven required screens
 * (Feedback exposed as its two required correct/incorrect variants) across
 * desktop + mobile and light + dark: 8 screens x 2 viewports x 2 themes =
 * 32 screenshots. Screens are reached via the QA-only prototype switcher,
 * never via product navigation — see App.tsx / PrototypeSwitcher.tsx.
 *
 * IMPORTANT: a passing screenshot comparison only proves the design did
 * not unexpectedly change since the last approved baseline. It does NOT
 * prove the design is good. Phase 5B requires a human visual review of
 * these images before approval — see the Phase 5B report.
 */

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 }
} as const;

const SCREENS: { id: string; label: string; heading: RegExp | string }[] = [
  { id: "home", label: "Home / Today", heading: /Residual risk and treatment decisions/ },
  { id: "daily-study-learn", label: "Daily Study — Learn", heading: "Residual risk" },
  { id: "question-apply", label: "Question / Apply", heading: /What should happen NEXT/ },
  { id: "feedback-correct", label: "Feedback — Correct", heading: "Correct" },
  { id: "feedback-incorrect", label: "Feedback — Incorrect", heading: "Repair the reasoning" },
  { id: "daily-study-completion", label: "Daily Study Completion", heading: /Today's study is complete/ },
  { id: "practice-exam", label: "Practice Exam", heading: "4 / 12" },
  { id: "review-center", label: "Review Center", heading: "Review what matters before you submit." }
];

for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
  for (const theme of ["light", "dark"] as const) {
    test.describe(`${viewportName} / ${theme}`, () => {
      test.use({ viewport });

      for (const screen of SCREENS) {
        test(`${screen.id}`, async ({ page }) => {
          await page.goto("/");
          if (theme === "dark") {
            const current = await page.locator("html").getAttribute("data-theme");
            if (current !== "dark") {
              await page.getByRole("button", { name: /Switch to dark mode/ }).click();
            }
          }
          if (screen.id !== "home") {
            await page.locator(".prototype-switcher-trigger").click();
            await page.getByRole("button", { name: screen.label }).click();
          }
          await expect(page.getByText(screen.heading).first()).toBeVisible();
          // The QA-only prototype switcher is fixed-position tooling, not
          // part of the design under review — and Playwright's full-page
          // capture "freezes" fixed elements at one stitched position,
          // which can visually collide with unrelated content further down
          // a tall page. Hide it for the screenshot only; it stays fully
          // present for interactive use and the smoke/a11y suites.
          await page.locator(".prototype-switcher").evaluate((el) => {
            (el as HTMLElement).style.display = "none";
          });
          await expect(page).toHaveScreenshot(`${screen.id}--${viewportName}--${theme}.png`, {
            fullPage: true
          });
        });
      }
    });
  }
}
