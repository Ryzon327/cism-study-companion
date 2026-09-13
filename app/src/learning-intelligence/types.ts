/**
 * LI-2 — Deterministic Insight Engine types.
 *
 * Per docs/architecture/LEARNING-INTELLIGENCE-V1.md and the Architect's
 * LI-2 review: pure, explainable evidence derived from immutable
 * LearningEvent history. No opaque score, no AI inference — every
 * classification is backed by a typed reason-code list and a structured
 * evidence summary a future LI-3 surface can turn into learner language.
 *
 * `insightEngineVersion` is independent of `eventSchemaVersion` (LI-1),
 * the IndexedDB structural version, and any app version — it versions
 * ONLY this derivation logic, so a future rule change never requires
 * touching a stored event.
 */
export const INSIGHT_ENGINE_VERSION = 1 as const;

export type Axis =
  | "domain"
  | "concept"
  | "family"
  | "pattern"
  | "evidence_dimension"
  | "qualifier"
  | "decision_type"
  | "role"
  | "lifecycle"
  | "stage";

/** Stable computational identity — never a display label. */
export interface GroupIdentity {
  axis: Axis;
  targetId: string;
  /** `${axis}:${targetId}` — the durable key used for lookups, dedup, and tie-breaking. */
  key: string;
}

export type GroupState = "NOT_ENOUGH_EVIDENCE" | "NEEDS_REVIEW" | "DEVELOPING" | "STRONGER_EVIDENCE";

export type ReasonCode =
  | "INSUFFICIENT_ATTEMPTS"
  | "INSUFFICIENT_BREADTH"
  | "REPEATED_MISSES"
  | "REPEATED_SURE_MISSES"
  | "REPAIR_STILL_MISSED"
  | "RECENT_STRONG_PERFORMANCE"
  | "SUCCESSFUL_CORRECTION"
  | "LOW_CONFIDENCE_CORRECT"
  | "IMPROVING_RECENTLY";

export type ConfidenceSignalType = "HIGH_CONFIDENCE_INCORRECT" | "LOW_CONFIDENCE_CORRECT" | "HIGH_CONFIDENCE_CORRECT";

export type RepairOutcome = "CORRECTED_ON_REPAIR" | "REPAIR_STILL_MISSED";

/** `null` means insufficient longitudinal evidence to compute a trend at all. */
export type TrendState = "IMPROVING" | "MIXED_DEVELOPING" | "NEEDS_REVIEW" | null;

/**
 * `primaryAttemptCount`, `distinctQuestionCount`, `successfulRepairCount`,
 * `failedRepairCount`, `recallCorrectCount`, `recallIncorrectCount`, and
 * `lastAttemptAt` are ALL-TIME aggregates for this group. `recentPrimaryCount`
 * through `unresolvedRecentIncorrectCount` are scoped to the bounded recent
 * primary window (§9 of the architecture review — last 6 eligible Apply
 * attempts, or fewer if fewer exist) that classification actually runs
 * against — see classification.ts.
 */
export interface EvidenceSummary {
  primaryAttemptCount: number;
  distinctQuestionCount: number;
  recentPrimaryCount: number;
  recentCorrectCount: number;
  recentIncorrectCount: number;
  sureIncorrectCount: number;
  lowConfidenceCorrectCount: number;
  /** Distinct questionIds among this window's low-confidence-correct attempts — Architect LI-2 follow-up §1's breadth check. */
  lowConfidenceCorrectDistinctQuestionCount: number;
  /**
   * Architect LI-2 follow-up §1: `recentIncorrectCount` minus any recent
   * incorrect attempt that was CORRECTED_ON_REPAIR — a miss the learner
   * demonstrably resolved must never, by itself, keep a group
   * recommendation-eligible. Used only by recommendation eligibility
   * (recommendations.ts); classification state/reason codes are untouched.
   */
  unresolvedRecentIncorrectCount: number;
  successfulRepairCount: number;
  failedRepairCount: number;
  recallCorrectCount: number;
  recallIncorrectCount: number;
  lastAttemptAt: number | null;
}

export interface EvidenceGroup {
  identity: GroupIdentity;
  state: GroupState;
  reasonCodes: ReasonCode[];
  trend: TrendState;
  evidence: EvidenceSummary;
}

export type SuggestedActionKind = "REVIEW_CONCEPT" | "PRACTICE_CONCEPT" | "PRACTICE_DOMAIN" | "REVIEW_PATTERN";

/**
 * Everything LI-3 needs to explain "why am I seeing this" and "what
 * should I do next" — never rendered UX prose. LI-2 identifies the
 * appropriate future action only conceptually; LI-4 owns real navigation.
 */
export interface RecommendationCandidate {
  target: GroupIdentity;
  state: GroupState;
  reasonCodes: ReasonCode[];
  evidenceSummary: EvidenceSummary;
  suggestedActionKind: SuggestedActionKind;
}

export type DiagnosticKind = "ORPHAN_REPAIR" | "UNSUPPORTED_SCHEMA_VERSION" | "MALFORMED_EVENT";

export interface Diagnostic {
  kind: DiagnosticKind;
  eventId: string;
  detail: string;
}

export interface InsightResult {
  insightEngineVersion: typeof INSIGHT_ENGINE_VERSION;
  groups: EvidenceGroup[];
  recommendations: RecommendationCandidate[];
  diagnostics: Diagnostic[];
}
