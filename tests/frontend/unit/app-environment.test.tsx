import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { App } from "../../../app/src/App";
import { installFakeIndexedDb } from "./learning-history/fakeIndexedDb";
import { recordQuestionAttempt } from "../../../app/src/learning-history";
import { resetSessionIdForTests } from "../../../app/src/learning-history/sessionId";

/**
 * Product-environment follow-up (docs/architecture/PRODUCT-ENVIRONMENT-FOLLOW-UP.md):
 * the released MVP defaulted to Phase 5B prototype fixtures and always
 * rendered the QA/prototype switcher, even in an ordinary build — a
 * pre-existing defect surfaced during LI-1's architecture review, unrelated
 * to Learning Intelligence itself. `VITE_ENABLE_QA_FIXTURES` is now the
 * one explicit opt-in for both; this file proves the App-level default
 * (unset) and the explicit opt-in, at the unit level. See
 * tests/frontend/e2e/product-environment.spec.ts for the same proof in a
 * real browser, across ordinary dev startup and a real production build.
 *
 * "Authority follows accountability" is production content's default
 * lesson (productionContentSource.ts's DEFAULT_TODAYS_LESSON_ID) — it can
 * only render if production content, not the Phase 5B prototype fixture
 * ("Residual risk and treatment decisions"), is what actually loaded.
 */

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("ordinary startup (VITE_ENABLE_QA_FIXTURES unset) — the default", () => {
  it("Home shows real production content, not the Phase 5B prototype fixture", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Authority follows accountability" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: /Residual risk and treatment decisions/ })).toBeNull();
  });

  it("renders no Prototype/Production QA switcher at all", () => {
    render(<App />);
    expect(document.querySelector(".prototype-switcher-trigger")).toBeNull();
    expect(document.querySelector(".prototype-switcher")).toBeNull();
  });

  it("Daily Study begins with real production content, never the prototype fixture's fixed Recall prompt", () => {
    render(<App />);
    // Two "Main" nav landmarks exist in markup (desktop ProductNav +
    // mobile BottomTabBar, mutually exclusive only via a real viewport's
    // CSS media query — see App.test.tsx's identical note); either one's
    // "Daily Study" button starts the same session.
    screen.getAllByRole("button", { name: "Daily Study" })[0]!.click();
    // The Phase 5B prototype fixture's Recall always reads "Quick recall
    // from Domain 1" (see smoke.spec.ts) — production content never does.
    expect(screen.queryByText(/Quick recall from Domain 1/)).toBeNull();
  });
});

/**
 * LI-4 §35/§36: proves App.tsx's actual navigation wiring end-to-end —
 * Insights' real action buttons transition to the exact right screen with
 * the right state, and manual primary-nav Practice is never left
 * accidentally targeted. Full real-browser evidence (with an actual
 * targeted-Practice attempt writing back to Learning History and Insights
 * refreshing) lives in tests/frontend/e2e/study-handoff.spec.ts — this
 * proves the App-level state machine itself, at the unit level.
 */
describe("LI-4 — Insights handoff navigation (App-level)", () => {
  beforeEach(() => {
    installFakeIndexedDb();
    resetSessionIdForTests();
  });

  function seedNeedsReviewConcept() {
    const Q = ["question.d3.0026", "question.d3.0027", "question.d3.0028"];
    for (const [i, correct] of [false, false, true].entries()) {
      recordQuestionAttempt({
        learningMode: "daily-study",
        sourceContext: "production",
        attemptKind: "apply",
        questionId: Q[i]!,
        occurredAt: 100 + i * 10,
        selectedOptionKey: correct ? "a" : "b",
        correctOptionKey: "a",
        correct,
        confidence: "sure",
        repairTargetId: correct ? null : "repair.knowledge-gap"
      });
    }
  }

  async function flushWrites(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  it("'Practice this topic' navigates to targeted Practice with the resolved scope, not a random domain", async () => {
    seedNeedsReviewConcept();
    await flushWrites();
    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: "Insights" })[0]!);
    await screen.findByRole("button", { name: /^Practice this topic:/ });
    fireEvent.click(screen.getByRole("button", { name: /^Practice this topic:/ }));
    expect(await screen.findByRole("heading", { name: "Targeted practice" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Choose what to practice" })).toBeNull();
  });

  it("'Review topic' navigates directly to Explore's exact concept, not the domain picker", async () => {
    seedNeedsReviewConcept();
    await flushWrites();
    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: "Insights" })[0]!);
    await screen.findByRole("button", { name: /^Review topic:/ });
    fireEvent.click(screen.getByRole("button", { name: /^Review topic:/ }));
    expect(screen.queryByRole("heading", { name: "Choose something to revisit" })).toBeNull();
    expect(screen.getAllByText(/Perspective|Notice this|Common trap/).length).toBeGreaterThan(0);
  });

  it("primary-nav Practice after a targeted handoff shows ordinary Practice, never accidentally sticky", async () => {
    seedNeedsReviewConcept();
    await flushWrites();
    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: "Insights" })[0]!);
    await screen.findByRole("button", { name: /^Practice this topic:/ });
    fireEvent.click(screen.getByRole("button", { name: /^Practice this topic:/ }));
    await screen.findByRole("heading", { name: "Targeted practice" });

    // Practice is a receded "session" screen (single Exit action) — leave
    // it first, exactly as a learner would, before reaching primary nav.
    fireEvent.click(screen.getByRole("button", { name: "Exit" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Practice" })[0]!);
    expect(screen.getByRole("heading", { name: "Choose what to practice" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Targeted practice" })).toBeNull();
  });
});

describe("explicit QA mode (VITE_ENABLE_QA_FIXTURES=true)", () => {
  it("renders the Prototype/Production QA switcher", () => {
    vi.stubEnv("VITE_ENABLE_QA_FIXTURES", "true");
    render(<App />);
    expect(document.querySelector(".prototype-switcher-trigger")).not.toBeNull();
  });

  it("defaults to the prototype fixture content, preserving prior behavior for QA/developer review", () => {
    vi.stubEnv("VITE_ENABLE_QA_FIXTURES", "true");
    render(<App />);
    expect(screen.getByRole("heading", { name: /Residual risk and treatment decisions/ })).toBeTruthy();
  });

  it("a value other than the exact string 'true' does not enable QA mode (no silent partial-match)", () => {
    vi.stubEnv("VITE_ENABLE_QA_FIXTURES", "1");
    render(<App />);
    expect(document.querySelector(".prototype-switcher-trigger")).toBeNull();
  });
});
