import type {
  AnswerOptionFixture,
  CompletionSummaryFixture,
  FeedbackFixture,
  LessonFixture,
  QuestionFixture,
  RecallCheckFixture,
  RepairCheckFixture
} from "../types/content";

/**
 * What DailyStudySession needs from "today's session" — nothing more.
 * DailyStudySession must never know which lesson/question IDs back these
 * values; it only asks a content source for "the recall for today," "the
 * lesson for today," etc. Two implementations exist: one wrapping the
 * Phase 5B hand-written fixtures (app/src/data/prototypeContentSource.ts,
 * default, unchanged behavior), and one wrapping the production content
 * pipeline (app/src/content/productionContentSource.ts). Swapping the
 * injected source is the only thing that changes which experience runs —
 * see App.tsx's dev-only content-source toggle in the Prototype panel.
 */
export interface DailyStudyContentSource {
  getRecall(): RecallCheckFixture;
  getLesson(): LessonFixture;
  getApplyQuestion(): { question: QuestionFixture; meta?: string };
  // Takes the question that was actually shown, not just the selected key —
  // once Apply can rotate through multiple family variants (Phase 6C),
  // feedback must be built against the exact variant the learner answered,
  // never re-derived from a fixed pointer. DailyStudySession passes back
  // the same QuestionFixture it received from getApplyQuestion(); it does
  // not interpret it, only carries it forward — the same way it already
  // carries selectedKey forward.
  buildFeedback(question: QuestionFixture, selectedKey: AnswerOptionFixture["key"]): FeedbackFixture & { repairTargetId?: string };
  getRepairCheck(repairTargetId?: string): RepairCheckFixture;
  getCompletion(): { summary: CompletionSummaryFixture; domainPosition: string };
}
