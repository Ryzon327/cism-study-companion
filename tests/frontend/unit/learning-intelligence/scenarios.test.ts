import { describe, it, expect, beforeEach } from "vitest";
import { deriveLearningInsights } from "../../../../app/src/learning-intelligence/deriveInsights";
import { makeApplyEvent, makeRepairEvent, resetFixtureIds } from "./fixtures";

/**
 * LI-2 §39: realistic synthetic learner histories exercising the engine
 * end-to-end (deriveLearningInsights), one per Architect-specified
 * scenario. Each event carries `conceptIds: ["concept.d2.risk-treatment-selection"]`
 * (or a second concept for the cross-cutting scenario) so the resulting
 * concept-axis group is easy to find and assert on directly.
 */

beforeEach(() => resetFixtureIds());

const CONCEPT = "concept.d2.risk-treatment-selection";

function conceptGroup(result: ReturnType<typeof deriveLearningInsights>, id = CONCEPT) {
  return result.groups.find((g) => g.identity.key === `concept:${id}`);
}

describe("Scenario A — one wrong answer", () => {
  it("NOT_ENOUGH_EVIDENCE, no weakness recommendation", () => {
    const result = deriveLearningInsights([makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false, conceptIds: [CONCEPT] })]);
    expect(conceptGroup(result)?.state).toBe("NOT_ENOUGH_EVIDENCE");
    expect(result.recommendations).toEqual([]);
  });
});

describe("Scenario B — repeated concept misses", () => {
  it("3+ attempts, 2+ distinct questions, repeated misses -> NEEDS_REVIEW", () => {
    const events = [
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false, conceptIds: [CONCEPT] }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false, conceptIds: [CONCEPT] }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true, conceptIds: [CONCEPT] })
    ];
    const result = deriveLearningInsights(events);
    expect(conceptGroup(result)?.state).toBe("NEEDS_REVIEW");
    expect(conceptGroup(result)?.reasonCodes).toContain("REPEATED_MISSES");
  });
});

describe("Scenario C — high-confidence misconception", () => {
  it("repeated Sure+incorrect across different questions -> NEEDS_REVIEW with a confidence reason code", () => {
    const events = [
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false, confidence: "sure", conceptIds: [CONCEPT] }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false, confidence: "sure", conceptIds: [CONCEPT] }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true, conceptIds: [CONCEPT] })
    ];
    const result = deriveLearningInsights(events);
    expect(conceptGroup(result)?.state).toBe("NEEDS_REVIEW");
    expect(conceptGroup(result)?.reasonCodes).toContain("REPEATED_SURE_MISSES");
    expect(conceptGroup(result)?.evidence.sureIncorrectCount).toBe(2);
  });
});

describe("Scenario D — successful correction", () => {
  it("an earlier miss corrected on Repair, followed by correct transfer, is never framed as permanent weakness", () => {
    const missed = makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false, conceptIds: [CONCEPT] });
    const repair = makeRepairEvent({ parentAttemptId: missed.attemptId, occurredAt: 110, correct: true });
    const events = [
      missed,
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: true, conceptIds: [CONCEPT] }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true, conceptIds: [CONCEPT] })
    ];
    const result = deriveLearningInsights([...events, repair]);
    const group = conceptGroup(result);
    // Not permanently weak: never NEEDS_REVIEW, the corrective signal is
    // explicit in the reason codes, and — per the Architect's LI-2
    // follow-up §1 — a successful Repair never keeps a group
    // recommendation-eligible by itself: the resolved miss does not
    // generate a "study this now" prompt at all.
    expect(group?.state).not.toBe("NEEDS_REVIEW");
    expect(group?.reasonCodes).toContain("SUCCESSFUL_CORRECTION");
    expect(result.recommendations.find((r) => r.target.key === `concept:${CONCEPT}`)).toBeUndefined();
  });
});

describe("Scenario E — failed Repair + repeated miss", () => {
  it("NEEDS_REVIEW with a Repair reason code", () => {
    const missed = makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false, conceptIds: [CONCEPT] });
    const repair = makeRepairEvent({ parentAttemptId: missed.attemptId, occurredAt: 110, correct: false });
    const events = [
      missed,
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false, conceptIds: [CONCEPT] }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true, conceptIds: [CONCEPT] })
    ];
    const result = deriveLearningInsights([...events, repair]);
    const group = conceptGroup(result);
    expect(group?.state).toBe("NEEDS_REVIEW");
    expect(group?.reasonCodes).toContain("REPAIR_STILL_MISSED");
  });
});

describe("Scenario F — strong recent performance", () => {
  it("5+ attempts, 3+ distinct, last 5 >= 4 correct, no Sure miss, no failed Repair -> STRONGER_EVIDENCE", () => {
    const events = [
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: true, confidence: "sure", conceptIds: [CONCEPT] }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: true, confidence: "sure", conceptIds: [CONCEPT] }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true, confidence: "sure", conceptIds: [CONCEPT] }),
      makeApplyEvent({ questionId: "q1", occurredAt: 400, correct: true, confidence: "sure", conceptIds: [CONCEPT] }),
      makeApplyEvent({ questionId: "q2", occurredAt: 500, correct: true, confidence: "sure", conceptIds: [CONCEPT] })
    ];
    const result = deriveLearningInsights(events);
    expect(conceptGroup(result)?.state).toBe("STRONGER_EVIDENCE");
    expect(result.recommendations).toEqual([]); // never a "study this now" prompt
  });
});

describe("Scenario G — cross-concept qualifier issue", () => {
  it("the same qualifier missed across 2+ distinct concepts produces a cross-cutting recommendation candidate", () => {
    // Distinct familyId/domain per concept so the higher-priority family
    // axis never happens to cover the exact same attempts as the
    // qualifier group — this test is specifically about qualifier breadth,
    // not an incidental family/domain overlap.
    const events = [
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false, qualifier: "qualifier.next", conceptIds: ["concept.a"], familyId: "family.a", domain: "domain.d1" }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false, qualifier: "qualifier.next", conceptIds: ["concept.b"], familyId: "family.b", domain: "domain.d2" }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true, qualifier: "qualifier.next", conceptIds: ["concept.a"], familyId: "family.a", domain: "domain.d1" })
    ];
    const result = deriveLearningInsights(events);
    const qualifierGroup = result.groups.find((g) => g.identity.key === "qualifier:qualifier.next");
    expect(qualifierGroup?.state).toBe("NEEDS_REVIEW");
    expect(result.recommendations.some((r) => r.target.key === "qualifier:qualifier.next")).toBe(true);
  });

  it("the same qualifier missed within only 1 concept does NOT produce a cross-cutting recommendation", () => {
    const events = [
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false, qualifier: "qualifier.next", conceptIds: ["concept.a"] }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false, qualifier: "qualifier.next", conceptIds: ["concept.a"] }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true, qualifier: "qualifier.next", conceptIds: ["concept.a"] })
    ];
    const result = deriveLearningInsights(events);
    expect(result.recommendations.some((r) => r.target.key === "qualifier:qualifier.next")).toBe(false);
  });
});

describe("Scenario H — QA contamination", () => {
  it("adding many prototype-fixture failures never changes the production-only insight result", () => {
    const production = [
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false, confidence: "sure", conceptIds: [CONCEPT] }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false, confidence: "sure", conceptIds: [CONCEPT] }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true, conceptIds: [CONCEPT] })
    ];
    const withoutQA = deriveLearningInsights(production);

    const qaFailures = Array.from({ length: 15 }, (_, i) =>
      makeApplyEvent({
        sourceContext: "prototype",
        questionId: `qa-fail-${i}`,
        occurredAt: 9000 + i,
        correct: false,
        confidence: "sure",
        conceptIds: [CONCEPT]
      })
    );
    const withQA = deriveLearningInsights([...production, ...qaFailures]);

    expect(withQA).toEqual(withoutQA);
  });
});

describe("top-three recommendation ranking example", () => {
  it("ranks NEEDS_REVIEW groups by severity/evidence and caps at 3", () => {
    function needsReviewConcept(id: string, failedRepairs: number, occurredAtBase: number) {
      const missed = makeApplyEvent({ questionId: `${id}-q1`, occurredAt: occurredAtBase, correct: false, conceptIds: [id] });
      const events = [
        missed,
        makeApplyEvent({ questionId: `${id}-q2`, occurredAt: occurredAtBase + 10, correct: false, conceptIds: [id] }),
        makeApplyEvent({ questionId: `${id}-q3`, occurredAt: occurredAtBase + 20, correct: true, conceptIds: [id] })
      ];
      const repairs = failedRepairs > 0 ? [makeRepairEvent({ parentAttemptId: missed.attemptId, occurredAt: occurredAtBase + 1, correct: false })] : [];
      return [...events, ...repairs];
    }

    const events = [
      ...needsReviewConcept("concept.low", 0, 1000),
      ...needsReviewConcept("concept.high", 1, 2000),
      ...needsReviewConcept("concept.mid", 0, 3000)
    ];
    const result = deriveLearningInsights(events);
    expect(result.recommendations.length).toBeLessThanOrEqual(3);
    expect(result.recommendations[0]?.target.targetId).toBe("concept.high"); // the failed-Repair group ranks first
  });
});
