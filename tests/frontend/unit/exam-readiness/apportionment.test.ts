import { describe, it, expect } from "vitest";
import { allocateBlueprintCounts } from "../../../../app/src/exam-readiness/apportionment";
import { examBlueprints } from "../../../../app/src/exam-readiness/blueprintRegistry";
import type { ExamBlueprint } from "../../../../app/src/exam-readiness/types";

/**
 * ER-1: the largest-remainder apportionment algorithm, mandated by the
 * Architect specifically to replace an earlier, naive per-domain-rounding
 * approach that produced an inconsistent 151-question total. These exact
 * expected outputs (25/30/50/45 and 27/30/50/43) were independently
 * verified against the Architect's own stated numbers before this test was
 * written.
 *
 * Every synthetic blueprint below uses the real exam domain ids
 * (domain.d1-d4), ALL FOUR of them, exactly once each: since
 * `allocateBlueprintCounts` now fails closed on an invalid blueprint
 * (Architect correction passes — see blueprintValidation.ts's
 * `assertValidExamBlueprint`, which requires every registered
 * `exam_domain` to appear exactly once), a blueprint omitting a real exam
 * domain, or using an invented placeholder id, would make these tests
 * throw instead of exercising the apportionment math itself.
 */

describe("allocateBlueprintCounts — largest-remainder apportionment", () => {
  it("current outline (17/20/33/30 @ 150) allocates exactly 25/30/50/45", () => {
    const current = examBlueprints.find((b) => b.id === "blueprint.cism.outline-through-2026-11-02")!;
    const allocations = allocateBlueprintCounts(current);
    const byDomain = Object.fromEntries(allocations.map((a) => [a.domainId, a.questionCount]));
    expect(byDomain).toEqual({ "domain.d1": 25, "domain.d2": 30, "domain.d3": 50, "domain.d4": 45 });
    expect(allocations.reduce((sum, a) => sum + a.questionCount, 0)).toBe(150);
  });

  it("2026-11-03 outline (18/20/33/29 @ 150) allocates exactly 27/30/50/43", () => {
    const next = examBlueprints.find((b) => b.id === "blueprint.cism.outline-2026-11-03")!;
    const allocations = allocateBlueprintCounts(next);
    const byDomain = Object.fromEntries(allocations.map((a) => [a.domainId, a.questionCount]));
    expect(byDomain).toEqual({ "domain.d1": 27, "domain.d2": 30, "domain.d3": 50, "domain.d4": 43 });
    expect(allocations.reduce((sum, a) => sum + a.questionCount, 0)).toBe(150);
  });

  it("always allocates a total exactly equal to questionCount, for arbitrary weights (no under/over count)", () => {
    const cases: ExamBlueprint[] = [
      { id: "x1", effectiveFrom: null, effectiveTo: null, questionCount: 150, domainWeights: [
        { domainId: "domain.d1", weightPercent: 1 }, { domainId: "domain.d2", weightPercent: 1 },
        { domainId: "domain.d3", weightPercent: 1 }, { domainId: "domain.d4", weightPercent: 97 }
      ], durationMinutes: 240 },
      { id: "x2", effectiveFrom: null, effectiveTo: null, questionCount: 7, domainWeights: [
        { domainId: "domain.d1", weightPercent: 22 }, { domainId: "domain.d2", weightPercent: 22 },
        { domainId: "domain.d3", weightPercent: 22 }, { domainId: "domain.d4", weightPercent: 34 }
      ], durationMinutes: 240 },
      { id: "x3", effectiveFrom: null, effectiveTo: null, questionCount: 1, domainWeights: [
        { domainId: "domain.d1", weightPercent: 25 }, { domainId: "domain.d2", weightPercent: 25 },
        { domainId: "domain.d3", weightPercent: 25 }, { domainId: "domain.d4", weightPercent: 25 }
      ], durationMinutes: 240 }
    ];
    for (const blueprint of cases) {
      const total = allocateBlueprintCounts(blueprint).reduce((sum, a) => sum + a.questionCount, 0);
      expect(total).toBe(blueprint.questionCount);
    }
  });

  it("never produces a negative allocation for any domain", () => {
    const blueprint: ExamBlueprint = {
      id: "x", effectiveFrom: null, effectiveTo: null, questionCount: 1, durationMinutes: 240,
      domainWeights: [
        { domainId: "domain.d1", weightPercent: 1 },
        { domainId: "domain.d2", weightPercent: 1 },
        { domainId: "domain.d3", weightPercent: 1 },
        { domainId: "domain.d4", weightPercent: 97 }
      ]
    };
    const allocations = allocateBlueprintCounts(blueprint);
    for (const allocation of allocations) {
      expect(allocation.questionCount).toBeGreaterThanOrEqual(0);
    }
  });

  it("prefers the larger remainder when remainders differ (not yet a genuine tie)", () => {
    // Q=4, weights d1=17,d2=33,d3=25,d4=25 (sum 100):
    // d1: exact .68 (base 0, rem .68); d2: exact 1.32 (base 1, rem .32);
    // d3/d4: exact 1.0 each (base 1, rem 0 — deliberately inert, never compete).
    // baseTotal = 0+1+1+1 = 3, leftover = 1. d1's remainder (.68) is the
    // largest, so it alone wins the leftover slot — no tie-break needed yet
    // (the genuine equal-remainder case is tested separately below).
    const blueprint: ExamBlueprint = {
      id: "remainder-only", effectiveFrom: null, effectiveTo: null, questionCount: 4, durationMinutes: 240,
      domainWeights: [
        { domainId: "domain.d1", weightPercent: 17 },
        { domainId: "domain.d2", weightPercent: 33 },
        { domainId: "domain.d3", weightPercent: 25 },
        { domainId: "domain.d4", weightPercent: 25 }
      ]
    };
    const allocations = allocateBlueprintCounts(blueprint);
    const byDomain = Object.fromEntries(allocations.map((a) => [a.domainId, a.questionCount]));
    expect(byDomain).toEqual({ "domain.d1": 1, "domain.d2": 1, "domain.d3": 1, "domain.d4": 1 });
  });

  it("tie-breaks a genuine equal-remainder case by higher published weight", () => {
    // Q=10, weights d1=15,d2=65,d3=10,d4=10 (sum 100):
    // d1: exact 1.5 (base 1, rem .5); d2: exact 6.5 (base 6, rem .5) — a
    // genuine tie between d1 and d2 (same remainder, last-digit-5 weights);
    // d3/d4: exact 1.0 each (base 1, rem 0 — inert, never compete).
    // baseTotal = 1+6+1+1 = 9, leftover = 1. Higher weight (d2=65 > d1=15)
    // must win the leftover slot.
    const blueprint: ExamBlueprint = {
      id: "tie2", effectiveFrom: null, effectiveTo: null, questionCount: 10, durationMinutes: 240,
      domainWeights: [
        { domainId: "domain.d1", weightPercent: 15 },
        { domainId: "domain.d2", weightPercent: 65 },
        { domainId: "domain.d3", weightPercent: 10 },
        { domainId: "domain.d4", weightPercent: 10 }
      ]
    };
    const allocations = allocateBlueprintCounts(blueprint);
    const byDomain = Object.fromEntries(allocations.map((a) => [a.domainId, a.questionCount]));
    expect(byDomain).toEqual({ "domain.d1": 1, "domain.d2": 7, "domain.d3": 1, "domain.d4": 1 });
    expect(allocations.reduce((sum, a) => sum + a.questionCount, 0)).toBe(10);
  });

  it("a genuine 3-way equal-remainder, equal-weight tie resolves by ascending domain-id, with only the lowest ids winning the available leftover slots", () => {
    // weights 13/13/13/61 @ questionCount 20:
    // d1=d2=d3: exact 2.6 (base 2, rem .6); d4: exact 12.2 (base 12, rem .2).
    // baseTotal = 2+2+2+12 = 18, leftover = 2.
    // d1/d2/d3 tie at the highest remainder (.6) AND the same weight (13), so the
    // tie-break falls all the way to domain-id ascending order: domain.d1 and
    // domain.d2 (the two lowest of the three tied ids) win the 2 leftover slots;
    // domain.d3 — same remainder, same weight, but the highest id of the three —
    // does not. domain.d4's lower remainder (.2) never competes at all.
    const blueprint: ExamBlueprint = {
      id: "three-way-tie", effectiveFrom: null, effectiveTo: null, questionCount: 20, durationMinutes: 240,
      domainWeights: [
        { domainId: "domain.d1", weightPercent: 13 },
        { domainId: "domain.d2", weightPercent: 13 },
        { domainId: "domain.d3", weightPercent: 13 },
        { domainId: "domain.d4", weightPercent: 61 }
      ]
    };
    const allocations = allocateBlueprintCounts(blueprint);
    const byDomain = Object.fromEntries(allocations.map((a) => [a.domainId, a.questionCount]));
    expect(byDomain).toEqual({ "domain.d1": 3, "domain.d2": 3, "domain.d3": 2, "domain.d4": 12 });
    expect(allocations.reduce((sum, a) => sum + a.questionCount, 0)).toBe(20);
  });
});

/**
 * Architect correction: `allocateBlueprintCounts` is the shared fail-closed
 * boundary every Exam Readiness operation calls through. These tests
 * construct an invalid `ExamBlueprint` object DIRECTLY (never touching
 * `blueprintRegistry.ts`'s own JSON-load-time check) to prove the function
 * itself refuses bad input, not merely the loader.
 */
describe("allocateBlueprintCounts — fails closed on an invalid blueprint handed directly", () => {
  function validBlueprint(overrides: Partial<ExamBlueprint> = {}): ExamBlueprint {
    return {
      id: "blueprint.direct-test",
      effectiveFrom: null,
      effectiveTo: null,
      questionCount: 100,
      durationMinutes: 240,
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
    expect(() => allocateBlueprintCounts(bad)).toThrow(/sum to 50/);
  });

  it("throws on a duplicate domainId", () => {
    const bad = validBlueprint({
      domainWeights: [
        { domainId: "domain.d1", weightPercent: 25 },
        { domainId: "domain.d1", weightPercent: 25 },
        { domainId: "domain.d2", weightPercent: 25 },
        { domainId: "domain.d3", weightPercent: 25 }
      ]
    });
    expect(() => allocateBlueprintCounts(bad)).toThrow(/duplicate domainId/);
  });

  it("throws on an unknown/nonexistent domainId", () => {
    const bad = validBlueprint({
      domainWeights: [
        { domainId: "domain.d1", weightPercent: 25 },
        { domainId: "domain.d2", weightPercent: 25 },
        { domainId: "domain.d3", weightPercent: 25 },
        { domainId: "domain.does-not-exist", weightPercent: 25 }
      ]
    });
    expect(() => allocateBlueprintCounts(bad)).toThrow(/does not exist in the domain registry/);
  });

  it("throws when a domainId refers to a non-exam domain (Foundation), even alongside every real exam domain present", () => {
    const bad = validBlueprint({
      domainWeights: [
        { domainId: "domain.d1", weightPercent: 20 },
        { domainId: "domain.d2", weightPercent: 20 },
        { domainId: "domain.d3", weightPercent: 20 },
        { domainId: "domain.d4", weightPercent: 20 },
        { domainId: "domain.foundation", weightPercent: 20 }
      ]
    });
    expect(() => allocateBlueprintCounts(bad)).toThrow(/not a real exam domain/);
  });

  it("throws when a real exam domain is omitted, even though the supplied weights still sum to 100", () => {
    const bad = validBlueprint({
      domainWeights: [
        { domainId: "domain.d1", weightPercent: 50 },
        { domainId: "domain.d2", weightPercent: 50 }
        // domain.d3 and domain.d4 omitted entirely.
      ]
    });
    expect(() => allocateBlueprintCounts(bad)).toThrow(/missing required exam domain/);
  });

  it("does not throw when every real exam domain appears exactly once", () => {
    expect(() => allocateBlueprintCounts(validBlueprint())).not.toThrow();
  });

  it("throws on a non-positive questionCount", () => {
    expect(() => allocateBlueprintCounts(validBlueprint({ questionCount: 0 }))).toThrow(/questionCount/);
    expect(() => allocateBlueprintCounts(validBlueprint({ questionCount: -10 }))).toThrow(/questionCount/);
  });

  it("throws on a non-positive durationMinutes", () => {
    expect(() => allocateBlueprintCounts(validBlueprint({ durationMinutes: 0 }))).toThrow(/durationMinutes/);
    expect(() => allocateBlueprintCounts(validBlueprint({ durationMinutes: -5 }))).toThrow(/durationMinutes/);
  });

  it("does not throw for a genuinely valid blueprint handed directly", () => {
    expect(() => allocateBlueprintCounts(validBlueprint())).not.toThrow();
  });
});
