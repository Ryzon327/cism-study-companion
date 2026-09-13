import { describe, it, expect, beforeEach } from "vitest";
import { classifyGroup } from "../../../../app/src/learning-intelligence/classification";
import { buildRepairIndex } from "../../../../app/src/learning-intelligence/repairLinkage";
import type { RawGroup } from "../../../../app/src/learning-intelligence/grouping";
import type { QuestionAttemptEvent, RepairAttemptEvent } from "../../../../app/src/learning-history";
import { makeApplyEvent, makeRecallEvent, makeRepairEvent, resetFixtureIds } from "./fixtures";

beforeEach(() => resetFixtureIds());

const IDENTITY = { axis: "concept" as const, targetId: "concept.test", key: "concept:concept.test" };

function classify(primaryAttempts: QuestionAttemptEvent[], repairAttempts: RepairAttemptEvent[] = []) {
  const raw: RawGroup = { identity: IDENTITY, primaryAttempts, recallAttempts: [] };
  const { index } = buildRepairIndex(primaryAttempts, repairAttempts);
  return classifyGroup(raw, index);
}

describe("minimum evidence (§10)", () => {
  it("fewer than 3 attempts -> NOT_ENOUGH_EVIDENCE / INSUFFICIENT_ATTEMPTS", () => {
    const result = classify([
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false })
    ]);
    expect(result.state).toBe("NOT_ENOUGH_EVIDENCE");
    expect(result.reasonCodes).toEqual(["INSUFFICIENT_ATTEMPTS"]);
  });

  it("3+ attempts but only 1 distinct question -> NOT_ENOUGH_EVIDENCE / INSUFFICIENT_BREADTH (one repeated question cannot establish weakness)", () => {
    const result = classify([
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false }),
      makeApplyEvent({ questionId: "q1", occurredAt: 200, correct: false }),
      makeApplyEvent({ questionId: "q1", occurredAt: 300, correct: false })
    ]);
    expect(result.state).toBe("NOT_ENOUGH_EVIDENCE");
    expect(result.reasonCodes).toEqual(["INSUFFICIENT_BREADTH"]);
  });

  it("a single isolated wrong answer never triggers weakness", () => {
    const result = classify([makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false })]);
    expect(result.state).toBe("NOT_ENOUGH_EVIDENCE");
  });

  it("3 attempts across 2 distinct questions meets the floor and is at least classifiable", () => {
    const result = classify([
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: true }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: true }),
      makeApplyEvent({ questionId: "q1", occurredAt: 300, correct: true })
    ]);
    expect(result.state).not.toBe("NOT_ENOUGH_EVIDENCE");
  });
});

describe("NEEDS_REVIEW — condition A: repeated misses (§12)", () => {
  it("2 incorrect attempts across 2 distinct questions -> NEEDS_REVIEW / REPEATED_MISSES", () => {
    const result = classify([
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true })
    ]);
    expect(result.state).toBe("NEEDS_REVIEW");
    expect(result.reasonCodes).toContain("REPEATED_MISSES");
  });

  it("2 misses on the SAME question do not satisfy condition A (no distinct-question breadth)", () => {
    const result = classify([
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false }),
      makeApplyEvent({ questionId: "q1", occurredAt: 200, correct: false }),
      makeApplyEvent({ questionId: "q2", occurredAt: 300, correct: true })
    ]);
    expect(result.reasonCodes).not.toContain("REPEATED_MISSES");
  });

  it("a single miss among otherwise-correct attempts stays DEVELOPING, not NEEDS_REVIEW", () => {
    const result = classify([
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: true }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true })
    ]);
    expect(result.state).toBe("DEVELOPING");
  });
});

describe("NEEDS_REVIEW — condition B: confident repeated misses (§12)", () => {
  it("2 Sure+incorrect attempts across 2 distinct questions -> NEEDS_REVIEW / REPEATED_SURE_MISSES", () => {
    const result = classify([
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false, confidence: "sure" }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false, confidence: "sure" }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true })
    ]);
    expect(result.state).toBe("NEEDS_REVIEW");
    expect(result.reasonCodes).toContain("REPEATED_SURE_MISSES");
  });

  it("guessing/not-sure misses never count toward condition B", () => {
    const result = classify([
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false, confidence: "guessing" }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false, confidence: "not-sure" }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true })
    ]);
    // still NEEDS_REVIEW via condition A (2 distinct-question misses), but not via B
    expect(result.reasonCodes).toContain("REPEATED_MISSES");
    expect(result.reasonCodes).not.toContain("REPEATED_SURE_MISSES");
  });
});

describe("NEEDS_REVIEW — condition C: failed Repair + repeated difficulty (§12)", () => {
  it("1 failed Repair + 1 additional incorrect attempt -> NEEDS_REVIEW / REPAIR_STILL_MISSED", () => {
    const missed = makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false });
    const repair = makeRepairEvent({ parentAttemptId: missed.attemptId, occurredAt: 150, correct: false });
    const result = classify(
      [missed, makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false }), makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true })],
      [repair]
    );
    expect(result.state).toBe("NEEDS_REVIEW");
    expect(result.reasonCodes).toContain("REPAIR_STILL_MISSED");
  });

  it("an isolated failed Repair with NO other incorrect attempt does not alone trigger NEEDS_REVIEW", () => {
    const missed = makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false });
    const repair = makeRepairEvent({ parentAttemptId: missed.attemptId, occurredAt: 150, correct: false });
    const result = classify(
      [missed, makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: true }), makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true })],
      [repair]
    );
    expect(result.state).not.toBe("NEEDS_REVIEW");
  });

  it("a successful Repair alone produces DEVELOPING with SUCCESSFUL_CORRECTION, never counted as weakness", () => {
    const missed = makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false });
    const repair = makeRepairEvent({ parentAttemptId: missed.attemptId, occurredAt: 150, correct: true });
    const result = classify(
      [missed, makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: true }), makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true })],
      [repair]
    );
    expect(result.state).toBe("DEVELOPING");
    expect(result.reasonCodes).toContain("SUCCESSFUL_CORRECTION");
  });
});

describe("DEVELOPING (§13)", () => {
  it("low-confidence correct answers produce LOW_CONFIDENCE_CORRECT without implying weakness", () => {
    const result = classify([
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: true, confidence: "guessing" }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: true, confidence: "not-sure" }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true, confidence: "sure" })
    ]);
    expect(result.state).toBe("DEVELOPING");
    expect(result.reasonCodes).toContain("LOW_CONFIDENCE_CORRECT");
  });
});

describe("STRONGER_EVIDENCE (§11)", () => {
  const strongFive = [
    makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: true, confidence: "sure" }),
    makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: true, confidence: "sure" }),
    makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true, confidence: "sure" }),
    makeApplyEvent({ questionId: "q1", occurredAt: 400, correct: true, confidence: "sure" }),
    makeApplyEvent({ questionId: "q2", occurredAt: 500, correct: true, confidence: "sure" })
  ];

  it("5 attempts, 3+ distinct questions, all correct -> STRONGER_EVIDENCE / RECENT_STRONG_PERFORMANCE", () => {
    const result = classify(strongFive);
    expect(result.state).toBe("STRONGER_EVIDENCE");
    expect(result.reasonCodes).toContain("RECENT_STRONG_PERFORMANCE");
  });

  it("never called 'Mastered' — the state constant itself is STRONGER_EVIDENCE, not a permanent-competence label", () => {
    const result = classify(strongFive);
    expect(result.state).not.toMatch(/master/i);
  });

  it("fails the floor with only 4 total attempts, regardless of quality", () => {
    const result = classify(strongFive.slice(0, 4));
    expect(result.state).not.toBe("STRONGER_EVIDENCE");
  });

  it("fails with only 2 distinct questions across the 5", () => {
    const twoDistinct = strongFive.map((a, i) => ({ ...a, questionId: i % 2 === 0 ? "q1" : "q2" }));
    expect(classify(twoDistinct).state).not.toBe("STRONGER_EVIDENCE");
  });

  it("fails with fewer than 4 correct in the last 5", () => {
    const withTwoMisses = strongFive.map((a, i) =>
      i === 0 || i === 1 ? { ...a, correct: false, confidence: "guessing" as const } : a
    );
    expect(classify(withTwoMisses).state).not.toBe("STRONGER_EVIDENCE");
  });

  it("fails if any Sure+incorrect exists in the last 5, even with 4 correct", () => {
    const withSureMiss = strongFive.map((a, i) => (i === 0 ? { ...a, correct: false, confidence: "sure" as const } : a));
    expect(classify(withSureMiss).state).not.toBe("STRONGER_EVIDENCE");
  });

  it("fails if a failed Repair is linked to an incorrect attempt within the last 5", () => {
    const withMiss = strongFive.map((a, i) => (i === 0 ? { ...a, correct: false, confidence: "guessing" as const } : a));
    const repair = makeRepairEvent({ parentAttemptId: withMiss[0]!.attemptId, occurredAt: 110, correct: false });
    expect(classify(withMiss, [repair]).state).not.toBe("STRONGER_EVIDENCE");
  });
});

describe("classification precedence (§14) — recent strong performance is not blocked by an older miss outside the last-5 window", () => {
  it("an old miss present only in the general recent window (last 6), not in the Stronger-Evidence window (last 5), still yields STRONGER_EVIDENCE", () => {
    const oldMiss = makeApplyEvent({ questionId: "q0", occurredAt: 50, correct: false, confidence: "guessing" });
    const strong = [
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: true, confidence: "sure" }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: true, confidence: "sure" }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true, confidence: "sure" }),
      makeApplyEvent({ questionId: "q1", occurredAt: 400, correct: true, confidence: "sure" }),
      makeApplyEvent({ questionId: "q2", occurredAt: 500, correct: true, confidence: "sure" })
    ];
    const result = classify([oldMiss, ...strong]);
    expect(result.state).toBe("STRONGER_EVIDENCE");
  });
});

describe("evidence summary (§19)", () => {
  it("reports all-time aggregate counts alongside recent-window counts", () => {
    const result = classify([
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: true }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true })
    ]);
    expect(result.evidence.primaryAttemptCount).toBe(3);
    expect(result.evidence.distinctQuestionCount).toBe(3);
    expect(result.evidence.recentPrimaryCount).toBe(3);
    expect(result.evidence.lastAttemptAt).toBe(300);
  });

  it("counts Recall correctness separately, never mixed into primary counts", () => {
    const raw: RawGroup = {
      identity: IDENTITY,
      primaryAttempts: [
        makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: true }),
        makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: true }),
        makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true })
      ],
      recallAttempts: [
        makeRecallEvent({ questionId: "q4", occurredAt: 50, correct: true }),
        makeRecallEvent({ questionId: "q5", occurredAt: 60, correct: false })
      ]
    };
    const { index } = buildRepairIndex(raw.primaryAttempts, []);
    const result = classifyGroup(raw, index);
    expect(result.evidence.recallCorrectCount).toBe(1);
    expect(result.evidence.recallIncorrectCount).toBe(1);
    expect(result.evidence.primaryAttemptCount).toBe(3); // Recall never inflates primary counts
  });
});

describe("immutability (§28)", () => {
  it("never mutates frozen input attempts", () => {
    const attempts = [
      Object.freeze(makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false })),
      Object.freeze(makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false })),
      Object.freeze(makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true }))
    ];
    expect(() => classify(attempts)).not.toThrow();
  });
});

describe("determinism (§29)", () => {
  it("the same input always produces the same result", () => {
    const attempts = [
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false, confidence: "sure" }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false, confidence: "sure" }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true })
    ];
    expect(classify([...attempts])).toEqual(classify([...attempts]));
  });
});
