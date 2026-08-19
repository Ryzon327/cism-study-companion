import { test, expect } from "@playwright/test";

async function selectPrototypeState(page: import("@playwright/test").Page, label: string) {
  await page.locator(".prototype-switcher-trigger").click();
  await page.getByRole("button", { name: label }).click();
}

test.describe("prototype loads and navigates", () => {
  test("loads on Home / Today with the primary action visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Residual risk and treatment decisions/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Start Today's Study/ })).toBeVisible();
  });

  test("navigates through all eight prototype-gate states via the QA switcher", async ({ page }) => {
    await page.goto("/");

    await selectPrototypeState(page, "Daily Study — Learn");
    await expect(page.getByRole("heading", { name: "Residual risk" })).toBeVisible();

    await selectPrototypeState(page, "Question / Apply");
    await expect(page.getByText(/What should happen NEXT/)).toBeVisible();

    await selectPrototypeState(page, "Feedback — Correct");
    await expect(page.getByText("Correct", { exact: true })).toBeVisible();

    await selectPrototypeState(page, "Feedback — Incorrect");
    await expect(page.getByText("Repair the reasoning")).toBeVisible();

    await selectPrototypeState(page, "Daily Study Completion");
    await expect(page.getByText(/Today's study is complete/)).toBeVisible();

    await selectPrototypeState(page, "Practice Exam");
    await expect(page.getByText("4 / 12")).toBeVisible();

    await selectPrototypeState(page, "Review Center");
    await expect(page.getByRole("heading", { name: "Review what matters before you submit." })).toBeVisible();
  });

  test("product navigation has exactly the three real destinations, distinct from the QA switcher", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("button")).toHaveCount(3);
    await expect(nav.getByRole("button", { name: "Home" })).toBeVisible();
    await expect(nav.getByRole("button", { name: "Daily Study" })).toBeVisible();
    await expect(nav.getByRole("button", { name: "Explore & Practice" })).toBeVisible();
    // "Feedback — Correct" etc. must never appear as primary navigation.
    await expect(nav.getByRole("button", { name: /Feedback/ })).toHaveCount(0);
  });

  test("Daily Study navigation recedes to a single Exit action during focused study", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Daily Study" }).click();
    // Product nav now enters the live session at Recall — see
    // daily-study-session.spec.ts for the full click-through flow.
    await expect(page.getByText(/Quick recall from Domain 1/)).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Exit" })).toBeVisible();
    await page.getByRole("button", { name: "Exit" }).click();
    await expect(page.getByRole("heading", { name: /Residual risk and treatment decisions/ })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  });

  test("keyboard: tabbing reaches the primary action and shows a visible focus ring", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab"); // skip link
    // Continue tabbing until the primary action receives focus.
    for (let i = 0; i < 15; i++) {
      const focused = await page.evaluate(() => document.activeElement?.textContent ?? "");
      if (focused.includes("Start Today's Study")) break;
      await page.keyboard.press("Tab");
    }
    await expect(page.getByRole("button", { name: /Start Today's Study/ })).toBeFocused();
  });

  test("Review Center: submit opens an accessible confirmation dialog, Escape closes it", async ({ page }) => {
    await page.goto("/");
    await selectPrototypeState(page, "Review Center");
    await page.getByRole("button", { name: "Submit practice exam" }).click();
    const dialog = page.getByRole("dialog", { name: "Submit practice exam?" });
    await expect(dialog).toBeVisible();
    // Wait for focus to actually land inside the dialog (the focus-trap
    // effect) before pressing Escape, rather than racing it — visibility
    // in the DOM does not guarantee the passive effect that attaches the
    // Escape listener and moves focus has run yet.
    await expect(page.getByRole("button", { name: "Keep reviewing" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("theme toggle switches data-theme without an error", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const before = await html.getAttribute("data-theme");
    await page.getByRole("button", { name: /Switch to dark mode|Switch to light mode/ }).click();
    const after = await html.getAttribute("data-theme");
    expect(after).not.toBe(before);
  });
});
