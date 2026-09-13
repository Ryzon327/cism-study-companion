/**
 * A per-app-session identifier for Learning Intelligence events — NOT a
 * user/account identity. Minted once, lazily, per running page (the same
 * module-scope-singleton pattern app/src/content/exposureStore.ts already
 * uses for exposure history): stable for every event recorded while this
 * page stays loaded, and legitimately different after a full reload. Never
 * persisted as a durable "who is this learner" value.
 */
import { createId } from "./ids";

let sessionId: string | null = null;

export function getOrCreateSessionId(): string {
  if (!sessionId) sessionId = createId();
  return sessionId;
}

/** Test-only: restores a clean slate. Not used by production code paths. */
export function resetSessionIdForTests(): void {
  sessionId = null;
}
