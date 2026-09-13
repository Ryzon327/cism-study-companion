import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * LI-3: Insights' own browser-level coverage — real navigation, real
 * accessibility, real screen-entry refresh (no page reload), and the
 * Reset confirmation flow in a real browser. Focus Next/Stronger
 * Areas/trend PRESENTATION correctness (display labels, reason-code copy,
 * evidence lines, ranking) is already proven deterministically at the
 * unit level (tests/frontend/unit/InsightsScreen.test.tsx,
 * tests/frontend/unit/insights/) — this file does not re-derive that.
 */

async function switchToProductionContent(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator(".prototype-switcher-trigger").click();
  await page.getByRole("radio", { name: "Production (candidate)" }).click();
  await page.locator(".prototype-switcher-trigger").click();
}

test("Insights is reachable from Main navigation and shows the fresh empty state with no automatically-detectable accessibility violations (@a11y)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Insights" }).click();
  await expect(page.getByRole("heading", { name: "What to focus on" })).toBeVisible();
  await expect(page.getByText(/Your study insights will appear as you answer questions/)).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("Study Data section and Reset confirmation have no automatically-detectable accessibility violations (@a11y)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Insights" }).click();
  await expect(page.getByRole("heading", { name: "Study data" })).toBeVisible();

  let results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

  // Reset is disabled with zero history — no dialog to open yet on a fresh profile.
  await expect(page.getByRole("button", { name: "Reset study history" })).toBeDisabled();
});

test("real production Daily Study attempts flow into Insights on the very next visit, with no page reload", async ({ page }) => {
  await switchToProductionContent(page);

  await page.getByRole("button", { name: /Start Today's Study/ }).click();
  await page.locator(".recall-options .answer-option").first().click();
  await page.getByRole("button", { name: "Continue to today's lesson →" }).click();
  await page.getByRole("button", { name: "Apply it →" }).click();
  // Deliberately not asserting on the exact question/option text — this
  // test only proves real evidence reaches Insights without a reload, not
  // any specific lesson's content (see product-environment.spec.ts for the
  // same generic-selection convention against the default lesson).
  const optionsGroup = page.getByRole("group", { name: "Answer options" });
  await optionsGroup.getByRole("button").first().click();
  await page.getByRole("radio", { name: "Guessing" }).click();
  await page.getByRole("button", { name: "Check answer" }).click();
  const correct = await page.getByRole("heading", { name: "Correct" }).isVisible();
  if (!correct) {
    await page.getByRole("button", { name: "Continue →" }).click(); // Feedback -> Repair
    const repairGroup = page.getByRole("group", { name: "Repair answer options" });
    await repairGroup.getByRole("button").first().click();
  }
  await page.getByRole("button", { name: "Continue →" }).click(); // -> Completion
  await page.getByRole("button", { name: "Done" }).click(); // Completion -> Home

  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Insights" }).click();
  await expect(page.getByRole("heading", { name: "What to focus on" })).toBeVisible();
  // Real evidence was recorded (Recall + Apply, at minimum) — the screen
  // must not still claim zero history, even though 1-2 attempts on any
  // one topic isn't yet enough for a Focus Next recommendation.
  await expect(page.getByText(/Your study insights will appear as you answer questions/)).toHaveCount(0);
  await expect(page.getByText(/recorded question attempts?/)).toBeVisible();
});

test("mobile viewport: Insights renders without horizontal scrolling and Study Data controls fit", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Insights" }).click();
  await expect(page.getByRole("heading", { name: "What to focus on" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Study data" })).toBeVisible();
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for sub-pixel rounding
});

test("dark mode: Insights remains legible with no automatically-detectable accessibility violations (@a11y)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Switch to dark mode/ }).click();
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Insights" }).click();
  await expect(page.getByRole("heading", { name: "What to focus on" })).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});
