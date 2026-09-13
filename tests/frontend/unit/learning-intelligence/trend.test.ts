import { describe, it, expect, beforeEach } from "vitest";
import { computeTrend } from "../../../../app/src/learning-intelligence/trend";
import { makeApplyEvent, resetFixtureIds } from "./fixtures";

beforeEach(() => resetFixtureIds());

function attemptsWith(correctness: boolean[]): ReturnType<typeof makeApplyEvent>[] {
  return correctness.map((correct, i) => makeApplyEvent({ questionId: `q${i}`, occurredAt: (i + 1) * 100, correct }));
}

describe("computeTrend (§18)", () => {
  it("fewer than 6 eligible primary attempts -> insufficient evidence (null)", () => {
    expect(computeTrend(attemptsWith([true, true, true, true, true]))).toBeNull();
  });

  it("recent 3 beat previous 3 by >= 2 correct -> IMPROVING", () => {
    // previous 3: 1 correct; recent 3: 3 correct -> delta 2
    expect(computeTrend(attemptsWith([false, false, true, true, true, true]))).toBe("IMPROVING");
  });

  it("previous 3 beat recent 3 by >= 2 correct -> NEEDS_REVIEW", () => {
    // previous 3: 3 correct; recent 3: 1 correct -> delta 2
    expect(computeTrend(attemptsWith([true, true, true, false, false, true]))).toBe("NEEDS_REVIEW");
  });

  it("a small shift (< 2) -> MIXED_DEVELOPING", () => {
    // previous 3: 2 correct; recent 3: 2 correct -> delta 0
    expect(computeTrend(attemptsWith([true, true, false, true, true, false]))).toBe("MIXED_DEVELOPING");
  });

  it("uses only the most recent 6, ignoring older history", () => {
    const older = [makeApplyEvent({ questionId: "old1", occurredAt: 1, correct: false }), makeApplyEvent({ questionId: "old2", occurredAt: 2, correct: false })];
    const recentSix = attemptsWith([false, false, true, true, true, true]).map((a, i) => ({ ...a, occurredAt: 100 + i * 100 }));
    expect(computeTrend([...older, ...recentSix])).toBe("IMPROVING");
  });

  it("never uses decimal/percentage precision — output is one of the fixed trend states", () => {
    const result = computeTrend(attemptsWith([true, true, true, true, true, true]));
    expect(["IMPROVING", "MIXED_DEVELOPING", "NEEDS_REVIEW", null]).toContain(result);
  });
});
