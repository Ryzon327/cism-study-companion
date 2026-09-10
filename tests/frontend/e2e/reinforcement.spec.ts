import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Phase 10B-4: ONE focused Optional Reinforcement accessibility/browser
 * check. Its question/Feedback/Repair states reuse Question/AnswerOption/
 * FeedbackScreen/RepairScreen verbatim — already covered by a11y.spec.ts
 * and production-daily-study.spec.ts's own @a11y checks, so this does not
 * repeat that. What is genuinely new and previously unexercised is the
 * Completion screen's real "A quick reinforcement" entry action, the
 * in-session progress text, and the Reinforcement Complete state — a
 * bounded, deliberately small addition, not a second accessibility suite.
 */

async function switchToProductionContent(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator(".prototype-switcher-trigger").click();
  await page.getByRole("radio", { name: "Production (candidate)" }).click();
  await page.locator(".prototype-switcher-trigger").click();
}

test("Optional Reinforcement's Completion entry, in-session progress, and completion state have no automatically-detectable accessibility violations (@a11y)", async ({ page }) => {
  await switchToProductionContent(page);
  await page.getByRole("button", { name: /Start Today's Study/ }).click();
  await page.getByRole("button", { name: "The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market" }).click();
  await page.getByRole("button", { name: /Continue to today's lesson/ }).click();
  await page.getByRole("button", { name: "Apply it →" }).click();
  await page.getByRole("button", { name: "The accountable business/process owner for that business unit" }).click();
  await page.getByRole("radio", { name: "Sure", exact: true }).click();
  await page.getByRole("button", { name: "Check answer" }).click();
  await page.getByRole("button", { name: "Continue →" }).click();

  await expect(page.getByRole("heading", { name: /Today's study is complete/ })).toBeVisible();
  const reinforceButton = page.getByRole("button", { name: "A quick reinforcement" });
  await expect(reinforceButton).toBeVisible();
  let results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

  await reinforceButton.click();
  await expect(page.getByText(/Quick reinforcement · Question 1 of/)).toBeVisible();
  results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

  // Finish the (short, bounded) set generically to reach the completion state.
  let done = false;
  while (!done) {
    await page.getByRole("group", { name: "Answer options" }).getByRole("button").first().click();
    await page.getByRole("radio", { name: "Guessing" }).click();
    await page.getByRole("button", { name: "Check answer" }).click();
    const correct = await page.getByRole("heading", { name: "Correct" }).isVisible().catch(() => false);
    await page.getByRole("button", { name: "Continue →" }).click();
    if (!correct) {
      await page.getByRole("group", { name: "Repair answer options" }).getByRole("button").first().click();
      await page.getByRole("button", { name: "Continue →" }).click();
    }
    done = await page.getByRole("heading", { name: "Reinforcement complete" }).isVisible().catch(() => false);
  }

  await expect(page.getByRole("heading", { name: "Reinforcement complete" })).toBeVisible();
  results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
});
