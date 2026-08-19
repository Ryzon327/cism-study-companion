import { describe, it, expect } from "vitest";
import { resolveLesson, resolveQuestion, resolveFeedback, recallPoolFor, requireProductionLesson, requireProductionQuestion } from "../../../app/src/content/resolve";
import { productionContentSource } from "../../../app/src/content/productionContentSource";

const TODAYS_LESSON_ID = "lesson.d1.authority-follows-accountability";
const PREREQ_LESSON_ID = "lesson.foundation.ask-qualifier";

describe("production content resolver", () => {
  it("resolves the Domain 1 lesson with real registry-backed display values, not raw ids", () => {
    const lesson = resolveLesson(TODAYS_LESSON_ID);
    expect(lesson.domainLabel).toBe("Governance");
    expect(lesson.pattern?.displayName).toBe("Authority Follows Accountability");
    expect(lesson.pattern?.id).toBe("pattern.p02");
  });

  it("resolves the Foundation lesson with no pattern (it has none) without crashing", () => {
    const lesson = resolveLesson(PREREQ_LESSON_ID);
    expect(lesson.domainLabel).toBe("Foundation");
    expect(lesson.pattern).toBeUndefined();
  });

  it("resolves a question's options exactly as authored, key-addressed not index-addressed", () => {
    const raw = requireProductionQuestion("question.d1.0002");
    const resolved = resolveQuestion(raw);
    expect(resolved.options).toHaveLength(4);
    expect(resolved.options.find((o) => o.key === "a")?.correct).toBe(true);
  });

  it("feedback corresponds to the actual selected option — invariant 30", () => {
    const question = requireProductionQuestion("question.d1.0002");

    const correctFeedback = resolveFeedback(question, "a");
    expect(correctFeedback.correct).toBe(true);
    expect(correctFeedback.selectedKey).toBe("a");
    expect(correctFeedback.repairTargetId).toBeUndefined();

    const wrongFeedback = resolveFeedback(question, "c");
    expect(wrongFeedback.correct).toBe(false);
    expect(wrongFeedback.selectedKey).toBe("c");
    expect(wrongFeedback.whySelectedWasWeaker).toContain("Internal Audit");
    expect(wrongFeedback.repairTargetId).toBe("repair.role-error");
  });

  it("different wrong options trigger different repair targets — invariant 31 (repair corresponds to the actual reasoning error)", () => {
    const question = requireProductionQuestion("question.d1.0002");
    expect(resolveFeedback(question, "b").repairTargetId).toBe("repair.authority-error");
    expect(resolveFeedback(question, "c").repairTargetId).toBe("repair.role-error");
    expect(resolveFeedback(question, "d").repairTargetId).toBe("repair.authority-error");
  });

  it("the repair content source returns different micro-questions for different repair targets", () => {
    const authorityRepair = productionContentSource.getRepairCheck("repair.authority-error");
    const roleRepair = productionContentSource.getRepairCheck("repair.role-error");
    expect(authorityRepair.prompt).not.toBe(undefined);
    expect(authorityRepair.confirmation).not.toBe(roleRepair.confirmation);
  });

  it("recall-eligibility: today's lesson's recall pool comes only from its prerequisite, never its own question", () => {
    const pool = recallPoolFor(TODAYS_LESSON_ID);
    expect(pool.length).toBeGreaterThan(0);
    const todaysLesson = requireProductionLesson(TODAYS_LESSON_ID);
    for (const q of pool) {
      expect(todaysLesson.retrieval_refs).not.toContain(q.id);
    }
    // and it must come from the prerequisite lesson specifically
    const prereqLesson = requireProductionLesson(PREREQ_LESSON_ID);
    expect(pool.map((q) => q.id)).toEqual(prereqLesson.retrieval_refs);
  });
});

describe("productionContentSource — invariant 32 (a production session can complete successfully)", () => {
  it("walks Recall -> Learn -> Apply -> Feedback -> Repair -> Completion without throwing, for both outcomes", () => {
    expect(() => productionContentSource.getRecall()).not.toThrow();
    expect(() => productionContentSource.getLesson()).not.toThrow();
    const { question } = productionContentSource.getApplyQuestion();
    const correctKey = question.options.find((o) => o.correct)!.key;
    const wrongKey = question.options.find((o) => !o.correct)!.key;

    const correctFeedback = productionContentSource.buildFeedback(correctKey);
    expect(correctFeedback.correct).toBe(true);

    const wrongFeedback = productionContentSource.buildFeedback(wrongKey);
    expect(wrongFeedback.correct).toBe(false);
    expect(() => productionContentSource.getRepairCheck(wrongFeedback.repairTargetId)).not.toThrow();

    const { summary, domainPosition } = productionContentSource.getCompletion();
    expect(summary.coveredItems.length).toBeGreaterThan(0);
    expect(domainPosition.length).toBeGreaterThan(0);
  });
});
