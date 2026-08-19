import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * End-to-end coverage for the Phase 6B production-content Daily Study
 * path: Home -> (dev-only content-source toggle) -> Start Today's Study ->
 * Recall -> Learn -> Apply -> Feedback -> (Repair if incorrect) ->
 * Completion -> Home — driven by content/production/ + schema/registry/,
 * not the Phase 5B prototype fixtures. Mirrors
 * daily-study-session.spec.ts's structure exactly so the two experiences
 * stay directly comparable.
 */

async function switchToProductionContent(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator(".prototype-switcher-trigger").click();
  await page.getByRole("radio", { name: "Production (candidate)" }).click();
  await page.locator(".prototype-switcher-trigger").click();
}

test.describe("Production Daily Study (Foundation + early Domain 1 candidate content)", () => {
  test("correct path: real production content flows Recall -> Learn -> Apply -> correct Feedback -> Completion -> Home", async ({ page }) => {
    await switchToProductionContent(page);

    await page.getByRole("button", { name: /Start Today's Study/ }).click();
    await expect(page.getByText("Foundation")).toBeVisible();
    await expect(page.getByRole("heading", { name: /qualifier NEXT require you to identify/ })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);

    await page.getByRole("button", { name: "The immediate next action given where the process currently stands" }).click();
    await page.getByRole("button", { name: /Continue to today's lesson/ }).click();

    await expect(page.getByRole("heading", { name: "Authority follows accountability", level: 1 })).toBeVisible();
    await expect(page.getByText("Governance", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Authority Follows Accountability", level: 4 })).toBeVisible(); // pattern callout

    await page.getByRole("button", { name: "Apply it →" }).click();
    await expect(page.getByText(/Who is MOST appropriate to decide/)).toBeVisible();

    await page.getByRole("button", { name: "The accountable business/process owner for that business unit" }).click();
    await page.getByRole("radio", { name: "Sure", exact: true }).click();
    await page.getByRole("button", { name: "Check answer" }).click();

    await expect(page.getByRole("heading", { name: "Correct" })).toBeVisible();
    await expect(page.getByText("MOST / MOST IMPORTANT")).toBeVisible();
    await expect(page.getByText("Business / Process Owner")).toBeVisible();

    await page.getByRole("button", { name: "Continue →" }).click();
    await expect(page.getByRole("heading", { name: /Today's study is complete/ })).toBeVisible();
    await expect(page.getByText(/Recalled:/)).toBeVisible();
    await expect(page.getByText(/Learned:/)).toBeVisible();
    await expect(page.getByText(/Applied:/)).toBeVisible();
    await expect(page.getByText(/GOVERNANCE.*CANDIDATE CONTENT/i)).toBeVisible();

    await page.getByRole("button", { name: "Done" }).click();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  });

  test("incorrect path: feedback names the actual selected option and Repair targets the specific reasoning error", async ({ page }) => {
    await switchToProductionContent(page);
    await page.getByRole("button", { name: /Start Today's Study/ }).click();
    await page.getByRole("button", { name: "The immediate next action given where the process currently stands" }).click();
    await page.getByRole("button", { name: /Continue to today's lesson/ }).click();
    await page.getByRole("button", { name: "Apply it →" }).click();

    await page.getByRole("button", { name: "Internal Audit, to independently verify the finding before any decision is made" }).click();
    await page.getByRole("radio", { name: "Guessing" }).click();
    await page.getByRole("button", { name: "Check answer" }).click();

    await expect(page.getByRole("heading", { name: "Repair the reasoning" })).toBeVisible();
    await expect(page.getByText(/C\. Internal Audit, to independently verify/)).toBeVisible();

    await page.getByRole("button", { name: "Continue →" }).click();
    await expect(page.getByRole("heading", { name: "Let's correct that reasoning." })).toBeVisible();
    // The role-error repair micro-question (not the authority-error one) must be shown for this option.
    await expect(page.getByText("Internal Audit's role is independent assessment and reporting")).toBeVisible();

    const repairContinue = page.getByRole("button", { name: "Continue →" });
    await expect(repairContinue).toBeDisabled();
    await page.getByRole("button", { name: "Internal Audit's role is independent assessment and reporting — not owning or deciding the risks it reviews." }).click();
    await expect(repairContinue).toBeEnabled();
    await repairContinue.click();

    await expect(page.getByRole("heading", { name: /Today's study is complete/ })).toBeVisible();
  });

  test("a wrong answer that triggers a different repair target shows different repair content", async ({ page }) => {
    await switchToProductionContent(page);
    await page.getByRole("button", { name: /Start Today's Study/ }).click();
    await page.getByRole("button", { name: "The immediate next action given where the process currently stands" }).click();
    await page.getByRole("button", { name: /Continue to today's lesson/ }).click();
    await page.getByRole("button", { name: "Apply it →" }).click();

    await page.getByRole("button", { name: "The security manager, since they identified and best understand the exposure" }).click();
    await page.getByRole("radio", { name: "Not sure" }).click();
    await page.getByRole("button", { name: "Check answer" }).click();
    await page.getByRole("button", { name: "Continue →" }).click();

    // authority-error repair, not role-error
    await expect(page.getByText("Decision authority belongs to whoever is accountable for the outcome")).toBeVisible();
  });

  test("production Recall and Repair screens have no automatically-detectable accessibility violations (@a11y)", async ({ page }) => {
    await switchToProductionContent(page);
    await page.getByRole("button", { name: /Start Today's Study/ }).click();
    await expect(page.getByRole("heading", { name: /qualifier NEXT require you to identify/ })).toBeVisible();
    let results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

    await page.getByRole("button", { name: "The immediate next action given where the process currently stands" }).click();
    await page.getByRole("button", { name: /Continue to today's lesson/ }).click();
    await page.getByRole("button", { name: "Apply it →" }).click();
    await page.getByRole("button", { name: "Whichever executive is senior enough to override the business unit" }).click();
    await page.getByRole("radio", { name: "Guessing" }).click();
    await page.getByRole("button", { name: "Check answer" }).click();
    await page.getByRole("button", { name: "Continue →" }).click();
    await expect(page.getByRole("heading", { name: "Let's correct that reasoning." })).toBeVisible();
    results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("the content-source toggle is dev-only tooling inside the Prototype panel, not permanent product navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("radio", { name: "Production (candidate)" })).toHaveCount(0);
    await page.locator(".prototype-switcher-trigger").click();
    await expect(page.getByRole("radio", { name: "Production (candidate)" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" }).getByText("Production")).toHaveCount(0);
  });

  test("switching back to the prototype fixture source restores the original Phase 5B experience unchanged", async ({ page }) => {
    await switchToProductionContent(page);
    await page.locator(".prototype-switcher-trigger").click();
    await page.getByRole("radio", { name: "Prototype fixtures", exact: true }).click();
    await page.locator(".prototype-switcher-trigger").click();
    await page.getByRole("button", { name: /Start Today's Study/ }).click();
    await expect(page.getByText(/Quick recall from Domain 1/)).toBeVisible();
  });

  test("Apply shows a different Domain 1 variant on each of three consecutive sessions without a page reload, then allows a repeat on the fourth (Phase 6C rotation)", async ({ page }) => {
    await switchToProductionContent(page);

    async function runOneSessionAndReadApplyPrompt(): Promise<string> {
      await page.getByRole("button", { name: /Start Today's Study/ }).click();
      // Recall varies too; just get past it with whatever's shown — this test
      // only cares which Apply variant was shown.
      await page.getByRole("group", { name: "Recall answer options" }).getByRole("button").first().click();
      await page.getByRole("button", { name: /Continue to today's lesson/ }).click();
      await page.getByRole("button", { name: "Apply it →" }).click();

      const prompt = (await page.locator(".question-stem").textContent())?.trim() ?? "";

      // Any option is fine — this test only cares which question was shown.
      await page.getByRole("group", { name: "Answer options" }).getByRole("button").first().click();
      await page.getByRole("radio", { name: "Not sure" }).click();
      await page.getByRole("button", { name: "Check answer" }).click();
      await page.getByRole("button", { name: "Continue →" }).click();

      // A correct guess skips Repair and lands on Completion directly; an
      // incorrect guess routes through Repair first — handle both.
      if (await page.getByRole("heading", { name: "Let's correct that reasoning." }).isVisible().catch(() => false)) {
        await page.getByRole("group", { name: "Repair answer options" }).getByRole("button").first().click();
        await page.getByRole("button", { name: "Continue →" }).click();
      }

      await expect(page.getByRole("heading", { name: /Today's study is complete/ })).toBeVisible();
      await page.getByRole("button", { name: "Done" }).click();
      await expect(page.getByRole("button", { name: /Start Today's Study/ })).toBeVisible();
      return prompt;
    }

    const prompts = [await runOneSessionAndReadApplyPrompt(), await runOneSessionAndReadApplyPrompt(), await runOneSessionAndReadApplyPrompt()];
    expect(new Set(prompts).size).toBe(3);

    // Pool exhausted (3 variants, 3 shown) — the 4th session is allowed to repeat.
    const fourth = await runOneSessionAndReadApplyPrompt();
    expect(prompts).toContain(fourth);
  });

  test("no localStorage is read or written during a full production session", async ({ page }) => {
    await switchToProductionContent(page);
    await page.getByRole("button", { name: /Start Today's Study/ }).click();
    await page.getByRole("button", { name: "The immediate next action given where the process currently stands" }).click();
    await page.getByRole("button", { name: /Continue to today's lesson/ }).click();
    await page.getByRole("button", { name: "Apply it →" }).click();
    await page.getByRole("button", { name: "The accountable business/process owner for that business unit" }).click();
    await page.getByRole("radio", { name: "Sure", exact: true }).click();
    await page.getByRole("button", { name: "Check answer" }).click();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByRole("button", { name: "Done" }).click();

    const storageLength = await page.evaluate(() => window.localStorage.length);
    expect(storageLength).toBe(0);
  });
});
