/**
 * The public, impure entry point every learning-mode call site uses to
 * record evidence — the "pure logic vs. one impure store" seam
 * exposureStore.ts already established for exposure history (see
 * docs/architecture/LEARNING-INTELLIGENCE-V1.md §6). Only ever APPENDS —
 * there is no update/delete operation here for routine study-flow use.
 *
 * `recordQuestionAttempt`/`recordRepairAttempt` return the constructed
 * event SYNCHRONOUSLY (including its `eventId`), so a caller (e.g.
 * QuestionAttemptFlow, to link a later Repair via `parentAttemptId`) never
 * has to await a storage round-trip just to know an ID it already
 * generated. The actual IndexedDB write happens in the background; its
 * outcome is exposed only via the returned `written` promise, which never
 * rejects — a storage failure is logged and swallowed here, per the
 * architecture's §19 rule that persistence must never make the study app
 * unusable, and never silently claims success it didn't achieve (`written`
 * resolves to `false` on failure; nothing calls it "saved" incorrectly).
 */
import { createId } from "./ids";
import { getOrCreateSessionId } from "./sessionId";
import { buildQuestionAttemptEvent, buildRepairAttemptEvent, type BuildQuestionAttemptEventParams, type BuildRepairAttemptEventParams } from "./eventFactory";
import * as db from "./db";
import type { LearningEvent, QuestionAttemptEvent, RepairAttemptEvent } from "./types";

export type RecordQuestionAttemptInput = Omit<BuildQuestionAttemptEventParams, "eventId" | "occurredAt" | "sessionId"> & {
  eventId?: string;
  occurredAt?: number;
};

export type RecordRepairAttemptInput = Omit<BuildRepairAttemptEventParams, "eventId" | "occurredAt" | "sessionId"> & {
  eventId?: string;
  occurredAt?: number;
};

export interface RecordResult<T extends LearningEvent> {
  event: T;
  /** Resolves true once durably written, false if the write failed. Never rejects. */
  written: Promise<boolean>;
}

function reportStorageFailure(context: string, error: unknown): void {
  // eslint-disable-next-line no-console -- the one intended observation point for a storage failure; never surfaced to the learner.
  console.error(`[learning-history] ${context} failed:`, error);
}

function writeInBackground(event: LearningEvent, context: string): Promise<boolean> {
  // ensureMeta() is idempotent (a no-op once the record exists) and
  // independent of the events store, so it runs alongside the event write
  // rather than blocking it — this is what actually establishes the
  // versioning anchor (§20 of the architecture) in real usage, not just in
  // tests that call it directly. A meta-write failure never affects the
  // boolean this resolves to — that reflects only whether the LEARNER'S
  // EVENT itself was saved.
  const metaEstablished = db.ensureMeta().catch((error: unknown) => reportStorageFailure("ensureMeta", error));
  const eventAppended = db
    .appendEvent(event)
    .then(() => true)
    .catch((error: unknown) => {
      reportStorageFailure(context, error);
      return false;
    });
  return Promise.all([metaEstablished, eventAppended]).then(([, appended]) => appended);
}

export function recordQuestionAttempt(input: RecordQuestionAttemptInput): RecordResult<QuestionAttemptEvent> {
  const event = buildQuestionAttemptEvent({
    ...input,
    eventId: input.eventId ?? createId(),
    occurredAt: input.occurredAt ?? Date.now(),
    sessionId: getOrCreateSessionId()
  });
  return { event, written: writeInBackground(event, "recordQuestionAttempt") };
}

export function recordRepairAttempt(input: RecordRepairAttemptInput): RecordResult<RepairAttemptEvent> {
  const event = buildRepairAttemptEvent({
    ...input,
    eventId: input.eventId ?? createId(),
    occurredAt: input.occurredAt ?? Date.now(),
    sessionId: getOrCreateSessionId()
  });
  return { event, written: writeInBackground(event, "recordRepairAttempt") };
}

export async function listLearningEvents(): Promise<LearningEvent[]> {
  try {
    return await db.listEvents();
  } catch (error) {
    reportStorageFailure("listLearningEvents", error);
    return [];
  }
}

/** Reset-service foundation (LI-1 scope: no UI yet — see LI-3). */
export async function resetLearningHistory(): Promise<boolean> {
  try {
    await db.clearEvents();
    return true;
  } catch (error) {
    reportStorageFailure("resetLearningHistory", error);
    return false;
  }
}
