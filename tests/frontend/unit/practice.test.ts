import { describe, it, expect, afterEach, beforeEach } from "vitest";
import {
  listPracticeScopes,
  getPracticeCountOptions,
  buildPracticeSession,
  conceptForQuestion,
  ALL_SCOPE_ID
} from "../../../app/src/content/practice";
import { registry, production, type ProductionConcept, type ProductionFamily, type ProductionQuestion } from "../../../app/src/content/registry";
import { getExposureHistory, resetExposureHistoryForTests } from "../../../app/src/content/exposureStore";

/**
 * Phase 10B-3: Practice's data layer. Practice is deliberately NOT a
 * second content system or a PracticeQuestionEngine — every function here
 * composes the same content/production/ + schema/registry/ data
 * explore.ts/productionContentSource.ts already load, and reuses
 * resolve.ts's/selection.ts's existing family/variant pipeline verbatim.
 */

beforeEach(() => {
  resetExposureHistoryForTests();
});
afterEach(() => {
  resetExposureHistoryForTests();
});

describe("Practice — scope discovery is generic (no D1/D2 hardcoding)", () => {
  it("lists 'All available material' plus exactly the domains that have at least one eligible family", () => {
    const scopes = listPracticeScopes();
    expect(scopes[0]).toMatchObject({ id: ALL_SCOPE_ID, label: "All available material" });
    const domainIds = scopes.slice(1).map((s) => s.id);
    const expectedDomainIds = new Set(
      [...production.families.values()].filter((f) => f.active).map((f) => f.domain)
    );
    expect(new Set(domainIds)).toEqual(expectedDomainIds);
  });

  it("does not currently include Domain 3/4 (not yet authored) — the boundary is data-driven, not an allowlist", () => {
    const scopes = listPracticeScopes();
    expect(scopes.some((s) => s.id === "domain.d3")).toBe(false);
    expect(scopes.some((s) => s.id === "domain.d4")).toBe(false);
  });

  it("'All available material' eligible count equals the sum of every eligible family's variant count", () => {
    const scopes = listPracticeScopes();
    const all = scopes.find((s) => s.id === ALL_SCOPE_ID)!;
    expect(all.eligibleQuestionCount).toBeGreaterThan(0);
    expect(all.eligibleQuestionCount).toBe(
      scopes.slice(1).reduce((sum, s) => sum + s.eligibleQuestionCount, 0)
    );
  });
});

describe("Practice — question-count selection", () => {
  it("offers 5 and 10 as candidate counts, marking availability truthfully per scope", () => {
    const allOptions = getPracticeCountOptions(ALL_SCOPE_ID);
    expect(allOptions.map((o) => o.count)).toEqual([5, 10]);
    expect(allOptions.every((o) => o.available)).toBe(true);

    // domain.foundation has only 3 total authored questions — both 5 and
    // 10 must be truthfully unavailable, never silently offered.
    const foundationOptions = getPracticeCountOptions("domain.foundation");
    expect(foundationOptions.every((o) => !o.available)).toBe(true);
  });
});

describe("Practice — single-domain scope works generically", () => {
  it("builds a session drawing only from the selected domain's families", () => {
    const session = buildPracticeSession("domain.d1", 5);
    expect(session).toHaveLength(5);
    for (const question of session) {
      const raw = production.questions.get(question.id)!;
      expect(raw.domain).toBe("domain.d1");
    }
  });
});

describe("Practice — bounded session construction", () => {
  it("creates a session of exactly the requested size when enough eligible questions exist", () => {
    const session = buildPracticeSession(ALL_SCOPE_ID, 10);
    expect(session).toHaveLength(10);
  });

  it("avoids exact duplicate questions within one session", () => {
    const session = buildPracticeSession(ALL_SCOPE_ID, 10);
    const ids = session.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("prefers variety across families/concepts rather than repeatedly drawing the same family", () => {
    const session = buildPracticeSession(ALL_SCOPE_ID, 5);
    const familyIds = session.map((q) => production.questions.get(q.id)!.family);
    // 5 questions, round-robin across 21 eligible families: every family id must be distinct.
    expect(new Set(familyIds).size).toBe(5);
  });

  it("gracefully returns fewer questions than requested when the scope doesn't have enough unique material (never fabricates one)", () => {
    const session = buildPracticeSession("domain.foundation", 10);
    expect(session.length).toBeLessThan(10);
    expect(session.length).toBeGreaterThan(0);
    expect(session.length).toBe(3); // domain.foundation's true total
    const ids = session.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("returns an empty session for a scope with zero eligible families, without throwing", () => {
    expect(buildPracticeSession("domain.nonexistent", 5)).toEqual([]);
  });
});

describe("Practice — shared exposure store integration", () => {
  it("records real exposure for every question in a constructed session (same store Daily Study/Explore use)", () => {
    const before = getExposureHistory().size;
    const session = buildPracticeSession(ALL_SCOPE_ID, 5);
    const after = getExposureHistory();
    for (const question of session) {
      expect(after.has(question.id)).toBe(true);
    }
    expect(after.size).toBeGreaterThanOrEqual(before + 5);
  });

  it("a second session started immediately after prefers not-yet-seen questions over the first session's own picks", () => {
    const first = buildPracticeSession(ALL_SCOPE_ID, 10);
    const second = buildPracticeSession(ALL_SCOPE_ID, 10);
    const firstIds = new Set(first.map((q) => q.id));
    const overlap = second.filter((q) => firstIds.has(q.id));
    // 67 total eligible, 10 already seen — plenty of unseen remain, so a
    // fresh session should not need to repeat any of the first session's
    // questions yet.
    expect(overlap).toHaveLength(0);
  });
});

describe("Practice — missed-concept derivation is truthful", () => {
  it("resolves a question's own concept, matching the underlying authored data", () => {
    const session = buildPracticeSession("domain.d1", 1);
    const concept = conceptForQuestion(session[0]!.id);
    const raw = production.questions.get(session[0]!.id)!;
    const expectedConceptId = raw.concepts[0];
    expect(concept?.id).toBe(expectedConceptId);
    expect(concept?.label).toBe(production.concepts.get(expectedConceptId!)?.display_name);
  });
});

describe("Practice — works generically for a synthetic future domain (no domain-specific code)", () => {
  const domainId = "domain.synthetic-future";
  const conceptId = "concept.synthetic-future.practice-test";
  const familyId = "family.synthetic-future.practice-test";
  const questionIds = ["question.synthetic-future.practice-0001", "question.synthetic-future.practice-0002"];

  it("discovers and builds a session from a synthetic domain/concept/family/questions with zero code changes", () => {
    registry.domains.set(domainId, { id: domainId, display_name: "Synthetic Future Domain", exam_domain: true });

    const concept: ProductionConcept = {
      id: conceptId,
      display_name: "Synthetic Practice Concept",
      home_domain: domainId,
      plain: "A synthetic concept used only to prove Practice is domain-generic.",
      related_patterns: [],
      content_status: "CANDIDATE",
      verification_status: "unverified",
      source: "source.test",
      version: 1
    };
    production.concepts.set(conceptId, concept);

    const family: ProductionFamily = {
      id: familyId,
      display_name: "Synthetic Practice Family",
      domain: domainId,
      concepts: [conceptId],
      patterns: [],
      evidence_dimensions: [],
      role_target: null,
      qualifier_target: null,
      lifecycle: null,
      stage_target: null,
      decision_type: null,
      teaching_objective: "Prove Practice is generic.",
      invariant_reasoning: "The synthetic correct answer is always option a in this test.",
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

    for (const id of questionIds) {
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
        prompt: `Synthetic scenario prompt for ${id}.`,
        options: [
          { key: "a", text: "Correct synthetic option", correct: true, rationale: "Because this test says so." },
          { key: "b", text: "Wrong synthetic option", correct: false, rationale: "Because this test says so." }
        ],
        explanation: "Synthetic explanation.",
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
      const scopes = listPracticeScopes();
      expect(scopes.some((s) => s.id === domainId)).toBe(true);

      const countOptions = getPracticeCountOptions(domainId);
      expect(countOptions.find((o) => o.count === 5)?.available).toBe(false); // only 2 authored
      expect(countOptions.find((o) => o.count === 10)?.available).toBe(false);

      const session = buildPracticeSession(domainId, 5);
      expect(session).toHaveLength(2); // truthfully capped at what's authored
      expect(new Set(session.map((q) => q.id))).toEqual(new Set(questionIds));

      const concept0 = conceptForQuestion(session[0]!.id);
      expect(concept0?.label).toBe("Synthetic Practice Concept");
    } finally {
      registry.domains.delete(domainId);
      production.concepts.delete(conceptId);
      production.families.delete(familyId);
      for (const id of questionIds) production.questions.delete(id);
    }
  });
});
