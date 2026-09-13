/**
 * Robust, injectable ID generation for Learning Intelligence events — never
 * derived from a timestamp alone (two events in the same millisecond must
 * still get distinct IDs). Prefers the platform's `crypto.randomUUID()`
 * (available in all supported browsers and in Node >=20, per this
 * project's `engines` field); falls back to a manually-assembled RFC
 * 4122 v4-shaped ID only if that API is unavailable, so ID generation
 * never throws and never blocks recording.
 */

function fallbackUuidV4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return fallbackUuidV4();
}
