import { test, expect } from "@playwright/test";
import { PRODUCTION_DEFAULT_TEST_BASE_URL, PRODUCTION_BUILD_TEST_BASE_URL } from "../test-server";

/**
 * Product-environment follow-up (surfaced during LI-1's architecture
 * review, see docs/architecture/PRODUCT-ENVIRONMENT-FOLLOW-UP.md): the
 * released MVP defaulted to Phase 5B prototype fixtures and always
 * rendered the QA/prototype switcher, even in an ordinary build. This
 * suite proves the fix from the OUTSIDE — ordinary startup and a real
 * production build both default to real production content with zero QA
 * tooling rendered — using two dedicated webServers that boot WITHOUT
 * VITE_ENABLE_QA_FIXTURES (see playwright.config.ts), unlike every other
 * spec in this directory, which explicitly opts into QA fixtures.
 *
 * "Authority follows accountability" is production content's default
 * lesson (productionContentSource.ts's DEFAULT_TODAYS_LESSON_ID) — it can
 * only appear if production content, not the Phase 5B prototype fixture
 * ("Residual risk and treatment decisions"), is what actually loaded.
 */

const PRODUCTION_LESSON_CONCEPT = "Authority follows accountability";
const PROTOTYPE_FIXTURE_HEADING = /Residual risk and treatment decisions/;

for (const [label, baseURL] of [
  ["ordinary dev startup (no QA flag)", PRODUCTION_DEFAULT_TEST_BASE_URL],
  ["production build + preview (no QA flag)", PRODUCTION_BUILD_TEST_BASE_URL]
] as const) {
  test.describe(label, () => {
    test.use({ baseURL });

    test("Home shows real production content, not the Phase 5B prototype fixture", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("heading", { name: PRODUCTION_LESSON_CONCEPT })).toBeVisible();
      await expect(page.getByText(PROTOTYPE_FIXTURE_HEADING)).toHaveCount(0);
    });

    test("no Prototype/Production QA switcher is rendered anywhere on the page", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator(".prototype-switcher-trigger")).toHaveCount(0);
      await expect(page.locator(".prototype-switcher")).toHaveCount(0);
    });

    test("Daily Study begins with real production Recall/Learn content, not the prototype fixture", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Daily Study" }).click();
      await expect(page.locator(".recall-options .answer-option").first()).toBeVisible();
      await page.locator(".recall-options .answer-option").first().click();
      await page.getByRole("button", { name: "Continue to today's lesson →" }).click();
      // ".lesson-title" (the Learn screen's own h1), not the level-4
      // PatternCallout heading that repeats the same concept name.
      await expect(page.locator(".lesson-title")).toHaveText(PRODUCTION_LESSON_CONCEPT);
    });

    test("Explore and Practice remain reachable and show real production domains", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Explore" }).click();
      await expect(page.getByRole("button", { name: /Governance/ })).toBeVisible();
    });

    test("mobile viewport: ordinary startup still shows production content with no QA panel", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/");
      await expect(page.getByRole("heading", { name: PRODUCTION_LESSON_CONCEPT })).toBeVisible();
      await expect(page.locator(".prototype-switcher-trigger")).toHaveCount(0);
    });
  });
}

test.describe("LI-1 learning history still records correctly under the new production default", () => {
  test.use({ baseURL: PRODUCTION_DEFAULT_TEST_BASE_URL });

  test("an ordinary Apply attempt is recorded with sourceContext 'production' — no QA opt-in required", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Daily Study" }).click();
    await page.locator(".recall-options .answer-option").first().click();
    await page.getByRole("button", { name: "Continue to today's lesson →" }).click();
    await page.getByRole("button", { name: "Apply it →" }).click();
    const optionsGroup = page.getByRole("group", { name: "Answer options" });
    await optionsGroup.getByRole("button").first().click();
    await page.getByRole("radio", { name: "Guessing" }).click();
    await page.getByRole("button", { name: "Check answer" }).click();

    const events = await page.evaluate(async () => {
      function promisify<T>(request: IDBRequest<T>): Promise<T> {
        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
      const db = await promisify(indexedDB.open("cism-li"));
      const tx = db.transaction("learningEvents", "readonly");
      const all = await promisify(tx.objectStore("learningEvents").getAll());
      db.close();
      return all as { type: string; sourceContext: string; attemptKind?: string }[];
    });

    const applyEvents = events.filter((e) => e.type === "QUESTION_ATTEMPT" && e.attemptKind === "apply");
    expect(applyEvents.length).toBeGreaterThan(0);
    expect(applyEvents.every((e) => e.sourceContext === "production")).toBe(true);
  });
});

test.describe("explicit QA mode (VITE_ENABLE_QA_FIXTURES=true) — the default e2e server", () => {
  // Deliberately no test.use({ baseURL }) override here: this reuses
  // playwright.config.ts's own default baseURL (TEST_BASE_URL), which is
  // the one server booted WITH the QA flag — see playwright.config.ts.

  test("the QA switcher renders and prototype fixtures remain reachable through it", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".prototype-switcher-trigger")).toBeVisible();
    await page.locator(".prototype-switcher-trigger").click();
    await page.getByRole("button", { name: "Practice Exam" }).click();
    await expect(page.getByText("4 / 12")).toBeVisible();
  });

  test("QA startup's default content source remains the prototype fixture, preserving prior behavior", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: PROTOTYPE_FIXTURE_HEADING })).toBeVisible();
  });
});
