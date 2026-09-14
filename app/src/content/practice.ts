/**
 * Phase 10B-3: read-only data layer for Practice — "test me deliberately on
 * material I've already learned," as distinct from Explore's "let me
 * understand or revisit something specific" and Daily Study's "teach me
 * what I should learn next." Deliberately NOT a second content system and
 * NOT a PracticeQuestionEngine: it composes the exact same
 * content/production/ + schema/registry/ data explore.ts and
 * productionContentSource.ts already load, reuses resolve.ts's existing
 * family/variant/question pipeline verbatim, and reuses the shared session
 * exposure store (exposureStore.ts) — the same one Daily Study and Explore
 * already write to. Feedback/Repair for a Practice question are
 * productionContentSource.buildFeedback/getRepairCheck unchanged (see
 * PracticeScreen.tsx).
 *
 * Generic over any domain/family/question id — no `if (domain === "domain.dN")`
 * branch exists or should ever be added; see
 * tests/frontend/unit/practice.test.ts's synthetic-future-domain coverage.
 */
import { registry, production, requireDisplayName, type ProductionQuestion } from "./registry";
import { familyVariantsFor, resolveQuestion, requireProductionQuestion } from "./resolve";
import { selectFamilyBalancedIds } from "./selection";
import { getExposureHistory, recordExposure } from "./exposureStore";
import { domainSortKey } from "./explore";
import type { QuestionFixture } from "../types/content";

export const ALL_SCOPE_ID = "all";

export interface PracticeScopeOption {
  id: string;
  label: string;
  eligibleQuestionCount: number;
}

export interface PracticeCountOption {
  count: number;
  available: boolean;
}

// The same candidate amounts for every scope — a fixed, small set, not a
// configuration system. Availability (not the list itself) varies by scope.
const CANDIDATE_COUNTS = [5, 10];

/**
 * A family is eligible for Practice when it's active and has at least one
 * active variant to actually draw from — an authored family with zero
 * variants is a content-authoring gap (see resolve.ts's
 * selectFamilyVariant), never something Practice should offer or crash on.
 */
function eligibleFamilies(scopeId: string) {
  return [...production.families.values()]
    .filter((family) => family.active && (scopeId === ALL_SCOPE_ID || family.domain === scopeId))
    .filter((family) => familyVariantsFor(family.id).length > 0)
    .sort((a, b) => a.id.localeCompare(b.id));
}

function totalEligibleQuestions(scopeId: string): number {
  return eligibleFamilies(scopeId).reduce((sum, family) => sum + familyVariantsFor(family.id).length, 0);
}

/**
 * Available-content rule (same one approved for Explore, Phase 10B-2):
 * with no persistent per-learner history, Practice cannot know what a
 * learner has actually studied across sessions, so a domain is offered the
 * moment it has at least one currently authored, active, non-empty
 * question family — generically derived from `family.domain`, never a
 * hardcoded domain id. Domain 3/4 appear automatically once their own
 * families exist.
 */
export function listPracticeScopes(): PracticeScopeOption[] {
  const allFamilies = eligibleFamilies(ALL_SCOPE_ID);
  const domainIds = [...new Set(allFamilies.map((family) => family.domain))].sort(
    (a, b) => domainSortKey(registry.domains.get(a) ?? { id: a }) - domainSortKey(registry.domains.get(b) ?? { id: b })
  );

  const domainScopes = domainIds.map((domainId) => ({
    id: domainId,
    label: requireDisplayName(registry.domains, domainId),
    eligibleQuestionCount: totalEligibleQuestions(domainId)
  }));

  return [
    { id: ALL_SCOPE_ID, label: "All available material", eligibleQuestionCount: totalEligibleQuestions(ALL_SCOPE_ID) },
    ...domainScopes
  ];
}

export function getPracticeCountOptions(scopeId: string): PracticeCountOption[] {
  const total = totalEligibleQuestions(scopeId);
  return CANDIDATE_COUNTS.map((count) => ({ count, available: total >= count }));
}

/**
 * Builds one bounded Practice session: up to `requestedCount` questions,
 * round-robining across every eligible family (in a stable, deterministic
 * order) so a short session draws from varied concepts rather than
 * repeatedly hitting the same one, and so no question id can appear twice
 * in the same session (each id is removed from its family's remaining pool
 * the moment it's chosen). If fewer unique questions exist than requested,
 * returns as many as are truthfully available — it never fabricates a
 * question or pads with a repeat merely to hit the requested count.
 *
 * Selection reuses selection.ts's own pure `selectVariant` (unseen-
 * preferred, least-recently-seen fallback) seeded from the real shared
 * exposure history, threading a local working copy through the round-robin
 * so each pick is aware of picks already made earlier in the same
 * construction — then commits real exposure for the whole session via the
 * same `exposureStore.ts` singleton Daily Study and Explore already write
 * to (one shared store, not a second `practiceExposureStore`).
 */
/**
 * Shared round-robin session builder: buckets a pool of eligible questions
 * (already filtered by whatever scope/target the caller resolved) by
 * family — questions with no family bucket alone, keyed by their own id, so
 * they're never silently dropped from the round-robin — then draws up to
 * `requestedCount` via the same unseen-preferred/least-recently-seen
 * `selectVariant` policy every other learning mode uses. Both domain-scoped
 * `buildPracticeSession` and axis-targeted `buildTargetedPracticeSession`
 * (LI-4) call this one function — there is exactly one session-construction
 * algorithm, never two.
 */
function buildSessionFromPool(pool: ProductionQuestion[], requestedCount: number): QuestionFixture[] {
  if (pool.length === 0 || requestedCount <= 0) return [];

  const now = Date.now();
  const { selectedIds } = selectFamilyBalancedIds(pool, requestedCount, getExposureHistory(), now);

  const priorExposureSnapshot = getExposureHistory();
  return selectedIds.map((id) => {
    const raw = requireProductionQuestion(id);
    const priorExposures = priorExposureSnapshot.get(id)?.count ?? 0;
    recordExposure(id);
    return resolveQuestion(raw, priorExposures);
  });
}

export function buildPracticeSession(scopeId: string, requestedCount: number): QuestionFixture[] {
  const families = eligibleFamilies(scopeId);
  const pool = families.flatMap((family) => familyVariantsFor(family.id));
  return buildSessionFromPool(pool, requestedCount);
}

/**
 * LI-4 — targeted Practice. `axis`/`targetId` mirror LI-2's `GroupIdentity`
 * exactly (see study-handoff/resolveStudyHandoffs.ts): the eligibility test
 * below is CURRENT production question metadata only — never a historical
 * LearningEvent snapshot, and never inferred when a field is null/empty.
 * `"domain"` is included for completeness/testing but real domain handoffs
 * route through the existing `buildPracticeSession(domainId, ...)` above
 * instead (LI-4 architecture record §14) — this function is the one new
 * addition for every other axis, not a second domain-filter implementation.
 */
export type PracticeTargetAxis = "domain" | "concept" | "family" | "pattern" | "evidence_dimension" | "qualifier" | "decision_type" | "role" | "lifecycle" | "stage";

export interface PracticeTarget {
  axis: PracticeTargetAxis;
  targetId: string;
}

function questionMatchesTarget(question: ProductionQuestion, target: PracticeTarget): boolean {
  switch (target.axis) {
    case "domain":
      return question.domain === target.targetId;
    case "concept":
      return question.concepts.includes(target.targetId);
    case "family":
      return question.family === target.targetId;
    case "pattern":
      return question.patterns.includes(target.targetId);
    case "evidence_dimension":
      return question.evidence_dimensions.includes(target.targetId);
    case "qualifier":
      return question.qualifier === target.targetId;
    case "decision_type":
      return question.decision_type === target.targetId;
    case "role":
      return question.primary_role === target.targetId;
    case "lifecycle":
      return question.lifecycle === target.targetId;
    case "stage":
      return question.stage === target.targetId;
  }
}

/**
 * Every active, current production question matching `target` — the single
 * source of truth for "what can be studied now" for any non-domain axis.
 * Never includes prototype/QA content (this reads only `production.*`, the
 * same registry Explore/Practice/Daily Study already use) and never
 * includes an inactive/superseded question.
 */
export function eligibleQuestionsForTarget(target: PracticeTarget): ProductionQuestion[] {
  return [...production.questions.values()].filter((question) => question.active && questionMatchesTarget(question, target));
}

const TARGETED_CANDIDATE_BASE_COUNTS = [5, 10];

/**
 * Same shape as `getPracticeCountOptions`, but bounded to what a narrow
 * target actually has: when the eligible pool is smaller than every fixed
 * candidate (a single concept or a sparse cross-cutting axis may only have
 * a handful of current questions), the pool's own true size is offered as a
 * real, startable option instead of leaving the learner with nothing
 * available — never padded with a repeat to reach 5/10 (LI-4 architecture
 * record §17/§27).
 */
export function getTargetedPracticeCountOptions(target: PracticeTarget): PracticeCountOption[] {
  const total = eligibleQuestionsForTarget(target).length;
  if (total <= 0) return [];
  const candidateCounts = new Set<number>([...TARGETED_CANDIDATE_BASE_COUNTS.filter((count) => count <= total), total]);
  return [...candidateCounts].sort((a, b) => a - b).map((count) => ({ count, available: true }));
}

/** Same round-robin session engine as `buildPracticeSession` (`buildSessionFromPool`), scoped to `target` instead of a domain. */
export function buildTargetedPracticeSession(target: PracticeTarget, requestedCount: number): QuestionFixture[] {
  return buildSessionFromPool(eligibleQuestionsForTarget(target), requestedCount);
}

/** The concept a resolved Practice question tests — used only after an
 * answer, for the session summary's truthful "review these" list. Never
 * shown before or during the question itself (Practice is deliberately
 * less scaffolded than Explore). */
export function conceptForQuestion(questionId: string): { id: string; label: string } | undefined {
  const raw = requireProductionQuestion(questionId);
  const conceptId = raw.concepts[0];
  if (!conceptId) return undefined;
  const concept = production.concepts.get(conceptId);
  if (!concept) return undefined;
  return { id: concept.id, label: concept.display_name };
}
