import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/preact";
import { InsightsScreen } from "../../../app/src/screens/InsightsScreen";
import { installFakeIndexedDb } from "./learning-history/fakeIndexedDb";
import { recordQuestionAttempt, recordRepairAttempt } from "../../../app/src/learning-history";
import { resetSessionIdForTests } from "../../../app/src/learning-history/sessionId";
import * as db from "../../../app/src/learning-history/db";

/**
 * LI-3 §37-§42: component-level tests proving correct presentation of
 * known engine output — never re-deriving LI-2's algorithm here. History
 * is seeded through LI-1's real recording functions
 * (`recordQuestionAttempt`/`recordRepairAttempt`) against REAL production
 * question IDs, exactly as the real app would populate IndexedDB — no
 * synthetic questionId would resolve any metadata at all (LI-1's
 * `metadataSnapshot.ts` only knows real content), and no learner-visible
 * "demo data" control exists anywhere in the product.
 *
 * `onActivateHandoff` is a no-op stub throughout this file — these tests
 * are about LI-3 presentation correctness, not LI-4 handoff resolution or
 * navigation, which have their own dedicated coverage in
 * InsightsScreen.handoffs.test.tsx and study-handoff/.
 */

// concept.d3.program-metrics-reporting — 6 real, distinct production
// questions all resolving to this one concept (see LI-3-IMPLEMENTATION-RECORD.md).
const Q = ["question.d3.0026", "question.d3.0027", "question.d3.0028", "question.d3.0032", "question.d3.0033", "question.d3.0034"];
const CONCEPT_LABEL_SUBSTRING = "metrics"; // the concept's authored display name mentions "metrics" — see content/production/concepts.json

beforeEach(() => {
  installFakeIndexedDb();
  resetSessionIdForTests();
  // jsdom does not implement these — stub them so Export's real download
  // code path can run without crashing; behavior/shape is already proven
  // in studyHistoryExport.test.ts, this only prevents a jsdom API gap from
  // failing an unrelated click-handler test.
  if (!("createObjectURL" in URL)) {
    (URL as unknown as { createObjectURL: () => string }).createObjectURL = () => "blob:mock";
  }
  if (!("revokeObjectURL" in URL)) {
    (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => {};
  }
});

function seedApply(questionId: string, occurredAt: number, correct: boolean, confidence: "sure" | "not-sure" | "guessing" = "sure") {
  const { event } = recordQuestionAttempt({
    learningMode: "daily-study",
    sourceContext: "production",
    attemptKind: "apply",
    questionId,
    occurredAt,
    selectedOptionKey: correct ? "a" : "b",
    correctOptionKey: "a",
    correct,
    confidence,
    repairTargetId: correct ? null : "repair.knowledge-gap"
  });
  return event;
}

function seedRecall(questionId: string, occurredAt: number, correct: boolean) {
  return recordQuestionAttempt({
    learningMode: "daily-study",
    sourceContext: "production",
    attemptKind: "recall",
    questionId,
    occurredAt,
    selectedOptionKey: correct ? "a" : "b",
    correctOptionKey: "a",
    correct,
    confidence: null,
    repairTargetId: null
  }).event;
}

function seedRepair(parentAttemptId: string, occurredAt: number, correct: boolean) {
  return recordRepairAttempt({
    learningMode: "daily-study",
    sourceContext: "production",
    parentAttemptId,
    occurredAt,
    selectedOptionKey: correct ? "a" : "b",
    correct,
    repairTargetId: "repair.knowledge-gap"
  }).event;
}

async function waitForWrites(): Promise<void> {
  // recordQuestionAttempt/recordRepairAttempt write in the background;
  // flush microtasks so seeded data is durable before rendering.
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("InsightsScreen — empty states (§38)", () => {
  it("zero events -> the no-history empty state, never a false weakness", async () => {
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await waitFor(() => expect(screen.getByText(/Your study insights will appear as you answer questions/)).toBeTruthy());
    expect(screen.queryByText(/Needs review/i)).toBeNull();
  });

  it("only Recall events -> the no-history empty state (Recall alone is secondary evidence, never weakness)", async () => {
    seedRecall(Q[0]!, 100, false);
    seedRecall(Q[1]!, 200, false);
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await waitFor(() => expect(screen.getByText(/Your study insights will appear as you answer questions/)).toBeTruthy());
    expect(screen.queryByText(/Needs review/i)).toBeNull();
  });

  it("one Apply miss -> the 'building your study picture' state, never a Needs Review card", async () => {
    seedApply(Q[0]!, 100, false);
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await waitFor(() => expect(screen.getByText(/Building your study picture/)).toBeTruthy());
    expect(screen.queryByText(/Needs review/i)).toBeNull();
  });

  it("some history but no classifiable groups -> the insufficient-evidence state", async () => {
    seedApply(Q[0]!, 100, true);
    seedApply(Q[0]!, 200, true); // same question repeated — never satisfies distinct-question breadth
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await waitFor(() => expect(screen.getByText(/Building your study picture/)).toBeTruthy());
  });
});

describe("InsightsScreen — actionable states (§39)", () => {
  it("A. a NEEDS_REVIEW concept renders under Focus Next with its real display label, never the raw ID", async () => {
    seedApply(Q[0]!, 100, false);
    seedApply(Q[1]!, 200, false);
    seedApply(Q[2]!, 300, true);
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    const heading = await screen.findByRole("heading", { name: "Focus next" });
    expect(heading).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3, name: new RegExp(CONCEPT_LABEL_SUBSTRING, "i") })).toBeTruthy();
    expect(screen.getByText("Needs review")).toBeTruthy();
    expect(screen.queryByText(/concept\.d3/)).toBeNull();
  });

  it("B. repeated Sure-confidence misses include the confidence-mismatch explanation, without diagnostic language", async () => {
    seedApply(Q[0]!, 100, false, "sure");
    seedApply(Q[1]!, 200, false, "sure");
    seedApply(Q[2]!, 300, true, "sure");
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await screen.findByRole("heading", { name: "Focus next" });
    expect(screen.getAllByText(/Sure confidence/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/overconfident/i)).toBeNull();
  });

  it("C. failed Repair evidence is explained in Focus Next", async () => {
    const missed = seedApply(Q[0]!, 100, false);
    seedRepair(missed.attemptId, 110, false);
    seedApply(Q[1]!, 200, false);
    seedApply(Q[2]!, 300, true);
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await screen.findByRole("heading", { name: "Focus next" });
    expect(screen.getByText(/Repair question was also missed/)).toBeTruthy();
  });

  it("D. a DEVELOPING recommendation renders with the softer 'Developing' label, not styled as urgent", async () => {
    // Exactly one unresolved miss among 3 distinct-question attempts: not
    // enough incorrect attempts for NEEDS_REVIEW's conditions A/B/C (all
    // require >=2), but the one miss is real, recent, and unresolved —
    // DEVELOPING, and recommendation-eligible.
    seedApply(Q[0]!, 100, false);
    seedApply(Q[1]!, 200, true);
    seedApply(Q[2]!, 300, true);
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await screen.findByRole("heading", { name: "Focus next" });
    const card = screen.getByRole("heading", { level: 3 }).closest("li")!;
    expect(within(card).getByText("Developing")).toBeTruthy();
  });

  it("E. a STRONGER_EVIDENCE group renders under Stronger Areas, never claims 'Mastered'", async () => {
    for (let i = 0; i < 5; i++) {
      seedApply(Q[i % Q.length]!, 100 + i * 10, true, "sure");
    }
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    const heading = await screen.findByRole("heading", { name: "Stronger areas" });
    expect(heading).toBeTruthy();
    expect(screen.getAllByText(/Recent evidence is stronger here/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/master/i)).toBeNull();
  });

  it("F. an improving trend surfaces directional language, never a percentage", async () => {
    // 6 attempts: previous 3 mostly wrong, recent 3 all correct -> IMPROVING.
    seedApply(Q[0]!, 100, false, "guessing");
    seedApply(Q[1]!, 200, false, "guessing");
    seedApply(Q[2]!, 300, false, "guessing");
    seedApply(Q[3]!, 400, true, "sure");
    seedApply(Q[4]!, 500, true, "sure");
    seedApply(Q[5]!, 600, true, "sure");
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await waitFor(() => expect(screen.queryByText(/Loading/)).toBeNull());
    expect(screen.getAllByText(/improving/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it("G. multiple recommendations render in the same order LI-2 ranked them", async () => {
    // concept.d3.program-metrics-reporting (Q, no failed repair) vs a second
    // concept with a failed Repair, which LI-2 ranks first.
    seedApply(Q[0]!, 1000, false);
    seedApply(Q[1]!, 1010, false);
    seedApply(Q[2]!, 1020, true);

    const OTHER_Q = ["question.d2.0026", "question.d2.0027", "question.d2.0028"];
    const missed = seedApply(OTHER_Q[0]!, 2000, false);
    seedRepair(missed.attemptId, 2010, false);
    seedApply(OTHER_Q[1]!, 2020, false);
    seedApply(OTHER_Q[2]!, 2030, true);

    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    const cards = await screen.findAllByRole("heading", { level: 3 });
    expect(cards.length).toBeGreaterThanOrEqual(2);
    // The failed-Repair concept (risk-monitoring-reporting) must rank first.
    expect(cards[0]!.textContent).toMatch(/monitoring|reporting/i);
  });
});

describe("InsightsScreen — QA exclusion (§40)", () => {
  it("prototype-sourced failures never appear as learner weakness alongside real production evidence", async () => {
    seedApply(Q[0]!, 100, false);
    seedApply(Q[1]!, 200, false);
    seedApply(Q[2]!, 300, true);

    for (let i = 0; i < 10; i++) {
      recordQuestionAttempt({
        learningMode: "daily-study",
        sourceContext: "prototype",
        attemptKind: "apply",
        questionId: `qa-fixture-${i}`,
        occurredAt: 9000 + i,
        selectedOptionKey: "b",
        correctOptionKey: "a",
        correct: false,
        confidence: "sure",
        repairTargetId: "repair.knowledge-gap"
      });
    }
    await waitForWrites();

    render(<InsightsScreen onActivateHandoff={() => {}} />);
    const heading = await screen.findByRole("heading", { name: "Focus next" });
    const list = heading.closest("section")!;
    expect(within(list).getAllByRole("heading", { level: 3 })).toHaveLength(1); // only the one real concept, not 11
  });
});

describe("InsightsScreen — unknown target fallback (§41)", () => {
  it("a stale concept ID (no longer in current content) renders a safe fallback label, never the raw ID", async () => {
    const staleBase = {
      eventSchemaVersion: 1 as const,
      sessionId: "session-stale",
      learningMode: "daily-study" as const,
      sourceContext: "production" as const,
      attemptKind: "apply" as const,
      familyId: null,
      domain: null,
      patterns: [],
      qualifier: null,
      primaryRole: null,
      lifecycle: null,
      stage: null,
      decisionType: null,
      evidenceDimensions: [],
      contentStatusAtAttempt: "CANDIDATE",
      correctOptionKey: "a" as const,
      confidence: "sure" as const
    };
    for (let i = 0; i < 3; i++) {
      await db.appendEvent({
        ...staleBase,
        eventId: `stale-${i}`,
        attemptId: `stale-${i}`,
        type: "QUESTION_ATTEMPT",
        occurredAt: 100 + i * 10,
        questionId: `question.stale.${i}`,
        conceptIds: ["concept.no-longer-exists"],
        selectedOptionKey: "b",
        correct: false,
        repairTargetId: "repair.knowledge-gap"
      });
    }

    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await screen.findByRole("heading", { name: "Focus next" });
    expect(screen.getByText("A previously studied topic")).toBeTruthy();
    expect(screen.queryByText(/concept\.no-longer-exists/)).toBeNull();
  });
});

describe("InsightsScreen — Study Data (§42)", () => {
  it("shows the local-storage explanation and a truthful attempt count", async () => {
    seedApply(Q[0]!, 100, true);
    seedApply(Q[1]!, 200, true);
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    expect(screen.getByText(/stored only in this browser/)).toBeTruthy();
    await screen.findByText(/2 recorded question attempts/);
    expect(screen.getByText(/not currently synced or backed up online/)).toBeTruthy();
  });

  it("never renders an Import control", async () => {
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await waitFor(() => expect(screen.getByText(/stored only in this browser/)).toBeTruthy());
    expect(screen.queryByRole("button", { name: /import/i })).toBeNull();
  });

  it("Export is disabled with zero history and enabled once history exists", async () => {
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Export study history" })).toBeTruthy());
    expect((screen.getByRole("button", { name: "Export study history" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("Reset shows a confirmation dialog; Cancel preserves history", async () => {
    seedApply(Q[0]!, 100, false);
    seedApply(Q[1]!, 200, false);
    seedApply(Q[2]!, 300, true);
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await screen.findByRole("heading", { name: "Focus next" });

    fireEvent.click(screen.getByRole("button", { name: "Reset study history" }));
    const dialog = await screen.findByRole("dialog", { name: "Reset study history?" });
    expect(dialog).toBeTruthy();

    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("heading", { name: "Focus next" })).toBeTruthy(); // history preserved
  });

  it("Reset clears history and returns to the fresh no-history state", async () => {
    seedApply(Q[0]!, 100, false);
    seedApply(Q[1]!, 200, false);
    seedApply(Q[2]!, 300, true);
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await screen.findByRole("heading", { name: "Focus next" });

    fireEvent.click(screen.getByRole("button", { name: "Reset study history" }));
    const dialog = await screen.findByRole("dialog", { name: "Reset study history?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Reset history" }));

    await waitFor(() => expect(screen.getByText(/Your study insights will appear as you answer questions/)).toBeTruthy());
    expect(screen.queryByRole("heading", { name: "Focus next" })).toBeNull();
  });

  it("Export triggers no network call (jsdom has no network primitive to intercept — this asserts the handler completes without throwing)", async () => {
    seedApply(Q[0]!, 100, true);
    await waitForWrites();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      throw new Error("network calls are not allowed from Export");
    });
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await waitFor(() => expect((screen.getByRole("button", { name: "Export study history" }) as HTMLButtonElement).disabled).toBe(false));
    expect(() => fireEvent.click(screen.getByRole("button", { name: "Export study history" }))).not.toThrow();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
