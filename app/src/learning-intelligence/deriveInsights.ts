/**
 * LI-2 §30: the one pure entry point — `deriveLearningInsights(events)`.
 * No IndexedDB, no wall clock, no randomness; the same `events` array
 * always produces the same `InsightResult` (§29). Never mutates `events`
 * or any event inside it (§28) — every helper below only reads.
 */
import { isQuestionAttemptEvent, isRepairAttemptEvent, type LearningEvent, type QuestionAttemptEvent, type RepairAttemptEvent } from "../learning-history";
import { filterEligibleEvents } from "./eligibility";
import { buildGroups } from "./grouping";
import { buildRepairIndex } from "./repairLinkage";
import { classifyGroup } from "./classification";
import { buildRecommendations } from "./recommendations";
import { INSIGHT_ENGINE_VERSION, type InsightResult } from "./types";

export function deriveLearningInsights(events: readonly LearningEvent[]): InsightResult {
  const { eligible, diagnostics: eligibilityDiagnostics } = filterEligibleEvents(events);

  const questionAttempts: QuestionAttemptEvent[] = eligible.filter(isQuestionAttemptEvent);
  const repairAttempts: RepairAttemptEvent[] = eligible.filter(isRepairAttemptEvent);

  const { index: repairIndex, diagnostics: repairDiagnostics } = buildRepairIndex(questionAttempts, repairAttempts);

  const rawGroups = buildGroups(questionAttempts);
  const groups = [...rawGroups.values()]
    .map((raw) => classifyGroup(raw, repairIndex))
    .sort((a, b) => a.identity.key.localeCompare(b.identity.key));

  const recommendations = buildRecommendations(groups, rawGroups);

  return {
    insightEngineVersion: INSIGHT_ENGINE_VERSION,
    groups,
    recommendations,
    diagnostics: [...eligibilityDiagnostics, ...repairDiagnostics]
  };
}
