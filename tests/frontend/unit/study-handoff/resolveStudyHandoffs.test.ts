import { describe, it, expect } from "vitest";
import { resolveStudyHandoffs } from "../../../../app/src/study-handoff/resolveStudyHandoffs";
import type { GroupIdentity } from "../../../../app/src/learning-intelligence";
import { production } from "../../../../app/src/content/registry";

/**
 * LI-4 §6/§7/§15/§26/§43: the ONE place a recommendation's target becomes a
 * real, currently-available destination (or none). Every case here uses
 * real production content — never a hand-authored fixture that wouldn't
 * exist in the real registry, since the whole point is proving resolution
 * against CURRENT production metadata, not synthetic behavior.
 */

function identity(axis: GroupIdentity["axis"], targetId: string): GroupIdentity {
  return { axis, targetId, key: `${axis}:${targetId}` };
}

describe("resolveStudyHandoffs — concept", () => {
  it("a resolvable concept gets both Review (exact concept) and Practice", () => {
    const handoffs = resolveStudyHandoffs(identity("concept", "concept.d3.program-metrics-reporting"));
    expect(handoffs).toHaveLength(2);
    const review = handoffs.find((h) => h.kind === "review");
    expect(review).toMatchObject({ kind: "review", conceptId: "concept.d3.program-metrics-reporting" });
    const practice = handoffs.find((h) => h.kind === "practice");
    expect(practice).toBeDefined();
    if (practice?.kind === "practice") {
      expect(practice.scope).toEqual({ kind: "target", axis: "concept", targetId: "concept.d3.program-metrics-reporting" });
      expect(practice.eligibleQuestionCount).toBeGreaterThan(0);
    }
  });
});

describe("resolveStudyHandoffs — family (LI-4 §15/§41)", () => {
  it("a family mapping to exactly one concept gets Review pointed at that concept, plus Practice", () => {
    const familyId = "family.d1.governance-layer-authority";
    expect(production.families.get(familyId)!.concepts).toHaveLength(1);
    const handoffs = resolveStudyHandoffs(identity("family", familyId));
    const review = handoffs.find((h) => h.kind === "review");
    expect(review).toMatchObject({ kind: "review", conceptId: production.families.get(familyId)!.concepts[0] });
    expect(handoffs.some((h) => h.kind === "practice")).toBe(true);
  });

  it("a family spanning multiple concepts gets Practice only — never an arbitrarily picked Review concept", () => {
    const familyId = "family.d2.risk-management-synthesis";
    expect(production.families.get(familyId)!.concepts.length).toBeGreaterThan(1);
    const handoffs = resolveStudyHandoffs(identity("family", familyId));
    expect(handoffs.some((h) => h.kind === "review")).toBe(false);
    const practice = handoffs.find((h) => h.kind === "practice");
    expect(practice).toBeDefined();
    if (practice?.kind === "practice") {
      expect(practice.scope).toEqual({ kind: "target", axis: "family", targetId: familyId });
    }
  });
});

describe("resolveStudyHandoffs — cross-cutting axes never get an arbitrary Review mapping", () => {
  const crossCuttingCases: Array<[GroupIdentity["axis"], string]> = [
    ["pattern", "pattern.p02"],
    ["qualifier", "qualifier.best"],
    ["decision_type", "decision.risk"],
    ["evidence_dimension", "evidence.knowledge"],
    ["role", "role.security-manager"],
    ["lifecycle", "lifecycle.risk"],
    ["stage", "stage.risk.analyze"]
  ];

  it.each(crossCuttingCases)("%s never produces a Review handoff, only Practice", (axis, targetId) => {
    const handoffs = resolveStudyHandoffs(identity(axis, targetId));
    expect(handoffs.some((h) => h.kind === "review")).toBe(false);
    const practice = handoffs.find((h) => h.kind === "practice");
    expect(practice).toBeDefined();
    if (practice?.kind === "practice") {
      expect(practice.scope).toEqual({ kind: "target", axis, targetId });
      expect(practice.eligibleQuestionCount).toBeGreaterThan(0);
    }
  });
});

describe("resolveStudyHandoffs — domain reuses the existing domain Practice mechanism, never Review", () => {
  it("a domain target gets a domain-scoped Practice handoff and no Review", () => {
    const handoffs = resolveStudyHandoffs(identity("domain", "domain.d2"));
    expect(handoffs.some((h) => h.kind === "review")).toBe(false);
    const practice = handoffs.find((h) => h.kind === "practice");
    expect(practice).toMatchObject({ kind: "practice", scope: { kind: "domain", domainId: "domain.d2" } });
  });
});

describe("resolveStudyHandoffs — stale/unresolvable target (LI-4 §26/§43)", () => {
  it("a concept no longer in current production content yields zero handoffs, never a broken action", () => {
    expect(resolveStudyHandoffs(identity("concept", "concept.no-longer-exists"))).toEqual([]);
  });

  it("a family no longer in current production content yields zero handoffs", () => {
    expect(resolveStudyHandoffs(identity("family", "family.no-longer-exists"))).toEqual([]);
  });

  it("a cross-cutting axis value with zero current matching questions yields zero handoffs, never throws", () => {
    expect(resolveStudyHandoffs(identity("pattern", "pattern.does-not-exist"))).toEqual([]);
    expect(resolveStudyHandoffs(identity("role", "role.does-not-exist"))).toEqual([]);
    expect(resolveStudyHandoffs(identity("lifecycle", "lifecycle.does-not-exist"))).toEqual([]);
  });
});

describe("resolveStudyHandoffs — never more than 2 actions (LI-4 §23)", () => {
  it("caps at 2 even in principle", () => {
    const handoffs = resolveStudyHandoffs(identity("concept", "concept.d3.program-metrics-reporting"));
    expect(handoffs.length).toBeLessThanOrEqual(2);
  });
});
