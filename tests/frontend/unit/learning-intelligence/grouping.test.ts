import { describe, it, expect, beforeEach } from "vitest";
import { buildGroups } from "../../../../app/src/learning-intelligence/grouping";
import { makeApplyEvent, makeRecallEvent, resetFixtureIds } from "./fixtures";

beforeEach(() => resetFixtureIds());

describe("buildGroups", () => {
  it("groups an Apply attempt under every axis its metadata carries", () => {
    const event = makeApplyEvent({
      domain: "domain.d2",
      conceptIds: ["concept.a"],
      familyId: "family.a",
      patterns: ["pattern.p01"],
      evidenceDimensions: ["evidence.knowledge"],
      qualifier: "qualifier.next",
      decisionType: "decision.risk"
    });
    const groups = buildGroups([event]);
    expect([...groups.keys()].sort()).toEqual(
      [
        "domain:domain.d2",
        "concept:concept.a",
        "family:family.a",
        "pattern:pattern.p01",
        "evidence_dimension:evidence.knowledge",
        "qualifier:qualifier.next",
        "decision_type:decision.risk"
      ].sort()
    );
  });

  it("never forms a group for a null/absent axis field (missing metadata = unavailable, never inferred)", () => {
    const event = makeApplyEvent({ primaryRole: null, lifecycle: null, stage: null });
    const groups = buildGroups([event]);
    expect([...groups.keys()].some((k) => k.startsWith("role:"))).toBe(false);
    expect([...groups.keys()].some((k) => k.startsWith("lifecycle:"))).toBe(false);
    expect([...groups.keys()].some((k) => k.startsWith("stage:"))).toBe(false);
  });

  it("forms a sparse axis group when that metadata is genuinely present", () => {
    const event = makeApplyEvent({ primaryRole: "role.board", lifecycle: "lifecycle.risk", stage: "stage.identify" });
    const groups = buildGroups([event]);
    expect(groups.has("role:role.board")).toBe(true);
    expect(groups.has("lifecycle:lifecycle.risk")).toBe(true);
    expect(groups.has("stage:stage.identify")).toBe(true);
  });

  it("contributes one attempt to multiple concept/pattern groups when a question spans several", () => {
    const event = makeApplyEvent({ conceptIds: ["concept.a", "concept.b"], patterns: ["pattern.p01", "pattern.p02"] });
    const groups = buildGroups([event]);
    expect(groups.get("concept:concept.a")?.primaryAttempts).toEqual([event]);
    expect(groups.get("concept:concept.b")?.primaryAttempts).toEqual([event]);
    expect(groups.get("pattern:pattern.p01")?.primaryAttempts).toEqual([event]);
    expect(groups.get("pattern:pattern.p02")?.primaryAttempts).toEqual([event]);
  });

  it("separates apply attempts from recall attempts within the same group", () => {
    const apply = makeApplyEvent({ conceptIds: ["concept.a"] });
    const recall = makeRecallEvent({ conceptIds: ["concept.a"] });
    const groups = buildGroups([apply, recall]);
    const group = groups.get("concept:concept.a")!;
    expect(group.primaryAttempts).toEqual([apply]);
    expect(group.recallAttempts).toEqual([recall]);
  });

  it("group identity uses real project identifiers, never a display label", () => {
    const event = makeApplyEvent({ conceptIds: ["concept.d2.risk-treatment-selection"] });
    const groups = buildGroups([event]);
    expect(groups.get("concept:concept.d2.risk-treatment-selection")).toBeTruthy();
  });

  it("does not mutate input events while grouping", () => {
    const event = Object.freeze(makeApplyEvent({ conceptIds: ["concept.a"] }));
    expect(() => buildGroups([event])).not.toThrow();
  });
});
