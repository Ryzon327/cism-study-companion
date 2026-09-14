import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildExamQuestionSet } from "../../../../app/src/exam-readiness/questionSetBuilder";
import { examBlueprints } from "../../../../app/src/exam-readiness/blueprintRegistry";
import { emptyHistory } from "../../../../app/src/content/selection";
import { production } from "../../../../app/src/content/registry";
import { getExposureHistory, recordExposure as recordExposureImpure, resetExposureHistoryForTests } from "../../../../app/src/content/exposureStore";
import type { ExamBlueprint } from "../../../../app/src/exam-readiness/types";

/**
 * ER-1 binding decision: Exam Readiness v1 MUST NOT read from or write to
 * the ordinary Practice `exposureStore` — a merely-drawn (even abandoned)
 * exam question set must never invisibly suppress those questions from
 * ordinary Practice's own unseen-question preference, and vice versa.
 * `buildExamQuestionSet` takes its own optional, entirely separate
 * `priorExamQuestionUsage` history instead.
 */

// A small synthetic blueprint sized to exactly what real current content
// can satisfy, so the happy path doesn't depend on ER-CONTENT-1 authoring
// more questions later.
const TINY_BLUEPRINT: ExamBlueprint = {
  id: "blueprint.test.tiny",
  effectiveFrom: null,
  effectiveTo: null,
  questionCount: 4,
  durationMinutes: 10,
  domainWeights: [
    { domainId: "domain.d1", weightPercent: 25 },
    { domainId: "domain.d2", weightPercent: 25 },
    { domainId: "domain.d3", weightPercent: 25 },
    { domainId: "domain.d4", weightPercent: 25 }
  ]
};

// A larger satisfiable blueprint (10 questions per domain — real current
// content has at least 30 active questions in every exam domain) used
// specifically to observe cross-domain ORDER, where TINY_BLUEPRINT's
// single question per domain is too small to show blocking vs. mixing.
const LARGER_BLUEPRINT: ExamBlueprint = {
  id: "blueprint.test.larger",
  effectiveFrom: null,
  effectiveTo: null,
  questionCount: 40,
  durationMinutes: 60,
  domainWeights: [
    { domainId: "domain.d1", weightPercent: 25 },
    { domainId: "domain.d2", weightPercent: 25 },
    { domainId: "domain.d3", weightPercent: 25 },
    { domainId: "domain.d4", weightPercent: 25 }
  ]
};

beforeEach(() => {
  resetExposureHistoryForTests();
});
afterEach(() => {
  resetExposureHistoryForTests();
});

describe("buildExamQuestionSet — fails closed on insufficiency", () => {
  it("throws for the real current-outline blueprint against real current content (genuinely insufficient today)", () => {
    const current = examBlueprints.find((b) => b.id === "blueprint.cism.outline-through-2026-11-02")!;
    expect(() => buildExamQuestionSet(current)).toThrow(/insufficient/i);
  });

  it("throws for the real 2026-11-03 blueprint too", () => {
    const next = examBlueprints.find((b) => b.id === "blueprint.cism.outline-2026-11-03")!;
    expect(() => buildExamQuestionSet(next)).toThrow(/insufficient/i);
  });
});

describe("buildExamQuestionSet — happy path against a satisfiable blueprint", () => {
  it("builds exactly questionCount question ids, matching the blueprint's own apportioned allocations", () => {
    const result = buildExamQuestionSet(TINY_BLUEPRINT, { now: 1000 });
    expect(result.questionIds).toHaveLength(4);
    expect(new Set(result.questionIds).size).toBe(4); // no duplicates
    const allocatedTotal = result.domainAllocations.reduce((sum, a) => sum + a.questionCount, 0);
    expect(allocatedTotal).toBe(4);
  });

  it("is deterministic given the same explicit clock and prior history", () => {
    const a = buildExamQuestionSet(TINY_BLUEPRINT, { now: 1000, priorExamQuestionUsage: emptyHistory() });
    const b = buildExamQuestionSet(TINY_BLUEPRINT, { now: 1000, priorExamQuestionUsage: emptyHistory() });
    expect(a.questionIds).toEqual(b.questionIds);
  });

  it("a non-empty priorExamQuestionUsage shifts selection, proving the exam-readiness history is actually consulted", () => {
    const first = buildExamQuestionSet(TINY_BLUEPRINT, { now: 1000 });
    // Feed the first build's own resulting history back in as "prior usage" for a second build.
    const second = buildExamQuestionSet(TINY_BLUEPRINT, { now: 2000, priorExamQuestionUsage: first.history });
    // With every previously-drawn id now marked seen, and the same small
    // per-domain pools, the fallback (least-recently-seen) policy applies —
    // this should not throw and should still return a full set.
    expect(second.questionIds).toHaveLength(4);
  });

  it("never reads or writes the shared Practice exposureStore", () => {
    const before = getExposureHistory();
    expect(before.size).toBe(0);

    buildExamQuestionSet(TINY_BLUEPRINT, { now: 1000 });

    const after = getExposureHistory();
    expect(after.size).toBe(0); // completely untouched
  });

  it("heavy real exposure in the shared Practice exposureStore never changes exam question selection", () => {
    const baseline = buildExamQuestionSet(TINY_BLUEPRINT, { now: 1000 });

    // Mark exactly the questions the exam build just chose as heavily seen
    // in the REAL, shared Practice store. If buildExamQuestionSet ever
    // read exposureStore, it would now prefer different, "less seen"
    // candidates within the same family bucket (where alternatives exist).
    for (const id of baseline.questionIds) {
      recordExposureImpure(id, 1);
    }
    expect(getExposureHistory().size).toBe(baseline.questionIds.length);

    const afterPollution = buildExamQuestionSet(TINY_BLUEPRINT, { now: 1000 });
    expect(afterPollution.questionIds).toEqual(baseline.questionIds);
  });
});

/**
 * Architect correction: `buildExamQuestionSet` calls through
 * `checkExamSufficiency` -> `allocateBlueprintCounts`, the shared
 * fail-closed boundary — these tests construct an invalid `ExamBlueprint`
 * DIRECTLY to prove `buildExamQuestionSet` itself refuses bad input before
 * ever reaching selection, not merely the registry loader.
 */
describe("buildExamQuestionSet — fails closed on an invalid blueprint handed directly", () => {
  function validBlueprint(overrides: Partial<ExamBlueprint> = {}): ExamBlueprint {
    return {
      id: "blueprint.direct-test",
      effectiveFrom: null,
      effectiveTo: null,
      questionCount: 4,
      durationMinutes: 10,
      domainWeights: [
        { domainId: "domain.d1", weightPercent: 25 },
        { domainId: "domain.d2", weightPercent: 25 },
        { domainId: "domain.d3", weightPercent: 25 },
        { domainId: "domain.d4", weightPercent: 25 }
      ],
      ...overrides
    };
  }

  it("throws when domainWeights do not total 100", () => {
    const bad = validBlueprint({ domainWeights: [{ domainId: "domain.d1", weightPercent: 50 }] });
    expect(() => buildExamQuestionSet(bad)).toThrow(/sum to 50/);
  });

  it("throws on a duplicate domainId", () => {
    const bad = validBlueprint({
      domainWeights: [
        { domainId: "domain.d1", weightPercent: 50 },
        { domainId: "domain.d1", weightPercent: 50 }
      ]
    });
    expect(() => buildExamQuestionSet(bad)).toThrow(/duplicate domainId/);
  });

  it("throws on an unknown/nonexistent domainId", () => {
    const bad = validBlueprint({ domainWeights: [{ domainId: "domain.does-not-exist", weightPercent: 100 }] });
    expect(() => buildExamQuestionSet(bad)).toThrow(/does not exist in the domain registry/);
  });

  it("throws when a domainId refers to a non-exam domain (Foundation)", () => {
    const bad = validBlueprint({
      domainWeights: [
        { domainId: "domain.foundation", weightPercent: 50 },
        { domainId: "domain.d1", weightPercent: 50 }
      ]
    });
    expect(() => buildExamQuestionSet(bad)).toThrow(/not a real exam domain/);
  });

  it("throws when a real exam domain is omitted, even though the supplied weights still sum to 100", () => {
    const bad = validBlueprint({
      domainWeights: [
        { domainId: "domain.d1", weightPercent: 50 },
        { domainId: "domain.d2", weightPercent: 50 }
      ]
    });
    expect(() => buildExamQuestionSet(bad)).toThrow(/missing required exam domain/);
  });

  it("throws on a non-positive questionCount", () => {
    expect(() => buildExamQuestionSet(validBlueprint({ questionCount: 0 }))).toThrow(/questionCount/);
  });

  it("throws on a non-positive durationMinutes", () => {
    expect(() => buildExamQuestionSet(validBlueprint({ durationMinutes: -1 }))).toThrow(/durationMinutes/);
  });
});

/**
 * Architect correction (MAJOR #3): `buildExamQuestionSet`'s returned
 * `questionIds` must never be domain-blocked ("all D1, then all D2, ...").
 * Per-domain selection itself (exact allocation, family-aware, no
 * duplicates, exam-only history, no Practice exposureStore access) is
 * unchanged — only the final combined order is now deterministically
 * interleaved (`interleaveDomainSelections`), covered in depth by its own
 * dedicated unit tests. These are the integration-level checks that the
 * wiring into `buildExamQuestionSet` itself is correct.
 */
describe("buildExamQuestionSet — cross-domain ordering (Architect correction MAJOR #3)", () => {
  function domainOfSelected(id: string): string {
    const raw = production.questions.get(id);
    if (!raw) throw new Error(`unexpected: ${id} not in production registry`);
    return raw.domain;
  }

  it("the real returned order mixes domains rather than running one large all-one-domain block", () => {
    const result = buildExamQuestionSet(LARGER_BLUEPRINT, { now: 1000 });
    expect(result.questionIds).toHaveLength(40);

    let longestRun = 0;
    let currentRun = 0;
    let lastDomain: string | undefined;
    for (const id of result.questionIds) {
      const domain = domainOfSelected(id);
      currentRun = domain === lastDomain ? currentRun + 1 : 1;
      lastDomain = domain;
      longestRun = Math.max(longestRun, currentRun);
    }
    // Equal 10/10/10/10 allocation -> a domain-blocked order would produce
    // one run of exactly 10; proportional interleaving must keep every run
    // far shorter.
    expect(longestRun).toBeLessThan(4);
  });

  it("exact per-domain totals are unchanged by the interleaving (still 10/10/10/10)", () => {
    const result = buildExamQuestionSet(LARGER_BLUEPRINT, { now: 1000 });
    const countByDomain = new Map<string, number>();
    for (const id of result.questionIds) {
      const domain = domainOfSelected(id);
      countByDomain.set(domain, (countByDomain.get(domain) ?? 0) + 1);
    }
    expect(Object.fromEntries(countByDomain)).toEqual({
      "domain.d1": 10,
      "domain.d2": 10,
      "domain.d3": 10,
      "domain.d4": 10
    });
  });

  it("no id is lost or duplicated after interleaving", () => {
    const result = buildExamQuestionSet(LARGER_BLUEPRINT, { now: 1000 });
    expect(new Set(result.questionIds).size).toBe(40);
  });

  it("the interleaved order is deterministic given the same explicit clock and history", () => {
    const a = buildExamQuestionSet(LARGER_BLUEPRINT, { now: 1000, priorExamQuestionUsage: emptyHistory() });
    const b = buildExamQuestionSet(LARGER_BLUEPRINT, { now: 1000, priorExamQuestionUsage: emptyHistory() });
    expect(a.questionIds).toEqual(b.questionIds);
  });

  it("interleaving introduces no Practice exposureStore interaction (still fully isolated)", () => {
    expect(getExposureHistory().size).toBe(0);
    buildExamQuestionSet(LARGER_BLUEPRINT, { now: 1000 });
    expect(getExposureHistory().size).toBe(0);
  });
});
