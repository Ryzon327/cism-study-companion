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

export interface FamilyBalancedCandidate {
  id: string;
  family?: string | null;
}

export interface FamilyBalancedSelectionResult {
  selectedIds: string[];
  history: ExposureHistory;
}

/**
 * Pure core of the round-robin, family-balanced session builder shared by
 * ordinary Practice (content/practice.ts's `buildSessionFromPool`) and Exam
 * Readiness's question-set builder (exam-readiness/questionSetBuilder.ts):
 * buckets `pool` by family (an id with no family buckets alone, keyed by
 * its own id, so it's never silently dropped), then draws up to
 * `requestedCount` round-robin across buckets via `selectVariant`'s
 * unseen-preferred/least-recently-seen policy. Takes and returns an
 * explicit `ExposureHistory` rather than touching any store — same inputs
 * always produce the same `selectedIds`, so callers with entirely separate
 * exposure histories (ordinary Practice's shared store vs. Exam Readiness's
 * own, deliberately separate history) can both use this one algorithm
 * without either ever reading or writing the other's state.
 */
export function selectFamilyBalancedIds(
  pool: readonly FamilyBalancedCandidate[],
  requestedCount: number,
  history: ExposureHistory,
  now: number
): FamilyBalancedSelectionResult {
  if (pool.length === 0 || requestedCount <= 0) {
    return { selectedIds: [], history };
  }

  const buckets = new Map<string, Set<string>>();
  for (const candidate of pool) {
    const bucketKey = candidate.family ?? `__solo__:${candidate.id}`;
    if (!buckets.has(bucketKey)) buckets.set(bucketKey, new Set());
    buckets.get(bucketKey)!.add(candidate.id);
  }
  const bucketList = [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  let workingHistory = history;
  const selectedIds: string[] = [];

  while (selectedIds.length < requestedCount) {
    let pickedAnyThisRound = false;
    for (const [, remaining] of bucketList) {
      if (selectedIds.length >= requestedCount) break;
      if (remaining.size === 0) continue;
      const candidateId = selectVariant([...remaining], workingHistory, now);
      remaining.delete(candidateId);
      selectedIds.push(candidateId);
      workingHistory = recordExposure(workingHistory, candidateId, now);
      pickedAnyThisRound = true;
    }
    if (!pickedAnyThisRound) break; // every bucket's variants are exhausted
  }

  return { selectedIds, history: workingHistory };
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
