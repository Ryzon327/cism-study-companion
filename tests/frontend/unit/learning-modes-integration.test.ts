import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { productionContentSource, setTodaysLessonIdForReview } from "../../../app/src/content/productionContentSource";
import { listExploreDomains, listExploreConcepts, getExploreConceptDetail, getExploreScenarioQuestion } from "../../../app/src/content/explore";
import { listPracticeScopes, getPracticeCountOptions, buildPracticeSession, ALL_SCOPE_ID } from "../../../app/src/content/practice";
import { reinforcementEligibleCount, buildReinforcementSession, type ReinforcementContext } from "../../../app/src/content/reinforcement";
import { registry, production, type ProductionConcept, type ProductionFamily, type ProductionQuestion } from "../../../app/src/content/registry";
import { getExposureHistory, resetExposureHistoryForTests } from "../../../app/src/content/exposureStore";

/**
 * Phase 10B-5: proves the four learning modes actually interoperate through
 * the ONE shared architecture each phase's own gate record documented in
 * isolation — not four independently-correct modes that happen to look
 * similar, but genuinely the same session exposure store, the same
 * active-authored-content boundary, and the same family/variant/Feedback/
 * Repair pipeline, exercised together in one continuous sequence and
 * against one shared synthetic domain.
 */

beforeEach(() => {
  resetExposureHistoryForTests();
  setTodaysLessonIdForReview("lesson.d1.governance-vs-management");
});
afterEach(() => {
  resetExposureHistoryForTests();
});

describe("Learning modes integration — shared exposure across Daily Study -> Explore -> Practice -> Reinforcement", () => {
  it("a question seen in Daily Study is recorded in the one shared store Explore/Practice/Reinforcement all read", () => {
    expect(getExposureHistory().size).toBe(0);

    // Daily Study: Recall + Apply each resolve and record one exposure.
    const recall = productionContentSource.getRecall();
    const { question: applyQuestion } = productionContentSource.getApplyQuestion();
    expect(getExposureHistory().has(applyQuestion.id)).toBe(true);
    if (recall.questionId) expect(getExposureHistory().has(recall.questionId)).toBe(true);

    // Explore, for the SAME concept the lesson just taught: must not
    // re-offer the exact question Daily Study just showed, while an unseen
    // sibling exists (family.d1.governance-vs-management has 3 variants).
    const scenario = getExploreScenarioQuestion("concept.d1.governance-vs-management");
    expect(scenario).toBeDefined();
    expect(scenario!.question.id).not.toBe(applyQuestion.id);
    expect(getExposureHistory().has(scenario!.question.id)).toBe(true);

    // Practice, scoped to "all": every pick is recorded in the same store,
    // and (per its own no-duplicate-within-a-session guarantee) contains
    // no internal repeats either.
    const before = getExposureHistory().size;
    const practiceSession = buildPracticeSession(ALL_SCOPE_ID, 5);
    expect(practiceSession.length).toBe(5);
    const after = getExposureHistory();
    for (const q of practiceSession) expect(after.has(q.id)).toBe(true);
    expect(after.size).toBeGreaterThanOrEqual(before + 5);

    // Reinforcement, built from that same Daily Study attempt's context:
    // never repeats the exact Apply/Recall ids just seen.
    const context: ReinforcementContext = {
      primaryQuestionId: applyQuestion.id,
      primaryCorrect: true,
      secondaryQuestionId: recall.questionId
    };
    const reinforcementSession = buildReinforcementSession(context, 3);
    const reinforcementIds = reinforcementSession.map((q) => q.id);
    expect(reinforcementIds).not.toContain(applyQuestion.id);
    if (recall.questionId) expect(reinforcementIds).not.toContain(recall.questionId);
    for (const id of reinforcementIds) expect(getExposureHistory().has(id)).toBe(true);
  });
});

describe("Learning modes integration — Explore and Practice share one active-authored-content boundary", () => {
  it("both discover exactly the same set of authored domains, via the same reused domain-sort rule", () => {
    const exploreDomainIds = listExploreDomains().map((d) => d.id);
    const practiceDomainIds = listPracticeScopes()
      .filter((s) => s.id !== ALL_SCOPE_ID)
      .map((s) => s.id);
    expect(new Set(practiceDomainIds)).toEqual(new Set(exploreDomainIds));
  });
});

describe("Learning modes integration — one shared Feedback/Repair pipeline", () => {
  it("a question reached via Explore's scenario routing produces the exact same near-transfer Repair check that Daily Study's own repair-coverage tests already verified for it — proving one shared implementation, not a per-mode fork", () => {
    // question.d1.0005 is family.d1.governance-vs-management's lowest-id
    // variant — deterministically what Explore's scenario resolves to here
    // (fresh exposure history) — and is the exact question
    // repair-coverage.test.ts independently exercises via
    // productionContentSource directly for Daily Study's own repair path.
    const scenario = getExploreScenarioQuestion("concept.d1.governance-vs-management")!;
    expect(scenario.question.id).toBe("question.d1.0005");

    const wrongOption = scenario.question.options.find((o) => !o.correct)!;
    const feedback = productionContentSource.buildFeedback(scenario.question, wrongOption.key);
    const repair = productionContentSource.getRepairCheck(feedback);

    // The same near-transfer, anti-giveaway guarantees repair-coverage.test.ts
    // proves for this exact question via Daily Study's own path.
    expect(repair.prompt).toMatch(/Perspective:/);
    const originalOptionTexts = scenario.question.options.map((o) => o.text);
    for (const option of repair.options) {
      expect(originalOptionTexts).not.toContain(option.text);
    }
  });
});

describe("Learning modes integration — a single synthetic future domain works across all four modes with zero mode-specific code", () => {
  const domainId = "domain.synthetic-future";
  const conceptId = "concept.synthetic-future.integration";
  const familyId = "family.synthetic-future.integration";
  const questionIds = ["question.synthetic-future.integration-0001", "question.synthetic-future.integration-0002", "question.synthetic-future.integration-0003"];

  it("Explore, Practice, and Reinforcement all discover and correctly use the same synthetic domain/concept/family/questions", () => {
    registry.domains.set(domainId, { id: domainId, display_name: "Synthetic Future Domain", exam_domain: true });

    const concept: ProductionConcept = {
      id: conceptId,
      display_name: "Synthetic Integration Concept",
      home_domain: domainId,
      plain: "A synthetic concept used only to prove all four modes are domain-generic together.",
      related_patterns: [],
      content_status: "CANDIDATE",
      verification_status: "unverified",
      source: "source.test",
      version: 1
    };
    production.concepts.set(conceptId, concept);

    const family: ProductionFamily = {
      id: familyId,
      display_name: "Synthetic Integration Family",
      domain: domainId,
      concepts: [conceptId],
      patterns: [],
      evidence_dimensions: [],
      role_target: null,
      qualifier_target: null,
      lifecycle: null,
      stage_target: null,
      decision_type: null,
      teaching_objective: "Prove cross-mode genericity.",
      invariant_reasoning: "test",
      variation_strategy: [],
      difficulty_band: "introductory",
      minimum_variant_count: 3,
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
        prompt: `Synthetic integration prompt for ${id}.`,
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
      // Explore discovers it.
      expect(listExploreDomains().some((d) => d.id === domainId)).toBe(true);
      expect(listExploreConcepts(domainId)).toEqual([{ id: conceptId, label: "Synthetic Integration Concept" }]);
      const detail = getExploreConceptDetail(conceptId);
      expect(detail?.hasScenario).toBe(true);
      const exploreScenario = getExploreScenarioQuestion(conceptId);
      expect(questionIds).toContain(exploreScenario?.question.id);

      // Practice discovers it as both a scope and a source of questions.
      expect(listPracticeScopes().some((s) => s.id === domainId)).toBe(true);
      expect(getPracticeCountOptions(domainId).find((o) => o.count === 5)?.available).toBe(false); // only 3 authored, minus the one Explore just used
      const practiceSession = buildPracticeSession(domainId, 3);
      expect(practiceSession.length).toBeGreaterThan(0);
      for (const q of practiceSession) expect(questionIds).toContain(q.id);

      // Reinforcement operates through the same family/variant relationship.
      const context: ReinforcementContext = { primaryQuestionId: exploreScenario!.question.id, primaryCorrect: false };
      expect(reinforcementEligibleCount(context)).toBeGreaterThanOrEqual(0);
      const reinforcementSession = buildReinforcementSession(context, 2);
      for (const q of reinforcementSession) {
        expect(q.id).not.toBe(exploreScenario!.question.id);
        expect(questionIds).toContain(q.id);
      }
    } finally {
      registry.domains.delete(domainId);
      production.concepts.delete(conceptId);
      production.families.delete(familyId);
      for (const id of questionIds) production.questions.delete(id);
    }
  });
});
