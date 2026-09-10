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
import type { AnswerOptionFixture, FeedbackFixture, JourneyStep, QuestionFixture, RepairCheckFixture } from "../types/content";
import { registry, production, requireDisplayName } from "./registry";
import {
  resolveLesson,
  resolveQuestion,
  resolveFeedback,
  questionMeta,
  recallFamilyIdsFor,
  anchorFamilyIdFor,
  selectFamilyVariant,
  familyVariantsFor,
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
//
// PHASE 10B-1 repair-coverage audit (docs/learning/PHASE-10B1-GATE-RECORD.md):
// of the 10 repair targets actually used across production content, this
// map now carries dedicated content for 8. The remaining 2
// (repair.knowledge-gap, repair.vocabulary-error) are deliberately NOT
// given a fixed static entry here — both are used across many unrelated
// concepts (governance vs. management, SLE/ALE arithmetic, policy-artifact
// hierarchy, risk terminology, etc.), so one fixed drill would necessarily
// be generic. Instead, getRepairCheck() below builds their repair content
// dynamically from the CURRENT lesson's own concept.plain text — reusing
// already-authored curriculum content instead of inventing a synthetic
// quiz that guesses at an arbitrary concept's right/wrong contrast.
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
  },
  "repair.business-context-error": {
    prompt: "Which statement is accurate?",
    options: [
      { key: "a", text: "A technically sound or generally good security practice is the right answer as long as it doesn't conflict with policy.", correct: false, rationale: "" },
      { key: "b", text: "The right answer has to fit the specific business objective, priority, or context the scenario actually describes — not just be generally sound practice.", correct: true, rationale: "" }
    ],
    confirmation: "Security exists to enable the business, not to maximize restriction - tie your answer back to the business context the stem actually gives you."
  },
  "repair.decision-error": {
    prompt: "Which statement is accurate?",
    options: [
      { key: "a", text: "Waiting for more information, staying passive, or treating an unproven assumption as fact can stand in for the decision the scenario actually calls for.", correct: false, rationale: "" },
      { key: "b", text: "A real decision requires acting on the evidence actually given - not deferring indefinitely, staying passive, or jumping to an unsupported conclusion.", correct: true, rationale: "" }
    ],
    confirmation: "Ask what decision the stem is actually calling for right now, based only on what it actually states."
  },
  "repair.lifecycle-error": {
    prompt: "Which statement is accurate?",
    options: [
      { key: "a", text: "A generally correct action is still correct even if the scenario hasn't reached the stage where that action belongs yet.", correct: false, rationale: "" },
      { key: "b", text: "A correct action performed at the wrong lifecycle stage is still the wrong answer - sequence matters as much as the action itself.", correct: true, rationale: "" }
    ],
    confirmation: "A correct action at the wrong stage is still the wrong answer - locate the current stage before picking the action."
  },
  "repair.qualifier-error": {
    prompt: "Which statement is accurate?",
    options: [
      { key: "a", text: "Once you recognize a qualifier like FIRST, NEXT, BEST, MOST, or PRIMARY, the same type of answer is always correct for that qualifier.", correct: false, rationale: "" },
      { key: "b", text: "Each qualifier changes what KIND of answer is being asked for - sequencing, ranking, or fit - and the correct answer still depends on what the stem says has already happened.", correct: true, rationale: "" }
    ],
    confirmation: "Identify what the qualifier is actually asking for, then check it against the stem's own stated facts - never treat a qualifier as a fixed shortcut to one answer."
  },
  "repair.sequence-error": {
    prompt: "Which statement is accurate?",
    options: [
      { key: "a", text: "As long as the eventual action is the right one, the order it happens in doesn't change whether it's correct.", correct: false, rationale: "" },
      { key: "b", text: "An otherwise-correct step taken out of its required order is still the wrong answer at this point in the scenario.", correct: true, rationale: "" }
    ],
    confirmation: "Check what has to happen first before this step is actually appropriate."
  },
  "repair.technical-vs-management-error": {
    prompt: "Which statement is accurate?",
    options: [
      { key: "a", text: "The most technically detailed or complete answer is the right one for a management or governance-level question.", correct: false, rationale: "" },
      { key: "b", text: "A management or governance-level question needs the answer that fits what that audience or role actually needs to decide, not the most technical option available.", correct: true, rationale: "" }
    ],
    confirmation: "'It exists' or 'it's detailed' answers a different question than 'it fits what this audience needs to decide.'"
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

// repair.knowledge-gap and repair.vocabulary-error are used across dozens
// of unrelated concepts (see PHASE-10B1-GATE-RECORD.md's audit) - rather
// than one fixed drill, this builds a repair check that makes the learner
// re-apply the missed distinction to a DIFFERENT concrete scenario, using
// only already-authored question content - never a fabricated quiz.
//
// PHASE 10B-1 FOUNDER HUMAN-EXPERIENCE FINDINGS, in order (see
// PHASE-10B1-GATE-RECORD.md's addenda):
// 1. The first version asked a META question ("does this need a second
//    look?") answerable without any concept understanding at all.
// 2. The second version fixed that by re-presenting the SAME question's
//    own correct option vs. an unselected wrong option - but reusing the
//    SAME scenario meant the "Perspective:" line, read right after the
//    mistake explanation, effectively telegraphed the answer (answer
//    RECOGNITION, not reapplication - "obvious," per direct Founder
//    feedback on the Governance-vs-Management case).
//
// This version performs genuine NEAR TRANSFER instead: it draws its two
// options from a DIFFERENT variant in the SAME family (family.json's
// minimum-3-variant floor guarantees at least one sibling always exists),
// so the learner must classify a scenario they have not just seen
// explained, using the same underlying distinction. Among the available
// siblings, one whose own correct/wrong option text does not literally
// contain the concept's own name-words or a canonical role's display name
// is preferred (a generic, reusable anti-giveaway check against existing
// registry vocabulary, not a new taxonomy) - e.g. it prefers an option
// pair that reads as "approving objectives and budget" vs. "assigning
// staff to projects" over one that reads as "the Board does X," so the
// learner cannot pattern-match a role/seniority keyword instead of
// reasoning about what the activity actually does. If every sibling still
// contains such a term, the lowest-id sibling is used anyway (near
// transfer to a different scenario, even an imperfect one, is still
// strictly harder than re-showing the original scenario). The confirmation
// remains the family's own already-authored `invariant_reasoning` - a
// reasoning CRITERION ("the correct answer always sets direction/
// accountability/oversight, never merely executes") rather than a keyword
// or role shortcut; see PHASE-10B1-GATE-RECORD.md for why this existing,
// curriculum-wide "always/never" phrasing was investigated and found to
// describe a functional test, not an exam-hack shortcut like "Board is
// always correct."
function optionTextRevealsAnswerViaKeyword(text: string, concept: { display_name: string }): boolean {
  const lower = text.toLowerCase();
  const conceptWords = concept.display_name
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 3 && w !== "versus");
  if (conceptWords.some((w) => lower.includes(w))) return true;
  for (const role of registry.roles.values()) {
    const roleNames = (role.display_name as string).split("/").map((s) => s.trim().toLowerCase());
    if (roleNames.some((name) => name.length > 2 && lower.includes(name))) return true;
  }
  return false;
}

function buildAppliedConceptRepair(feedback: FeedbackFixture): RepairCheckFixture | undefined {
  const raw = requireProductionQuestion(feedback.question.id);
  const concept = production.concepts.get(raw.concepts[0] ?? "");
  if (!concept || !raw.family) return undefined;

  const siblings = familyVariantsFor(raw.family)
    .filter((q) => q.id !== raw.id)
    .sort((a, b) => a.id.localeCompare(b.id));
  if (siblings.length === 0) return undefined;

  const siblingOptionPair = (sibling: (typeof siblings)[number]) => {
    const correctOption = sibling.options.find((o) => o.correct);
    const wrongOption = sibling.options.find((o) => !o.correct);
    if (!correctOption || !wrongOption) return undefined;
    return { correctOption, wrongOption };
  };

  const cleanSibling = siblings.find((sibling) => {
    const pair = siblingOptionPair(sibling);
    return (
      pair &&
      !optionTextRevealsAnswerViaKeyword(pair.correctOption.text, concept) &&
      !optionTextRevealsAnswerViaKeyword(pair.wrongOption.text, concept)
    );
  });
  const chosenSibling = cleanSibling ?? siblings[0]!;
  const pair = siblingOptionPair(chosenSibling);
  if (!pair) return undefined;

  const family = production.families.get(raw.family);

  return {
    prompt: `Perspective: ${concept.display_name}. A different situation now - which of these fits?`,
    options: [
      { key: "a", text: pair.wrongOption.text, correct: false, rationale: "" },
      { key: "b", text: pair.correctOption.text, correct: true, rationale: "" }
    ],
    confirmation: family?.invariant_reasoning ?? concept.plain
  };
}

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

/**
 * A short orientation label for the Home snapshot card, generically
 * derived from whichever concept the current lesson teaches — never
 * hard-coded per lesson/domain, so it works unchanged for any future
 * concept. Concept `display_name`s that use a colon as a short-label /
 * elaboration separator (e.g. "Governance effectiveness: structure and
 * activity vs. measured outcome") yield just the short label; a
 * display_name with no colon is already short enough to use as-is. This
 * is deliberately never the same string as `reason` (the main paragraph,
 * sourced from `lesson.objective`) — see the Phase 7C Home UX correction
 * in docs/learning/PHASE-7C-GATE-RECORD.md for why the two were
 * duplicating each other before this function existed.
 */
export function shortConceptLabel(displayName: string): string {
  const colonIndex = displayName.indexOf(":");
  return colonIndex === -1 ? displayName : displayName.slice(0, colonIndex).trim();
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
        focus: concept ? shortConceptLabel(concept.display_name) : domainDisplayName
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

  getRepairCheck(feedback: FeedbackFixture & { repairTargetId?: string }) {
    const repairTargetId = feedback.repairTargetId;
    if (!repairTargetId) return FALLBACK_REPAIR;
    if (repairTargetId === "repair.knowledge-gap" || repairTargetId === "repair.vocabulary-error") {
      const applied = buildAppliedConceptRepair(feedback);
      if (applied) return applied;
    }
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
