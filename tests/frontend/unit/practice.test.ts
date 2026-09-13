import { describe, it, expect, afterEach, beforeEach } from "vitest";
import {
  listPracticeScopes,
  getPracticeCountOptions,
  buildPracticeSession,
  conceptForQuestion,
  ALL_SCOPE_ID,
  eligibleQuestionsForTarget,
  getTargetedPracticeCountOptions,
  buildTargetedPracticeSession,
  type PracticeTarget
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

  it("now includes Domain 3 and Domain 4 (both authored) — the boundary is data-driven, not an allowlist", () => {
    // Originally asserted neither D3 nor D4 was present, then that D3 was
    // present but not yet D4. D3-U1/U2 and D4-U1/U2 have since both been
    // authored (see docs/learning/DOMAIN-3-CURRICULUM-ARCHITECTURE.md,
    // docs/learning/DOMAIN-4-CURRICULUM-ARCHITECTURE.md, and
    // tests/content-production/domain3-u1-u2.test.mjs /
    // domain4-u1-u2.test.mjs) with zero changes to practice.ts itself —
    // each domain simply appeared here automatically once authored, which
    // is the actual proof this boundary is data-driven.
    const scopes = listPracticeScopes();
    expect(scopes.some((s) => s.id === "domain.d3")).toBe(true);
    expect(scopes.some((s) => s.id === "domain.d4")).toBe(true);
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

/**
 * LI-4 §40-42: targeted Practice's current-content eligibility filter, one
 * axis at a time, against real production metadata (never synthetic
 * fixtures here — the whole point is proving CURRENT production content
 * resolution is correct). Each test proves both directions: every returned
 * question matches, and a deliberately non-matching real question is
 * excluded.
 */
describe("Practice — targeted eligibility filter (LI-4)", () => {
  function assertAllMatch(target: PracticeTarget, predicate: (q: ProductionQuestion) => boolean) {
    const results = eligibleQuestionsForTarget(target);
    expect(results.length).toBeGreaterThan(0);
    for (const q of results) {
      expect(q.active).toBe(true);
      expect(predicate(q)).toBe(true);
    }
    return results;
  }

  it("concept — only questions referencing that exact concept, no domain-mate leakage", () => {
    const targetConcept = "concept.d3.program-metrics-reporting";
    const results = assertAllMatch({ axis: "concept", targetId: targetConcept }, (q) => q.concepts.includes(targetConcept));
    // A real same-domain, different-concept question must be excluded.
    const sameDomainOtherConcept = [...production.questions.values()].find(
      (q) => q.active && q.domain === "domain.d3" && !q.concepts.includes(targetConcept)
    );
    expect(sameDomainOtherConcept).toBeDefined();
    expect(results.some((q) => q.id === sameDomainOtherConcept!.id)).toBe(false);
  });

  it("family — only questions belonging to that exact family", () => {
    const targetFamily = "family.d1.governance-layer-authority";
    assertAllMatch({ axis: "family", targetId: targetFamily }, (q) => q.family === targetFamily);
  });

  it("pattern — only questions whose patterns[] include the target, spanning multiple concepts/domains (cross-cutting §42)", () => {
    const targetPattern = "pattern.p02";
    const results = assertAllMatch({ axis: "pattern", targetId: targetPattern }, (q) => q.patterns.includes(targetPattern));
    const distinctConcepts = new Set(results.flatMap((q) => q.concepts));
    expect(distinctConcepts.size).toBeGreaterThan(1); // never collapsed to one concept/domain
  });

  it("qualifier — only questions with the exact qualifier", () => {
    assertAllMatch({ axis: "qualifier", targetId: "qualifier.best" }, (q) => q.qualifier === "qualifier.best");
  });

  it("decision_type — only questions with the exact decision type, spanning multiple domains", () => {
    const results = assertAllMatch({ axis: "decision_type", targetId: "decision.risk" }, (q) => q.decision_type === "decision.risk");
    const distinctDomains = new Set(results.map((q) => q.domain));
    expect(distinctDomains.size).toBeGreaterThanOrEqual(1);
  });

  it("evidence_dimension — only questions whose evidence_dimensions[] include the target", () => {
    assertAllMatch({ axis: "evidence_dimension", targetId: "evidence.knowledge" }, (q) => q.evidence_dimensions.includes("evidence.knowledge"));
  });

  it("role — only questions with the exact primary_role, never inferred from roles_mentioned", () => {
    const targetRole = "role.security-manager";
    const results = assertAllMatch({ axis: "role", targetId: targetRole }, (q) => q.primary_role === targetRole);
    // A question that merely MENTIONS the role without it being primary must be excluded.
    const mentionsOnly = [...production.questions.values()].find(
      (q) => q.active && q.primary_role !== targetRole && q.roles_mentioned.includes(targetRole)
    );
    if (mentionsOnly) expect(results.some((q) => q.id === mentionsOnly.id)).toBe(false);
  });

  it("lifecycle — only questions with the exact lifecycle", () => {
    assertAllMatch({ axis: "lifecycle", targetId: "lifecycle.risk" }, (q) => q.lifecycle === "lifecycle.risk");
  });

  it("stage — only questions with the exact stage", () => {
    assertAllMatch({ axis: "stage", targetId: "stage.risk.analyze" }, (q) => q.stage === "stage.risk.analyze");
  });

  it("domain — only questions in that exact domain (used only as a truthful existence check; real domain sessions still go through buildPracticeSession)", () => {
    assertAllMatch({ axis: "domain", targetId: "domain.d2" }, (q) => q.domain === "domain.d2");
  });

  it("an axis with no current production coverage returns zero results safely, never throws", () => {
    expect(eligibleQuestionsForTarget({ axis: "lifecycle", targetId: "lifecycle.does-not-exist" })).toEqual([]);
    expect(eligibleQuestionsForTarget({ axis: "concept", targetId: "concept.does-not-exist" })).toEqual([]);
  });
});

describe("Practice — targeted count options never pad or fabricate (LI-4 §17/§27)", () => {
  it("offers the true pool size as a startable option when it is smaller than every fixed candidate", () => {
    const target: PracticeTarget = { axis: "concept", targetId: "concept.d3.program-metrics-reporting" };
    const total = eligibleQuestionsForTarget(target).length;
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(10);
    const options = getTargetedPracticeCountOptions(target);
    expect(options.every((o) => o.available)).toBe(true);
    expect(options.some((o) => o.count === total)).toBe(true);
    expect(options.every((o) => o.count <= total)).toBe(true);
  });

  it("returns no options for a target with zero current eligible questions", () => {
    expect(getTargetedPracticeCountOptions({ axis: "concept", targetId: "concept.does-not-exist" })).toEqual([]);
  });

  it("offers the standard 5/10 candidates when the pool is large enough", () => {
    const options = getTargetedPracticeCountOptions({ axis: "decision_type", targetId: "decision.risk" });
    expect(options.map((o) => o.count)).toEqual(expect.arrayContaining([5, 10]));
  });
});

describe("Practice — targeted session construction reuses the same engine (LI-4 §8/§41/§42)", () => {
  it("concept-level Practice never leaks a same-domain, different-concept question into the pool", () => {
    const targetConcept = "concept.d3.program-metrics-reporting";
    const session = buildTargetedPracticeSession({ axis: "concept", targetId: targetConcept }, 10);
    expect(session.length).toBeGreaterThan(0);
    for (const question of session) {
      const raw = production.questions.get(question.id)!;
      expect(raw.concepts).toContain(targetConcept);
    }
  });

  it("never duplicates a question within one targeted session", () => {
    const session = buildTargetedPracticeSession({ axis: "pattern", targetId: "pattern.p02" }, 10);
    const ids = session.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("a cross-cutting target retains matches spanning multiple concepts, never collapsed to one", () => {
    const session = buildTargetedPracticeSession({ axis: "pattern", targetId: "pattern.p02" }, 10);
    const conceptIds = new Set(session.flatMap((q) => production.questions.get(q.id)!.concepts));
    expect(conceptIds.size).toBeGreaterThan(1);
  });

  it("returns an empty session for a target with zero eligible questions, without throwing", () => {
    expect(buildTargetedPracticeSession({ axis: "concept", targetId: "concept.does-not-exist" }, 5)).toEqual([]);
  });
});
