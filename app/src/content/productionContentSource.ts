/**
 * Adapts content/production/ + schema/registry/ to the
 * DailyStudyContentSource interface. This is the ONLY place that knows
 * "today's lesson is lesson.d1.authority-follows-accountability" —
 * DailyStudySession and every screen it renders receive only resolved
 * data, never these IDs, never family IDs, never exposure-history
 * mechanics. No persistence: "today's lesson" is a fixed pointer for this
 * phase, not a scheduling algorithm (Phase 4+ work); exposure history
 * lives in exposureStore.ts, in-memory only, per
 * docs/data-model/REPETITION-AND-RECALL-MODEL.md.
 */
import type { DailyStudyContentSource } from "../session/contentSource";
import type { AnswerOptionFixture, JourneyStep, QuestionFixture, RepairCheckFixture } from "../types/content";
import { registry, production, requireDisplayName } from "./registry";
import {
  resolveLesson,
  resolveQuestion,
  resolveFeedback,
  questionMeta,
  recallFamilyIdsFor,
  anchorFamilyIdFor,
  selectFamilyVariant,
  requireProductionLesson,
  requireProductionQuestion
} from "./resolve";
import { getExposureHistory, recordExposure } from "./exposureStore";
import { orderOptionsForDisplay } from "./answerOrder";

// The single candidate lesson this phase's Daily Study teaches. Its
// `prerequisites` field (see content/production/lessons.json) is what
// recallFamilyIdsFor() walks to find taught-before material — changing
// this pointer to a lesson with different prerequisites automatically
// changes what Recall is allowed to draw from, with no other code change.
//
// Mutable (not a const) so the dev-only PrototypeSwitcher QA panel can let
// a human reviewer preview any production lesson as "today's lesson" —
// see setTodaysLessonIdForReview() below. This is still not a scheduler:
// there is no calendar, no persistence, and the default below is what any
// real learner session uses; only the QA panel can change it, and only for
// the current in-memory session.
const DEFAULT_TODAYS_LESSON_ID = "lesson.d1.authority-follows-accountability";
let todaysLessonId = DEFAULT_TODAYS_LESSON_ID;

/**
 * QA-only. Lets the dev-only PrototypeSwitcher panel (never learner-facing
 * navigation) preview any production lesson's full Recall -> Learn ->
 * Apply -> Feedback -> Repair -> Completion flow as "today's lesson," so a
 * human reviewer can walk a teaching sequence (e.g. the Phase 7B-1 D1-U1 ->
 * U2 -> U3 -> U4 slice) one lesson at a time without a real scheduler or
 * persistence. See docs/data-model/PHASE-6C-GATE-RECORD.md and the
 * Phase 7B-1 implementation report for how this is used in manual review.
 */
export function setTodaysLessonIdForReview(lessonId: string): void {
  todaysLessonId = lessonId;
}

export function getTodaysLessonIdForReview(): string {
  return todaysLessonId;
}

// Small, targeted corrective content per diagnosed reasoning failure —
// not a re-teach of the lesson. Lives here (not content/production/)
// because it is presentation-adjacent repair *interaction* content, not
// curriculum data with its own referential/provenance shape — see the
// Phase 6B report's explicit rationale for this decision.
const REPAIR_CONTENT: Record<string, RepairCheckFixture> = {
  "repair.authority-error": {
    prompt: "Which statement is accurate?",
    options: [
      { key: "a", text: "Whoever identifies and recommends a fix also holds authority to accept the associated risk.", correct: false, rationale: "" },
      { key: "b", text: "Decision authority belongs to whoever is accountable for the outcome, even if someone else identified the issue.", correct: true, rationale: "" }
    ],
    confirmation: "That's the distinction to hold onto: identifying and recommending is not the same as deciding."
  },
  "repair.role-error": {
    prompt: "Which statement is accurate?",
    options: [
      { key: "a", text: "Internal Audit can decide whether to accept a business risk it identifies during review.", correct: false, rationale: "" },
      { key: "b", text: "Internal Audit's role is independent assessment and reporting — not owning or deciding the risks it reviews.", correct: true, rationale: "" }
    ],
    confirmation: "That's the distinction to hold onto: independent assurance is a different role from decision authority."
  }
};

const FALLBACK_REPAIR: RepairCheckFixture = {
  prompt: "Which statement is accurate?",
  options: [
    { key: "a", text: "The reasoning shown in the explanation above does not need to be reapplied elsewhere.", correct: false, rationale: "" },
    { key: "b", text: "The same reasoning applies whenever a similar scenario appears.", correct: true, rationale: "" }
  ],
  confirmation: "Carry that reasoning forward to the next scenario that looks like this one."
};

// Same six-step scaffold app/src/data/fixtures.ts's approved Phase 5B
// Journey already uses (id/label unchanged) — only `state` differs here,
// derived generically from ORDER, not a special case per domain. A stage's
// state is relative to the current QA lesson's domain position in this
// fixed sequence: stages before it are "completed" (a truthful statement
// about ordered CURRICULUM POSITION — Domain 1 content is sequenced after
// Foundation, so if Domain 1 is current, Foundation's position has
// necessarily already passed), the stage matching the current domain is
// "current", and every later stage is "upcoming". This is still not a
// real persisted learner-progress/mastery model (see the Phase 7B-3 gate
// record's Home/Journey-mismatch entry) — it never claims a real learner
// actually mastered anything, only where the app's current QA lesson sits
// in the fixed curriculum sequence. Extends to any future domain with no
// per-domain conditional: see getHomeState()'s ordered comparison below.
const JOURNEY_STEP_DEFS: { id: string; label: string; domainId: string | null }[] = [
  { id: "foundation", label: "Foundation", domainId: "domain.foundation" },
  { id: "d1", label: "Domain 1", domainId: "domain.d1" },
  { id: "d2", label: "Domain 2", domainId: "domain.d2" },
  { id: "d3", label: "Domain 3", domainId: "domain.d3" },
  { id: "d4", label: "Domain 4", domainId: "domain.d4" },
  { id: "reinforcement", label: "Adaptive Reinforcement", domainId: null }
];

/**
 * Pure, generic ordered-position derivation — deliberately independent of
 * any specific domain id so it can never become a per-domain special
 * case. Exported so its generalization to domains with no authored
 * curriculum yet (Domain 2, Domain 3, ...) can be proven directly, without
 * needing real lesson content for those domains to exist first — see
 * tests/frontend/unit/production-content.test.tsx's "future Domain 2/3"
 * coverage.
 */
export function deriveJourneySteps(currentDomainId: string | null): JourneyStep[] {
  const currentStepIndex = JOURNEY_STEP_DEFS.findIndex((s) => s.domainId === currentDomainId);
  return JOURNEY_STEP_DEFS.map((step, i) => ({
    id: step.id,
    label: step.label,
    state: i < currentStepIndex ? "completed" : i === currentStepIndex ? "current" : "upcoming"
  }));
}

export const productionContentSource: DailyStudyContentSource = {
  getHomeState() {
    const lesson = requireProductionLesson(todaysLessonId);
    const concept = production.concepts.get(lesson.concepts[0] ?? "");
    const domain = registry.domains.get(lesson.domain);
    const currentStepIndex = JOURNEY_STEP_DEFS.findIndex((s) => s.domainId === lesson.domain);
    // d1..d4 happen to sit at array indices 1..4, so the index doubles as
    // the domain's own number with no separate parsing of the domain id.
    const domainNumber = currentStepIndex >= 1 && currentStepIndex <= 4 ? currentStepIndex : null;

    const journeySteps = deriveJourneySteps(lesson.domain);

    const domainDisplayName = domain?.display_name ?? lesson.domain;
    return {
      journeySteps,
      todayFocus: {
        domainLabel: domainNumber !== null ? `D${domainNumber} · ${domainDisplayName}` : domainDisplayName,
        domainNumeral: domainNumber !== null ? String(domainNumber).padStart(2, "0") : "—",
        domainPosition:
          domainNumber !== null
            ? `Domain ${domainNumber} of ${JOURNEY_STEP_DEFS.length}`
            : `${domainDisplayName} of ${JOURNEY_STEP_DEFS.length}`,
        title: concept?.display_name ?? lesson.objective,
        reason: lesson.objective,
        estimatedMinutes: 25
      }
    };
  },

  getRecall() {
    const familyIds = recallFamilyIdsFor(todaysLessonId);
    const familyId = familyIds[0];
    if (!familyId) {
      throw new Error(
        `No recall-eligible family for ${todaysLessonId} — its lesson has no taught prerequisite whose retrieval question belongs to a family.`
      );
    }
    const recallQuestion = selectFamilyVariant(familyId, getExposureHistory(), Date.now());
    // Read the exposure count BEFORE recording this exposure — it seeds
    // this exposure's answer-order permutation (see answerOrder.ts). Reuses
    // the same per-question counter exposureStore already tracks for
    // variant rotation; a separate, unrelated concern from which variant
    // was selected above.
    const priorExposures = getExposureHistory().get(recallQuestion.id)?.count ?? 0;
    recordExposure(recallQuestion.id);

    const orderedOptions = orderOptionsForDisplay(recallQuestion.options, recallQuestion.id, priorExposures);
    const correctOption = recallQuestion.options.find((o) => o.correct);
    return {
      domainLabel: requireDisplayName(registry.domains, recallQuestion.domain),
      prompt: recallQuestion.prompt,
      options: orderedOptions.map((o) => ({ key: o.key, text: o.text, correct: o.correct, rationale: o.rationale })),
      reinforcement: correctOption?.rationale ?? recallQuestion.explanation
    };
  },

  getLesson() {
    return resolveLesson(todaysLessonId);
  },

  getApplyQuestion() {
    const lesson = requireProductionLesson(todaysLessonId);
    const familyId = anchorFamilyIdFor(todaysLessonId);

    const question = familyId
      ? selectFamilyVariant(familyId, getExposureHistory(), Date.now())
      : requireProductionQuestion(lesson.retrieval_refs[0] ?? "");

    const priorExposures = getExposureHistory().get(question.id)?.count ?? 0;
    recordExposure(question.id);
    return { question: resolveQuestion(question, priorExposures), meta: questionMeta(question, 1, 1) };
  },

  buildFeedback(question: QuestionFixture, selectedKey: AnswerOptionFixture["key"]) {
    // `question` is the exact resolved fixture DailyStudySession received
    // from getApplyQuestion() and has been carrying forward — including
    // its display order for this attempt. Reuse it verbatim (attempt
    // stability: Feedback/Repair must show options in the identical
    // position the learner just chose from), and separately fetch the raw
    // entity for correctness/rationale/repair-target lookups by semantic
    // key, which resolve correctly regardless of display order.
    const raw = requireProductionQuestion(question.id);
    return resolveFeedback(raw, question, selectedKey);
  },

  getRepairCheck(repairTargetId?: string) {
    if (!repairTargetId) return FALLBACK_REPAIR;
    return REPAIR_CONTENT[repairTargetId] ?? FALLBACK_REPAIR;
  },

  getCompletion() {
    const lesson = requireProductionLesson(todaysLessonId);
    const familyIds = recallFamilyIdsFor(todaysLessonId);
    const recalledFamily = familyIds[0] ? production.families.get(familyIds[0]) : undefined;
    const concept = production.concepts.get(lesson.concepts[0] ?? "");
    const domain = registry.domains.get(lesson.domain);
    return {
      summary: {
        headline: "Today's study is complete.",
        detail: "Your next session will continue building on today's reasoning and bring it back through recall.",
        optionalLabel: "Optional 5-minute reinforcement",
        coveredItems: [
          recalledFamily ? `Recalled: ${recalledFamily.teaching_objective}` : "",
          `Learned: ${lesson.memory_rules[0] ?? lesson.objective}`,
          `Applied: ${concept?.plain ?? lesson.objective}`
        ].filter(Boolean)
      },
      domainPosition: domain ? `${domain.display_name} · candidate content` : ""
    };
  }
};
