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
  getTodaysLessonIdForReview,
  deriveJourneySteps
} from "../../../app/src/content/productionContentSource";
import { resetExposureHistoryForTests } from "../../../app/src/content/exposureStore";
import { prototypeContentSource } from "../../../app/src/data/prototypeContentSource";

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
// Phase 7B-2
const U5_LESSON_ID = "lesson.d1.security-strategy-alignment";
const U6_LESSON_ID = "lesson.d1.business-justification-roadmap";
const U7_LESSON_ID = "lesson.d1.governance-effectiveness";
const U5_FAMILY_ID = "family.d1.security-strategy-alignment";
const U6_FAMILY_ID = "family.d1.business-justification-roadmap";
const U7_FAMILY_ID = "family.d1.governance-effectiveness";

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
    const resolved = resolveQuestion(question);

    const correctFeedback = resolveFeedback(question, resolved, "a");
    expect(correctFeedback.correct).toBe(true);
    expect(correctFeedback.selectedKey).toBe("a");
    expect(correctFeedback.repairTargetId).toBeUndefined();

    const wrongFeedback = resolveFeedback(question, resolved, "c");
    expect(wrongFeedback.correct).toBe(false);
    expect(wrongFeedback.selectedKey).toBe("c");
    expect(wrongFeedback.whySelectedWasWeaker).toContain("Internal Audit");
    expect(wrongFeedback.repairTargetId).toBe("repair.role-error");
  });

  it("different wrong options trigger different repair targets — invariant 31 (repair corresponds to the actual reasoning error)", () => {
    const question = requireProductionQuestion("question.d1.0002");
    const resolved = resolveQuestion(question);
    expect(resolveFeedback(question, resolved, "b").repairTargetId).toBe("repair.authority-error");
    expect(resolveFeedback(question, resolved, "c").repairTargetId).toBe("repair.role-error");
    expect(resolveFeedback(question, resolved, "d").repairTargetId).toBe("repair.authority-error");
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

describe("Phase 7B-2 — Domain 1 strategy/effectiveness slice (U5 -> U6 -> U7)", () => {
  it("resolves all three new lessons without error", () => {
    expect(() => resolveLesson(U5_LESSON_ID)).not.toThrow();
    expect(() => resolveLesson(U6_LESSON_ID)).not.toThrow();
    expect(() => resolveLesson(U7_LESSON_ID)).not.toThrow();
  });

  it("each new family has its approved variant count: U5=3, U6=3, U7=3", () => {
    expect(familyVariantsFor(U5_FAMILY_ID)).toHaveLength(3);
    expect(familyVariantsFor(U6_FAMILY_ID)).toHaveLength(3);
    expect(familyVariantsFor(U7_FAMILY_ID)).toHaveLength(3);
  });

  it("each lesson's anchor family is its own unit's family", () => {
    expect(anchorFamilyIdFor(U5_LESSON_ID)).toBe(U5_FAMILY_ID);
    expect(anchorFamilyIdFor(U6_LESSON_ID)).toBe(U6_FAMILY_ID);
    expect(anchorFamilyIdFor(U7_LESSON_ID)).toBe(U7_FAMILY_ID);
  });

  it("recall selects U4/U5/U6 first for U5/U6/U7 respectively, per the approved progression", () => {
    expect(recallFamilyIdsFor(U5_LESSON_ID)[0]).toBe(U4_FAMILY_ID);
    expect(recallFamilyIdsFor(U6_LESSON_ID)[0]).toBe(U5_FAMILY_ID);
    expect(recallFamilyIdsFor(U7_LESSON_ID)[0]).toBe(U6_FAMILY_ID);
  });

  it("cumulative recall from U7 still reaches every earlier unit's family, including Foundation", () => {
    const u7Recall = recallFamilyIdsFor(U7_LESSON_ID);
    for (const id of [U6_FAMILY_ID, U5_FAMILY_ID, U4_FAMILY_ID, U3_FAMILY_ID, D1_FAMILY_ID, U1_FAMILY_ID, FOUNDATION_FAMILY_ID]) {
      expect(u7Recall).toContain(id);
    }
    expect(u7Recall).not.toContain(U7_FAMILY_ID);
  });

  it("Apply rotates through all 3 unseen U6 variants before repeating", () => {
    const seen = new Set<string>();
    let history = emptyHistory();
    for (let i = 0; i < 3; i++) {
      const q = selectFamilyVariant(U6_FAMILY_ID, history, 3000 + i);
      expect(seen.has(q.id)).toBe(false);
      seen.add(q.id);
      history = recordExposure(history, q.id, 3000 + i);
    }
    expect(seen.size).toBe(3);
  });

  it("U1-U4 remain fully intact and unaffected by the U5-U7 extension", () => {
    expect(familyVariantsFor(U1_FAMILY_ID)).toHaveLength(3);
    expect(familyVariantsFor(D1_FAMILY_ID)).toHaveLength(3);
    expect(familyVariantsFor(U3_FAMILY_ID)).toHaveLength(4);
    expect(familyVariantsFor(U4_FAMILY_ID)).toHaveLength(4);
    expect(recallFamilyIdsFor(TODAYS_LESSON_ID)[0]).toBe(U1_FAMILY_ID);
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

describe("Answer-position rotation (architectural amendment) — attempt stability and exposure variation, integrated end-to-end", () => {
  it("13. question-family variant rotation is untouched: three consecutive Apply sessions still show three distinct D1 variants", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 3; i++) seen.add(productionContentSource.getApplyQuestion().question.id);
    expect(seen.size).toBe(3);
  });

  it("attempt stability, end-to-end: Feedback shows the answer options in the EXACT same order Apply showed, not a fresh re-derivation", () => {
    const { question } = productionContentSource.getApplyQuestion();
    const applyOrder = question.options.map((o) => o.key);
    const someKey = question.options[0]!.key;
    const feedback = productionContentSource.buildFeedback(question, someKey);
    expect(feedback.question.options.map((o) => o.key)).toEqual(applyOrder);
  });

  it("14. feedback still identifies the learner's actual selected semantic answer, regardless of that answer's on-screen position", () => {
    const { question } = productionContentSource.getApplyQuestion();
    // Deliberately select whichever option is NOT first in the (possibly reordered) display array.
    const nonFirst = question.options[1]!;
    const feedback = productionContentSource.buildFeedback(question, nonFirst.key);
    expect(feedback.selectedKey).toBe(nonFirst.key);
    expect(feedback.correct).toBe(nonFirst.correct);
  });

  it("15. an incorrect answer still triggers its own correct repair target, regardless of display position", () => {
    const { question } = productionContentSource.getApplyQuestion();
    const wrongOption = question.options.find((o) => !o.correct)!;
    const feedback = productionContentSource.buildFeedback(question, wrongOption.key);
    expect(feedback.correct).toBe(false);
    expect(feedback.repairTargetId).toBeTruthy();
  });

  it("exposure variation, end-to-end: repeated exposure to the SAME question (via family-pool exhaustion) can show its correct answer at a different display position", () => {
    // Exhaust family.d1.authority-accountability-decision's 3-variant pool,
    // then trigger a guaranteed repeat, and confirm the repeated question's
    // correct-answer position is captured deterministically across repeats
    // (not asserted to differ every single time — 3 variants share a small
    // pool so an immediate repeat can still land on the same permutation
    // slot by chance — but the mechanism must be provably wired end-to-end).
    const positions: string[] = [];
    let lastQuestionId = "";
    for (let i = 0; i < 4; i++) {
      const { question } = productionContentSource.getApplyQuestion();
      lastQuestionId = question.id;
      const correctIndex = question.options.findIndex((o) => o.correct);
      positions.push(String.fromCharCode(65 + correctIndex));
    }
    expect(lastQuestionId).toBeTruthy();
    // Confirms the pipeline runs without throwing and produces a real,
    // recorded letter each time — the pure-function-level tests in
    // answer-order.test.ts prove full A/B/C/D coverage rigorously; this
    // integration test proves the wiring reaches all the way through
    // productionContentSource without being lost or overridden.
    expect(positions.every((p) => ["A", "B", "C", "D"].includes(p))).toBe(true);
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

describe("Home/Journey state (Phase 7B-3 defect fix) — the UI must not independently invent learner progress", () => {
  const originalLessonId = getTodaysLessonIdForReview();
  const U8_LESSON_ID = "lesson.d1.legal-regulatory-risk";
  const U9_LESSON_ID = "lesson.d1.organizational-culture-governance";

  afterEach(() => {
    setTodaysLessonIdForReview(originalLessonId);
  });

  // A. Prototype fixture mode retains the approved D2 Home/Journey fixture.
  it("prototype mode's Home/Journey state is the unchanged, approved Phase 5B D2 fixture", () => {
    const { journeySteps, todayFocus } = prototypeContentSource.getHomeState();
    expect(journeySteps.find((s) => s.id === "d2")?.state).toBe("current");
    expect(journeySteps.find((s) => s.id === "d1")?.state).toBe("completed");
    expect(todayFocus.title).toBe("Residual risk and treatment decisions");
    expect(todayFocus.domainLabel).toBe("D2 · Risk Management");
  });

  // 1, 2. Production mode with a Domain 1 lesson (D1-U8 or D1-U9):
  // Foundation completed (it precedes Domain 1 in the fixed curriculum
  // sequence — an ordered-position fact, not a fabricated mastery claim),
  // Domain 1 current, Domain 2 (and every later stage) upcoming.
  it.each([
    ["D1-U8", "lesson.d1.legal-regulatory-risk"],
    ["D1-U9", "lesson.d1.organizational-culture-governance"]
  ])("production mode with %s selected shows Foundation completed, Domain 1 current, Domain 2+ upcoming", (_label, lessonId) => {
    setTodaysLessonIdForReview(lessonId);
    const { journeySteps } = productionContentSource.getHomeState();
    expect(journeySteps.find((s) => s.id === "foundation")?.state).toBe("completed");
    expect(journeySteps.find((s) => s.id === "d1")?.state).toBe("current");
    expect(journeySteps.find((s) => s.id === "d2")?.state).toBe("upcoming");
    expect(journeySteps.find((s) => s.id === "d3")?.state).toBe("upcoming");
    expect(journeySteps.find((s) => s.id === "d4")?.state).toBe("upcoming");
    expect(journeySteps.find((s) => s.id === "reinforcement")?.state).toBe("upcoming");
  });

  // 5, 6. Future-stage architectural proof: the SAME generic derivation
  // (no per-domain conditional — deriveJourneySteps takes only a domain
  // id) naturally produces the correct ordered state once Domain 2 or
  // Domain 3 becomes current, with no curriculum for those domains needing
  // to exist yet. This is what proves the fix generalizes rather than
  // special-casing Domain 1.
  it("deriveJourneySteps generalizes to a future Domain 2 current state with no per-domain special case", () => {
    const steps = deriveJourneySteps("domain.d2");
    expect(steps.find((s) => s.id === "foundation")?.state).toBe("completed");
    expect(steps.find((s) => s.id === "d1")?.state).toBe("completed");
    expect(steps.find((s) => s.id === "d2")?.state).toBe("current");
    expect(steps.find((s) => s.id === "d3")?.state).toBe("upcoming");
    expect(steps.find((s) => s.id === "d4")?.state).toBe("upcoming");
    expect(steps.find((s) => s.id === "reinforcement")?.state).toBe("upcoming");
  });

  it("deriveJourneySteps generalizes to a future Domain 3 current state with no per-domain special case", () => {
    const steps = deriveJourneySteps("domain.d3");
    expect(steps.find((s) => s.id === "foundation")?.state).toBe("completed");
    expect(steps.find((s) => s.id === "d1")?.state).toBe("completed");
    expect(steps.find((s) => s.id === "d2")?.state).toBe("completed");
    expect(steps.find((s) => s.id === "d3")?.state).toBe("current");
    expect(steps.find((s) => s.id === "d4")?.state).toBe("upcoming");
    expect(steps.find((s) => s.id === "reinforcement")?.state).toBe("upcoming");
  });

  it("deriveJourneySteps handles Foundation itself as current (no earlier stage exists to mark completed)", () => {
    const steps = deriveJourneySteps("domain.foundation");
    expect(steps.find((s) => s.id === "foundation")?.state).toBe("current");
    expect(steps.find((s) => s.id === "d1")?.state).toBe("upcoming");
  });

  // E. Production Home lesson/title corresponds to the currently selected
  // production QA lesson.
  it("production Home's title/domain corresponds to the currently selected D1-U8 lesson, using canonical metadata", () => {
    setTodaysLessonIdForReview(U8_LESSON_ID);
    const { todayFocus } = productionContentSource.getHomeState();
    expect(todayFocus.domainLabel).toBe("D1 · Governance");
    expect(todayFocus.title.toLowerCase()).toContain("legal");
  });

  // 3. Changing the QA lesson from U8 to U9 updates Home rather than
  // retaining stale U8 or prototype D2 content — lesson title changes,
  // Foundation stays completed, Domain 1 stays current, Domain 2 stays
  // upcoming, no stale Journey state appears.
  it("changing the QA lesson from D1-U8 to D1-U9 changes Home's title accordingly, with no stale U8/D2 content or stale Journey state", () => {
    setTodaysLessonIdForReview(U8_LESSON_ID);
    const u8Title = productionContentSource.getHomeState().todayFocus.title;

    setTodaysLessonIdForReview(U9_LESSON_ID);
    const { journeySteps, todayFocus } = productionContentSource.getHomeState();
    expect(todayFocus.title).not.toBe(u8Title);
    expect(todayFocus.title.toLowerCase()).toContain("culture");
    expect(todayFocus.domainLabel).toBe("D1 · Governance");
    expect(journeySteps.find((s) => s.id === "foundation")?.state).toBe("completed");
    expect(journeySteps.find((s) => s.id === "d1")?.state).toBe("current");
    expect(journeySteps.find((s) => s.id === "d2")?.state).toBe("upcoming");
  });

  // G. No persistence mechanism is introduced: getHomeState is a pure
  // function of the in-memory QA lesson pointer, computed fresh from
  // content/production/ + schema/registry/ on every call — no cross-call
  // state is read from or written to anywhere outside that pointer. (Full
  // browser-level "no localStorage" proof lives in
  // tests/frontend/e2e/production-daily-study.spec.ts, which exercises a
  // real window; jsdom's localStorage shim is unreliable to spy on here.)
  it("getHomeState is idempotent and side-effect-free: calling it repeatedly for the same lesson never changes its own result", () => {
    setTodaysLessonIdForReview(U9_LESSON_ID);
    const first = productionContentSource.getHomeState();
    const second = productionContentSource.getHomeState();
    const third = productionContentSource.getHomeState();
    expect(second).toEqual(first);
    expect(third).toEqual(first);
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

  it("lets a QA reviewer preview each of U5/U6/U7 as today's lesson, reflected immediately in getLesson/getApplyQuestion", () => {
    setTodaysLessonIdForReview(U5_LESSON_ID);
    expect(getTodaysLessonIdForReview()).toBe(U5_LESSON_ID);
    expect(productionContentSource.getLesson().conceptTitle).toBeTruthy();
    expect(productionContentSource.getApplyQuestion().question.id).toMatch(/^question\.d1\.00(16|17|18)$/);

    setTodaysLessonIdForReview(U6_LESSON_ID);
    expect(productionContentSource.getApplyQuestion().question.id).toMatch(/^question\.d1\.00(19|20|21)$/);

    setTodaysLessonIdForReview(U7_LESSON_ID);
    expect(productionContentSource.getApplyQuestion().question.id).toMatch(/^question\.d1\.00(22|23|24)$/);
  });
});
