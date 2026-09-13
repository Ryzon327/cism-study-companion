/**
 * Snapshots the reliable question metadata needed to interpret a historical
 * attempt later, AT THE TIME OF THE ATTEMPT — per
 * docs/architecture/LEARNING-INTELLIGENCE-V1.md §7/§14/§25: a later
 * curriculum edit or content-status promotion must never silently
 * reinterpret what a stored event actually measured.
 *
 * Only ever reads `production.questions` (never throws on a missing
 * question — recording must not crash the study flow). Sparse fields
 * (primary_role, lifecycle, stage — see the architecture's §8 population
 * table) are preserved as-authored: null/empty stays null/empty, never
 * inferred or backfilled. A "prototype" sourceContext, or an unresolvable
 * questionId, yields the same "unavailable" snapshot — the Phase 5B
 * prototype fixtures carry no production metadata to snapshot at all.
 */
import { production } from "../content/registry";
import type { SourceContext } from "./types";

export interface QuestionMetadataSnapshot {
  familyId: string | null;
  conceptIds: string[];
  domain: string | null;
  patterns: string[];
  qualifier: string | null;
  primaryRole: string | null;
  lifecycle: string | null;
  stage: string | null;
  decisionType: string | null;
  evidenceDimensions: string[];
  contentStatusAtAttempt: string | null;
}

function unavailableMetadata(): QuestionMetadataSnapshot {
  return {
    familyId: null,
    conceptIds: [],
    domain: null,
    patterns: [],
    qualifier: null,
    primaryRole: null,
    lifecycle: null,
    stage: null,
    decisionType: null,
    evidenceDimensions: [],
    contentStatusAtAttempt: null
  };
}

export function snapshotQuestionMetadata(questionId: string | null, sourceContext: SourceContext): QuestionMetadataSnapshot {
  if (!questionId || sourceContext !== "production") return unavailableMetadata();
  const raw = production.questions.get(questionId);
  if (!raw) return unavailableMetadata();
  return {
    familyId: raw.family ?? null,
    conceptIds: raw.concepts,
    domain: raw.domain,
    patterns: raw.patterns,
    qualifier: raw.qualifier,
    primaryRole: raw.primary_role,
    lifecycle: raw.lifecycle,
    stage: raw.stage,
    decisionType: raw.decision_type,
    evidenceDimensions: raw.evidence_dimensions,
    contentStatusAtAttempt: raw.content_status
  };
}
