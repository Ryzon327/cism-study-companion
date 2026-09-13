/**
 * Pure LearningEvent construction — no I/O, no ID/clock generation of its
 * own. Every non-deterministic input (`eventId`, `occurredAt`, `sessionId`)
 * is a parameter, so these functions are fully deterministic and testable
 * without touching IndexedDB or real time. `learningHistoryStore.ts` is the
 * only impure caller.
 */
import { snapshotQuestionMetadata } from "./metadataSnapshot";
import { EVENT_SCHEMA_VERSION, type AttemptKind, type Confidence, type LearningMode, type OptionKey, type QuestionAttemptEvent, type RepairAttemptEvent, type SourceContext } from "./types";

export interface BuildQuestionAttemptEventParams {
  eventId: string;
  occurredAt: number;
  sessionId: string;
  learningMode: LearningMode;
  sourceContext: SourceContext;
  attemptKind: AttemptKind;
  questionId: string | null;
  selectedOptionKey: OptionKey;
  correctOptionKey: OptionKey;
  correct: boolean;
  confidence: Confidence | null;
  repairTargetId: string | null;
}

export function buildQuestionAttemptEvent(params: BuildQuestionAttemptEventParams): QuestionAttemptEvent {
  const metadata = snapshotQuestionMetadata(params.questionId, params.sourceContext);
  return {
    eventId: params.eventId,
    eventSchemaVersion: EVENT_SCHEMA_VERSION,
    type: "QUESTION_ATTEMPT",
    occurredAt: params.occurredAt,
    sessionId: params.sessionId,
    learningMode: params.learningMode,
    sourceContext: params.sourceContext,
    attemptId: params.eventId,
    attemptKind: params.attemptKind,
    questionId: params.questionId,
    familyId: metadata.familyId,
    conceptIds: metadata.conceptIds,
    domain: metadata.domain,
    patterns: metadata.patterns,
    qualifier: metadata.qualifier,
    primaryRole: metadata.primaryRole,
    lifecycle: metadata.lifecycle,
    stage: metadata.stage,
    decisionType: metadata.decisionType,
    evidenceDimensions: metadata.evidenceDimensions,
    contentStatusAtAttempt: metadata.contentStatusAtAttempt,
    selectedOptionKey: params.selectedOptionKey,
    correctOptionKey: params.correctOptionKey,
    correct: params.correct,
    confidence: params.confidence,
    repairTargetId: params.repairTargetId
  };
}

export interface BuildRepairAttemptEventParams {
  eventId: string;
  occurredAt: number;
  sessionId: string;
  learningMode: LearningMode;
  sourceContext: SourceContext;
  parentAttemptId: string;
  repairTargetId: string | null;
  selectedOptionKey: OptionKey;
  correct: boolean;
}

export function buildRepairAttemptEvent(params: BuildRepairAttemptEventParams): RepairAttemptEvent {
  return {
    eventId: params.eventId,
    eventSchemaVersion: EVENT_SCHEMA_VERSION,
    type: "REPAIR_ATTEMPT",
    occurredAt: params.occurredAt,
    sessionId: params.sessionId,
    learningMode: params.learningMode,
    sourceContext: params.sourceContext,
    repairAttemptId: params.eventId,
    parentAttemptId: params.parentAttemptId,
    repairTargetId: params.repairTargetId,
    selectedOptionKey: params.selectedOptionKey,
    correct: params.correct
  };
}
