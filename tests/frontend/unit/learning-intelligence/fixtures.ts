import type { QuestionAttemptEvent, RepairAttemptEvent } from "../../../../app/src/learning-history";

/**
 * Synthetic, immutable-shaped LearningEvent builders for LI-2 tests.
 * Direct object construction (the same convention LI-1's own
 * db.test.ts already established) rather than routing through LI-1's
 * `buildQuestionAttemptEvent`/`buildRepairAttemptEvent` factories: those
 * factories snapshot REAL production content by questionId, which would
 * make it impossible to control arbitrary concept/pattern/domain
 * combinations for a specific synthetic scenario. Every field defaults to
 * a harmless, realistic-shaped value so a test only needs to override
 * what it actually cares about.
 */

let counter = 0;
export function resetFixtureIds(): void {
  counter = 0;
}
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function makeApplyEvent(overrides: Partial<QuestionAttemptEvent> = {}): QuestionAttemptEvent {
  const eventId = overrides.eventId ?? nextId("apply");
  const correct = overrides.correct ?? true;
  return {
    eventId,
    eventSchemaVersion: 1,
    type: "QUESTION_ATTEMPT",
    occurredAt: overrides.occurredAt ?? 0,
    sessionId: overrides.sessionId ?? "session-1",
    learningMode: overrides.learningMode ?? "daily-study",
    sourceContext: overrides.sourceContext ?? "production",
    attemptId: overrides.attemptId ?? eventId,
    attemptKind: "apply",
    questionId: overrides.questionId === undefined ? nextId("question.test") : overrides.questionId,
    familyId: overrides.familyId === undefined ? "family.test.example" : overrides.familyId,
    conceptIds: overrides.conceptIds ?? ["concept.test.example"],
    domain: overrides.domain === undefined ? "domain.d2" : overrides.domain,
    patterns: overrides.patterns ?? [],
    qualifier: overrides.qualifier === undefined ? null : overrides.qualifier,
    primaryRole: overrides.primaryRole === undefined ? null : overrides.primaryRole,
    lifecycle: overrides.lifecycle === undefined ? null : overrides.lifecycle,
    stage: overrides.stage === undefined ? null : overrides.stage,
    decisionType: overrides.decisionType === undefined ? null : overrides.decisionType,
    evidenceDimensions: overrides.evidenceDimensions ?? [],
    contentStatusAtAttempt: overrides.contentStatusAtAttempt === undefined ? "CANDIDATE" : overrides.contentStatusAtAttempt,
    selectedOptionKey: overrides.selectedOptionKey ?? (correct ? "a" : "b"),
    correctOptionKey: overrides.correctOptionKey ?? "a",
    correct,
    confidence: overrides.confidence === undefined ? "sure" : overrides.confidence,
    repairTargetId: overrides.repairTargetId === undefined ? (correct ? null : "repair.test-target") : overrides.repairTargetId
  };
}

/** attemptKind "recall" — confidence is always null, matching real LI-1 behavior (no Recall confidence UI). */
export function makeRecallEvent(overrides: Partial<QuestionAttemptEvent> = {}): QuestionAttemptEvent {
  const apply = makeApplyEvent(overrides);
  return { ...apply, attemptKind: "recall", confidence: null, repairTargetId: null };
}

export function makeRepairEvent(overrides: Partial<RepairAttemptEvent> & { parentAttemptId: string }): RepairAttemptEvent {
  const eventId = overrides.eventId ?? nextId("repair");
  return {
    eventId,
    eventSchemaVersion: 1,
    type: "REPAIR_ATTEMPT",
    occurredAt: overrides.occurredAt ?? 0,
    sessionId: overrides.sessionId ?? "session-1",
    learningMode: overrides.learningMode ?? "daily-study",
    sourceContext: overrides.sourceContext ?? "production",
    repairAttemptId: overrides.repairAttemptId ?? eventId,
    parentAttemptId: overrides.parentAttemptId,
    repairTargetId: overrides.repairTargetId === undefined ? "repair.test-target" : overrides.repairTargetId,
    selectedOptionKey: overrides.selectedOptionKey ?? "b",
    correct: overrides.correct ?? true
  };
}

/** A correct Apply attempt paired with a CORRECTED_ON_REPAIR-style Repair — for scenario-level convenience. */
export function makeMissThenRepair(
  applyOverrides: Partial<QuestionAttemptEvent>,
  repairCorrect: boolean
): [QuestionAttemptEvent, RepairAttemptEvent] {
  const apply = makeApplyEvent({ ...applyOverrides, correct: false });
  const repair = makeRepairEvent({ parentAttemptId: apply.attemptId, correct: repairCorrect, occurredAt: apply.occurredAt + 1 });
  return [apply, repair];
}
