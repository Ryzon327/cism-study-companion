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
    await expect(page.locator(".recall-domain")).toHaveText("Governance");
    await expect(page.getByRole("heading", { name: /information security GOVERNANCE activity, rather than a management activity/ })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);

    await page.getByRole("button", { name: "The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market" }).click();
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
    await page.getByRole("button", { name: "The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market" }).click();
    await page.getByRole("button", { name: /Continue to today's lesson/ }).click();
    await page.getByRole("button", { name: "Apply it →" }).click();

    await page.getByRole("button", { name: "Internal Audit, to independently verify the finding before any decision is made" }).click();
    await page.getByRole("radio", { name: "Guessing" }).click();
    await page.getByRole("button", { name: "Check answer" }).click();

    await expect(page.getByRole("heading", { name: "Repair the reasoning" })).toBeVisible();
    // The leading letter is no longer asserted here: answer position now
    // varies per exposure (see app/src/content/answerOrder.ts), so the
    // semantic option "Internal Audit..." may legitimately be labeled any
    // of A-D depending on this question's exposure count. The text itself
    // is still the reliable, order-independent signal that feedback named
    // the actual selected option.
    await expect(page.getByText(/Internal Audit, to independently verify/)).toBeVisible();

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
    await page.getByRole("button", { name: "The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market" }).click();
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
    await expect(page.getByRole("heading", { name: /information security GOVERNANCE activity, rather than a management activity/ })).toBeVisible();
    let results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

    await page.getByRole("button", { name: "The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market" }).click();
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

  test("Home truthfully reflects the current Production QA lesson (D1-U8 -> D1-U9), never the stale D2 prototype state", async ({ page }) => {
    await page.goto("/");
    await page.locator(".prototype-switcher-trigger").click();
    await page.getByRole("radio", { name: "Production (candidate)" }).click();
    await page.getByRole("button", { name: "D1-U8 — Legal, Regulatory & Contractual Risk" }).click();
    await page.locator(".prototype-switcher-trigger").click();

    // Domain must read D1, never the old hard-coded D2 prototype pill.
    await expect(page.locator(".home-domain-pill")).toHaveText("D1 · Governance");
    // Title corresponds to the actual selected lesson's concept, not a
    // hard-coded prototype string.
    await expect(page.getByRole("heading", { name: /Legal, regulatory, and contractual requirements as risk/i })).toBeVisible();

    // Domain 1 is current, never shown as completed; Domain 2 is never
    // shown as current while a D1 lesson is selected. Foundation IS
    // completed — it precedes Domain 1 in the fixed curriculum sequence,
    // an ordered-position fact, never a fabricated learner-mastery claim —
    // and it is the ONLY step completed (Domain 1 itself is current, not
    // completed; nothing later is completed either).
    const journey = page.locator(".journey");
    await expect(journey.locator(".journey-step-current")).toContainText("Domain 1");
    await expect(journey.locator(".journey-step-current")).not.toContainText("Domain 2");
    await expect(journey.locator(".journey-step-completed")).toHaveCount(1);
    await expect(journey.locator(".journey-step-completed")).toContainText("Foundation");

    // Changing the QA lesson to D1-U9 (without navigating away from Home)
    // updates the presentation — no stale U8 or prototype D2 content, and
    // Foundation/Domain 1/Domain 2 states are unchanged by the switch.
    await page.locator(".prototype-switcher-trigger").click();
    await page.getByRole("button", { name: "D1-U9 — Organizational Culture & Governance" }).click();
    await page.locator(".prototype-switcher-trigger").click();

    await expect(page.getByRole("heading", { name: /Organizational culture and governance effectiveness/i })).toBeVisible();
    await expect(page.getByText("Legal, regulatory, and contractual requirements as risk")).toHaveCount(0);
    await expect(page.getByText("Residual risk and treatment decisions")).toHaveCount(0);
    await expect(journey.locator(".journey-step-current")).toContainText("Domain 1");
    await expect(journey.locator(".journey-step-completed")).toHaveCount(1);
    await expect(journey.locator(".journey-step-completed")).toContainText("Foundation");

    const storageLength = await page.evaluate(() => window.localStorage.length);
    expect(storageLength).toBe(0);
  });

  test("Home UX correction (Phase 7C follow-up): the Domain card no longer duplicates the main lesson paragraph, and no fabricated duration is shown, across U7 -> U8 -> U9", async ({ page }) => {
    await page.goto("/");
    await page.locator(".prototype-switcher-trigger").click();
    await page.getByRole("radio", { name: "Production (candidate)" }).click();
    await page.getByRole("button", { name: "D1-U7 — Frameworks, GRC & Effectiveness" }).click();
    await page.locator(".prototype-switcher-trigger").click();

    // No fabricated numeric duration anywhere on Home.
    await expect(page.getByText(/~\d+\s*min session/i)).toHaveCount(0);
    await expect(page.getByText("Quick study session")).toBeVisible();

    // The main paragraph and the card's Focus line must not be the same
    // text — the card shows a short orientation label, not a second copy
    // of the lesson's full objective.
    const mainParagraph = (await page.locator(".home-hero-reason").textContent())?.trim() ?? "";
    const cardFocus = (await page.locator(".home-hero-snapshot-detail").textContent())?.trim() ?? "";
    expect(mainParagraph.length).toBeGreaterThan(0);
    expect(cardFocus.length).toBeGreaterThan(0);
    expect(cardFocus).not.toBe(mainParagraph);
    expect(mainParagraph.startsWith(cardFocus)).toBe(false);
    await expect(page.locator(".home-hero-snapshot-label")).toHaveText("Focus");
    await expect(page.locator(".home-hero-snapshot-detail")).toHaveText("Governance effectiveness");
    // Domain card still correctly identifies the active domain.
    await expect(page.locator(".home-domain-pill")).toHaveText("D1 · Governance");

    // Switch to U8 without reload — the card updates, no stale U7 content.
    await page.locator(".prototype-switcher-trigger").click();
    await page.getByRole("button", { name: "D1-U8 — Legal, Regulatory & Contractual Risk" }).click();
    await page.locator(".prototype-switcher-trigger").click();

    const u8MainParagraph = (await page.locator(".home-hero-reason").textContent())?.trim() ?? "";
    const u8CardFocus = (await page.locator(".home-hero-snapshot-detail").textContent())?.trim() ?? "";
    expect(u8CardFocus).not.toBe(u8MainParagraph);
    expect(u8CardFocus).not.toBe(cardFocus); // no stale U7 value
    await expect(page.getByText(/~\d+\s*min session/i)).toHaveCount(0);
    await expect(page.getByText("Quick study session")).toBeVisible();

    // Switch to U9 without reload — same guarantees hold again.
    await page.locator(".prototype-switcher-trigger").click();
    await page.getByRole("button", { name: "D1-U9 — Organizational Culture & Governance" }).click();
    await page.locator(".prototype-switcher-trigger").click();

    const u9MainParagraph = (await page.locator(".home-hero-reason").textContent())?.trim() ?? "";
    const u9CardFocus = (await page.locator(".home-hero-snapshot-detail").textContent())?.trim() ?? "";
    expect(u9CardFocus).not.toBe(u9MainParagraph);
    expect(u9CardFocus).not.toBe(u8CardFocus); // no stale U8 value
    await expect(page.getByText(/~\d+\s*min session/i)).toHaveCount(0);
    await expect(page.getByText("Quick study session")).toBeVisible();
  });

  test("Prototype fixture mode's Home/Journey is unaffected by any production QA lesson selection, and the Phase 7C Home UX correction applies consistently there too", async ({ page }) => {
    await page.goto("/");
    await page.locator(".prototype-switcher-trigger").click();
    await page.getByRole("radio", { name: "Production (candidate)" }).click();
    await page.getByRole("button", { name: "D1-U9 — Organizational Culture & Governance" }).click();
    await page.getByRole("radio", { name: "Prototype fixtures", exact: true }).click();
    await page.locator(".prototype-switcher-trigger").click();

    await expect(page.getByRole("heading", { name: /Residual risk and treatment decisions/ })).toBeVisible();
    await expect(page.locator(".home-domain-pill")).toHaveText("D2 · Risk Management");
    const journey = page.locator(".journey");
    await expect(journey.locator(".journey-step-current")).toContainText("Domain 2");
    await expect(journey.locator(".journey-step-completed")).toHaveCount(2); // Foundation and Domain 1 — the approved, unchanged D2 fixture

    // The Phase 7C Home UX correction is a shared-component change (one
    // HomeScreen serves both content sources) — Prototype's approved core
    // content (title, main paragraph, domain label/position, journey
    // state) is fully unchanged above; only the card's short orientation
    // label and the non-numeric session wording apply here too, exactly
    // as they now do in Production, and Prototype's card no longer
    // duplicates its own main paragraph either.
    await expect(page.getByText(/~\d+\s*min session/i)).toHaveCount(0);
    await expect(page.getByText("Quick study session")).toBeVisible();
    await expect(page.locator(".home-hero-snapshot-label")).toHaveText("Focus");
    await expect(page.locator(".home-hero-snapshot-detail")).toHaveText("Residual risk");
    const mainParagraph = (await page.locator(".home-hero-reason").textContent())?.trim() ?? "";
    expect(mainParagraph).not.toBe("Residual risk");
  });

  test("no localStorage is read or written during a full production session", async ({ page }) => {
    await switchToProductionContent(page);
    await page.getByRole("button", { name: /Start Today's Study/ }).click();
    await page.getByRole("button", { name: "The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market" }).click();
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
