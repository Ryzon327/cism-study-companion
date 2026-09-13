/**
 * LI-3 presentation layer — turns LI-2's structured, ID-based
 * `InsightResult` into calm, learner-facing copy. Deliberately separate
 * from `app/src/learning-intelligence/` (the pure engine, untouched here)
 * and from `InsightsScreen.tsx` (the component that renders this output).
 * Every function here is pure: given the same `InsightResult`, it always
 * produces the same presentation.
 *
 * No raw ID, reason-code identifier, engine-version number, JSON, or
 * timestamp is ever put in a string this module returns — see
 * docs/architecture/LI-3-IMPLEMENTATION-RECORD.md's display-resolution
 * and evidence-detail sections.
 */
import { registry, production } from "../content/registry";
import type { Axis, EvidenceSummary, GroupIdentity, GroupState, InsightResult, ReasonCode, TrendState } from "../learning-intelligence";
import { resolveStudyHandoffs } from "../study-handoff/resolveStudyHandoffs";
import type { StudyHandoff } from "../study-handoff/types";
import lifecycles from "../../../schema/registry/lifecycles.json";
import lifecycleStages from "../../../schema/registry/lifecycle-stages.json";

interface NamedEntity {
  id: string;
  display_name: string;
}

const lifecyclesById = new Map((lifecycles as NamedEntity[]).map((l) => [l.id, l]));
const stagesById = new Map((lifecycleStages as NamedEntity[]).map((s) => [s.id, s]));

const UNKNOWN_TARGET_FALLBACK = "A previously studied topic";

export interface DisplayLabel {
  label: string;
  isUnknownTarget: boolean;
}

/**
 * §10/§11 of the LI-3 brief: resolve a stable LI-2 identity into a
 * trusted, already-authored display name — never the raw ID. A target no
 * longer present in current metadata (e.g. superseded content) degrades
 * to a restrained, truthful fallback rather than crashing or leaking the
 * implementation ID as the primary label. The raw ID is preserved on
 * `GroupIdentity` itself for any future internal/debugging need — this
 * function just never puts it in front of a learner.
 */
export function resolveDisplayLabel(identity: GroupIdentity): DisplayLabel {
  const { axis, targetId } = identity;
  switch (axis) {
    case "domain": {
      const entity = registry.domains.get(targetId);
      return entity ? { label: entity.display_name as string, isUnknownTarget: false } : unknown();
    }
    case "concept": {
      const entity = production.concepts.get(targetId);
      return entity ? { label: entity.display_name, isUnknownTarget: false } : unknown();
    }
    case "family": {
      const entity = production.families.get(targetId);
      return entity ? { label: entity.display_name, isUnknownTarget: false } : unknown();
    }
    case "pattern": {
      const entity = registry.patterns.get(targetId);
      return entity ? { label: entity.display_name as string, isUnknownTarget: false } : unknown();
    }
    case "evidence_dimension": {
      const entity = registry.evidenceDimensions.get(targetId);
      return entity ? { label: entity.display_name as string, isUnknownTarget: false } : unknown();
    }
    case "decision_type": {
      const entity = registry.decisionTypes.get(targetId);
      return entity ? { label: entity.display_name as string, isUnknownTarget: false } : unknown();
    }
    case "role": {
      const entity = registry.roles.get(targetId);
      return entity ? { label: entity.display_name as string, isUnknownTarget: false } : unknown();
    }
    case "qualifier": {
      const entity = registry.qualifiers.get(targetId);
      return entity ? { label: `${entity.display_name as string} questions`, isUnknownTarget: false } : unknown();
    }
    case "lifecycle": {
      const entity = lifecyclesById.get(targetId);
      return entity ? { label: entity.display_name, isUnknownTarget: false } : unknown();
    }
    case "stage": {
      const entity = stagesById.get(targetId);
      return entity ? { label: entity.display_name, isUnknownTarget: false } : unknown();
    }
    default:
      return unknown();
  }
}

function unknown(): DisplayLabel {
  return { label: UNKNOWN_TARGET_FALLBACK, isUnknownTarget: true };
}

/** §12: only these three states are ever shown to a learner. NOT_ENOUGH_EVIDENCE is handled at the screen level (empty states), never as a per-card label. */
export function stateLabel(state: GroupState): string {
  switch (state) {
    case "NEEDS_REVIEW":
      return "Needs review";
    case "DEVELOPING":
      return "Developing";
    case "STRONGER_EVIDENCE":
      return "Stronger evidence";
    case "NOT_ENOUGH_EVIDENCE":
      return "Not enough evidence yet";
  }
}

/** §13: one factual, non-diagnostic line per reason code — never psychological language. */
export function reasonCodeCopy(code: ReasonCode): string {
  switch (code) {
    case "REPEATED_MISSES":
      return "You missed multiple recent questions on this topic.";
    case "REPEATED_SURE_MISSES":
      return "Some of those misses were answered with Sure confidence.";
    case "REPAIR_STILL_MISSED":
      return "A related Repair question was also missed.";
    case "LOW_CONFIDENCE_CORRECT":
      return "You answered correctly, but confidence has remained low.";
    case "IMPROVING_RECENTLY":
      return "Your recent answers are improving.";
    case "SUCCESSFUL_CORRECTION":
      return "You corrected an earlier miss during Repair.";
    case "RECENT_STRONG_PERFORMANCE":
      return "Your recent performance has been consistently strong across different scenarios.";
    case "INSUFFICIENT_ATTEMPTS":
    case "INSUFFICIENT_BREADTH":
      // Never shown per-card (§12) — these back the screen-level empty
      // states instead. Included here only so the switch stays exhaustive.
      return "Not enough evidence yet.";
  }
}

/** §17: the one place a Sure+incorrect pattern gets a brief, non-diagnostic explanatory line — never "you are overconfident." */
const SURE_MISMATCH_EXPLANATION = "That can be a useful sign to slow down and check the decision rule before committing to an answer.";

/** §14: concise, plain-language evidence lines — never raw counters, window names, timestamps, or JSON. */
export function evidenceLines(evidence: EvidenceSummary, reasonCodes: readonly ReasonCode[]): string[] {
  const lines: string[] = [];

  if (evidence.recentPrimaryCount > 0) {
    const missedPart = evidence.recentIncorrectCount > 0 ? ` · ${evidence.recentIncorrectCount} missed` : "";
    lines.push(`${evidence.recentPrimaryCount} recent attempt${evidence.recentPrimaryCount === 1 ? "" : "s"}${missedPart}`);
  }

  if (evidence.sureIncorrectCount > 0) {
    lines.push(`${evidence.sureIncorrectCount} miss${evidence.sureIncorrectCount === 1 ? "" : "es"} answered with Sure confidence`);
    lines.push(SURE_MISMATCH_EXPLANATION);
  }

  if (reasonCodes.includes("SUCCESSFUL_CORRECTION")) {
    lines.push("Corrected successfully during Repair.");
  } else if (evidence.failedRepairCount > 0) {
    lines.push("A related Repair attempt was also missed.");
  }

  if (evidence.recentPrimaryCount > 0 && evidence.recentCorrectCount > 0 && evidence.distinctQuestionCount > 1) {
    lines.push(
      `${evidence.recentCorrectCount} of your last ${evidence.recentPrimaryCount} were correct across ${evidence.distinctQuestionCount} different questions`
    );
  }

  return lines;
}

/**
 * LI-4 — real, target-specific action wording. Deliberately independent of
 * LI-2's `suggestedActionKind` (conceptual metadata only, not authoritative
 * navigation — see docs/architecture/LI-4-IMPLEMENTATION-RECORD.md's
 * binding routing constraint): every label here is derived from the axis
 * that `resolveStudyHandoffs` actually resolved a real destination for,
 * never a generic "Go"/"Open"/"Fix weakness."
 */
function reviewActionLabel(): string {
  return "Review topic";
}

function practiceActionLabel(axis: Axis, displayLabel: string): string {
  switch (axis) {
    case "concept":
    case "family":
      return "Practice this topic";
    case "pattern":
      return "Practice this pattern";
    case "qualifier":
      return `Practice ${displayLabel}`;
    case "domain":
      return "Practice this domain";
    case "decision_type":
    case "evidence_dimension":
    case "role":
    case "lifecycle":
    case "stage":
      return "Practice this reasoning focus";
  }
}

export interface RecommendationActionPresentation {
  handoff: StudyHandoff;
  label: string;
  /** Distinct accessible name per card (§37 of the LI-4 brief) — several cards may share the visible label "Practice this topic." */
  ariaLabel: string;
}

export interface RecommendationPresentation {
  key: string;
  axis: Axis;
  targetId: string;
  displayLabel: string;
  isUnknownTarget: boolean;
  state: "NEEDS_REVIEW" | "DEVELOPING";
  stateLabel: string;
  whyLines: string[];
  evidenceLines: string[];
  /** 0–2 real, currently-available handoffs — never a broken/disabled action for a stale or unresolvable target. */
  actions: RecommendationActionPresentation[];
}

/** §9/§15: LI-2 already ranked and capped at 3 — this only formats and resolves real handoffs (LI-4). */
export function buildFocusNext(insights: InsightResult): RecommendationPresentation[] {
  return insights.recommendations.map((candidate) => {
    const display = resolveDisplayLabel(candidate.target);
    const handoffs = resolveStudyHandoffs(candidate.target);
    const actions: RecommendationActionPresentation[] = handoffs.map((handoff) => {
      const label = handoff.kind === "review" ? reviewActionLabel() : practiceActionLabel(candidate.target.axis, display.label);
      return { handoff, label, ariaLabel: `${label}: ${display.label}` };
    });
    return {
      key: candidate.target.key,
      axis: candidate.target.axis,
      targetId: candidate.target.targetId,
      displayLabel: display.label,
      isUnknownTarget: display.isUnknownTarget,
      state: candidate.state as "NEEDS_REVIEW" | "DEVELOPING",
      stateLabel: stateLabel(candidate.state),
      whyLines: candidate.reasonCodes.map(reasonCodeCopy),
      evidenceLines: evidenceLines(candidate.evidenceSummary, candidate.reasonCodes),
      actions
    };
  });
}

export interface StrongerAreaPresentation {
  key: string;
  displayLabel: string;
  isUnknownTarget: boolean;
}

const STRONGER_AREA_AXIS_PRIORITY: Record<GroupIdentity["axis"], number> = {
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

const MAX_STRONGER_AREAS = 3;

/**
 * §19/§20: a presentation-only redundancy reduction — LI-2's
 * `EvidenceGroup` does not expose underlying attempt IDs, so true
 * attempt-level overlap reduction (as `recommendations.ts` does) isn't
 * reproducible here without a genuine LI-2 change (out of LI-3 scope,
 * §43). Instead: prefer the most specific, most learner-useful axes
 * (concept/family first), and once at least one such entry exists, the
 * inherently-broader `domain` axis is dropped entirely — the one
 * redundancy case the brief's own example names (concept + family +
 * domain describing the same evidence). This never alters which groups
 * LI-2 classified as STRONGER_EVIDENCE, only which are shown together.
 */
export function buildStrongerAreas(insights: InsightResult): StrongerAreaPresentation[] {
  const strong = insights.groups.filter((g) => g.state === "STRONGER_EVIDENCE");
  const hasSpecific = strong.some((g) => g.identity.axis !== "domain");
  const filtered = hasSpecific ? strong.filter((g) => g.identity.axis !== "domain") : strong;

  const sorted = [...filtered].sort(
    (a, b) =>
      STRONGER_AREA_AXIS_PRIORITY[a.identity.axis] - STRONGER_AREA_AXIS_PRIORITY[b.identity.axis] ||
      b.evidence.primaryAttemptCount - a.evidence.primaryAttemptCount ||
      a.identity.key.localeCompare(b.identity.key)
  );

  return sorted.slice(0, MAX_STRONGER_AREAS).map((group) => {
    const display = resolveDisplayLabel(group.identity);
    return { key: group.identity.key, displayLabel: display.label, isUnknownTarget: display.isUnknownTarget };
  });
}

export interface TrendPresentation {
  key: string;
  displayLabel: string;
  trendLabel: string;
}

/** §18: only for groups whose trend is genuinely known (non-null) and not already shown in Focus Next. */
export function trendDisplayLabel(trend: TrendState): string | null {
  switch (trend) {
    case "IMPROVING":
      return "Improving";
    case "MIXED_DEVELOPING":
      return "Mixed / Developing";
    case "NEEDS_REVIEW":
      return "Needs review";
    case null:
      return null;
  }
}

const MAX_TREND_SUMMARIES = 2;

export function buildTrendSummaries(insights: InsightResult, excludeKeys: ReadonlySet<string>): TrendPresentation[] {
  const withTrend = insights.groups.filter((g) => g.trend !== null && !excludeKeys.has(g.identity.key));
  const sorted = [...withTrend].sort((a, b) => a.identity.key.localeCompare(b.identity.key));
  return sorted.slice(0, MAX_TREND_SUMMARIES).map((group) => {
    const display = resolveDisplayLabel(group.identity);
    return { key: group.identity.key, displayLabel: display.label, trendLabel: trendDisplayLabel(group.trend) ?? "" };
  });
}

/** §21: secondary, subtle, only when one domain clearly dominates current concern — never a percentage dashboard. */
export function domainSummaryLine(insights: InsightResult): string | null {
  const domainConcerns = insights.groups.filter(
    (g) => g.identity.axis === "domain" && (g.state === "NEEDS_REVIEW" || g.state === "DEVELOPING")
  );
  if (domainConcerns.length === 0) return null;
  const [top] = [...domainConcerns].sort((a, b) => b.evidence.recentIncorrectCount - a.evidence.recentIncorrectCount || a.identity.key.localeCompare(b.identity.key));
  if (!top) return null;
  const display = resolveDisplayLabel(top.identity);
  return `Most of your current focus areas are in ${display.label}.`;
}

export type InsightsStatus = "loading" | "error" | "no-history" | "insufficient-evidence" | "ready";

export interface InsightsViewModel {
  status: InsightsStatus;
  focusNext: RecommendationPresentation[];
  strongerAreas: StrongerAreaPresentation[];
  trendSummaries: TrendPresentation[];
  domainSummary: string | null;
}

/** §6/§7: distinguishes "genuinely no history" from "some history, not enough evidence" from "ready" — the screen-level empty-state logic lives here, not scattered across the component. */
export function buildInsightsViewModel(insights: InsightResult): InsightsViewModel {
  const hasAnyPrimaryAttempts = insights.groups.some((g) => g.evidence.primaryAttemptCount > 0);
  const focusNext = buildFocusNext(insights);
  const strongerAreas = buildStrongerAreas(insights);

  if (!hasAnyPrimaryAttempts) {
    return { status: "no-history", focusNext: [], strongerAreas: [], trendSummaries: [], domainSummary: null };
  }

  if (focusNext.length === 0 && strongerAreas.length === 0) {
    return { status: "insufficient-evidence", focusNext: [], strongerAreas: [], trendSummaries: [], domainSummary: null };
  }

  const excludeKeys = new Set(focusNext.map((f) => f.key));
  return {
    status: "ready",
    focusNext,
    strongerAreas,
    trendSummaries: buildTrendSummaries(insights, excludeKeys),
    domainSummary: domainSummaryLine(insights)
  };
}
