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
  // The Phase 5B/6B prototype has exactly one fixed question — the
  // `question` param is accepted for interface parity with the production
  // source but not needed here, since there is nothing to disambiguate.
  buildFeedback: (_question, selectedKey: AnswerOptionFixture["key"]) => buildFeedback(selectedKey),
  getRepairCheck: () => repairCheck,
  getCompletion: () => ({ summary: completionSummary, domainPosition: todayFocus.domainPosition })
};
