import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { reinforcementEligibleCount, buildReinforcementSession, type ReinforcementContext } from "../../../app/src/content/reinforcement";
import { registry, production, type ProductionConcept, type ProductionFamily, type ProductionQuestion } from "../../../app/src/content/registry";
import { getExposureHistory, resetExposureHistoryForTests } from "../../../app/src/content/exposureStore";

/**
 * Phase 10B-4: Optional Reinforcement's data layer. Deliberately NOT a
 * second content system or a ReinforcementQuestionEngine — every function
 * here composes the same content/production/ data every other mode loads,
 * and reuses resolve.ts's/selection.ts's existing family/variant pipeline
 * verbatim (see reinforcement.ts's own header comment).
 */

beforeEach(() => {
  resetExposureHistoryForTests();
});
afterEach(() => {
  resetExposureHistoryForTests();
});

// question.d1.0005 belongs to family.d1.governance-vs-management (3
// variants: 0005/0006/0007 — see repair-coverage.test.ts's own use of the
// same family). question.d1.0002 belongs to
// family.d1.authority-accountability-decision (3 variants: 0002/0003/0004).
const PRIMARY_ID = "question.d1.0005";
const SECONDARY_ID = "question.d1.0002";

describe("Reinforcement — eligibility and session construction", () => {
  it("is eligible when the primary question's family has an unseen sibling", () => {
    const context: ReinforcementContext = { primaryQuestionId: PRIMARY_ID, primaryCorrect: true };
    expect(reinforcementEligibleCount(context)).toBeGreaterThan(0);
  });

  it("never re-offers the exact primary (or secondary) question just seen this session", () => {
    const context: ReinforcementContext = { primaryQuestionId: PRIMARY_ID, primaryCorrect: false, secondaryQuestionId: SECONDARY_ID };
    const session = buildReinforcementSession(context, 3);
    const ids = session.map((q) => q.id);
    expect(ids).not.toContain(PRIMARY_ID);
    expect(ids).not.toContain(SECONDARY_ID);
  });

  it("draws from both the primary and secondary families when both are provided and distinct", () => {
    const context: ReinforcementContext = { primaryQuestionId: PRIMARY_ID, primaryCorrect: true, secondaryQuestionId: SECONDARY_ID };
    const session = buildReinforcementSession(context, 3);
    const families = new Set(session.map((q) => production.questions.get(q.id)!.family));
    expect(families.has("family.d1.governance-vs-management")).toBe(true);
    expect(families.has("family.d1.authority-accountability-decision")).toBe(true);
  });

  it("works with only a primary question (no secondary provided)", () => {
    const context: ReinforcementContext = { primaryQuestionId: PRIMARY_ID, primaryCorrect: true };
    const session = buildReinforcementSession(context, 3);
    expect(session.length).toBeGreaterThan(0);
    for (const q of session) {
      expect(production.questions.get(q.id)!.family).toBe("family.d1.governance-vs-management");
    }
  });

  it("produces no exact duplicate questions within one reinforcement set", () => {
    const context: ReinforcementContext = { primaryQuestionId: PRIMARY_ID, primaryCorrect: false, secondaryQuestionId: SECONDARY_ID };
    const session = buildReinforcementSession(context, 3);
    const ids = session.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("degrades truthfully to fewer questions when only 2 unique alternatives exist across both families", () => {
    // family.d1.governance-vs-management has 3 variants total; excluding
    // the just-seen primary (0005) leaves 2. family.d1.authority-
    // accountability-decision has 3 variants; excluding the just-seen
    // secondary (0002) leaves 2. Requesting more than 4 should still cap
    // truthfully at 4 (2 + 2), never fabricate a 5th.
    const context: ReinforcementContext = { primaryQuestionId: PRIMARY_ID, primaryCorrect: false, secondaryQuestionId: SECONDARY_ID };
    const session = buildReinforcementSession(context, 10);
    expect(session.length).toBe(4);
  });

  it("commits real exposure via the shared session exposure store", () => {
    const context: ReinforcementContext = { primaryQuestionId: PRIMARY_ID, primaryCorrect: true };
    const before = getExposureHistory().size;
    const session = buildReinforcementSession(context, 3);
    const after = getExposureHistory();
    for (const q of session) expect(after.has(q.id)).toBe(true);
    expect(after.size).toBeGreaterThanOrEqual(before + session.length);
  });

  it("fails safely (zero eligible, empty session) for an unresolvable/invalid question id, without throwing", () => {
    const context: ReinforcementContext = { primaryQuestionId: "proto.q1", primaryCorrect: true };
    expect(reinforcementEligibleCount(context)).toBe(0);
    expect(() => buildReinforcementSession(context, 3)).not.toThrow();
    expect(buildReinforcementSession(context, 3)).toEqual([]);
  });

  it("returns zero/empty for a family with no alternate variant available (only the just-seen one existed)", () => {
    const soloFamilyId = "family.synthetic-future.reinforcement-solo";
    const soloConceptId = "concept.synthetic-future.reinforcement-solo";
    const soloQuestionId = "question.synthetic-future.reinforcement-solo-0001";
    production.concepts.set(soloConceptId, {
      id: soloConceptId,
      display_name: "Solo Synthetic Concept",
      home_domain: "domain.d1",
      plain: "Synthetic concept with exactly one authored question.",
      related_patterns: [],
      content_status: "CANDIDATE",
      verification_status: "unverified",
      source: "source.test",
      version: 1
    });
    production.families.set(soloFamilyId, {
      id: soloFamilyId,
      display_name: "Solo Synthetic Family",
      domain: "domain.d1",
      concepts: [soloConceptId],
      patterns: [],
      evidence_dimensions: [],
      role_target: null,
      qualifier_target: null,
      lifecycle: null,
      stage_target: null,
      decision_type: null,
      teaching_objective: "test",
      invariant_reasoning: "test",
      variation_strategy: [],
      difficulty_band: "introductory",
      minimum_variant_count: 1,
      content_status: "CANDIDATE",
      verification_status: "unverified",
      active: true,
      version: 1,
      replaced_by: null,
      source: "source.test"
    });
    production.questions.set(soloQuestionId, {
      id: soloQuestionId,
      domain: "domain.d1",
      concepts: [soloConceptId],
      patterns: [],
      qualifier: null,
      roles_mentioned: [],
      primary_role: null,
      lifecycle: null,
      stage: null,
      decision_type: null,
      family: soloFamilyId,
      prompt: "Solo synthetic prompt.",
      options: [
        { key: "a", text: "Correct", correct: true, rationale: "" },
        { key: "b", text: "Wrong", correct: false, rationale: "" }
      ],
      explanation: "test",
      evidence_dimensions: [],
      content_status: "CANDIDATE",
      verification_status: "unverified",
      active: true,
      version: 1,
      source: "source.test"
    });
    try {
      const context: ReinforcementContext = { primaryQuestionId: soloQuestionId, primaryCorrect: true };
      expect(reinforcementEligibleCount(context)).toBe(0);
      expect(buildReinforcementSession(context, 3)).toEqual([]);
    } finally {
      production.concepts.delete(soloConceptId);
      production.families.delete(soloFamilyId);
      production.questions.delete(soloQuestionId);
    }
  });
});

describe("Reinforcement — works generically for a synthetic future domain (no domain-specific code)", () => {
  const domainId = "domain.synthetic-future";
  const conceptId = "concept.synthetic-future.reinforcement-test";
  const familyId = "family.synthetic-future.reinforcement-test";
  const seenId = "question.synthetic-future.reinforcement-seen";
  const siblingId = "question.synthetic-future.reinforcement-sibling";

  it("discovers a synthetic domain/concept/family/question with zero code changes", () => {
    registry.domains.set(domainId, { id: domainId, display_name: "Synthetic Future Domain", exam_domain: true });
    production.concepts.set(conceptId, {
      id: conceptId,
      display_name: "Synthetic Reinforcement Concept",
      home_domain: domainId,
      plain: "A synthetic concept used only to prove Reinforcement is domain-generic.",
      related_patterns: [],
      content_status: "CANDIDATE",
      verification_status: "unverified",
      source: "source.test",
      version: 1
    });
    const family: ProductionFamily = {
      id: familyId,
      display_name: "Synthetic Reinforcement Family",
      domain: domainId,
      concepts: [conceptId],
      patterns: [],
      evidence_dimensions: [],
      role_target: null,
      qualifier_target: null,
      lifecycle: null,
      stage_target: null,
      decision_type: null,
      teaching_objective: "Prove Reinforcement is generic.",
      invariant_reasoning: "test",
      variation_strategy: [],
      difficulty_band: "introductory",
      minimum_variant_count: 2,
      content_status: "CANDIDATE",
      verification_status: "unverified",
      active: true,
      version: 1,
      replaced_by: null,
      source: "source.test"
    };
    production.families.set(familyId, family);

    for (const id of [seenId, siblingId]) {
      const question: ProductionQuestion = {
        id,
        domain: domainId,
        concepts: [conceptId],
        patterns: [],
        qualifier: null,
        roles_mentioned: [],
        primary_role: null,
        lifecycle: null,
        stage: null,
        decision_type: null,
        family: familyId,
        prompt: `Synthetic prompt for ${id}.`,
        options: [
          { key: "a", text: "Correct synthetic option", correct: true, rationale: "" },
          { key: "b", text: "Wrong synthetic option", correct: false, rationale: "" }
        ],
        explanation: "test",
        evidence_dimensions: [],
        content_status: "CANDIDATE",
        verification_status: "unverified",
        active: true,
        version: 1,
        source: "source.test"
      };
      production.questions.set(id, question);
    }

    try {
      const context: ReinforcementContext = { primaryQuestionId: seenId, primaryCorrect: false };
      expect(reinforcementEligibleCount(context)).toBe(1);
      const session = buildReinforcementSession(context, 3);
      expect(session).toHaveLength(1);
      expect(session[0]!.id).toBe(siblingId);
    } finally {
      registry.domains.delete(domainId);
      production.concepts.delete(conceptId);
      production.families.delete(familyId);
      production.questions.delete(seenId);
      production.questions.delete(siblingId);
    }
  });
});
