import { describe, it, expect, beforeEach } from "vitest";
import { buildRepairIndex } from "../../../../app/src/learning-intelligence/repairLinkage";
import { makeApplyEvent, makeRepairEvent, resetFixtureIds } from "./fixtures";

beforeEach(() => resetFixtureIds());

describe("buildRepairIndex", () => {
  it("resolves CORRECTED_ON_REPAIR for a correct Repair linked to its parent", () => {
    const apply = makeApplyEvent({ correct: false });
    const repair = makeRepairEvent({ parentAttemptId: apply.attemptId, correct: true });
    const { index, diagnostics } = buildRepairIndex([apply], [repair]);
    expect(index.outcomeForAttempt(apply.attemptId)).toBe("CORRECTED_ON_REPAIR");
    expect(diagnostics).toEqual([]);
  });

  it("resolves REPAIR_STILL_MISSED for an incorrect Repair", () => {
    const apply = makeApplyEvent({ correct: false });
    const repair = makeRepairEvent({ parentAttemptId: apply.attemptId, correct: false });
    const { index } = buildRepairIndex([apply], [repair]);
    expect(index.outcomeForAttempt(apply.attemptId)).toBe("REPAIR_STILL_MISSED");
  });

  it("returns null for an attempt with no linked Repair (correct Apply, no Repair shown)", () => {
    const apply = makeApplyEvent({ correct: true });
    const { index } = buildRepairIndex([apply], []);
    expect(index.outcomeForAttempt(apply.attemptId)).toBeNull();
  });

  it("emits an ORPHAN_REPAIR diagnostic and excludes it from the index when the parent cannot be resolved", () => {
    const apply = makeApplyEvent({ correct: false });
    const orphan = makeRepairEvent({ parentAttemptId: "does-not-exist", correct: false });
    const { index, diagnostics } = buildRepairIndex([apply], [orphan]);
    expect(index.outcomeForAttempt(apply.attemptId)).toBeNull();
    expect(diagnostics).toEqual([{ kind: "ORPHAN_REPAIR", eventId: orphan.eventId, detail: expect.any(String) }]);
  });

  it("never mutates the primary attempt on Repair resolution", () => {
    const apply = makeApplyEvent({ correct: false });
    const frozenApply = Object.freeze({ ...apply });
    const repair = makeRepairEvent({ parentAttemptId: frozenApply.attemptId, correct: true });
    buildRepairIndex([frozenApply], [repair]);
    expect(frozenApply.correct).toBe(false); // never flipped to "correct" by a successful Repair
  });

  it("a second Repair on the same parent (defensive, should not occur in practice) resolves deterministically to the most recent one", () => {
    const apply = makeApplyEvent({ correct: false });
    const first = makeRepairEvent({ parentAttemptId: apply.attemptId, correct: false, occurredAt: 100 });
    const second = makeRepairEvent({ parentAttemptId: apply.attemptId, correct: true, occurredAt: 200 });
    const { index } = buildRepairIndex([apply], [first, second]);
    expect(index.outcomeForAttempt(apply.attemptId)).toBe("CORRECTED_ON_REPAIR");
  });
});
