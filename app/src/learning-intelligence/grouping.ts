/**
 * LI-2 §7/§8: derives evidence groups for every metadata axis a
 * `QuestionAttemptEvent` reliably carries. Group identity is
 * `${axis}:${targetId}` — a stable, durable, computational key built from
 * real project identifiers (e.g. `concept.d2.risk-treatment-selection`),
 * never a display label. Missing metadata (`null`/empty array) simply
 * contributes to no group for that axis — never inferred, never
 * backfilled, and never penalized (§7's "missing metadata = unavailable"
 * rule, inherited unchanged from LI-1).
 *
 * Pure: reads events, never mutates them; every group's attempt arrays
 * hold references to the original event objects, never copies with
 * altered fields.
 */
import type { QuestionAttemptEvent } from "../learning-history";
import type { Axis, GroupIdentity } from "./types";

export interface RawGroup {
  identity: GroupIdentity;
  /** attemptKind === "apply" — primary/transfer evidence (§6). */
  primaryAttempts: QuestionAttemptEvent[];
  /** attemptKind === "recall" — secondary evidence only (§6/§17). */
  recallAttempts: QuestionAttemptEvent[];
}

function identityFor(axis: Axis, targetId: string): GroupIdentity {
  return { axis, targetId, key: `${axis}:${targetId}` };
}

export function buildGroups(questionAttempts: readonly QuestionAttemptEvent[]): Map<string, RawGroup> {
  const groups = new Map<string, RawGroup>();

  function contribute(axis: Axis, targetId: string | null, event: QuestionAttemptEvent) {
    if (targetId === null) return;
    const identity = identityFor(axis, targetId);
    let group = groups.get(identity.key);
    if (!group) {
      group = { identity, primaryAttempts: [], recallAttempts: [] };
      groups.set(identity.key, group);
    }
    if (event.attemptKind === "apply") group.primaryAttempts.push(event);
    else group.recallAttempts.push(event);
  }

  for (const event of questionAttempts) {
    contribute("domain", event.domain, event);
    for (const conceptId of event.conceptIds) contribute("concept", conceptId, event);
    contribute("family", event.familyId, event);
    for (const patternId of event.patterns) contribute("pattern", patternId, event);
    for (const dimensionId of event.evidenceDimensions) contribute("evidence_dimension", dimensionId, event);
    contribute("qualifier", event.qualifier, event);
    contribute("decision_type", event.decisionType, event);
    // Sparse axes (§7): contributed identically — a group simply never
    // forms for a domain/question that carries no role/lifecycle/stage.
    contribute("role", event.primaryRole, event);
    contribute("lifecycle", event.lifecycle, event);
    contribute("stage", event.stage, event);
  }

  return groups;
}
