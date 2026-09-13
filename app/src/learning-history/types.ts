/**
 * The Learning Intelligence v1 event model, per
 * docs/architecture/LEARNING-INTELLIGENCE-V1.md §7 (Architect-approved
 * revision): an immutable, append-only, discriminated `LearningEvent`
 * union. Once written, routine study flow NEVER mutates an event — a
 * Repair result is a new `RepairAttemptEvent` referencing its originating
 * `QuestionAttemptEvent` via `parentAttemptId`, never an edit to it.
 *
 * Metadata fields are nullable/empty wherever the underlying content
 * doesn't reliably supply them (sparse `primary_role`/`lifecycle`/`stage`,
 * or a non-production `sourceContext` where no production question
 * metadata exists at all) — per the architecture's "missing metadata means
 * unavailable, never a gap to infer or penalize" rule (§8/§21 of the
 * Architect review). See metadataSnapshot.ts for how these are populated.
 */
import type { AnswerOptionFixture } from "../types/content";
import type { Confidence } from "../components/ConfidenceControl/ConfidenceControl";

export type { Confidence };

export const EVENT_SCHEMA_VERSION = 1 as const;

export type LearningMode = "daily-study" | "explore" | "practice" | "reinforcement";

export type AttemptKind = "apply" | "recall";

/** Mirrors PrototypeSwitcher's ContentSourceMode — kept as an independent
 * literal union here so learning-history has no dependency on app-shell. */
export type SourceContext = "prototype" | "production";

export type OptionKey = AnswerOptionFixture["key"];

interface BaseEvent {
  eventId: string;
  eventSchemaVersion: typeof EVENT_SCHEMA_VERSION;
  occurredAt: number;
  sessionId: string;
  learningMode: LearningMode;
  sourceContext: SourceContext;
}

export interface QuestionAttemptEvent extends BaseEvent {
  type: "QUESTION_ATTEMPT";
  attemptId: string; // == eventId; named separately so RepairAttemptEvent.parentAttemptId reads naturally
  attemptKind: AttemptKind;

  // Content identity — snapshotted from ProductionQuestion at attempt time
  // when reliably known (see metadataSnapshot.ts). Null/empty when not.
  questionId: string | null;
  familyId: string | null;
  conceptIds: string[];
  domain: string | null;
  patterns: string[];
  qualifier: string | null;
  primaryRole: string | null;
  lifecycle: string | null;
  stage: string | null;
  decisionType: string | null;
  evidenceDimensions: string[];
  contentStatusAtAttempt: string | null;

  // The attempt itself — always known from the options actually shown,
  // independent of whether questionId/metadata could be resolved.
  selectedOptionKey: OptionKey;
  correctOptionKey: OptionKey;
  correct: boolean;
  confidence: Confidence | null; // null for "recall" (no new confidence UI added in LI-1)
  repairTargetId: string | null; // the *selected option's* repair_target; only meaningful when correct === false
}

export interface RepairAttemptEvent extends BaseEvent {
  type: "REPAIR_ATTEMPT";
  repairAttemptId: string; // == eventId
  parentAttemptId: string; // -> the QuestionAttemptEvent.attemptId this repair was triggered by; that event is never mutated
  repairTargetId: string | null;
  selectedOptionKey: OptionKey;
  correct: boolean;
}

export type LearningEvent = QuestionAttemptEvent | RepairAttemptEvent;

export function isQuestionAttemptEvent(event: LearningEvent): event is QuestionAttemptEvent {
  return event.type === "QUESTION_ATTEMPT";
}

export function isRepairAttemptEvent(event: LearningEvent): event is RepairAttemptEvent {
  return event.type === "REPAIR_ATTEMPT";
}
