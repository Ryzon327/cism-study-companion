/**
 * Public surface of the Learning Intelligence v1 local history module
 * (LI-1: persistence foundation only — no insight computation, no UI; see
 * docs/architecture/LEARNING-INTELLIGENCE-V1.md §26).
 */
export type {
  LearningEvent,
  QuestionAttemptEvent,
  RepairAttemptEvent,
  LearningMode,
  AttemptKind,
  SourceContext,
  OptionKey,
  Confidence
} from "./types";
export { isQuestionAttemptEvent, isRepairAttemptEvent, EVENT_SCHEMA_VERSION } from "./types";
export { recordQuestionAttempt, recordRepairAttempt, listLearningEvents, resetLearningHistory } from "./learningHistoryStore";
export type { RecordQuestionAttemptInput, RecordRepairAttemptInput, RecordResult } from "./learningHistoryStore";
export { getOrCreateSessionId } from "./sessionId";
