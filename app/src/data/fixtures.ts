/**
 * Local, controlled prototype fixtures for the Phase 5B Visual Prototype
 * Gate. This is deliberately NOT production curriculum and is NOT wired to
 * schema/example/ or schema/registry/ — see app/src/types/content.ts and
 * the Phase 5B report's architectural-decisions section for why.
 *
 * Content here is thematically consistent with the approved learning
 * architecture (docs/learning/) and the canonical data model
 * (docs/data-model/) but is hand-written, illustrative-only prototype text.
 */
import type {
  JourneyStep,
  LessonFixture,
  QuestionFixture,
  AnswerOptionFixture,
  FeedbackFixture,
  ExamQuestionState
} from "../types/content";

export const journeySteps: JourneyStep[] = [
  { id: "foundation", label: "Foundation", state: "completed" },
  { id: "d1", label: "Domain 1", state: "completed" },
  { id: "d2", label: "Domain 2", state: "current" },
  { id: "d3", label: "Domain 3", state: "upcoming" },
  { id: "d4", label: "Domain 4", state: "upcoming" },
  { id: "reinforcement", label: "Adaptive Reinforcement", state: "upcoming" }
];

export const todayFocus = {
  domainLabel: "D2 · Risk Management",
  domainNumeral: "02",
  domainPosition: "Domain 2 of 6",
  title: "Residual risk and treatment decisions",
  reason: "Continuing lifecycle sequencing from yesterday.",
  estimatedMinutes: 25
};

export const lesson: LessonFixture = {
  domainLabel: "Domain 2 · Risk Management",
  conceptTitle: "Residual risk",
  whyItMatters: "It's the number the business actually decides on.",
  context:
    "Once a treatment has been applied to a risk, some exposure almost always remains. " +
    "That remainder — residual risk — is what the accountable risk owner has to judge as " +
    "acceptable or not. Treatment reduces risk; it rarely erases it.",
  pattern: {
    id: "pattern.p13",
    displayName: "Acceptable Risk, Not Zero Risk",
    meaning: "The goal is acceptable risk, not zero risk.",
    recognitionClue: "An option that implies eliminating all risk is almost always a distractor."
  },
  scenario:
    "A control reduces the annualized loss expectancy for a risk from $100,000 to $18,000. " +
    "The risk owner still has to decide whether $18,000 of remaining exposure is acceptable — " +
    "the control did its job, but it didn't make the decision for them.",
  memoryRule: "CISM's risk goal is acceptable residual risk, not zero risk."
};

const sharedOptions = {
  a: { key: "a" as const, text: "The risk owner determines whether the residual risk is acceptable", correct: true,
    rationale: "Once residual risk is known, the accountable risk owner judges whether it falls within acceptable limits." },
  b: { key: "b" as const, text: "Begin ongoing monitoring for changes in the risk", correct: false,
    rationale: "Monitoring is the stage after acceptability has been validated, not before." },
  c: { key: "c" as const, text: "The security manager formally accepts the residual risk on behalf of the enterprise", correct: false,
    rationale: "The security manager can assess and recommend, but formally accepting business risk belongs to the accountable risk owner." },
  d: { key: "d" as const, text: "Run an additional technical vulnerability scan on the affected asset", correct: false,
    rationale: "This is a technical action offered in response to a management-level acceptability decision." }
};

export const applyQuestion: QuestionFixture = {
  id: "proto.q1",
  domainLabel: "Domain 2 · Risk Management",
  prompt:
    "A security manager has applied a treatment to a significant risk and determined the residual " +
    "risk that remains. What should happen NEXT?",
  options: [sharedOptions.a, sharedOptions.b, sharedOptions.c, sharedOptions.d]
};

/**
 * Builds a FeedbackFixture for whichever option the learner actually
 * selected, so the live Daily Study session's feedback always names the
 * real selected answer and its real rationale — not a single hardcoded
 * wrong-answer case. See DailyStudySession.tsx.
 */
export function buildFeedback(selectedKey: AnswerOptionFixture["key"]): FeedbackFixture {
  const selectedOption = applyQuestion.options.find((o) => o.key === selectedKey) ?? sharedOptions.a;
  const correct = selectedOption.correct;
  return {
    question: applyQuestion,
    selectedKey,
    correct,
    why: sharedOptions.a.rationale,
    whySelectedWasWeaker: correct ? undefined : selectedOption.rationale,
    pattern: lesson.pattern,
    qualifier: { label: "NEXT" },
    role: { label: "Risk Owner" },
    lifecycle: [
      { label: "Treat", current: false },
      { label: "Determine Residual Risk", current: false },
      { label: "Validate Acceptability", current: true },
      { label: "Monitor / Reassess", current: false }
    ],
    memoryRule: "Residual risk is known → the risk owner judges acceptability before anything else happens."
  };
}

export const feedbackCorrect: FeedbackFixture = buildFeedback("a");
export const feedbackIncorrect: FeedbackFixture = buildFeedback("c");

// Short cumulative-recall check drawn from an already-completed domain
// (Domain 1 — see journeySteps), shown before new learning so the session
// opens with "I remember this" rather than a fresh quiz. See RecallScreen.
export const recallCheck = {
  domainLabel: "Domain 1 · Governance",
  prompt: "Quick recall from Domain 1 — what ultimately defines whether a security control is “sufficient”?",
  options: [
    { key: "a" as const, text: "Alignment with the organization's risk appetite", correct: true,
      rationale: "Control sufficiency is judged against risk appetite, not an external benchmark." },
    { key: "b" as const, text: "Meeting the highest available industry benchmark", correct: false,
      rationale: "A benchmark is a reference point, not the enterprise's own acceptance criteria." }
  ],
  reinforcement: "Right — CISM ties control sufficiency back to the organization's own risk appetite, not an outside standard."
};

// One controlled prototype repair example — not a general repair engine.
// Targets the specific reasoning slip the Apply question is designed to
// surface (security manager vs. risk owner authority). See RepairScreen.
export const repairCheck = {
  prompt: "Which statement is accurate?",
  options: [
    { key: "a" as const, text: "The security manager can formally accept residual risk on the business's behalf.", correct: false,
      rationale: "" },
    { key: "b" as const, text: "Only the accountable risk owner can formally accept residual risk.", correct: true,
      rationale: "" }
  ],
  confirmation: "That's the distinction to hold onto: the security manager advises, the risk owner decides."
};

export const completionSummary = {
  headline: "Today's study is complete.",
  detail: "Your next session will continue Domain 2 and bring lifecycle sequencing back through recall.",
  optionalLabel: "Optional 5-minute reinforcement",
  coveredItems: [
    "Recalled: control sufficiency is judged against risk appetite",
    "Learned: the goal is acceptable residual risk, not zero risk",
    "Applied: the risk owner validates acceptability, not the security manager"
  ]
};

export const examQuestions: ExamQuestionState[] = Array.from({ length: 12 }, (_, i) => ({
  index: i + 1,
  answered: [0, 1, 2, 4, 5, 7, 9, 10].includes(i),
  marked: [2, 7, 9].includes(i)
}));

export const examCurrentIndex = 3;
