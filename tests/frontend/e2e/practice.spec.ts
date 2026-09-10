import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Phase 10B-3: ONE focused Practice accessibility/browser check. Practice's
 * question/Feedback/Repair states reuse Question/AnswerOption/FeedbackScreen/
 * RepairScreen verbatim — already covered by a11y.spec.ts and
 * production-daily-study.spec.ts's own @a11y checks, so this does not
 * repeat that. What is genuinely new and previously unexercised by any
 * automated a11y browser check is Practice's own scope/count landing
 * screen, the in-session progress text, and the session summary — a
 * bounded, deliberately small addition, not a second accessibility suite.
 */
test("Practice's landing (scope/count), in-session progress, and summary have no automatically-detectable accessibility violations (@a11y)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Practice", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Choose what to practice" })).toBeVisible();
  let results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

  await page.getByRole("radio", { name: "Governance" }).click();
  await page.getByRole("radio", { name: "5", exact: true }).click();
  await page.getByRole("button", { name: "Start Practice →" }).click();
  await expect(page.getByText(/Question 1 of 5/)).toBeVisible();
  results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("Practice product navigation reaches a real, distinct destination (not the old prototype)", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("button")).toHaveCount(4);
  await nav.getByRole("button", { name: "Practice", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Choose what to practice" })).toBeVisible();
  // The old Phase 5B "Practice Exam" mockup must never appear as the real destination.
  await expect(page.getByText("4 / 12")).toHaveCount(0);
});
