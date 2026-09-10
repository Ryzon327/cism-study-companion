/**
 * Phase 10B-4: read-only data layer for Optional Reinforcement — "give me
 * a very short retrieval boost on what I just learned," strictly scoped to
 * the CURRENT Daily Study session's own already-resolved context (the
 * lesson's Apply question and Recall question). Never claims historical
 * weakness, never inspects a prior browser session, never persists
 * anything.
 *
 * Deliberately NOT a second content system and NOT a
 * ReinforcementQuestionEngine: composes the same content/production/ data
 * every other mode loads, reuses resolve.ts's/selection.ts's existing
 * family/variant pipeline verbatim, and commits to the same shared session
 * exposure store Daily Study/Explore/Practice already write to. Feedback/
 * Repair for a reinforcement question are productionContentSource's
 * buildFeedback/getRepairCheck unchanged (see DailyStudySession.tsx, which
 * passes them straight into the shared QuestionAttemptFlow).
 */
import { production } from "./registry";
import { familyVariantsFor, resolveQuestion, requireProductionQuestion } from "./resolve";
import { selectVariant, recordExposure as advanceHistory, type ExposureHistory } from "./selection";
import { getExposureHistory, recordExposure } from "./exposureStore";
import type { QuestionFixture } from "../types/content";

/**
 * Session-only evidence from the Daily Study attempt/recall the learner
 * just completed — never anything from a prior session, never persisted.
 * `secondaryQuestionId` is optional because not every content source can
 * supply one (see RecallCheckFixture's own doc comment); Reinforcement
 * still works with just the primary question when it's absent.
 */
export interface ReinforcementContext {
  primaryQuestionId: string;
  primaryCorrect: boolean;
  secondaryQuestionId?: string;
}

/**
 * Unlike `requireProductionQuestion()`, never throws: the context's
 * question ids come from whichever `DailyStudyContentSource` is active,
 * and the Phase 5B prototype fixture source uses its own non-production
 * ids (e.g. "proto.q1") that intentionally don't resolve here. Treating
 * that as "no reinforcement content available" (this function's callers
 * all handle `undefined`) rather than throwing is exactly the "invalid
 * context fails safely" behavior this phase requires.
 */
function safeProductionQuestion(id: string) {
  return production.questions.get(id);
}

function candidateFamilyIds(context: ReinforcementContext): string[] {
  const primaryFamily = safeProductionQuestion(context.primaryQuestionId)?.family;
  const secondaryFamily = context.secondaryQuestionId
    ? safeProductionQuestion(context.secondaryQuestionId)?.family
    : undefined;
  const ids: string[] = [];
  // Primary (the concept the lesson just taught and tested) always leads —
  // most relevant regardless of correctness; a sibling variant of it is
  // near-transfer either way. Secondary (the recall question's own family,
  // prior material this session also touched) follows, when it resolves
  // to a real, different family.
  if (primaryFamily) ids.push(primaryFamily);
  if (secondaryFamily && secondaryFamily !== primaryFamily) ids.push(secondaryFamily);
  return ids.filter((id) => production.families.get(id)?.active);
}

/** The exact ids just seen this Daily Study session — never re-offered,
 * even if that leaves a candidate family with nothing else to contribute. */
function justSeenIds(context: ReinforcementContext): Set<string> {
  const ids = [context.primaryQuestionId];
  if (context.secondaryQuestionId) ids.push(context.secondaryQuestionId);
  return new Set(ids);
}

function eligibleIdsByFamily(context: ReinforcementContext): Map<string, Set<string>> {
  const seen = justSeenIds(context);
  const map = new Map<string, Set<string>>();
  for (const familyId of candidateFamilyIds(context)) {
    const remaining = new Set(
      familyVariantsFor(familyId)
        .map((q) => q.id)
        .filter((id) => !seen.has(id))
    );
    if (remaining.size > 0) map.set(familyId, remaining);
  }
  return map;
}

/**
 * Cheap, side-effect-free: how many genuinely eligible (never-just-seen)
 * questions Reinforcement could actually offer right now. Used by
 * CompletionScreen to decide whether to show the action at all — never by
 * committing exposure merely to check.
 */
export function reinforcementEligibleCount(context: ReinforcementContext): number {
  let total = 0;
  for (const ids of eligibleIdsByFamily(context).values()) total += ids.size;
  return total;
}

/**
 * Builds one short Reinforcement set: up to `requestedCount` questions,
 * round-robining across the (at most two) candidate families in priority
 * order, using selection.ts's own pure `selectVariant`/`recordExposure`
 * threaded through a local working history seeded from the real shared
 * store — then commits real exposure via the same `exposureStore.ts`
 * singleton every other mode writes to. Never repeats a question the
 * learner just saw this session, and never pads or fabricates to reach
 * `requestedCount` — a family with no eligible alternative simply
 * contributes nothing, and the set is truthfully shorter (or empty) when
 * that leaves too little material.
 */
export function buildReinforcementSession(context: ReinforcementContext, requestedCount: number): QuestionFixture[] {
  const remainingByFamily = eligibleIdsByFamily(context);
  if (remainingByFamily.size === 0 || requestedCount <= 0) return [];

  const familyOrder = candidateFamilyIds(context).filter((id) => remainingByFamily.has(id));
  const now = Date.now();
  let workingHistory: ExposureHistory = getExposureHistory();
  const selectedIds: string[] = [];

  while (selectedIds.length < requestedCount) {
    let pickedAnyThisRound = false;
    for (const familyId of familyOrder) {
      if (selectedIds.length >= requestedCount) break;
      const remaining = remainingByFamily.get(familyId)!;
      if (remaining.size === 0) continue;
      const candidateId = selectVariant([...remaining], workingHistory, now);
      remaining.delete(candidateId);
      selectedIds.push(candidateId);
      workingHistory = advanceHistory(workingHistory, candidateId, now);
      pickedAnyThisRound = true;
    }
    if (!pickedAnyThisRound) break;
  }

  const priorExposureSnapshot = getExposureHistory();
  return selectedIds.map((id) => {
    const raw = requireProductionQuestion(id);
    const priorExposures = priorExposureSnapshot.get(id)?.count ?? 0;
    recordExposure(id);
    return resolveQuestion(raw, priorExposures);
  });
}
