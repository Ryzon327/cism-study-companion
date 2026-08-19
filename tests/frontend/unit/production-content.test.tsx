import { describe, it, expect, beforeEach } from "vitest";
import {
  resolveLesson,
  resolveQuestion,
  resolveFeedback,
  recallFamilyIdsFor,
  anchorFamilyIdFor,
  familyVariantsFor,
  selectFamilyVariant,
  requireProductionLesson,
  requireProductionQuestion
} from "../../../app/src/content/resolve";
import { emptyHistory, recordExposure } from "../../../app/src/content/selection";
import { productionContentSource } from "../../../app/src/content/productionContentSource";
import { resetExposureHistoryForTests } from "../../../app/src/content/exposureStore";

const TODAYS_LESSON_ID = "lesson.d1.authority-follows-accountability";
const PREREQ_LESSON_ID = "lesson.foundation.ask-qualifier";
const D1_FAMILY_ID = "family.d1.authority-accountability-decision";
const FOUNDATION_FAMILY_ID = "family.foundation.qualifier-recognition";

beforeEach(() => {
  resetExposureHistoryForTests();
});

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
});

describe("QuestionFamily resolution (Phase 6C)", () => {
  it("familyVariantsFor returns exactly the 3 authored variants per family", () => {
    expect(familyVariantsFor(D1_FAMILY_ID).map((q) => q.id).sort()).toEqual([
      "question.d1.0002",
      "question.d1.0003",
      "question.d1.0004"
    ]);
    expect(familyVariantsFor(FOUNDATION_FAMILY_ID).map((q) => q.id).sort()).toEqual([
      "question.foundation.0001",
      "question.foundation.0002",
      "question.foundation.0003"
    ]);
  });

  it("anchorFamilyIdFor resolves today's lesson to its authority-accountability family", () => {
    expect(anchorFamilyIdFor(TODAYS_LESSON_ID)).toBe(D1_FAMILY_ID);
  });

  it("recall-eligibility: today's lesson's recall-eligible family is exactly its prerequisite's family, never its own", () => {
    const familyIds = recallFamilyIdsFor(TODAYS_LESSON_ID);
    expect(familyIds).toEqual([FOUNDATION_FAMILY_ID]);
    expect(familyIds).not.toContain(D1_FAMILY_ID);
  });

  it("selectFamilyVariant rotates through unseen variants before repeating, given a shared history", () => {
    let history = emptyHistory();
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      const q = selectFamilyVariant(D1_FAMILY_ID, history, 1000 + i);
      expect(seen).not.toContain(q.id);
      seen.push(q.id);
      history = recordExposure(history, q.id, 1000 + i);
    }
    expect(seen.sort()).toEqual(["question.d1.0002", "question.d1.0003", "question.d1.0004"]);
  });
});

describe("productionContentSource — variant rotation across repeated sessions (invariant 32 + the founder's repeated-question finding)", () => {
  it("Apply shows a different Domain 1 variant on each of three consecutive sessions, then may repeat on the fourth", () => {
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      const { question } = productionContentSource.getApplyQuestion();
      expect(seen).not.toContain(question.id);
      seen.push(question.id);
    }
    expect(seen.sort()).toEqual(["question.d1.0002", "question.d1.0003", "question.d1.0004"]);

    // Pool exhausted — the 4th session is allowed to repeat (never "never repeat").
    const fourth = productionContentSource.getApplyQuestion();
    expect(seen).toContain(fourth.question.id);
  });

  it("Recall shows a different Foundation variant on each of three consecutive sessions", () => {
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      const recall = productionContentSource.getRecall();
      // RecallCheckFixture doesn't carry an id, so identify the variant by its unique prompt text instead.
      expect(seen).not.toContain(recall.prompt);
      seen.push(recall.prompt);
    }
    expect(seen).toHaveLength(3);
  });

  it("feedback always matches the variant actually shown by getApplyQuestion, even after rotation", () => {
    const { question } = productionContentSource.getApplyQuestion();
    const correctKey = question.options.find((o) => o.correct)!.key;
    const feedback = productionContentSource.buildFeedback(question, correctKey);
    expect(feedback.question.id).toBe(question.id);
    expect(feedback.correct).toBe(true);
  });
});

describe("productionContentSource — invariant 32 (a production session can complete successfully)", () => {
  it("walks Recall -> Learn -> Apply -> Feedback -> Repair -> Completion without throwing, for both outcomes", () => {
    expect(() => productionContentSource.getRecall()).not.toThrow();
    expect(() => productionContentSource.getLesson()).not.toThrow();
    const { question } = productionContentSource.getApplyQuestion();
    const correctKey = question.options.find((o) => o.correct)!.key;
    const wrongKey = question.options.find((o) => !o.correct)!.key;

    const correctFeedback = productionContentSource.buildFeedback(question, correctKey);
    expect(correctFeedback.correct).toBe(true);

    const wrongFeedback = productionContentSource.buildFeedback(question, wrongKey);
    expect(wrongFeedback.correct).toBe(false);
    expect(() => productionContentSource.getRepairCheck(wrongFeedback.repairTargetId)).not.toThrow();

    const { summary, domainPosition } = productionContentSource.getCompletion();
    expect(summary.coveredItems.length).toBeGreaterThan(0);
    expect(domainPosition.length).toBeGreaterThan(0);
  });
});

describe("no future-domain leakage / taught-before-tested still holds with families", () => {
  it("requireProductionLesson resolves both slice lessons without error", () => {
    expect(() => requireProductionLesson(TODAYS_LESSON_ID)).not.toThrow();
    expect(() => requireProductionLesson(PREREQ_LESSON_ID)).not.toThrow();
  });
});
