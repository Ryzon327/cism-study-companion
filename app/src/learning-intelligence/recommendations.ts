/**
 * LI-2 §21-§25, refined by the Architect's LI-2 decision follow-up:
 * structured recommendation CANDIDATES — never rendered, never navigated
 * (LI-3/LI-4 own that).
 *
 * Two-phase eligibility (Architect follow-up §1): NEEDS_REVIEW is the
 * primary recommendation state and is always processed first, in full
 * (overlap-reduced and ranked). Only if fewer than 3 NEEDS_REVIEW
 * candidates survive that pass are DEVELOPING groups considered at all —
 * and only those carrying real, unresolved actionable evidence; a
 * successful Repair can never, by itself, make a DEVELOPING group
 * recommendation-eligible (a corrected miss is evidence of benefiting
 * from correction, not of ongoing difficulty).
 */
import { distinctConceptCount } from "./windows";
import type { RawGroup } from "./grouping";
import type { Axis, EvidenceGroup, RecommendationCandidate, SuggestedActionKind } from "./types";

const MAX_RECOMMENDATIONS = 3;

// §22, as refined: target-priority order — lower number wins an overlap
// tie. Role/lifecycle/stage now sit above only the broad Domain fallback,
// per the Architect's final ordering; Domain remains the last resort.
const AXIS_PRIORITY: Record<Axis, number> = {
  concept: 0,
  family: 1,
  pattern: 2,
  qualifier: 3,
  decision_type: 3,
  evidence_dimension: 4,
  role: 5,
  lifecycle: 5,
  stage: 5,
  domain: 6
};

const ACTION_KIND_BY_AXIS: Record<Axis, SuggestedActionKind> = {
  concept: "REVIEW_CONCEPT",
  family: "PRACTICE_CONCEPT",
  pattern: "REVIEW_PATTERN",
  qualifier: "REVIEW_PATTERN",
  decision_type: "REVIEW_PATTERN",
  evidence_dimension: "REVIEW_PATTERN",
  domain: "PRACTICE_DOMAIN",
  role: "PRACTICE_DOMAIN",
  lifecycle: "PRACTICE_DOMAIN",
  stage: "PRACTICE_DOMAIN"
};

// §23, as refined: pattern/qualifier/decision_type/role/lifecycle/stage
// recommendations all require breadth across concepts — a one-concept
// issue on any of these axes is a concept issue, not a cross-cutting one.
// (concept/family/evidence_dimension/domain carry no such requirement.)
const AXES_REQUIRING_CROSS_CONCEPT_BREADTH = new Set<Axis>(["pattern", "qualifier", "decision_type", "role", "lifecycle", "stage"]);
const CROSS_CUTTING_MIN_DISTINCT_CONCEPTS = 2;

const LOW_CONFIDENCE_CORRECT_MIN_COUNT = 2;
const LOW_CONFIDENCE_CORRECT_MIN_DISTINCT_QUESTIONS = 2;

/**
 * Architect LI-2 follow-up §1, condition B: a DEVELOPING group is only
 * considered at all when it carries real, UNRESOLVED actionable evidence —
 * at least one recent incorrect attempt that was NOT corrected on Repair,
 * or at least 2 low-confidence-correct attempts spanning 2+ distinct
 * questions (fragile-but-correct knowledge, a different actionable signal
 * entirely). A group whose only recent incorrect attempt was successfully
 * repaired satisfies neither condition and is never eligible.
 */
function hasUnresolvedActionableEvidence(group: EvidenceGroup): boolean {
  if (group.evidence.unresolvedRecentIncorrectCount >= 1) return true;
  return (
    group.evidence.lowConfidenceCorrectCount >= LOW_CONFIDENCE_CORRECT_MIN_COUNT &&
    group.evidence.lowConfidenceCorrectDistinctQuestionCount >= LOW_CONFIDENCE_CORRECT_MIN_DISTINCT_QUESTIONS
  );
}

function passesCrossCuttingBreadth(group: EvidenceGroup, rawGroups: ReadonlyMap<string, RawGroup>): boolean {
  if (!AXES_REQUIRING_CROSS_CONCEPT_BREADTH.has(group.identity.axis)) return true;
  const raw = rawGroups.get(group.identity.key);
  return !!raw && distinctConceptCount(raw.primaryAttempts) >= CROSS_CUTTING_MIN_DISTINCT_CONCEPTS;
}

function attemptIdSet(raw: RawGroup | undefined): Set<string> {
  return new Set(raw ? raw.primaryAttempts.map((a) => a.attemptId) : []);
}

function isFullyExplainedBy(candidateAttempts: Set<string>, alreadyCoveredAttempts: ReadonlySet<string>): boolean {
  if (candidateAttempts.size === 0) return false;
  for (const id of candidateAttempts) {
    if (!alreadyCoveredAttempts.has(id)) return false;
  }
  return true;
}

function rankKey(candidate: RecommendationCandidate): [number, number, number, number, number, number, string] {
  const stateSeverity = candidate.state === "NEEDS_REVIEW" ? 0 : 1; // NEEDS_REVIEW before DEVELOPING
  return [
    stateSeverity,
    -candidate.evidenceSummary.failedRepairCount,
    -candidate.evidenceSummary.sureIncorrectCount,
    -candidate.evidenceSummary.recentIncorrectCount,
    -candidate.evidenceSummary.distinctQuestionCount,
    -(candidate.evidenceSummary.lastAttemptAt ?? 0),
    candidate.target.key // stable final tie-break
  ];
}

function compareRank(a: RecommendationCandidate, b: RecommendationCandidate): number {
  const keyA = rankKey(a);
  const keyB = rankKey(b);
  for (let i = 0; i < keyA.length; i++) {
    const va = keyA[i]!;
    const vb = keyB[i]!;
    if (va < vb) return -1;
    if (va > vb) return 1;
  }
  return 0;
}

/** Overlap-reduces a pool (already in target-priority order) against a starting covered-set, mutating a copy of it. */
function overlapReduce(
  poolInPriorityOrder: readonly EvidenceGroup[],
  rawGroups: ReadonlyMap<string, RawGroup>,
  initiallyCovered: ReadonlySet<string>
): { candidates: RecommendationCandidate[]; covered: Set<string> } {
  const covered = new Set(initiallyCovered);
  const candidates: RecommendationCandidate[] = [];
  for (const group of poolInPriorityOrder) {
    const attempts = attemptIdSet(rawGroups.get(group.identity.key));
    if (isFullyExplainedBy(attempts, covered)) continue;
    for (const id of attempts) covered.add(id);
    candidates.push({
      target: group.identity,
      state: group.state,
      reasonCodes: group.reasonCodes,
      evidenceSummary: group.evidence,
      suggestedActionKind: ACTION_KIND_BY_AXIS[group.identity.axis]
    });
  }
  return { candidates, covered };
}

function byPriorityThenKey(groups: readonly EvidenceGroup[]): EvidenceGroup[] {
  return [...groups].sort((a, b) => AXIS_PRIORITY[a.identity.axis] - AXIS_PRIORITY[b.identity.axis] || a.identity.key.localeCompare(b.identity.key));
}

export function buildRecommendations(groups: readonly EvidenceGroup[], rawGroups: ReadonlyMap<string, RawGroup>): RecommendationCandidate[] {
  // Phase 1 — NEEDS_REVIEW, always eligible, always processed first.
  const needsReviewPool = byPriorityThenKey(groups.filter((g) => g.state === "NEEDS_REVIEW" && passesCrossCuttingBreadth(g, rawGroups)));
  const { candidates: needsReviewCandidates, covered } = overlapReduce(needsReviewPool, rawGroups, new Set());
  const rankedNeedsReview = needsReviewCandidates.sort(compareRank);
  const cappedNeedsReview = rankedNeedsReview.slice(0, MAX_RECOMMENDATIONS);

  if (cappedNeedsReview.length >= MAX_RECOMMENDATIONS) {
    return cappedNeedsReview;
  }

  // Phase 2 — DEVELOPING may only fill remaining slots, and only with
  // groups carrying real unresolved actionable evidence (Architect
  // follow-up §1). Overlap-reduced against everything NEEDS_REVIEW already
  // covers, so a Developing group fully explained by an accepted
  // NEEDS_REVIEW candidate is never redundantly added.
  const developingPool = byPriorityThenKey(
    groups.filter((g) => g.state === "DEVELOPING" && hasUnresolvedActionableEvidence(g) && passesCrossCuttingBreadth(g, rawGroups))
  );
  const { candidates: developingCandidates } = overlapReduce(developingPool, rawGroups, covered);
  const rankedDeveloping = developingCandidates.sort(compareRank);

  const remainingSlots = MAX_RECOMMENDATIONS - cappedNeedsReview.length;
  return [...cappedNeedsReview, ...rankedDeveloping.slice(0, remainingSlots)];
}
