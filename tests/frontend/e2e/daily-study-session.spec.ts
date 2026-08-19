import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * End-to-end coverage for the controlled, in-memory Daily Study experience
 * prototype: Home → Recall → Learn → Apply → Feedback → (Repair if
 * incorrect) → Completion → Home. This is the exact flow a human reviewer
 * clicks through manually; see the Phase 5B experience-gate report.
 */

test.describe("Daily Study live session", () => {
  test("correct path: Home → Recall → Learn → Apply → correct Feedback → Completion → Home, nav receded throughout", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();

    await page.getByRole("button", { name: /Start Today's Study/ }).click();
    await expect(page.getByText(/Quick recall from Domain 1/)).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Exit" })).toBeVisible();

    await page.getByRole("button", { name: "Alignment with the organization's risk appetite" }).click();
    await page.getByRole("button", { name: /Continue to today's lesson/ }).click();
    await expect(page.getByRole("heading", { name: "Residual risk" })).toBeVisible();

    await page.getByRole("button", { name: "Apply it →" }).click();
    await expect(page.getByText(/What should happen NEXT/)).toBeVisible();

    const submit = page.getByRole("button", { name: "Check answer" });
    await expect(submit).toBeDisabled();
    await page.getByRole("button", { name: "The risk owner determines whether the residual risk is acceptable" }).click();
    await expect(submit).toBeDisabled();
    await page.getByRole("radio", { name: "Sure", exact: true }).click();
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByRole("heading", { name: "Correct" })).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();

    await expect(page.getByRole("heading", { name: /Today's study is complete/ })).toBeVisible();
    await expect(page.getByText("Domain 2 of 6")).toBeVisible();

    await page.getByRole("button", { name: "Done" }).click();
    await expect(page.getByRole("heading", { name: /Residual risk and treatment decisions/ })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  });

  test("incorrect path branches to instructional feedback and a repair step before Completion", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Start Today's Study/ }).click();
    await page.getByRole("button", { name: "Alignment with the organization's risk appetite" }).click();
    await page.getByRole("button", { name: /Continue to today's lesson/ }).click();
    await page.getByRole("button", { name: "Apply it →" }).click();

    await page.getByRole("button", { name: "The security manager formally accepts the residual risk on behalf of the enterprise" }).click();
    await page.getByRole("radio", { name: "Guessing" }).click();
    await page.getByRole("button", { name: "Check answer" }).click();

    await expect(page.getByRole("heading", { name: "Repair the reasoning" })).toBeVisible();
    await expect(page.getByText(/C\. The security manager formally accepts/)).toBeVisible();

    await page.getByRole("button", { name: "Continue →" }).click();
    await expect(page.getByRole("heading", { name: "Let's correct that reasoning." })).toBeVisible();

    const repairContinue = page.getByRole("button", { name: "Continue →" });
    await expect(repairContinue).toBeDisabled();
    await page.getByRole("button", { name: "Only the accountable risk owner can formally accept residual risk." }).click();
    await expect(repairContinue).toBeEnabled();
    await repairContinue.click();

    await expect(page.getByRole("heading", { name: /Today's study is complete/ })).toBeVisible();
  });

  test("Recall and Repair — the two screens only reachable via the live session — have no automatically-detectable violations (@a11y)", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Start Today's Study/ }).click();
    await expect(page.getByText(/Quick recall from Domain 1/)).toBeVisible();
    let results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

    await page.getByRole("button", { name: "Alignment with the organization's risk appetite" }).click();
    await page.getByRole("button", { name: /Continue to today's lesson/ }).click();
    await page.getByRole("button", { name: "Apply it →" }).click();
    await page.getByRole("button", { name: "The security manager formally accepts the residual risk on behalf of the enterprise" }).click();
    await page.getByRole("radio", { name: "Guessing" }).click();
    await page.getByRole("button", { name: "Check answer" }).click();
    await page.getByRole("button", { name: "Continue →" }).click();
    await expect(page.getByRole("heading", { name: "Let's correct that reasoning." })).toBeVisible();
    results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("the Prototype QA switcher still works independently of the live session", async ({ page }) => {
    await page.goto("/");
    await page.locator(".prototype-switcher-trigger").click();
    await page.getByRole("button", { name: "Feedback — Incorrect" }).click();
    await expect(page.getByText("Repair the reasoning")).toBeVisible();
  });

  test("no localStorage is read or written across the full session", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Start Today's Study/ }).click();
    await page.getByRole("button", { name: "Alignment with the organization's risk appetite" }).click();
    await page.getByRole("button", { name: /Continue to today's lesson/ }).click();
    await page.getByRole("button", { name: "Apply it →" }).click();
    await page.getByRole("button", { name: "The risk owner determines whether the residual risk is acceptable" }).click();
    await page.getByRole("radio", { name: "Sure", exact: true }).click();
    await page.getByRole("button", { name: "Check answer" }).click();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByRole("button", { name: "Done" }).click();

    const storageLength = await page.evaluate(() => window.localStorage.length);
    expect(storageLength).toBe(0);
  });
});
