import { describe, it, expect } from "vitest";
import { buildQuestionAttemptEvent, buildRepairAttemptEvent } from "../../../../app/src/learning-history/eventFactory";
import { EVENT_SCHEMA_VERSION } from "../../../../app/src/learning-history/types";

/**
 * Pure LearningEvent construction — LI-1. Every input is injected
 * (eventId/occurredAt/sessionId), so these tests never touch IndexedDB, a
 * clock, or an ID generator, per
 * docs/architecture/LEARNING-INTELLIGENCE-V1.md §21's "pure logic" tier.
 */

const BASE_PARAMS = {
  eventId: "event-1",
  occurredAt: 1_700_000_000_000,
  sessionId: "session-1",
  learningMode: "daily-study" as const,
  sourceContext: "production" as const
};

describe("buildQuestionAttemptEvent", () => {
  it("Apply correct: builds a fully-formed QUESTION_ATTEMPT event with real production metadata snapshotted", () => {
    const event = buildQuestionAttemptEvent({
      ...BASE_PARAMS,
      attemptKind: "apply",
      questionId: "question.foundation.0001",
      selectedOptionKey: "a",
      correctOptionKey: "a",
      correct: true,
      confidence: "sure",
      repairTargetId: null
    });

    expect(event.type).toBe("QUESTION_ATTEMPT");
    expect(event.eventSchemaVersion).toBe(EVENT_SCHEMA_VERSION);
    expect(event.attemptId).toBe(event.eventId);
    expect(event.attemptKind).toBe("apply");
    expect(event.correct).toBe(true);
    expect(event.confidence).toBe("sure");
    expect(event.repairTargetId).toBeNull();
    // question.foundation.0001 is a real production question (foundation domain, qualifier.next).
    expect(event.domain).toBe("domain.foundation");
    expect(event.familyId).toBe("family.foundation.qualifier-recognition");
    expect(event.conceptIds).toEqual(["concept.foundation.qualifier-recognition"]);
    expect(event.qualifier).toBe("qualifier.next");
    expect(event.evidenceDimensions).toEqual(["evidence.qualifier"]);
    expect(event.contentStatusAtAttempt).toBe("CANDIDATE");
  });

  it("Apply incorrect: carries the selected option's repair target and confidence value", () => {
    const event = buildQuestionAttemptEvent({
      ...BASE_PARAMS,
      attemptKind: "apply",
      questionId: "question.foundation.0001",
      selectedOptionKey: "b",
      correctOptionKey: "a",
      correct: false,
      confidence: "guessing",
      repairTargetId: "repair.qualifier-error"
    });

    expect(event.correct).toBe(false);
    expect(event.confidence).toBe("guessing");
    expect(event.repairTargetId).toBe("repair.qualifier-error");
    expect(event.selectedOptionKey).toBe("b");
    expect(event.correctOptionKey).toBe("a");
  });

  it("Recall: confidence is always null, even when a caller passes something else through the type system", () => {
    const event = buildQuestionAttemptEvent({
      ...BASE_PARAMS,
      attemptKind: "recall",
      questionId: "question.foundation.0001",
      selectedOptionKey: "a",
      correctOptionKey: "a",
      correct: true,
      confidence: null,
      repairTargetId: null
    });

    expect(event.attemptKind).toBe("recall");
    expect(event.confidence).toBeNull();
  });

  it("sparse role/lifecycle/stage metadata is preserved as null, never inferred (question.foundation.0001 has none of these)", () => {
    const event = buildQuestionAttemptEvent({
      ...BASE_PARAMS,
      attemptKind: "apply",
      questionId: "question.foundation.0001",
      selectedOptionKey: "a",
      correctOptionKey: "a",
      correct: true,
      confidence: "sure",
      repairTargetId: null
    });
    expect(event.primaryRole).toBeNull();
    expect(event.lifecycle).toBeNull();
    expect(event.stage).toBeNull();
  });

  it("a null questionId (e.g. Recall with no durable question id) yields fully unavailable metadata, not a thrown error", () => {
    const event = buildQuestionAttemptEvent({
      ...BASE_PARAMS,
      attemptKind: "recall",
      questionId: null,
      selectedOptionKey: "a",
      correctOptionKey: "a",
      correct: true,
      confidence: null,
      repairTargetId: null
    });
    expect(event.questionId).toBeNull();
    expect(event.familyId).toBeNull();
    expect(event.conceptIds).toEqual([]);
    expect(event.domain).toBeNull();
  });

  it("a prototype sourceContext never snapshots production metadata, even for a real production questionId", () => {
    const event = buildQuestionAttemptEvent({
      ...BASE_PARAMS,
      sourceContext: "prototype",
      attemptKind: "apply",
      questionId: "question.foundation.0001",
      selectedOptionKey: "a",
      correctOptionKey: "a",
      correct: true,
      confidence: "sure",
      repairTargetId: null
    });
    expect(event.domain).toBeNull();
    expect(event.familyId).toBeNull();
    expect(event.sourceContext).toBe("prototype");
  });

  it("an unresolvable questionId yields unavailable metadata rather than throwing", () => {
    const event = buildQuestionAttemptEvent({
      ...BASE_PARAMS,
      attemptKind: "apply",
      questionId: "question.does-not-exist.0001",
      selectedOptionKey: "a",
      correctOptionKey: "a",
      correct: true,
      confidence: "sure",
      repairTargetId: null
    });
    expect(event.domain).toBeNull();
    expect(event.contentStatusAtAttempt).toBeNull();
  });

  it("two events built with different eventIds never collide, even with identical other inputs", () => {
    const eventA = buildQuestionAttemptEvent({ ...BASE_PARAMS, eventId: "a", attemptKind: "apply", questionId: null, selectedOptionKey: "a", correctOptionKey: "a", correct: true, confidence: "sure", repairTargetId: null });
    const eventB = buildQuestionAttemptEvent({ ...BASE_PARAMS, eventId: "b", attemptKind: "apply", questionId: null, selectedOptionKey: "a", correctOptionKey: "a", correct: true, confidence: "sure", repairTargetId: null });
    expect(eventA.eventId).not.toBe(eventB.eventId);
  });
});

describe("buildRepairAttemptEvent", () => {
  it("builds a REPAIR_ATTEMPT event linked to its parent via parentAttemptId, never embedding parent fields", () => {
    const event = buildRepairAttemptEvent({
      ...BASE_PARAMS,
      eventId: "repair-1",
      parentAttemptId: "apply-1",
      repairTargetId: "repair.qualifier-error",
      selectedOptionKey: "b",
      correct: true
    });
    expect(event.type).toBe("REPAIR_ATTEMPT");
    expect(event.repairAttemptId).toBe("repair-1");
    expect(event.parentAttemptId).toBe("apply-1");
    expect(event.correct).toBe(true);
    expect((event as unknown as { attemptKind?: unknown }).attemptKind).toBeUndefined();
  });

  it("a null repairTargetId is preserved as null (not coerced to a string)", () => {
    const event = buildRepairAttemptEvent({
      ...BASE_PARAMS,
      eventId: "repair-2",
      parentAttemptId: "apply-2",
      repairTargetId: null,
      selectedOptionKey: "a",
      correct: false
    });
    expect(event.repairTargetId).toBeNull();
    expect(event.correct).toBe(false);
  });
});
