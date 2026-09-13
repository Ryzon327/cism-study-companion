import { describe, it, expect, beforeEach, vi } from "vitest";
import { installFakeIndexedDb, removeIndexedDbForTests } from "./fakeIndexedDb";
import { recordQuestionAttempt, recordRepairAttempt, listLearningEvents, resetLearningHistory } from "../../../../app/src/learning-history/learningHistoryStore";
import { readMeta } from "../../../../app/src/learning-history/db";
import { resetSessionIdForTests, getOrCreateSessionId } from "../../../../app/src/learning-history/sessionId";

/**
 * LI-1: the public `LearningHistoryStore` seam every learning-mode call
 * site actually uses. Verifies the synchronous-event/async-write contract,
 * session-id stability, reset, and the failure boundary (§19 of
 * docs/architecture/LEARNING-INTELLIGENCE-V1.md: a storage failure must
 * never make the study app unusable, and must never claim success it
 * didn't achieve).
 */

beforeEach(() => {
  installFakeIndexedDb();
  resetSessionIdForTests();
});

const BASE_APPLY = {
  learningMode: "daily-study" as const,
  sourceContext: "production" as const,
  attemptKind: "apply" as const,
  questionId: "question.foundation.0001",
  selectedOptionKey: "a" as const,
  correctOptionKey: "a" as const,
  correct: true,
  confidence: "sure" as const,
  repairTargetId: null
};

describe("recordQuestionAttempt", () => {
  it("returns the constructed event synchronously, with an eventId already assigned", () => {
    const { event } = recordQuestionAttempt(BASE_APPLY);
    expect(event.eventId).toBeTruthy();
    expect(event.attemptId).toBe(event.eventId);
  });

  it("the returned `written` promise resolves true once the background write succeeds", async () => {
    const { written } = recordQuestionAttempt(BASE_APPLY);
    expect(await written).toBe(true);
  });

  it("the event is durably persisted once `written` resolves", async () => {
    const { event, written } = recordQuestionAttempt(BASE_APPLY);
    await written;
    const stored = await listLearningEvents();
    expect(stored.map((e) => e.eventId)).toContain(event.eventId);
  });

  it("every call mints a fresh sessionId source consistently within one session (module-scope singleton)", () => {
    const sessionId = getOrCreateSessionId();
    const { event } = recordQuestionAttempt(BASE_APPLY);
    expect(event.sessionId).toBe(sessionId);
  });

  it("a caller-supplied eventId is honored (used by QuestionAttemptFlow to know the id before Repair may need it)", () => {
    const { event } = recordQuestionAttempt({ ...BASE_APPLY, eventId: "explicit-id-1" });
    expect(event.eventId).toBe("explicit-id-1");
  });
});

describe("recordRepairAttempt", () => {
  it("links to its parent via parentAttemptId and persists independently", async () => {
    const { event: parent, written: parentWritten } = recordQuestionAttempt({ ...BASE_APPLY, correct: false, repairTargetId: "repair.qualifier-error" });
    await parentWritten;
    const { event: repair, written: repairWritten } = recordRepairAttempt({
      learningMode: "daily-study",
      sourceContext: "production",
      parentAttemptId: parent.attemptId,
      repairTargetId: "repair.qualifier-error",
      selectedOptionKey: "b",
      correct: true
    });
    expect(await repairWritten).toBe(true);

    const events = await listLearningEvents();
    const storedParent = events.find((e) => e.eventId === parent.eventId);
    const storedRepair = events.find((e) => e.eventId === repair.eventId);
    expect(storedParent).toEqual(parent); // untouched by the repair write
    expect(storedRepair && "parentAttemptId" in storedRepair ? storedRepair.parentAttemptId : undefined).toBe(parent.attemptId);
  });
});

describe("meta / schema-version anchor", () => {
  it("recording any event establishes the meta record as a side effect, in real usage (not just via explicit db.ensureMeta() calls in tests)", async () => {
    expect(await readMeta()).toBeUndefined();
    const { written } = recordQuestionAttempt(BASE_APPLY);
    await written;
    const meta = await readMeta();
    expect(meta?.eventSchemaVersion).toBe(1);
  });
});

describe("resetLearningHistory", () => {
  it("clears all recorded events", async () => {
    const { written } = recordQuestionAttempt(BASE_APPLY);
    await written;
    expect(await listLearningEvents()).toHaveLength(1);
    expect(await resetLearningHistory()).toBe(true);
    expect(await listLearningEvents()).toEqual([]);
  });
});

describe("failure behavior — IndexedDB unavailable", () => {
  it("recordQuestionAttempt still returns a usable event synchronously, and `written` resolves false, without throwing", async () => {
    removeIndexedDbForTests();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { event, written } = recordQuestionAttempt(BASE_APPLY);
    expect(event.eventId).toBeTruthy(); // the learner's attempt is never blocked by storage being unavailable

    expect(await written).toBe(false); // never silently claims success it didn't achieve
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("listLearningEvents degrades to an empty array rather than throwing when IndexedDB is unavailable", async () => {
    removeIndexedDbForTests();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await listLearningEvents()).toEqual([]);
    consoleError.mockRestore();
  });
});

describe("duplicate-prevention at the store level", () => {
  it("recording the same logical attempt twice with the same eventId does not silently double-count (the second write fails loudly, not silently)", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const first = recordQuestionAttempt({ ...BASE_APPLY, eventId: "fixed-id" });
    await first.written;
    const second = recordQuestionAttempt({ ...BASE_APPLY, eventId: "fixed-id", selectedOptionKey: "b" });
    expect(await second.written).toBe(false);

    const events = await listLearningEvents();
    expect(events.filter((e) => e.eventId === "fixed-id")).toHaveLength(1);
    consoleError.mockRestore();
  });
});
