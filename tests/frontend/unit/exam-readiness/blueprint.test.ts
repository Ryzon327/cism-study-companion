import { describe, it, expect } from "vitest";
import { examBlueprints } from "../../../../app/src/exam-readiness/blueprintRegistry";
import { validateExamBlueprintRegistry } from "../../../../app/src/exam-readiness/blueprintValidation";
import { resolveCurrentBlueprint } from "../../../../app/src/exam-readiness/resolveCurrentBlueprint";
import { allocateBlueprintCounts } from "../../../../app/src/exam-readiness/apportionment";
import { checkExamSufficiency } from "../../../../app/src/exam-readiness/sufficiency";
import { registry } from "../../../../app/src/content/registry";
import type { ExamBlueprint } from "../../../../app/src/exam-readiness/types";

/**
 * ER-1: the versioned exam blueprint registry (schema/registry/exam-blueprints.json)
 * is a separate, dated authority from schema/registry/domains.json's own
 * flat `exam_weight` field — a blueprint is immutable once published, and a
 * new outline is a new entry, never an edit to an existing one.
 */

describe("exam-blueprints.json — the real registry", () => {
  it("has exactly two entries: the current outline and the 2026-11-03 outline", () => {
    expect(examBlueprints).toHaveLength(2);
    const ids = examBlueprints.map((b) => b.id).sort();
    expect(ids).toEqual(["blueprint.cism.outline-2026-11-03", "blueprint.cism.outline-through-2026-11-02"]);
  });

  it("both entries are internally valid (weights sum to 100, positive counts, no overlap)", () => {
    expect(validateExamBlueprintRegistry(examBlueprints)).toEqual([]);
  });

  it("both entries specify 150 questions and 240 minutes", () => {
    for (const blueprint of examBlueprints) {
      expect(blueprint.questionCount).toBe(150);
      expect(blueprint.durationMinutes).toBe(240);
    }
  });

  it("current outline weights are 17/20/33/30 across d1-d4", () => {
    const current = examBlueprints.find((b) => b.id === "blueprint.cism.outline-through-2026-11-02")!;
    const byDomain = Object.fromEntries(current.domainWeights.map((w) => [w.domainId, w.weightPercent]));
    expect(byDomain).toEqual({ "domain.d1": 17, "domain.d2": 20, "domain.d3": 33, "domain.d4": 30 });
  });

  it("2026-11-03 outline weights are 18/20/33/29 across d1-d4", () => {
    const next = examBlueprints.find((b) => b.id === "blueprint.cism.outline-2026-11-03")!;
    const byDomain = Object.fromEntries(next.domainWeights.map((w) => [w.domainId, w.weightPercent]));
    expect(byDomain).toEqual({ "domain.d1": 18, "domain.d2": 20, "domain.d3": 33, "domain.d4": 29 });
  });

  it("the two entries' effective ranges are adjacent (no gap, no overlap) at 2026-11-03", () => {
    const current = examBlueprints.find((b) => b.id === "blueprint.cism.outline-through-2026-11-02")!;
    const next = examBlueprints.find((b) => b.id === "blueprint.cism.outline-2026-11-03")!;
    expect(current.effectiveTo).toBe("2026-11-03");
    expect(next.effectiveFrom).toBe("2026-11-03");
    expect(current.effectiveFrom).toBeNull();
    expect(next.effectiveTo).toBeNull();
  });
});

/**
 * Architect correction (ER-1 correction pass): the original version of
 * this block compared domains.json's exam_weight against
 * resolveCurrentBlueprint(examBlueprints, Date.now()) — a wall-clock-
 * dependent assertion that would have turned this exact commit from green
 * to red the moment the real-world date crossed 2026-11-03, with no
 * repository change at all. Test/CI truth must be deterministic from
 * repository state and explicit test inputs, never the machine's actual
 * date/time.
 *
 * schema/registry/domains.json's flat `exam_weight` field is legacy,
 * informational compatibility metadata only — it is NOT Exam Readiness
 * runtime authority and no Exam Readiness code reads it (see the
 * "Exam Readiness does not read domains.json exam_weight" describe block
 * below). The versioned blueprint registry
 * (schema/registry/exam-blueprints.json) is the sole runtime authority for
 * which outline applies. This test is therefore a STATIC, explicitly
 * named comparison against one specific, named blueprint entry
 * (`blueprint.cism.outline-through-2026-11-02`, the lineage domains.json's
 * exam_weight predates and represents) — never "whichever blueprint is
 * current today." Its result never changes based on the actual date; it
 * only changes if either registry entry is edited. After 2026-11-03,
 * domains.json's exam_weight may remain this same historical value until
 * a separately authorized governance/content cleanup revisits it — this
 * test intentionally does not force that cleanup to happen automatically.
 */
describe("legacy compatibility — domains.json's exam_weight vs. the named historical blueprint it represents", () => {
  it("domains.json's exam_weight still matches blueprint.cism.outline-through-2026-11-02's weights (a fixed, named comparison, not 'today')", () => {
    const namedBlueprint = examBlueprints.find((b) => b.id === "blueprint.cism.outline-through-2026-11-02")!;
    for (const weight of namedBlueprint.domainWeights) {
      const domainEntry = registry.domains.get(weight.domainId);
      expect(domainEntry?.exam_domain).toBe(true);
      expect(domainEntry?.exam_weight).toBe(weight.weightPercent);
    }
  });
});

/**
 * Architect correction: proves — functionally, not just by the absence of
 * a grep hit — that Exam Readiness runtime selection never reads
 * domains.json's exam_weight. Corrupts every exam domain's exam_weight at
 * runtime, re-runs allocation and sufficiency for the real current
 * blueprint, and asserts the results are byte-identical to before the
 * corruption — if any Exam Readiness code path consulted exam_weight
 * (directly or indirectly), corrupting it would change these results.
 */
describe("Exam Readiness runtime does not read domains.json's exam_weight for selection", () => {
  it("allocateBlueprintCounts and checkExamSufficiency are unaffected by corrupting every exam domain's exam_weight", () => {
    const current = examBlueprints.find((b) => b.id === "blueprint.cism.outline-through-2026-11-02")!;
    const allocationBefore = allocateBlueprintCounts(current);
    const sufficiencyBefore = checkExamSufficiency(current);

    const domainIds = ["domain.d1", "domain.d2", "domain.d3", "domain.d4"];
    const originalWeights = domainIds.map((id) => registry.domains.get(id)?.exam_weight);
    try {
      for (const id of domainIds) {
        const entry = registry.domains.get(id)!;
        entry.exam_weight = 999999; // deliberately corrupted; must have zero effect
      }

      const allocationAfter = allocateBlueprintCounts(current);
      const sufficiencyAfter = checkExamSufficiency(current);
      expect(allocationAfter).toEqual(allocationBefore);
      expect(sufficiencyAfter).toEqual(sufficiencyBefore);
    } finally {
      domainIds.forEach((id, i) => {
        registry.domains.get(id)!.exam_weight = originalWeights[i];
      });
    }
  });
});

describe("validateExamBlueprintRegistry", () => {
  function blueprint(overrides: Partial<ExamBlueprint>): ExamBlueprint {
    return {
      id: "blueprint.test",
      effectiveFrom: null,
      effectiveTo: null,
      questionCount: 150,
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

  it("flags weights that do not sum to 100", () => {
    const bad = blueprint({ domainWeights: [{ domainId: "domain.d1", weightPercent: 50 }] });
    const issues = validateExamBlueprintRegistry([bad]);
    expect(issues.some((i) => i.message.includes("expected 100"))).toBe(true);
  });

  it("flags a non-positive questionCount or durationMinutes", () => {
    const issues = validateExamBlueprintRegistry([blueprint({ questionCount: 0, durationMinutes: -5 })]);
    expect(issues.some((i) => i.message.includes("questionCount"))).toBe(true);
    expect(issues.some((i) => i.message.includes("durationMinutes"))).toBe(true);
  });

  it("flags a duplicate domainId within one blueprint", () => {
    const bad = blueprint({
      domainWeights: [
        { domainId: "domain.d1", weightPercent: 50 },
        { domainId: "domain.d1", weightPercent: 50 }
      ]
    });
    expect(validateExamBlueprintRegistry([bad]).some((i) => i.message.includes("duplicate domainId"))).toBe(true);
  });

  it("flags effectiveFrom on or after effectiveTo", () => {
    const bad = blueprint({ effectiveFrom: "2026-01-01", effectiveTo: "2026-01-01" });
    expect(validateExamBlueprintRegistry([bad]).some((i) => i.message.includes("must be before"))).toBe(true);
  });

  it("flags two blueprints whose effective ranges overlap", () => {
    const a = blueprint({ id: "blueprint.a", effectiveFrom: null, effectiveTo: "2027-01-01" });
    const b = blueprint({ id: "blueprint.b", effectiveFrom: "2026-06-01", effectiveTo: null });
    expect(validateExamBlueprintRegistry([a, b]).some((i) => i.message.includes("overlaps"))).toBe(true);
  });

  it("does not flag two blueprints whose effective ranges are adjacent but non-overlapping", () => {
    const a = blueprint({ id: "blueprint.a", effectiveFrom: null, effectiveTo: "2026-06-01" });
    const b = blueprint({ id: "blueprint.b", effectiveFrom: "2026-06-01", effectiveTo: null });
    expect(validateExamBlueprintRegistry([a, b])).toEqual([]);
  });

  it("flags two blueprints with the same id (blueprintId is persisted as historical authority in a completed attempt, so it must be unique)", () => {
    const a = blueprint({ id: "blueprint.dup", effectiveFrom: null, effectiveTo: "2026-06-01" });
    const b = blueprint({ id: "blueprint.dup", effectiveFrom: "2026-06-01", effectiveTo: null });
    expect(validateExamBlueprintRegistry([a, b]).some((i) => i.message.includes("duplicate blueprint id"))).toBe(true);
  });

  it("flags a finite gap between two otherwise-adjacent-looking ranges", () => {
    const a = blueprint({ id: "blueprint.a", effectiveFrom: null, effectiveTo: "2026-06-01" });
    const b = blueprint({ id: "blueprint.b", effectiveFrom: "2026-07-01", effectiveTo: null }); // a day-for-day gap of a month
    expect(validateExamBlueprintRegistry([a, b]).some((i) => i.message.includes("gap"))).toBe(true);
  });

  it("flags more than one blueprint with an open (null) effectiveFrom", () => {
    const a = blueprint({ id: "blueprint.a", effectiveFrom: null, effectiveTo: "2026-06-01" });
    const b = blueprint({ id: "blueprint.b", effectiveFrom: null, effectiveTo: null });
    // Deliberately still non-overlapping in the naive sense is impossible with two open-begin
    // ranges (both start at -infinity) — the open-begin count check fires regardless of overlap.
    expect(validateExamBlueprintRegistry([a, b]).some((i) => i.message.includes("open (null) effectiveFrom"))).toBe(true);
  });

  it("flags more than one blueprint with an open (null) effectiveTo", () => {
    const a = blueprint({ id: "blueprint.a", effectiveFrom: null, effectiveTo: "2026-06-01" });
    const b = blueprint({ id: "blueprint.b", effectiveFrom: "2026-06-01", effectiveTo: null });
    const c = blueprint({ id: "blueprint.c", effectiveFrom: "2027-06-01", effectiveTo: null });
    expect(validateExamBlueprintRegistry([a, b, c]).some((i) => i.message.includes("open (null) effectiveTo"))).toBe(true);
  });

  it("rejects a non-canonical or impossible date (not merely 'gap/overlap' math, but format/calendar validity itself)", () => {
    const nonCanonical = blueprint({ id: "blueprint.bad-format", effectiveFrom: "2026-2-03", effectiveTo: null });
    const invalidMonth = blueprint({ id: "blueprint.bad-month", effectiveFrom: "2026-13-01", effectiveTo: null });
    const invalidDay = blueprint({ id: "blueprint.bad-day", effectiveFrom: "2026-02-30", effectiveTo: null }); // Feb never has 30 days, even in a leap year

    expect(validateExamBlueprintRegistry([nonCanonical]).some((i) => i.message.includes("not a valid canonical"))).toBe(true);
    expect(validateExamBlueprintRegistry([invalidMonth]).some((i) => i.message.includes("not a valid canonical"))).toBe(true);
    expect(validateExamBlueprintRegistry([invalidDay]).some((i) => i.message.includes("not a valid canonical"))).toBe(true);
  });

  it("accepts a valid leap-day date (2028-02-29) and rejects the same calendar day in a non-leap year (2026-02-29)", () => {
    const leapYearOk = blueprint({ id: "blueprint.leap-ok", effectiveFrom: "2028-02-29", effectiveTo: null });
    const nonLeapYearBad = blueprint({ id: "blueprint.leap-bad", effectiveFrom: "2026-02-29", effectiveTo: null });
    expect(validateExamBlueprintRegistry([leapYearOk]).some((i) => i.message.includes("not a valid canonical"))).toBe(false);
    expect(validateExamBlueprintRegistry([nonLeapYearBad]).some((i) => i.message.includes("not a valid canonical"))).toBe(true);
  });
});

describe("resolveCurrentBlueprint — fails closed, never guesses", () => {
  it("resolves to the current outline before 2026-11-03", () => {
    const resolved = resolveCurrentBlueprint(examBlueprints, Date.parse("2026-09-13T00:00:00.000Z"));
    expect(resolved.id).toBe("blueprint.cism.outline-through-2026-11-02");
  });

  it("resolves to the current outline on the last eligible day, 2026-11-02", () => {
    const resolved = resolveCurrentBlueprint(examBlueprints, Date.parse("2026-11-02T23:00:00.000Z"));
    expect(resolved.id).toBe("blueprint.cism.outline-through-2026-11-02");
  });

  it("resolves to the 2026-11-03 outline exactly on the transition date", () => {
    const resolved = resolveCurrentBlueprint(examBlueprints, Date.parse("2026-11-03T00:00:00.000Z"));
    expect(resolved.id).toBe("blueprint.cism.outline-2026-11-03");
  });

  it("resolves to the 2026-11-03 outline well after the transition", () => {
    const resolved = resolveCurrentBlueprint(examBlueprints, Date.parse("2030-01-01T00:00:00.000Z"));
    expect(resolved.id).toBe("blueprint.cism.outline-2026-11-03");
  });

  it("throws (fails closed) when zero blueprints match — a gap in the registry", () => {
    const gapped: ExamBlueprint[] = [
      { id: "a", effectiveFrom: null, effectiveTo: "2020-01-01", questionCount: 150, durationMinutes: 240, domainWeights: [] },
      { id: "b", effectiveFrom: "2025-01-01", effectiveTo: null, questionCount: 150, durationMinutes: 240, domainWeights: [] }
    ];
    expect(() => resolveCurrentBlueprint(gapped, Date.parse("2022-01-01T00:00:00.000Z"))).toThrow();
  });

  it("throws (fails closed) when more than one blueprint matches — an overlap in the registry", () => {
    const overlapping: ExamBlueprint[] = [
      { id: "a", effectiveFrom: null, effectiveTo: "2027-01-01", questionCount: 150, durationMinutes: 240, domainWeights: [] },
      { id: "b", effectiveFrom: "2026-01-01", effectiveTo: null, questionCount: 150, durationMinutes: 240, domainWeights: [] }
    ];
    expect(() => resolveCurrentBlueprint(overlapping, Date.parse("2026-06-01T00:00:00.000Z"))).toThrow();
  });

  it("throws on an empty registry", () => {
    expect(() => resolveCurrentBlueprint([], Date.parse("2026-01-01T00:00:00.000Z"))).toThrow();
  });
});
