/**
 * Adapts the Phase 5B hand-written prototype fixtures to the
 * DailyStudyContentSource interface. Pure adapter — no behavior change
 * from the original Phase 5B experience; every value here already existed
 * in fixtures.ts.
 */
import type { DailyStudyContentSource } from "../session/contentSource";
import type { AnswerOptionFixture } from "../types/content";
import { lesson, applyQuestion, recallCheck, repairCheck, completionSummary, todayFocus, buildFeedback } from "./fixtures";

export const prototypeContentSource: DailyStudyContentSource = {
  getRecall: () => recallCheck,
  getLesson: () => lesson,
  getApplyQuestion: () => ({ question: applyQuestion, meta: "Question 1 of 1 · Domain 2" }),
  buildFeedback: (selectedKey: AnswerOptionFixture["key"]) => buildFeedback(selectedKey),
  getRepairCheck: () => repairCheck,
  getCompletion: () => ({ summary: completionSummary, domainPosition: todayFocus.domainPosition })
};
