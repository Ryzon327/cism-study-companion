import { describe, it, expect, beforeEach } from "vitest";
import { installFakeIndexedDb } from "./fakeIndexedDb";
import * as db from "../../../../app/src/learning-history/db";
import type { QuestionAttemptEvent, RepairAttemptEvent } from "../../../../app/src/learning-history/types";

/**
 * LI-1: the thin IndexedDB adapter itself, exercised against
 * `fake-indexeddb` (dev-only dependency, added specifically so this can be
 * unit-tested under Vitest/jsdom — see
 * docs/architecture/LEARNING-INTELLIGENCE-V1.md §6/§21). Derivation/
 * weakness logic is explicitly out of scope here (LI-2) — these tests only
 * prove the storage contract itself.
 */

beforeEach(() => {
  installFakeIndexedDb();
});

function applyEvent(overrides: Partial<QuestionAttemptEvent> = {}): QuestionAttemptEvent {
  return {
    eventId: "attempt-1",
    eventSchemaVersion: 1,
    type: "QUESTION_ATTEMPT",
    occurredAt: 1000,
    sessionId: "session-1",
    learningMode: "daily-study",
    sourceContext: "production",
    attemptId: "attempt-1",
    attemptKind: "apply",
    questionId: "question.foundation.0001",
    familyId: "family.foundation.qualifier-recognition",
    conceptIds: ["concept.foundation.qualifier-recognition"],
    domain: "domain.foundation",
    patterns: [],
    qualifier: "qualifier.next",
    primaryRole: null,
    lifecycle: null,
    stage: null,
    decisionType: null,
    evidenceDimensions: ["evidence.qualifier"],
    contentStatusAtAttempt: "CANDIDATE",
    selectedOptionKey: "b",
    correctOptionKey: "a",
    correct: false,
    confidence: "sure",
    repairTargetId: "repair.qualifier-error",
    ...overrides
  };
}

function repairEvent(overrides: Partial<RepairAttemptEvent> = {}): RepairAttemptEvent {
  return {
    eventId: "repair-1",
    eventSchemaVersion: 1,
    type: "REPAIR_ATTEMPT",
    occurredAt: 1500,
    sessionId: "session-1",
    learningMode: "daily-study",
    sourceContext: "production",
    repairAttemptId: "repair-1",
    parentAttemptId: "attempt-1",
    repairTargetId: "repair.qualifier-error",
    selectedOptionKey: "b",
    correct: true,
    ...overrides
  };
}

describe("learning-history db adapter", () => {
  it("an empty store returns an empty array", async () => {
    expect(await db.listEvents()).toEqual([]);
  });

  it("appends and retrieves a QUESTION_ATTEMPT event", async () => {
    const event = applyEvent();
    await db.appendEvent(event);
    const events = await db.listEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(event);
  });

  it("appends and retrieves a REPAIR_ATTEMPT event", async () => {
    await db.appendEvent(applyEvent());
    const repair = repairEvent();
    await db.appendEvent(repair);
    const events = await db.listEvents();
    expect(events).toHaveLength(2);
    expect(events.find((e) => e.eventId === "repair-1")).toEqual(repair);
  });

  it("returns events in stable chronological order regardless of insertion order", async () => {
    await db.appendEvent(applyEvent({ eventId: "e-3", occurredAt: 3000 }));
    await db.appendEvent(applyEvent({ eventId: "e-1", occurredAt: 1000 }));
    await db.appendEvent(applyEvent({ eventId: "e-2", occurredAt: 2000 }));
    const events = await db.listEvents();
    expect(events.map((e) => e.eventId)).toEqual(["e-1", "e-2", "e-3"]);
  });

  it("ties on identical occurredAt are broken deterministically by eventId", async () => {
    await db.appendEvent(applyEvent({ eventId: "b", occurredAt: 5000 }));
    await db.appendEvent(applyEvent({ eventId: "a", occurredAt: 5000 }));
    const events = await db.listEvents();
    expect(events.map((e) => e.eventId)).toEqual(["a", "b"]);
  });

  it("persists across independent calls (each function opens its own connection) — no in-memory-only shortcut", async () => {
    await db.appendEvent(applyEvent({ eventId: "persisted-1" }));
    // A brand new call, with no shared adapter instance, still sees it.
    const fetched = await db.getEventById("persisted-1");
    expect(fetched?.eventId).toBe("persisted-1");
  });

  it("getEventById returns undefined for an unknown id, not an error", async () => {
    expect(await db.getEventById("does-not-exist")).toBeUndefined();
  });

  it("clearEvents empties the store", async () => {
    await db.appendEvent(applyEvent());
    await db.appendEvent(repairEvent());
    expect(await db.listEvents()).toHaveLength(2);
    await db.clearEvents();
    expect(await db.listEvents()).toEqual([]);
  });

  it("rejects a duplicate eventId rather than silently overwriting (append is not upsert)", async () => {
    await db.appendEvent(applyEvent({ eventId: "dup-1" }));
    await expect(db.appendEvent(applyEvent({ eventId: "dup-1", selectedOptionKey: "c" }))).rejects.toThrow();
    // The original, unmutated event is still the one on disk.
    const stored = await db.getEventById("dup-1");
    expect(stored?.selectedOptionKey).toBe("b");
  });

  it("a REPAIR_ATTEMPT event never mutates its parent QUESTION_ATTEMPT event", async () => {
    const attempt = applyEvent({ eventId: "parent-1" });
    await db.appendEvent(attempt);
    await db.appendEvent(repairEvent({ eventId: "child-1", parentAttemptId: "parent-1" }));

    const parentAfter = await db.getEventById("parent-1");
    expect(parentAfter).toEqual(attempt); // byte-for-byte identical to what was originally written
  });

  it("nullable metadata (questionId null, sparse role/lifecycle/stage) round-trips through storage unchanged", async () => {
    const event = applyEvent({
      eventId: "nullable-1",
      questionId: null,
      familyId: null,
      conceptIds: [],
      domain: null,
      primaryRole: null,
      lifecycle: null,
      stage: null,
      confidence: null
    });
    await db.appendEvent(event);
    const stored = await db.getEventById("nullable-1");
    expect(stored).toEqual(event);
  });

  it("ensureMeta writes a schema-version record on first call and is idempotent thereafter", async () => {
    const first = await db.ensureMeta();
    expect(first.eventSchemaVersion).toBe(1);
    expect(first.dbVersion).toBe(db.DB_VERSION);
    const second = await db.ensureMeta();
    expect(second).toEqual(first); // same record, not regenerated
  });

  it("clearEvents does not touch the meta record", async () => {
    const meta = await db.ensureMeta();
    await db.appendEvent(applyEvent());
    await db.clearEvents();
    expect(await db.readMeta()).toEqual(meta);
  });

  it("isIndexedDbAvailable reflects the current global (true once fake-indexeddb is installed)", () => {
    expect(db.isIndexedDbAvailable()).toBe(true);
  });
});
