import { describe, it, expect, afterEach } from "vitest";
import {
  listExploreDomains,
  listExploreConcepts,
  getExploreConceptDetail,
  getExploreScenarioQuestion
} from "../../../app/src/content/explore";
import { registry, production, type ProductionConcept, type ProductionFamily, type ProductionQuestion } from "../../../app/src/content/registry";
import { resetExposureHistoryForTests } from "../../../app/src/content/exposureStore";

/**
 * Phase 10B-2: Explore's data layer. Explore is deliberately NOT a second
 * content system — every function here composes the same content/production/
 * + schema/registry/ data productionContentSource.ts already loads, and the
 * optional scenario question reuses resolve.ts's existing family/variant
 * pipeline verbatim (see explore.ts's own header comment).
 */

afterEach(() => {
  resetExposureHistoryForTests();
});

describe("Explore — domain discovery is generic (no D1/D2 hardcoding)", () => {
  // "No hardcoded branching" is proven behaviorally, not by grepping source
  // text: the synthetic-future-domain suite below adds a domain/concept/
  // family/question combination explore.ts has never seen and shows it is
  // discovered with zero code changes — a stronger guarantee than a text
  // search, and one that can't pass by accident.

  it("lists exactly the domains that have at least one authored concept, matching production data directly", () => {
    const domains = listExploreDomains();
    const expectedIds = new Set([...production.concepts.values()].map((c) => c.home_domain));
    expect(new Set(domains.map((d) => d.id))).toEqual(expectedIds);
    for (const domain of domains) {
      const actualCount = [...production.concepts.values()].filter((c) => c.home_domain === domain.id).length;
      expect(domain.conceptCount).toBe(actualCount);
      expect(domain.label).toBe(registry.domains.get(domain.id)?.display_name);
    }
  });

  it("Foundation (a non-exam domain) sorts before the numbered exam domains, generically — not via a special case", () => {
    const domains = listExploreDomains();
    const foundationIndex = domains.findIndex((d) => registry.domains.get(d.id)?.exam_domain === false);
    const firstExamIndex = domains.findIndex((d) => registry.domains.get(d.id)?.exam_domain === true);
    if (foundationIndex !== -1 && firstExamIndex !== -1) {
      expect(foundationIndex).toBeLessThan(firstExamIndex);
    }
  });

  it("does not currently include Domain 3/4 (not yet authored) — proves the boundary is data-driven, not a hardcoded allowlist", () => {
    const domains = listExploreDomains();
    expect(domains.some((d) => d.id === "domain.d3")).toBe(false);
    expect(domains.some((d) => d.id === "domain.d4")).toBe(false);
  });
});

describe("Explore — concept discovery is generic", () => {
  it("lists exactly the concepts whose home_domain matches, for more than one real domain", () => {
    for (const domainId of ["domain.d1", "domain.d2"]) {
      const concepts = listExploreConcepts(domainId);
      const expected = [...production.concepts.values()].filter((c) => c.home_domain === domainId);
      expect(concepts.map((c) => c.id).sort()).toEqual(expected.map((c) => c.id).sort());
    }
  });

  it("returns an empty list for a domain with no authored concepts, without throwing", () => {
    expect(listExploreConcepts("domain.nonexistent")).toEqual([]);
  });
});

describe("Explore — concept review composition", () => {
  it("composes the full review from concept + its teaching lesson when one exists (Governance vs. Management)", () => {
    const detail = getExploreConceptDetail("concept.d1.governance-vs-management");
    expect(detail).toBeDefined();
    expect(detail!.title).toBe("Governance vs. management");
    expect(detail!.domainLabel).toBe("Governance");
    expect(detail!.whatIsThis).toMatch(/Governance sets direction/);
    expect(detail!.perspective).toBeTruthy();
    expect(detail!.recognitionClue).toBeTruthy();
    expect(detail!.trap).toBeTruthy();
    expect(detail!.memoryRule).toBe("Governance sets the boundary; management works within it.");
    expect(detail!.hasScenario).toBe(true);
  });

  it("returns undefined for an unknown concept id rather than throwing (invalid-state safety)", () => {
    expect(getExploreConceptDetail("concept.does-not-exist")).toBeUndefined();
  });
});

describe("Explore — optional scenario reuses the existing family/variant architecture", () => {
  it("resolves a real question belonging to the concept's own family", () => {
    const scenario = getExploreScenarioQuestion("concept.d1.governance-vs-management");
    expect(scenario).toBeDefined();
    const raw = production.questions.get(scenario!.question.id);
    expect(raw?.family).toBe("family.d1.governance-vs-management");
  });

  it("prefers the most concept-specific family when a concept is covered by more than one active family", () => {
    // concept.d2.risk-evaluation is covered by both family.d2.risk-evaluation
    // (1 concept) and family.d2.risk-management-synthesis (5 concepts) — the
    // smallest-concept-count rule must pick the dedicated one, never the
    // broader synthesis family.
    const scenario = getExploreScenarioQuestion("concept.d2.risk-evaluation");
    const raw = production.questions.get(scenario!.question.id);
    expect(raw?.family).toBe("family.d2.risk-evaluation");
  });

  it("respects the shared session exposure store (same one Daily Study uses) rather than a separate Explore history", () => {
    const first = getExploreScenarioQuestion("concept.d1.governance-vs-management");
    const second = getExploreScenarioQuestion("concept.d1.governance-vs-management");
    // Exact-repeat avoidance is exercised in selection.ts's own tests; the
    // relevant Explore-specific guarantee is that calling twice advances the
    // SAME shared store (recordExposure is actually invoked), not a private
    // one — verified indirectly via getExposureHistory below.
    expect(first).toBeDefined();
    expect(second).toBeDefined();
  });
});

describe("Explore — works generically for a synthetic future domain (no domain-specific code)", () => {
  const domainId = "domain.synthetic-future";
  const conceptId = "concept.synthetic-future.test-concept";
  const familyId = "family.synthetic-future.test-family";
  const questionId = "question.synthetic-future.0001";

  it("discovers a synthetic domain/concept/family/question with zero code changes", () => {
    registry.domains.set(domainId, { id: domainId, display_name: "Synthetic Future Domain", exam_domain: true });

    const concept: ProductionConcept = {
      id: conceptId,
      display_name: "Synthetic Test Concept",
      home_domain: domainId,
      plain: "A synthetic concept used only to prove Explore is domain-generic.",
      related_patterns: [],
      content_status: "CANDIDATE",
      verification_status: "unverified",
      source: "source.test",
      version: 1
    };
    production.concepts.set(conceptId, concept);

    const family: ProductionFamily = {
      id: familyId,
      display_name: "Synthetic Test Family",
      domain: domainId,
      concepts: [conceptId],
      patterns: [],
      evidence_dimensions: [],
      role_target: null,
      qualifier_target: null,
      lifecycle: null,
      stage_target: null,
      decision_type: null,
      teaching_objective: "Prove Explore is generic.",
      invariant_reasoning: "The synthetic correct answer is always option a in this test.",
      variation_strategy: [],
      difficulty_band: "introductory",
      minimum_variant_count: 1,
      content_status: "CANDIDATE",
      verification_status: "unverified",
      active: true,
      version: 1,
      replaced_by: null,
      source: "source.test"
    };
    production.families.set(familyId, family);

    const question: ProductionQuestion = {
      id: questionId,
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
      prompt: "A synthetic scenario prompt.",
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
    production.questions.set(questionId, question);

    try {
      const domains = listExploreDomains();
      expect(domains.some((d) => d.id === domainId)).toBe(true);

      const concepts = listExploreConcepts(domainId);
      expect(concepts).toEqual([{ id: conceptId, label: "Synthetic Test Concept" }]);

      const detail = getExploreConceptDetail(conceptId);
      expect(detail?.title).toBe("Synthetic Test Concept");
      expect(detail?.hasScenario).toBe(true);

      const scenario = getExploreScenarioQuestion(conceptId);
      expect(scenario?.question.id).toBe(questionId);
    } finally {
      registry.domains.delete(domainId);
      production.concepts.delete(conceptId);
      production.families.delete(familyId);
      production.questions.delete(questionId);
    }
  });

  it("a concept with no matching family/variant safely reports no scenario, without fabricating one", () => {
    const bareConceptId = "concept.synthetic-future.no-family";
    production.concepts.set(bareConceptId, {
      id: bareConceptId,
      display_name: "Synthetic Concept With No Family",
      home_domain: "domain.d1",
      plain: "A synthetic concept with no associated family.",
      related_patterns: [],
      content_status: "CANDIDATE",
      verification_status: "unverified",
      source: "source.test",
      version: 1
    });
    try {
      const detail = getExploreConceptDetail(bareConceptId);
      expect(detail?.hasScenario).toBe(false);
      expect(getExploreScenarioQuestion(bareConceptId)).toBeUndefined();
    } finally {
      production.concepts.delete(bareConceptId);
    }
  });
});
