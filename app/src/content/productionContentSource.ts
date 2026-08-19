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
import type { AnswerOptionFixture, QuestionFixture, RepairCheckFixture } from "../types/content";
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

// The single candidate lesson this phase's Daily Study teaches. Its
// `prerequisites` field (see content/production/lessons.json) is what
// recallFamilyIdsFor() walks to find taught-before material — changing
// this pointer to a lesson with different prerequisites automatically
// changes what Recall is allowed to draw from, with no other code change.
const TODAYS_LESSON_ID = "lesson.d1.authority-follows-accountability";

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

export const productionContentSource: DailyStudyContentSource = {
  getRecall() {
    const familyIds = recallFamilyIdsFor(TODAYS_LESSON_ID);
    const familyId = familyIds[0];
    if (!familyId) {
      throw new Error(
        `No recall-eligible family for ${TODAYS_LESSON_ID} — its lesson has no taught prerequisite whose retrieval question belongs to a family.`
      );
    }
    const recallQuestion = selectFamilyVariant(familyId, getExposureHistory(), Date.now());
    recordExposure(recallQuestion.id);

    const correctOption = recallQuestion.options.find((o) => o.correct);
    return {
      domainLabel: requireDisplayName(registry.domains, recallQuestion.domain),
      prompt: recallQuestion.prompt,
      options: recallQuestion.options.map((o) => ({ key: o.key, text: o.text, correct: o.correct, rationale: o.rationale })),
      reinforcement: correctOption?.rationale ?? recallQuestion.explanation
    };
  },

  getLesson() {
    return resolveLesson(TODAYS_LESSON_ID);
  },

  getApplyQuestion() {
    const lesson = requireProductionLesson(TODAYS_LESSON_ID);
    const familyId = anchorFamilyIdFor(TODAYS_LESSON_ID);

    const question = familyId
      ? selectFamilyVariant(familyId, getExposureHistory(), Date.now())
      : requireProductionQuestion(lesson.retrieval_refs[0] ?? "");

    recordExposure(question.id);
    return { question: resolveQuestion(question), meta: questionMeta(question, 1, 1) };
  },

  buildFeedback(question: QuestionFixture, selectedKey: AnswerOptionFixture["key"]) {
    // `question` is the exact variant DailyStudySession received from
    // getApplyQuestion() and is carrying forward — re-resolve the raw
    // entity by its id rather than re-deriving "today's" question, so
    // feedback always matches whichever variant was actually shown.
    const raw = requireProductionQuestion(question.id);
    return resolveFeedback(raw, selectedKey);
  },

  getRepairCheck(repairTargetId?: string) {
    if (!repairTargetId) return FALLBACK_REPAIR;
    return REPAIR_CONTENT[repairTargetId] ?? FALLBACK_REPAIR;
  },

  getCompletion() {
    const lesson = requireProductionLesson(TODAYS_LESSON_ID);
    const familyIds = recallFamilyIdsFor(TODAYS_LESSON_ID);
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
