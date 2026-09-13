import { describe, it, expect, beforeEach } from "vitest";
import { buildRecommendations } from "../../../../app/src/learning-intelligence/recommendations";
import type { RawGroup } from "../../../../app/src/learning-intelligence/grouping";
import type { EvidenceGroup, EvidenceSummary, GroupIdentity, GroupState, ReasonCode } from "../../../../app/src/learning-intelligence/types";
import { makeApplyEvent, resetFixtureIds } from "./fixtures";

beforeEach(() => resetFixtureIds());

const BASE_EVIDENCE: EvidenceSummary = {
  primaryAttemptCount: 3,
  distinctQuestionCount: 3,
  recentPrimaryCount: 3,
  recentCorrectCount: 1,
  recentIncorrectCount: 2,
  sureIncorrectCount: 0,
  lowConfidenceCorrectCount: 0,
  lowConfidenceCorrectDistinctQuestionCount: 0,
  unresolvedRecentIncorrectCount: 0,
  successfulRepairCount: 0,
  failedRepairCount: 0,
  recallCorrectCount: 0,
  recallIncorrectCount: 0,
  lastAttemptAt: 300
};

function identity(axis: GroupIdentity["axis"], targetId: string): GroupIdentity {
  return { axis, targetId, key: `${axis}:${targetId}` };
}

function makeGroup(
  axis: GroupIdentity["axis"],
  targetId: string,
  state: GroupState,
  overrides: Partial<EvidenceSummary> = {},
  reasonCodes: ReasonCode[] = []
): EvidenceGroup {
  return { identity: identity(axis, targetId), state, reasonCodes, trend: null, evidence: { ...BASE_EVIDENCE, ...overrides } };
}

function rawFor(identityKey: string, attemptIds: string[], conceptIds: string[] = ["concept.shared"]): [string, RawGroup] {
  const primaryAttempts = attemptIds.map((id) => makeApplyEvent({ eventId: id, correct: false, conceptIds }));
  const axis = identityKey.split(":")[0] as GroupIdentity["axis"];
  const targetId = identityKey.slice(axis.length + 1);
  return [identityKey, { identity: { axis, targetId, key: identityKey }, primaryAttempts, recallAttempts: [] }];
}

describe("recommendation eligibility (§21)", () => {
  it("NOT_ENOUGH_EVIDENCE never becomes a candidate", () => {
    const group = makeGroup("concept", "concept.a", "NOT_ENOUGH_EVIDENCE");
    const raw = new Map([rawFor("concept:concept.a", ["e1"])]);
    expect(buildRecommendations([group], raw)).toEqual([]);
  });

  it("STRONGER_EVIDENCE never becomes a 'study this now' candidate", () => {
    const group = makeGroup("concept", "concept.a", "STRONGER_EVIDENCE", { recentIncorrectCount: 0 });
    const raw = new Map([rawFor("concept:concept.a", ["e1"])]);
    expect(buildRecommendations([group], raw)).toEqual([]);
  });

  it("NEEDS_REVIEW is always candidate-eligible", () => {
    const group = makeGroup("concept", "concept.a", "NEEDS_REVIEW", {}, ["REPEATED_MISSES"]);
    const raw = new Map([rawFor("concept:concept.a", ["e1", "e2"])]);
    expect(buildRecommendations([group], raw)).toHaveLength(1);
  });
});

describe("DEVELOPING recommendation eligibility — Architect LI-2 follow-up §1", () => {
  it("a DEVELOPING group with an unresolved recent incorrect attempt is candidate-eligible", () => {
    const group = makeGroup("concept", "concept.a", "DEVELOPING", { unresolvedRecentIncorrectCount: 1 });
    const raw = new Map([rawFor("concept:concept.a", ["e1"])]);
    expect(buildRecommendations([group], raw)).toHaveLength(1);
  });

  it("a DEVELOPING group with zero unresolved evidence is NOT candidate-eligible", () => {
    const group = makeGroup("concept", "concept.a", "DEVELOPING", { unresolvedRecentIncorrectCount: 0, lowConfidenceCorrectCount: 0 });
    const raw = new Map([rawFor("concept:concept.a", ["e1"])]);
    expect(buildRecommendations([group], raw)).toEqual([]);
  });

  it("a successful Repair ALONE never makes a DEVELOPING group recommendation-eligible — the miss it resolved does not count as unresolved", () => {
    // recentIncorrectCount reflects the raw miss (still 1), but
    // unresolvedRecentIncorrectCount is 0 because that miss was
    // CORRECTED_ON_REPAIR — the exact "missed, then Repair succeeded, then
    // performed correctly on transfer" learner story this rule protects.
    const group = makeGroup("concept", "concept.a", "DEVELOPING", {
      recentIncorrectCount: 1,
      unresolvedRecentIncorrectCount: 0,
      successfulRepairCount: 1
    }, ["SUCCESSFUL_CORRECTION"]);
    const raw = new Map([rawFor("concept:concept.a", ["e1"])]);
    expect(buildRecommendations([group], raw)).toEqual([]);
  });

  it("2+ low-confidence-correct attempts across 2+ distinct questions makes a DEVELOPING group eligible even with zero incorrect evidence", () => {
    const group = makeGroup("concept", "concept.a", "DEVELOPING", {
      unresolvedRecentIncorrectCount: 0,
      lowConfidenceCorrectCount: 2,
      lowConfidenceCorrectDistinctQuestionCount: 2
    });
    const raw = new Map([rawFor("concept:concept.a", ["e1"])]);
    expect(buildRecommendations([group], raw)).toHaveLength(1);
  });

  it("low-confidence-correct attempts confined to a single question do not satisfy the breadth requirement", () => {
    const group = makeGroup("concept", "concept.a", "DEVELOPING", {
      unresolvedRecentIncorrectCount: 0,
      lowConfidenceCorrectCount: 3,
      lowConfidenceCorrectDistinctQuestionCount: 1
    });
    const raw = new Map([rawFor("concept:concept.a", ["e1"])]);
    expect(buildRecommendations([group], raw)).toEqual([]);
  });

  it("DEVELOPING candidates are only considered when fewer than 3 NEEDS_REVIEW candidates already fill the slots", () => {
    const needsReview = ["nr1", "nr2", "nr3"].map((id) => makeGroup("concept", id, "NEEDS_REVIEW"));
    const developing = makeGroup("concept", "concept.dev", "DEVELOPING", { unresolvedRecentIncorrectCount: 5 }); // maximally actionable
    const raw = new Map([
      ...needsReview.map((g, i) => rawFor(`concept:${g.identity.targetId}`, [`nre${i}`])),
      rawFor("concept:concept.dev", ["de1"])
    ]);
    const result = buildRecommendations([...needsReview, developing], raw);
    expect(result).toHaveLength(3);
    expect(result.every((r) => r.state === "NEEDS_REVIEW")).toBe(true); // Developing never displaces a full NEEDS_REVIEW slate
  });

  it("a qualifying DEVELOPING candidate fills a remaining slot when fewer than 3 NEEDS_REVIEW exist", () => {
    const needsReview = makeGroup("concept", "concept.nr", "NEEDS_REVIEW");
    const developing = makeGroup("concept", "concept.dev", "DEVELOPING", { unresolvedRecentIncorrectCount: 1 });
    const raw = new Map([rawFor("concept:concept.nr", ["nr1"]), rawFor("concept:concept.dev", ["de1"])]);
    const result = buildRecommendations([needsReview, developing], raw);
    expect(result.map((r) => r.target.targetId)).toEqual(["concept.nr", "concept.dev"]);
  });
});

describe("cross-cutting breadth rule (§23, extended by the Architect LI-2 follow-up §2/§3)", () => {
  it("a pattern group spanning only 1 concept is excluded even if NEEDS_REVIEW", () => {
    const group = makeGroup("pattern", "pattern.p01", "NEEDS_REVIEW");
    const primaryAttempts = [
      makeApplyEvent({ eventId: "e1", conceptIds: ["concept.a"], correct: false }),
      makeApplyEvent({ eventId: "e2", conceptIds: ["concept.a"], correct: false })
    ];
    const raw = new Map([["pattern:pattern.p01", { identity: group.identity, primaryAttempts, recallAttempts: [] }]]);
    expect(buildRecommendations([group], raw)).toEqual([]);
  });

  it("a pattern group spanning 2+ distinct concepts is eligible", () => {
    const group = makeGroup("pattern", "pattern.p01", "NEEDS_REVIEW");
    const primaryAttempts = [
      makeApplyEvent({ eventId: "e1", conceptIds: ["concept.a"], correct: false }),
      makeApplyEvent({ eventId: "e2", conceptIds: ["concept.b"], correct: false })
    ];
    const raw = new Map([["pattern:pattern.p01", { identity: group.identity, primaryAttempts, recallAttempts: [] }]]);
    expect(buildRecommendations([group], raw)).toHaveLength(1);
  });

  it("a decision_type group confined to 1 concept does NOT become a cross-cutting recommendation", () => {
    const group = makeGroup("decision_type", "decision.risk", "NEEDS_REVIEW");
    const primaryAttempts = [
      makeApplyEvent({ eventId: "e1", conceptIds: ["concept.a"], correct: false }),
      makeApplyEvent({ eventId: "e2", conceptIds: ["concept.a"], correct: false })
    ];
    const raw = new Map([["decision_type:decision.risk", { identity: group.identity, primaryAttempts, recallAttempts: [] }]]);
    expect(buildRecommendations([group], raw)).toEqual([]);
  });

  it("a decision_type group spanning 2+ distinct concepts is eligible", () => {
    const group = makeGroup("decision_type", "decision.risk", "NEEDS_REVIEW");
    const primaryAttempts = [
      makeApplyEvent({ eventId: "e1", conceptIds: ["concept.a"], correct: false }),
      makeApplyEvent({ eventId: "e2", conceptIds: ["concept.b"], correct: false })
    ];
    const raw = new Map([["decision_type:decision.risk", { identity: group.identity, primaryAttempts, recallAttempts: [] }]]);
    expect(buildRecommendations([group], raw)).toHaveLength(1);
  });

  it("a role group confined to 1 concept does NOT become a cross-cutting recommendation (§2)", () => {
    const group = makeGroup("role", "role.board", "NEEDS_REVIEW");
    const primaryAttempts = [
      makeApplyEvent({ eventId: "e1", conceptIds: ["concept.a"], correct: false }),
      makeApplyEvent({ eventId: "e2", conceptIds: ["concept.a"], correct: false })
    ];
    const raw = new Map([["role:role.board", { identity: group.identity, primaryAttempts, recallAttempts: [] }]]);
    expect(buildRecommendations([group], raw)).toEqual([]);
  });

  it("a lifecycle group spanning 2+ distinct concepts is eligible (§2)", () => {
    const group = makeGroup("lifecycle", "lifecycle.risk", "NEEDS_REVIEW");
    const primaryAttempts = [
      makeApplyEvent({ eventId: "e1", conceptIds: ["concept.a"], correct: false }),
      makeApplyEvent({ eventId: "e2", conceptIds: ["concept.b"], correct: false })
    ];
    const raw = new Map([["lifecycle:lifecycle.risk", { identity: group.identity, primaryAttempts, recallAttempts: [] }]]);
    expect(buildRecommendations([group], raw)).toHaveLength(1);
  });

  it("a stage group confined to 1 concept does NOT become a cross-cutting recommendation (§2)", () => {
    const group = makeGroup("stage", "stage.identify", "NEEDS_REVIEW");
    const primaryAttempts = [
      makeApplyEvent({ eventId: "e1", conceptIds: ["concept.a"], correct: false }),
      makeApplyEvent({ eventId: "e2", conceptIds: ["concept.a"], correct: false })
    ];
    const raw = new Map([["stage:stage.identify", { identity: group.identity, primaryAttempts, recallAttempts: [] }]]);
    expect(buildRecommendations([group], raw)).toEqual([]);
  });

  it("a concept group needs no cross-concept breadth (the rule is cross-cutting-axis-specific)", () => {
    const group = makeGroup("concept", "concept.a", "NEEDS_REVIEW");
    const raw = new Map([rawFor("concept:concept.a", ["e1", "e2"])]);
    expect(buildRecommendations([group], raw)).toHaveLength(1);
  });
});

describe("target-priority order — final ordering (Architect LI-2 follow-up §2)", () => {
  it("role/lifecycle/stage rank above Domain but below every other axis on overlap", () => {
    const sharedAttempts = ["e1", "e2"];
    const roleGroup = makeGroup("role", "role.board", "NEEDS_REVIEW");
    const domainGroup = makeGroup("domain", "domain.d1", "NEEDS_REVIEW");
    const raw = new Map<string, RawGroup>([
      ["role:role.board", { identity: roleGroup.identity, primaryAttempts: sharedAttempts.map((id) => makeApplyEvent({ eventId: id, correct: false, conceptIds: ["concept.a", "concept.b"] })), recallAttempts: [] }],
      ["domain:domain.d1", { identity: domainGroup.identity, primaryAttempts: sharedAttempts.map((id) => makeApplyEvent({ eventId: id, correct: false })), recallAttempts: [] }]
    ]);
    const result = buildRecommendations([domainGroup, roleGroup], raw);
    expect(result).toHaveLength(1);
    expect(result[0]!.target.axis).toBe("role");
  });
});

describe("overlap reduction (§22)", () => {
  it("drops a family recommendation whose evidence is identical to its higher-priority concept recommendation", () => {
    const sharedAttempts = ["e1", "e2"];
    const conceptGroup = makeGroup("concept", "concept.risk-treatment", "NEEDS_REVIEW");
    const familyGroup = makeGroup("family", "family.risk-treatment", "NEEDS_REVIEW");
    const raw = new Map([
      rawFor("concept:concept.risk-treatment", sharedAttempts),
      rawFor("family:family.risk-treatment", sharedAttempts)
    ]);
    const result = buildRecommendations([conceptGroup, familyGroup], raw);
    expect(result).toHaveLength(1);
    expect(result[0]!.target.axis).toBe("concept");
  });

  it("keeps both recommendations when their underlying evidence only partially overlaps", () => {
    const conceptGroup = makeGroup("concept", "concept.a", "NEEDS_REVIEW");
    const domainGroup = makeGroup("domain", "domain.d1", "NEEDS_REVIEW");
    const raw = new Map([rawFor("concept:concept.a", ["e1", "e2"]), rawFor("domain:domain.d1", ["e3", "e4"])]);
    const result = buildRecommendations([conceptGroup, domainGroup], raw);
    expect(result).toHaveLength(2);
  });
});

describe("ranking (§24)", () => {
  it("orders NEEDS_REVIEW before DEVELOPING", () => {
    const developing = makeGroup("concept", "concept.dev", "DEVELOPING", { unresolvedRecentIncorrectCount: 1 });
    const needsReview = makeGroup("concept", "concept.review", "NEEDS_REVIEW");
    const raw = new Map([rawFor("concept:concept.dev", ["e1"]), rawFor("concept:concept.review", ["e2"])]);
    const result = buildRecommendations([developing, needsReview], raw);
    expect(result.map((r) => r.target.targetId)).toEqual(["concept.review", "concept.dev"]);
  });

  it("orders by failed-Repair count next, more failures first", () => {
    const fewer = makeGroup("concept", "concept.fewer", "NEEDS_REVIEW", { failedRepairCount: 1 });
    const more = makeGroup("concept", "concept.more", "NEEDS_REVIEW", { failedRepairCount: 3 });
    const raw = new Map([rawFor("concept:concept.fewer", ["e1"]), rawFor("concept:concept.more", ["e2"])]);
    const result = buildRecommendations([fewer, more], raw);
    expect(result.map((r) => r.target.targetId)).toEqual(["concept.more", "concept.fewer"]);
  });

  it("breaks a full tie deterministically by target identity key", () => {
    const a = makeGroup("concept", "concept.a", "NEEDS_REVIEW");
    const b = makeGroup("concept", "concept.b", "NEEDS_REVIEW");
    const raw = new Map([rawFor("concept:concept.a", ["e1"]), rawFor("concept:concept.b", ["e2"])]);
    const result = buildRecommendations([b, a], raw); // reversed input order
    expect(result.map((r) => r.target.targetId)).toEqual(["concept.a", "concept.b"]);
  });

  it("produces identical ranking across repeated calls with the same input (determinism)", () => {
    const a = makeGroup("concept", "concept.a", "NEEDS_REVIEW", { failedRepairCount: 2 });
    const b = makeGroup("concept", "concept.b", "NEEDS_REVIEW", { failedRepairCount: 1 });
    const raw = new Map([rawFor("concept:concept.a", ["e1"]), rawFor("concept:concept.b", ["e2"])]);
    expect(buildRecommendations([a, b], raw)).toEqual(buildRecommendations([a, b], raw));
  });
});

describe("recommendation cap (§21/§24)", () => {
  it("never returns more than 3 recommendations, even with many eligible groups", () => {
    const groups: EvidenceGroup[] = [];
    const raw = new Map<string, RawGroup>();
    for (let i = 0; i < 6; i++) {
      const id = `concept.g${i}`;
      groups.push(makeGroup("concept", id, "NEEDS_REVIEW"));
      const [key, value] = rawFor(`concept:${id}`, [`e${i}`]);
      raw.set(key, value);
    }
    expect(buildRecommendations(groups, raw)).toHaveLength(3);
  });
});
