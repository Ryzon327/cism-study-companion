import { describe, it, expect, beforeEach } from "vitest";
import { getOrCreateSessionId, resetSessionIdForTests } from "../../../../app/src/learning-history/sessionId";

/**
 * LI-1 §6/§7: a per-app-session identifier — module-scope singleton, the
 * same pattern app/src/content/exposureStore.ts uses for exposure history.
 * NOT a user/account identity: only stable for as long as this module
 * instance stays loaded.
 */

beforeEach(() => {
  resetSessionIdForTests();
});

describe("getOrCreateSessionId", () => {
  it("returns the same id across repeated calls within one session", () => {
    const first = getOrCreateSessionId();
    const second = getOrCreateSessionId();
    expect(second).toBe(first);
  });

  it("is not derived from a timestamp alone (two resets in the same tick still yield distinct ids)", () => {
    const first = getOrCreateSessionId();
    resetSessionIdForTests();
    const second = getOrCreateSessionId();
    expect(second).not.toBe(first);
  });

  it("resetSessionIdForTests forces a new id on the next call", () => {
    const before = getOrCreateSessionId();
    resetSessionIdForTests();
    const after = getOrCreateSessionId();
    expect(after).not.toBe(before);
  });
});
