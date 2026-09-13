/**
 * LI-2 §9/§29: deterministic ordering and bounded recent-window helpers.
 * Every function here is pure and side-effect free — no wall clock, no
 * random numbers, no reliance on input array order or IndexedDB storage
 * order. Ties on `occurredAt` (possible if two attempts share a
 * millisecond) break on `eventId` so the same input always sorts the same
 * way.
 */
import type { QuestionAttemptEvent } from "../learning-history";

/** Ascending by occurredAt, tie-broken by eventId — never mutates the input array. */
export function sortByOccurredAt<T extends { occurredAt: number; eventId: string }>(attempts: readonly T[]): T[] {
  return [...attempts].sort((a, b) => a.occurredAt - b.occurredAt || a.eventId.localeCompare(b.eventId));
}

/** The most recent `size` attempts (or fewer, if fewer exist), oldest first. */
export function recentWindow<T extends { occurredAt: number; eventId: string }>(attempts: readonly T[], size: number): T[] {
  return sortByOccurredAt(attempts).slice(-size);
}

/** Distinct, non-null questionIds — an attempt with no durable question id never counts toward breadth (§10). */
export function distinctQuestionCount(attempts: readonly QuestionAttemptEvent[]): number {
  return new Set(attempts.map((a) => a.questionId).filter((id): id is string => id !== null)).size;
}

export function distinctConceptCount(attempts: readonly QuestionAttemptEvent[]): number {
  return new Set(attempts.flatMap((a) => a.conceptIds)).size;
}
