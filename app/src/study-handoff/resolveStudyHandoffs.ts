/**
 * LI-4 — resolves a recommendation's target into zero or more real,
 * currently-available study destinations. This is the ONE place LI-4
 * decides "what can the learner actually do about this" — no routing
 * decision is made anywhere else (not in card rendering, not from LI-2's
 * `suggestedActionKind`, which is conceptual recommendation metadata only —
 * see docs/architecture/LI-4-IMPLEMENTATION-RECORD.md's binding routing
 * constraint).
 *
 * Pure and safe: never throws on a stale/unknown target, missing metadata,
 * or sparse role/lifecycle/stage coverage — a target that no longer
 * resolves against current production content simply yields zero handoffs,
 * which falls out of `eligibleQuestionsForTarget`/`production.concepts`
 * lookups naturally returning empty rather than requiring special-cased
 * stale-target logic here.
 */
import { production } from "../content/registry";
import { eligibleQuestionsForTarget } from "../content/practice";
import type { GroupIdentity } from "../learning-intelligence";
import type { PracticeScope, StudyHandoff } from "./types";

/**
 * A family's Review destination is unambiguous only when the family maps
 * to exactly one concept — Explore has no per-family screen, only
 * domain -> concept (see ExploreScreen.tsx). Most authored families are 1:1
 * with a concept today; a handful of domain-synthesis/capstone families
 * (e.g. family.d2.risk-management-synthesis) intentionally span several
 * concepts and must never have one arbitrarily picked for Review — those
 * get Practice only (LI-4 architecture record §15/§41).
 */
function uniqueFamilyConceptId(familyId: string): string | undefined {
  const family = production.families.get(familyId);
  if (!family || !family.active) return undefined;
  return family.concepts.length === 1 ? family.concepts[0] : undefined;
}

function practiceScopeFor(target: GroupIdentity): PracticeScope {
  return target.axis === "domain" ? { kind: "domain", domainId: target.targetId } : { kind: "target", axis: target.axis, targetId: target.targetId };
}

export function resolveStudyHandoffs(target: GroupIdentity): StudyHandoff[] {
  const handoffs: StudyHandoff[] = [];

  if (target.axis === "concept" && production.concepts.has(target.targetId)) {
    handoffs.push({ kind: "review", conceptId: target.targetId });
  } else if (target.axis === "family") {
    const conceptId = uniqueFamilyConceptId(target.targetId);
    if (conceptId) handoffs.push({ kind: "review", conceptId });
  }

  const eligibleQuestionCount = eligibleQuestionsForTarget({ axis: target.axis, targetId: target.targetId }).length;
  if (eligibleQuestionCount > 0) {
    handoffs.push({ kind: "practice", scope: practiceScopeFor(target), eligibleQuestionCount });
  }

  // Keep Focus Next calm (LI-4 architecture record §23): at most one Review
  // and one Practice action can ever exist per the logic above, but this
  // cap is kept explicit rather than merely implied by construction.
  return handoffs.slice(0, 2);
}
