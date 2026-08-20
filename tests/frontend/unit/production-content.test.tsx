import { describe, it, expect, beforeEach, afterEach } from "vitest";
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
import {
  productionContentSource,
  setTodaysLessonIdForReview,
  getTodaysLessonIdForReview
} from "../../../app/src/content/productionContentSource";
import { resetExposureHistoryForTests } from "../../../app/src/content/exposureStore";

const TODAYS_LESSON_ID = "lesson.d1.authority-follows-accountability";
const PREREQ_LESSON_ID = "lesson.foundation.ask-qualifier";
const D1_FAMILY_ID = "family.d1.authority-accountability-decision";
const FOUNDATION_FAMILY_ID = "family.foundation.qualifier-recognition";
// Phase 7B-1
const U1_LESSON_ID = "lesson.d1.governance-vs-management";
const U3_LESSON_ID = "lesson.d1.governance-layer-authority";
const U4_LESSON_ID = "lesson.d1.data-ownership-accountability";
const U1_FAMILY_ID = "family.d1.governance-vs-management";
const U3_FAMILY_ID = "family.d1.governance-layer-authority";
const U4_FAMILY_ID = "family.d1.data-ownership-accountability";

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

  it("recall-eligibility: today's lesson's (U2) recall-eligible families are exactly its two prerequisites' families (U1 and Foundation), never its own", () => {
    const familyIds = recallFamilyIdsFor(TODAYS_LESSON_ID);
    expect(familyIds.sort()).toEqual([FOUNDATION_FAMILY_ID, U1_FAMILY_ID].sort());
    expect(familyIds).not.toContain(D1_FAMILY_ID);
  });

  it("Recall selects U1's family first for U2, per the approved 'U2: recall U1' progression — not Foundation's", () => {
    expect(recallFamilyIdsFor(TODAYS_LESSON_ID)[0]).toBe(U1_FAMILY_ID);
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

describe("Phase 7B-1 — Domain 1 governance/authority slice (U1 -> U2 -> U3 -> U4)", () => {
  it("resolves all four lessons in the sequence without error", () => {
    expect(() => resolveLesson(U1_LESSON_ID)).not.toThrow();
    expect(() => resolveLesson(TODAYS_LESSON_ID)).not.toThrow();
    expect(() => resolveLesson(U3_LESSON_ID)).not.toThrow();
    expect(() => resolveLesson(U4_LESSON_ID)).not.toThrow();
  });

  it("each new family has its approved variant count: U1=3, U3=4, U4=4", () => {
    expect(familyVariantsFor(U1_FAMILY_ID)).toHaveLength(3);
    expect(familyVariantsFor(U3_FAMILY_ID)).toHaveLength(4);
    expect(familyVariantsFor(U4_FAMILY_ID)).toHaveLength(4);
  });

  it("each lesson's anchor family is its own unit's family, not an earlier or later one", () => {
    expect(anchorFamilyIdFor(U1_LESSON_ID)).toBe(U1_FAMILY_ID);
    expect(anchorFamilyIdFor(TODAYS_LESSON_ID)).toBe(D1_FAMILY_ID);
    expect(anchorFamilyIdFor(U3_LESSON_ID)).toBe(U3_FAMILY_ID);
    expect(anchorFamilyIdFor(U4_LESSON_ID)).toBe(U4_FAMILY_ID);
  });

  it("cumulative recall grows through the chain: U3 reaches U2 and (via traversal) U1; U4 reaches U3 and everything before it", () => {
    const u3Recall = recallFamilyIdsFor(U3_LESSON_ID);
    expect(u3Recall[0]).toBe(D1_FAMILY_ID);
    expect(u3Recall).toContain(U1_FAMILY_ID);
    expect(u3Recall).toContain(FOUNDATION_FAMILY_ID);
    expect(u3Recall).not.toContain(U3_FAMILY_ID);

    const u4Recall = recallFamilyIdsFor(U4_LESSON_ID);
    expect(u4Recall[0]).toBe(U3_FAMILY_ID);
    expect(u4Recall).toContain(D1_FAMILY_ID);
    expect(u4Recall).toContain(U1_FAMILY_ID);
    expect(u4Recall).toContain(FOUNDATION_FAMILY_ID);
    expect(u4Recall).not.toContain(U4_FAMILY_ID);
  });

  it("Apply rotates through all 4 unseen U3 variants before repeating (deliberately above the 3-variant floor)", () => {
    const seen = new Set<string>();
    let history = emptyHistory();
    for (let i = 0; i < 4; i++) {
      const q = selectFamilyVariant(U3_FAMILY_ID, history, 2000 + i);
      expect(seen.has(q.id)).toBe(false);
      seen.add(q.id);
      history = recordExposure(history, q.id, 2000 + i);
    }
    expect(seen.size).toBe(4);
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

describe("Phase 7B-1 QA review tooling — setTodaysLessonIdForReview", () => {
  const originalLessonId = getTodaysLessonIdForReview();

  afterEach(() => {
    setTodaysLessonIdForReview(originalLessonId);
  });

  it("defaults to lesson.d1.authority-follows-accountability (U2) — unchanged real-session behavior", () => {
    expect(originalLessonId).toBe(TODAYS_LESSON_ID);
  });

  it("lets a QA reviewer preview each of U1/U2/U3/U4 as today's lesson, reflected immediately in getLesson/getApplyQuestion", () => {
    setTodaysLessonIdForReview(U1_LESSON_ID);
    expect(getTodaysLessonIdForReview()).toBe(U1_LESSON_ID);
    expect(productionContentSource.getLesson().conceptTitle).toBeTruthy();
    expect(productionContentSource.getApplyQuestion().question.id).toMatch(/^question\.d1\.000[5-7]$/);

    setTodaysLessonIdForReview(U3_LESSON_ID);
    expect(productionContentSource.getApplyQuestion().question.id).toMatch(/^question\.d1\.00(08|09|10|11)$/);

    setTodaysLessonIdForReview(U4_LESSON_ID);
    expect(productionContentSource.getApplyQuestion().question.id).toMatch(/^question\.d1\.00(12|13|14|15)$/);
  });
});
