/**
 * Phase 10B-2: read-only data layer for Explore — "let me understand or
 * revisit something specific," as distinct from Daily Study's "teach me
 * what I should learn next." Deliberately NOT a second content system: it
 * composes small views out of the exact same content/production/ +
 * schema/registry/ data productionContentSource.ts already loads (via
 * `registry`/`production`), and reuses resolve.ts's existing
 * family/variant/question pipeline verbatim for its optional scenario —
 * there is no ExploreQuestionEngine, and Feedback/Repair for that scenario
 * are productionContentSource.buildFeedback/getRepairCheck unchanged (see
 * ExploreScreen.tsx, which passes them straight into the shared
 * QuestionAttemptFlow).
 *
 * Everything here is generic over domain/concept/family ids — no
 * `if (domain === "domain.dN")` branch exists or should ever be added; see
 * tests/frontend/unit/explore.test.ts's synthetic-future-domain coverage.
 */
import { registry, production, requireDisplayName, type ProductionConcept, type ProductionLesson } from "./registry";
import { familyVariantsFor, selectFamilyVariant, resolveQuestion, questionMeta } from "./resolve";
import { getExposureHistory, recordExposure } from "./exposureStore";
import type { QuestionFixture } from "../types/content";

export interface ExploreDomainOption {
  id: string;
  label: string;
  conceptCount: number;
}

export interface ExploreConceptOption {
  id: string;
  label: string;
}

export interface ExploreConceptDetail {
  id: string;
  domainId: string;
  domainLabel: string;
  title: string;
  // concept.plain — the one field every authored concept has. Everything
  // else below is optional because it depends on a teaching lesson
  // existing for this concept, which is not guaranteed (see
  // findTeachingLesson()).
  whatIsThis: string;
  perspective?: string;
  recognitionClue?: string;
  trap?: string;
  memoryRule?: string;
  hasScenario: boolean;
}

// Foundation is instructional preparation, not a fifth exam domain (see
// schema/registry/domains.json's own note on domain.foundation), but it is
// still authored, explorable content — this sorts it first, then the
// numbered exam domains in order, without ever naming a specific domain id.
// A future domain with no trailing digit and exam_domain: true sorts last,
// which only matters once such a domain is both authored AND has concepts,
// at which point this can be revisited.
// Exported for reuse by practice.ts (Phase 10B-3), which needs the same
// Foundation-first-then-numbered-exam-domains ordering for its own scope
// list — one ordering rule, not a second copy of it.
export function domainSortKey(domain: { id: string; exam_domain?: boolean }): number {
  if (domain.exam_domain === false) return -1;
  const match = domain.id.match(/(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

/**
 * Available-content rule (documented per Phase 10B-2 scope): with no
 * persistent learner-progress store, Explore cannot know what a specific
 * learner has actually been taught across sessions — so it does not try
 * to. Every domain/concept that has at least one authored, active
 * production concept is available to explore. This is deliberately
 * broader than Daily Study's own taught-before-tested guarantee (see
 * resolve.ts's recallPoolFor), which is fine: Explore is learner-directed
 * ("something specific I want to revisit"), not a taught-material gate.
 */
export function listExploreDomains(): ExploreDomainOption[] {
  const counts = new Map<string, number>();
  for (const concept of production.concepts.values()) {
    counts.set(concept.home_domain, (counts.get(concept.home_domain) ?? 0) + 1);
  }
  return [...registry.domains.values()]
    .filter((domain) => (counts.get(domain.id) ?? 0) > 0)
    .sort((a, b) => domainSortKey(a) - domainSortKey(b))
    .map((domain) => ({ id: domain.id, label: domain.display_name, conceptCount: counts.get(domain.id) ?? 0 }));
}

export function listExploreConcepts(domainId: string): ExploreConceptOption[] {
  return [...production.concepts.values()]
    .filter((concept) => concept.home_domain === domainId)
    .map((concept) => ({ id: concept.id, label: concept.display_name }));
}

/**
 * The first active lesson that teaches this concept, in authored order.
 * Concept-level fields (`plain`) exist for every concept; lesson-level
 * fields (recognition clues, traps, memory rules, the CISM-perspective
 * framing) exist only for concepts a lesson actually teaches, so a concept
 * authored ahead of its lesson still renders a usable (shorter) review
 * rather than throwing.
 */
function findTeachingLesson(conceptId: string): ProductionLesson | undefined {
  return [...production.lessons.values()].find((lesson) => lesson.active && lesson.concepts.includes(conceptId));
}

/**
 * Concept -> family resolution: the smallest predictable rule that never
 * hardcodes a family id. Some concepts (see a domain's synthesis/capstone
 * family, if one exists) are legitimately covered by more than one active
 * family; this prefers whichever matching family lists the FEWEST
 * concepts — i.e. the family most specifically about this one concept —
 * and falls back to the lowest family id on an exact tie, so the choice is
 * always deterministic and never "random."
 */
function resolveConceptFamily(conceptId: string) {
  const candidates = [...production.families.values()].filter(
    (family) => family.active && family.concepts.includes(conceptId)
  );
  if (candidates.length === 0) return undefined;
  return candidates.sort((a, b) => a.concepts.length - b.concepts.length || a.id.localeCompare(b.id))[0];
}

function conceptHasScenario(conceptId: string): boolean {
  const family = resolveConceptFamily(conceptId);
  return family !== undefined && familyVariantsFor(family.id).length > 0;
}

export function getExploreConceptDetail(conceptId: string): ExploreConceptDetail | undefined {
  const concept: ProductionConcept | undefined = production.concepts.get(conceptId);
  if (!concept) return undefined;
  const lesson = findTeachingLesson(conceptId);
  return {
    id: concept.id,
    domainId: concept.home_domain,
    domainLabel: requireDisplayName(registry.domains, concept.home_domain),
    title: concept.display_name,
    whatIsThis: concept.plain,
    perspective: lesson?.cism_perspective,
    recognitionClue: lesson?.recognition_clues[0],
    trap: lesson?.traps[0],
    memoryRule: lesson?.memory_rules[0],
    hasScenario: conceptHasScenario(conceptId)
  };
}

/**
 * The optional "Try a scenario" question for a concept: concept -> its
 * most specific family (resolveConceptFamily) -> an exposure-aware variant
 * from the SAME shared session exposure store Daily Study already uses
 * (exposureStore.ts) -> the same resolveQuestion() every other caller
 * uses. Returns undefined for a concept with no family or no active
 * variants — callers must treat that as "no scenario available," never
 * fabricate one.
 */
export function getExploreScenarioQuestion(conceptId: string): { question: QuestionFixture; meta?: string } | undefined {
  const family = resolveConceptFamily(conceptId);
  if (!family || familyVariantsFor(family.id).length === 0) return undefined;

  const question = selectFamilyVariant(family.id, getExposureHistory(), Date.now());
  const priorExposures = getExposureHistory().get(question.id)?.count ?? 0;
  recordExposure(question.id);
  return { question: resolveQuestion(question, priorExposures), meta: questionMeta(question, 1, 1) };
}
