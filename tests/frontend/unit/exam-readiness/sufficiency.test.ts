import { describe, it, expect } from "vitest";
import { checkExamSufficiency } from "../../../../app/src/exam-readiness/sufficiency";
import { examBlueprints } from "../../../../app/src/exam-readiness/blueprintRegistry";
import { registry, production } from "../../../../app/src/content/registry";
import type { ExamBlueprint } from "../../../../app/src/exam-readiness/types";

/**
 * ER-1: sufficiency joins a blueprint's apportioned per-domain counts
 * against CURRENT production content, via each domain's own registry entry
 * (`exam_domain === true`) — never a question's own field, since
 * ProductionQuestion carries no such flag itself. As of ER-0's inventory,
 * current production content is genuinely insufficient for a full-length
 * exam (127 active questions total, 124 of them exam-eligible across
 * d1-d4, vs. 150 required) — these tests pin the exact real shortfall so a
 * future content-authoring change is visible here rather than silently
 * changing exam-readiness's own behavior.
 */

describe("checkExamSufficiency — against real current production content", () => {
  it("the current outline blueprint is NOT sufficient today (D3/D4 are short)", () => {
    const current = examBlueprints.find((b) => b.id === "blueprint.cism.outline-through-2026-11-02")!;
    const result = checkExamSufficiency(current);
    expect(result.sufficient).toBe(false);

    const totalShortfall = result.domains.reduce((sum, d) => sum + d.shortfall, 0);
    expect(totalShortfall).toBe(35);

    const d3 = result.domains.find((d) => d.domainId === "domain.d3")!;
    const d4 = result.domains.find((d) => d.domainId === "domain.d4")!;
    expect(d3.sufficient).toBe(false);
    expect(d4.sufficient).toBe(false);
  });

  it("the 2026-11-03 outline blueprint is also NOT sufficient today (total shortfall 33)", () => {
    const next = examBlueprints.find((b) => b.id === "blueprint.cism.outline-2026-11-03")!;
    const result = checkExamSufficiency(next);
    expect(result.sufficient).toBe(false);
    const totalShortfall = result.domains.reduce((sum, d) => sum + d.shortfall, 0);
    expect(totalShortfall).toBe(33);
  });

  it("every domain's `available` count matches a direct count of active production questions in that domain", () => {
    const current = examBlueprints.find((b) => b.id === "blueprint.cism.outline-through-2026-11-02")!;
    const result = checkExamSufficiency(current);
    for (const domain of result.domains) {
      const directCount = [...production.questions.values()].filter((q) => q.active && q.domain === domain.domainId).length;
      expect(domain.available).toBe(directCount);
    }
  });

  it("shortfall is exactly max(0, required - available) for every domain", () => {
    const current = examBlueprints.find((b) => b.id === "blueprint.cism.outline-through-2026-11-02")!;
    const result = checkExamSufficiency(current);
    for (const domain of result.domains) {
      expect(domain.shortfall).toBe(Math.max(0, domain.required - domain.available));
      expect(domain.sufficient).toBe(domain.shortfall === 0);
    }
  });

  it("a domain with vastly reduced weight (trivially satisfiable) is reported sufficient", () => {
    const trivial: ExamBlueprint = {
      id: "blueprint.trivial",
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
    const result = checkExamSufficiency(trivial);
    expect(result.sufficient).toBe(true);
    expect(result.domains.every((d) => d.shortfall === 0)).toBe(true);
  });

  it("a blueprint that (incorrectly) references Foundation now fails closed at the shared validation boundary, rather than silently reporting zero available", () => {
    // Architect correction: checkExamSufficiency calls through
    // allocateBlueprintCounts, which now validates the blueprint itself
    // (assertValidExamBlueprint) before any allocation/sufficiency math
    // runs. A non-exam-domain reference is caught there and throws —
    // a stronger guarantee than the prior behavior of quietly computing
    // a truthful zero-available result for an already-invalid blueprint.
    const badBlueprint: ExamBlueprint = {
      id: "blueprint.bad",
      effectiveFrom: null,
      effectiveTo: null,
      questionCount: 10,
      durationMinutes: 10,
      domainWeights: [{ domainId: "domain.foundation", weightPercent: 100 }]
    };
    expect(registry.domains.get("domain.foundation")?.exam_domain).toBe(false);
    expect(() => checkExamSufficiency(badBlueprint)).toThrow(/not a real exam domain/);
  });
});
