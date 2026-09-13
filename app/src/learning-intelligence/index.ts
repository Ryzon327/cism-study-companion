/**
 * Public surface of the Learning Intelligence v1 insight engine (LI-2:
 * pure derivation only — no learner-facing surface, no navigation; see
 * docs/architecture/LEARNING-INTELLIGENCE-V1.md §26).
 */
export { deriveLearningInsights } from "./deriveInsights";
export { INSIGHT_ENGINE_VERSION } from "./types";
export type {
  Axis,
  GroupIdentity,
  GroupState,
  ReasonCode,
  ConfidenceSignalType,
  RepairOutcome,
  TrendState,
  EvidenceSummary,
  EvidenceGroup,
  SuggestedActionKind,
  RecommendationCandidate,
  DiagnosticKind,
  Diagnostic,
  InsightResult
} from "./types";

// The one impure call site (§3: "IndexedDB != insight logic") — loads
// events via LI-1's own store, then hands them to the pure engine above.
// Nothing in ./deriveInsights.ts or the modules it composes ever imports
// learningHistoryStore.ts directly.
import { listLearningEvents } from "../learning-history";
import { deriveLearningInsights } from "./deriveInsights";
import type { InsightResult } from "./types";

export async function loadLearningInsights(): Promise<InsightResult> {
  const events = await listLearningEvents();
  return deriveLearningInsights(events);
}
