import { describe, it, expect } from "vitest";
import { productionContentSource } from "../../../app/src/content/productionContentSource";
import { requireProductionQuestion, resolveQuestion, resolveFeedback } from "../../../app/src/content/resolve";
import productionQuestions from "../../../content/production/questions.json";

/**
 * Phase 10B-1 repair-coverage audit (docs/learning/PHASE-10B1-GATE-RECORD.md),
 * revised after the Founder's targeted human-experience finding: the first
 * dynamic repair.knowledge-gap/repair.vocabulary-error treatment asked a
 * META question ("does this need a second look?") answerable without any
 * concept understanding. These tests exercise getRepairCheck() (the actual
 * runtime path) with REAL resolved feedback objects (never bare target-id
 * strings) to prove the replacement genuinely requires re-applying the
 * missed concept.
 */

function feedbackFor(questionId: string, wrongKey: "a" | "b" | "c" | "d") {
  const raw = requireProductionQuestion(questionId);
  const resolved = resolveQuestion(raw);
  return resolveFeedback(raw, resolved, wrongKey);
}

const ALL_USED_REPAIR_TARGETS = Array.from(
  new Set(
    (productionQuestions as { options: { repair_target?: string }[] }[]).flatMap((q) =>
      q.options.map((o) => o.repair_target).filter((t): t is string => Boolean(t))
    )
  )
).sort();

const FALLBACK_CONFIRMATION = "Carry that reasoning forward to the next scenario that looks like this one.";
const OLD_META_PROMPT = "Which statement is accurate?";

describe("repair-coverage audit — every actually-used repair target", () => {
  it("exactly 10 repair targets are actually used across production content (matches the Phase 10B-1 audit)", () => {
    expect(ALL_USED_REPAIR_TARGETS).toHaveLength(10);
  });

  it("every dedicated static-content target (8 of 10) returns its own specific content, never the generic fallback", () => {
    const cases: [string, string, "a" | "b" | "c" | "d"][] = [
      ["repair.authority-error", "question.d1.0002", "b"],
      ["repair.role-error", "question.d1.0002", "c"],
      ["repair.business-context-error", "question.d1.0016", "b"],
      ["repair.decision-error", "question.d1.0026", "d"],
      ["repair.lifecycle-error", "question.d2.0005", "c"],
      ["repair.qualifier-error", "question.foundation.0001", "b"],
      ["repair.sequence-error", "question.d2.0005", "b"],
      ["repair.technical-vs-management-error", "question.d1.0029", "d"]
    ];
    for (const [target, questionId, wrongKey] of cases) {
      const feedback = feedbackFor(questionId, wrongKey);
      expect(feedback.repairTargetId, `${questionId}/${wrongKey} must trigger ${target}`).toBe(target);
      const check = productionContentSource.getRepairCheck(feedback);
      expect(check.confirmation, `${target} must not fall back to the generic confirmation`).not.toBe(FALLBACK_CONFIRMATION);
      expect(check.options.length).toBeGreaterThanOrEqual(2);
      expect(check.options.some((o) => o.correct)).toBe(true);
    }
  });

  it("repair.knowledge-gap and repair.vocabulary-error no longer ask the old meta 'does this need review' question", () => {
    const knowledgeGapFeedback = feedbackFor("question.d1.0006", "c");
    const vocabFeedback = feedbackFor("question.d1.0005", "b");
    const knowledgeGapCheck = productionContentSource.getRepairCheck(knowledgeGapFeedback);
    const vocabCheck = productionContentSource.getRepairCheck(vocabFeedback);

    expect(knowledgeGapCheck.prompt).not.toBe(OLD_META_PROMPT);
    expect(vocabCheck.prompt).not.toBe(OLD_META_PROMPT);
    expect(knowledgeGapCheck.confirmation).not.toBe(FALLBACK_CONFIRMATION);
    expect(vocabCheck.confirmation).not.toBe(FALLBACK_CONFIRMATION);
  });

  it("the applied-concept repair check performs NEAR TRANSFER: it draws from a DIFFERENT sibling variant in the same family, not the missed question itself", () => {
    const raw = requireProductionQuestion("question.d1.0005");
    const resolved = resolveQuestion(raw);
    const feedback = resolveFeedback(raw, resolved, "b");
    const check = productionContentSource.getRepairCheck(feedback);

    const originalOptionTexts = raw.options.map((o) => o.text);
    const checkTexts = check.options.map((o) => o.text);

    // Per the Founder's "too obvious / answer recognition, not reapplication"
    // finding: the check must NOT reuse ANY of the original question's own
    // option text (neither the correct one nor any wrong one) — it must be
    // a genuinely different concrete scenario testing the same distinction.
    for (const text of checkTexts) {
      expect(originalOptionTexts, `check text "${text}" must not come from the original missed question`).not.toContain(text);
    }
    // Exactly one of the two check options is correct.
    expect(check.options.filter((o) => o.correct)).toHaveLength(1);
  });

  it("the near-transfer source is a real sibling variant from the same family (question.d1.0006 for the Governance-vs-Management example)", () => {
    const feedback = feedbackFor("question.d1.0005", "b");
    const check = productionContentSource.getRepairCheck(feedback);
    const sibling = requireProductionQuestion("question.d1.0006");
    const siblingTexts = sibling.options.map((o) => o.text);
    for (const option of check.options) {
      expect(siblingTexts, `check option "${option.text}" should come from a real sibling variant`).toContain(option.text);
    }
  });

  it("prefers a sibling variant whose options do not literally name the concept or a canonical role (anti-giveaway heuristic)", () => {
    // question.d1.0007's correct option literally contains the word
    // "governance," and question.d1.0005 (excluded as the missed question
    // anyway) names "Board" directly — question.d1.0006 is the one sibling
    // whose options describe pure activities ("approving objectives and
    // budget" / "assigning staff to projects") with no such giveaway.
    const feedback = feedbackFor("question.d1.0005", "b");
    const check = productionContentSource.getRepairCheck(feedback);
    for (const option of check.options) {
      expect(option.text.toLowerCase()).not.toMatch(/governance|management|\bboard\b/);
    }
  });

  it("the repair check names a perspective/lens (the concept being tested) without a new taxonomy", () => {
    const feedback = feedbackFor("question.d1.0005", "b");
    const check = productionContentSource.getRepairCheck(feedback);
    expect(check.prompt).toMatch(/Perspective:/);
    expect(check.prompt).toMatch(/Governance vs\. management/i);
  });

  it("the confirmation is the family's own invariant_reasoning (a real, general 'what to notice next time' principle)", () => {
    const feedback = feedbackFor("question.d1.0005", "b");
    const check = productionContentSource.getRepairCheck(feedback);
    expect(check.confirmation).toMatch(/governance|management|direction|accountability/i);
  });

  // Architect-approved wording correction (Phase 10B-1 closeout): the
  // Governance-vs-Management confirmation previously read "...is ALWAYS the
  // option that sets direction... — NEVER the option that merely
  // executes...". That phrasing teaches an absolute answer-selection
  // shortcut ("when you see X, always choose Y") rather than the underlying
  // reasoning criterion. Fixed at its actual source — this family's own
  // `invariant_reasoning` in content/production/families.json — not in
  // Repair-presentation code, and not applied to any other family's
  // existing, separately-approved "always/never" phrasing (see
  // PHASE-10B1-GATE-RECORD.md's investigation of that curriculum-wide
  // convention). This test guards only this one family's confirmation.
  it("the Governance-vs-Management confirmation states its reasoning criterion without an absolute 'always/never' answer-selection shortcut", () => {
    const feedback = feedbackFor("question.d1.0005", "b");
    const check = productionContentSource.getRepairCheck(feedback);
    expect(check.confirmation).not.toMatch(/\balways\b/i);
    expect(check.confirmation).not.toMatch(/\bnever\b/i);
    expect(check.confirmation).toMatch(/sets direction|accepts accountability|ongoing oversight/i);
  });

  it("the same repair target produces DIFFERENT, lesson-grounded content for two different concepts (Domain 1 vs. Domain 2)", () => {
    const d1KnowledgeGap = productionContentSource.getRepairCheck(feedbackFor("question.d1.0006", "c"));
    const d2KnowledgeGap = productionContentSource.getRepairCheck(feedbackFor("question.d2.0002", "b"));
    expect(d1KnowledgeGap.confirmation).not.toBe(d2KnowledgeGap.confirmation);
    expect(d1KnowledgeGap.options.map((o) => o.text)).not.toEqual(d2KnowledgeGap.options.map((o) => o.text));

    const d1Vocab = productionContentSource.getRepairCheck(feedbackFor("question.d1.0005", "b"));
    const d2Vocab = productionContentSource.getRepairCheck(feedbackFor("question.d2.0015", "c"));
    expect(d1Vocab.confirmation).not.toBe(d2Vocab.confirmation);
  });

  it("a learner cannot pass the applied-concept check merely by recognizing a generic 'review is useful' statement — both options are concrete scenario content", () => {
    const feedback = feedbackFor("question.d1.0005", "b");
    const check = productionContentSource.getRepairCheck(feedback);
    for (const option of check.options) {
      expect(option.text.toLowerCase()).not.toMatch(/second look|worth pausing|fine to move on|need.*review/);
    }
  });

  it("EVERY actual production usage of repair.knowledge-gap/repair.vocabulary-error safely produces a non-fallback, single-correct-option applied check", () => {
    type RawOption = { key: "a" | "b" | "c" | "d"; correct: boolean; repair_target?: string };
    type RawQuestion = { id: string; options: RawOption[] };
    const questions = productionQuestions as RawQuestion[];
    const failures: string[] = [];

    for (const q of questions) {
      for (const option of q.options) {
        if (option.repair_target !== "repair.knowledge-gap" && option.repair_target !== "repair.vocabulary-error") continue;
        const feedback = feedbackFor(q.id, option.key);
        const check = productionContentSource.getRepairCheck(feedback);
        if (check.confirmation === FALLBACK_CONFIRMATION) failures.push(`${q.id}/${option.key} fell back to generic confirmation`);
        if (check.options.filter((o) => o.correct).length !== 1) failures.push(`${q.id}/${option.key} did not produce exactly one correct check option`);
        if (check.options.length < 2) failures.push(`${q.id}/${option.key} produced fewer than 2 check options`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("an unrecognized repair target still safely falls back to the generic repair (regression safety net preserved)", () => {
    const feedback = feedbackFor("question.d1.0005", "b");
    const check = productionContentSource.getRepairCheck({ ...feedback, repairTargetId: "repair.some-future-target-not-yet-authored" });
    expect(check.confirmation).toBe(FALLBACK_CONFIRMATION);
  });

  it("no repairTargetId still returns the generic fallback (a correct answer never needs repair content)", () => {
    const feedback = feedbackFor("question.d1.0005", "b");
    const check = productionContentSource.getRepairCheck({ ...feedback, repairTargetId: undefined });
    expect(check.confirmation).toBe(FALLBACK_CONFIRMATION);
  });
});
