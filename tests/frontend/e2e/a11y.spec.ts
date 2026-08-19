import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// @a11y
const SCREENS: { label: string; heading: RegExp | string }[] = [
  { label: "Home / Today", heading: /Residual risk and treatment decisions/ },
  { label: "Daily Study — Learn", heading: "Residual risk" },
  { label: "Question / Apply", heading: /What should happen NEXT/ },
  { label: "Feedback — Correct", heading: "Correct" },
  { label: "Feedback — Incorrect", heading: "Repair the reasoning" },
  { label: "Daily Study Completion", heading: /Today's study is complete/ },
  { label: "Practice Exam", heading: "4 / 12" },
  { label: "Review Center", heading: "Review what matters before you submit." }
];

for (const theme of ["light", "dark"] as const) {
  test.describe(`accessibility — ${theme} theme`, () => {
    for (const screen of SCREENS) {
      test(`${screen.label} has no automatically-detectable violations (@a11y)`, async ({ page }) => {
        await page.goto("/");
        if (theme === "dark") {
          const current = await page.locator("html").getAttribute("data-theme");
          if (current !== "dark") {
            await page.getByRole("button", { name: /Switch to dark mode/ }).click();
          }
        }
        await page.locator(".prototype-switcher-trigger").click();
        await page.getByRole("button", { name: screen.label }).click();
        await expect(page.getByText(screen.heading).first()).toBeVisible();

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
          .analyze();

        expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
      });
    }
  });
}
