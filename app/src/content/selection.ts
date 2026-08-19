/**
 * Pure, deterministic variant-selection engine — the mechanism behind
 * docs/data-model/REPETITION-AND-RECALL-MODEL.md's exact-repeat policy.
 *
 * Nothing in this file touches localStorage, IndexedDB, the network, or
 * Math.random(). Every function takes its inputs explicitly (candidate
 * ids, an exposure history, a caller-supplied clock) and returns a value —
 * same inputs always produce the same output, so a selection bug is always
 * reproducible from a bug report, not a one-time fluke. The impure parts
 * (an actual in-memory store, an actual Date.now()) live in
 * exposureStore.ts and productionContentSource.ts, deliberately kept out
 * of this file.
 */

export interface ExposureStats {
  count: number;
  lastSeenAt: number;
}

/** questionId -> exposure stats. Immutable from this module's point of view. */
export type ExposureHistory = ReadonlyMap<string, ExposureStats>;

export function emptyHistory(): ExposureHistory {
  return new Map();
}

/**
 * Records one exposure, returning a NEW history (the input is never
 * mutated) — this is what keeps the selection functions themselves pure
 * even though the overall system has state somewhere (in exposureStore.ts).
 */
export function recordExposure(history: ExposureHistory, questionId: string, now: number): ExposureHistory {
  const next = new Map(history);
  const prev = next.get(questionId);
  next.set(questionId, { count: (prev?.count ?? 0) + 1, lastSeenAt: now });
  return next;
}

/**
 * The exact-repeat policy: prefer an unseen candidate; if every candidate
 * has been seen, prefer the least-recently-seen one; tie-break
 * deterministically. Exact repeats are allowed (never a "never repeat"
 * guarantee) — they simply become the fallback once the pool is
 * genuinely exhausted.
 */
export function selectVariant(candidateIds: readonly string[], history: ExposureHistory, now: number): string {
  if (candidateIds.length === 0) {
    throw new Error("selectVariant: no candidate variants supplied");
  }

  const unseen = candidateIds.filter((id) => !history.has(id));
  if (unseen.length > 0) {
    return deterministicPick(unseen);
  }

  // Every candidate has been seen at least once — fall back to the
  // least-recently-seen one, tie-broken deterministically.
  let best: string | undefined;
  let bestLastSeen = Infinity;
  for (const id of candidateIds) {
    const lastSeen = history.get(id)!.lastSeenAt;
    if (lastSeen < bestLastSeen || (lastSeen === bestLastSeen && (best === undefined || id < best))) {
      best = id;
      bestLastSeen = lastSeen;
    }
  }
  // best is guaranteed defined: candidateIds is non-empty and every id has history.
  return best as string;
}

/** Deterministic, not random: lowest id wins. Stable and reproducible across runs. */
function deterministicPick(ids: readonly string[]): string {
  return [...ids].sort()[0] as string;
}

// ---- Confidence interaction (classification only — not wired into live
// selection yet; see docs/data-model/REPETITION-AND-RECALL-MODEL.md's
// explicit note on why). Confidence NEVER contributes to mastery by
// itself — evidence.confidence.contributes_to_mastery stays false,
// unchanged from Phase 3. ----

export type ConfidenceSignal =
  | "strong-repair-priority" // incorrect + high confidence
  | "normal-repair" // incorrect + low confidence
  | "reinforcement-candidate" // correct + low confidence
  | "healthy-calibration"; // correct + high confidence

export function classifyConfidenceSignal(correct: boolean, highConfidence: boolean): ConfidenceSignal {
  if (!correct && highConfidence) return "strong-repair-priority";
  if (!correct && !highConfidence) return "normal-repair";
  if (correct && !highConfidence) return "reinforcement-candidate";
  return "healthy-calibration";
}

// ---- Spacing bands (types + pure transition function only — not wired
// into live target-selection yet, since Phase 6C's two-family slice never
// has more than one eligible recall target to prioritize among; see
// docs/data-model/REPETITION-AND-RECALL-MODEL.md). No calendar/interval
// math, no UI exposure. ----

export type SpacingBand = "SOON" | "LATER" | "STABLE";

export function nextSpacingBand(current: SpacingBand, signal: ConfidenceSignal): SpacingBand {
  if (signal === "strong-repair-priority" || signal === "normal-repair") return "SOON";
  if (signal === "reinforcement-candidate") return current; // calibration gap — hold, don't promote
  // healthy-calibration: promote one step
  if (current === "SOON") return "LATER";
  if (current === "LATER") return "STABLE";
  return "STABLE";
}
