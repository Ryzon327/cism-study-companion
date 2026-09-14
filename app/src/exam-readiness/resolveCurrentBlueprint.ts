import type { ExamBlueprint } from "./types";

/**
 * Resolves which single blueprint governs "now" — pure, given an explicit
 * clock (never reads `Date.now()` itself, so callers can test date
 * transitions deterministically). Fails closed: throws rather than
 * guessing if zero or more than one blueprint's effective range matches,
 * since either case means the registry itself is wrong (a gap or an
 * overlap) and silently picking one would hide that.
 */
export function resolveCurrentBlueprint(blueprints: readonly ExamBlueprint[], now: number): ExamBlueprint {
  const nowIso = new Date(now).toISOString().slice(0, 10);
  const matches = blueprints.filter((blueprint) => isWithinRange(blueprint, nowIso));

  if (matches.length === 0) {
    throw new Error(`resolveCurrentBlueprint: no exam blueprint is effective at ${nowIso}`);
  }
  if (matches.length > 1) {
    const ids = matches.map((blueprint) => blueprint.id).join(", ");
    throw new Error(`resolveCurrentBlueprint: ${matches.length} exam blueprints are effective at ${nowIso} (${ids}) — ambiguous, refusing to guess`);
  }
  // matches.length === 1 is guaranteed by the checks above.
  return matches[0]!;
}

function isWithinRange(blueprint: ExamBlueprint, isoDate: string): boolean {
  if (blueprint.effectiveFrom !== null && isoDate < blueprint.effectiveFrom) return false;
  if (blueprint.effectiveTo !== null && isoDate >= blueprint.effectiveTo) return false;
  return true;
}
