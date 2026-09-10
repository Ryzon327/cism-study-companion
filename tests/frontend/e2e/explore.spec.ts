import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Phase 10B-2: ONE focused Explore accessibility/browser check. Explore's
 * question/Feedback/Repair states reuse Question/AnswerOption/FeedbackScreen/
 * RepairScreen verbatim — already covered by a11y.spec.ts and
 * production-daily-study.spec.ts's own @a11y checks, so this does not
 * repeat that. What is genuinely new and previously unexercised by any
 * automated a11y browser check is Explore's own domain list, concept list,
 * and concept-detail navigation — a bounded, deliberately small addition,
 * not a second accessibility suite.
 */
test("Explore's domain list, concept list, and concept detail have no automatically-detectable accessibility violations (@a11y)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Explore", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Choose something to revisit" })).toBeVisible();
  let results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

  await page.getByRole("button", { name: /Governance/ }).click();
  await expect(page.getByRole("heading", { name: "Governance" })).toBeVisible();
  results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

  await page.getByRole("button", { name: "Governance vs. management" }).click();
  await expect(page.getByRole("heading", { name: "Governance vs. management" })).toBeVisible();
  results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});
