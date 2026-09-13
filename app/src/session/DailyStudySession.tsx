import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { RecallScreen } from "../screens/RecallScreen";
import { DailyStudyLearnScreen } from "../screens/DailyStudyLearnScreen";
import { CompletionScreen } from "../screens/CompletionScreen";
import { ReinforcementCompleteScreen } from "../screens/ReinforcementCompleteScreen";
import { QuestionAttemptFlow } from "./QuestionAttemptFlow";
import type { AnswerOptionFixture, QuestionFixture } from "../types/content";
import type { DailyStudyContentSource } from "./contentSource";
import { reinforcementEligibleCount, buildReinforcementSession, type ReinforcementContext } from "../content/reinforcement";
import { conceptForQuestion } from "../content/practice";
import { recordQuestionAttempt, type SourceContext } from "../learning-history";

type Phase = "recall" | "learn" | "attempt" | "completion" | "reinforcement" | "reinforcement-complete";

interface DailyStudySessionProps {
  contentSource: DailyStudyContentSource;
  onDone: () => void;
  // Phase 10B-4: reuses Explore's existing concept routing for
  // Reinforcement's completion "Explore" handoff — the same mechanism
  // Practice's summary already uses (App.tsx's shared handler). Optional:
  // the Phase 5B prototype content source never builds a reinforcement
  // context with a real concept to hand off, so this is simply unused in
  // that mode.
  onExploreConcept?: (conceptId?: string) => void;
  // LI-1: which concrete content source is actually behind `contentSource`
  // — App.tsx's own contentSourceMode toggle. DailyStudySession never
  // otherwise knows this (it's injected as an opaque interface), but
  // Learning Intelligence must tag every recorded event so
  // prototype/QA-sourced attempts never contaminate real evidence (see
  // docs/architecture/LEARNING-INTELLIGENCE-V1.md §25).
  sourceContext: SourceContext;
}

interface ApplyQuestionState {
  question: QuestionFixture;
  meta?: string;
}

interface MissedConcept {
  id: string;
  label: string;
}

/**
 * The controlled, in-memory Daily Study experience: Recall → Learn →
 * Apply → Feedback → (Repair if incorrect) → Completion → optional
 * Reinforcement (Phase 10B-4) → Reinforcement Complete.
 *
 * Reinforcement is deliberately owned here, not as a separate top-level
 * screen/nav destination: it is "an optional extension of the learning
 * session," and its only real input is this exact session's own
 * already-resolved Apply/Recall context (`reinforcement.ts`'s
 * `ReinforcementContext`) — never a persisted or cross-session signal.
 * Completion only offers it when `reinforcementEligibleCount()` is
 * genuinely positive; reaching "reinforcement" builds the short question
 * set once via `buildReinforcementSession()`, reusing the exact same
 * `QuestionAttemptFlow` → Feedback → Repair pipeline the "attempt" phase
 * already uses below.
 *
 * This component is pure session orchestration — it never names a
 * specific lesson, question, family, or exposure-history mechanic.
 * Everything it renders comes from the injected `contentSource`, which
 * may be the Phase 5B prototype fixtures or the production content-loader
 * layer (app/src/content/); the phase state machine and screen sequence
 * are identical either way.
 *
 * Recall and Apply content are resolved exactly once per session: Recall
 * via a lazy useState initializer (Recall is always the first phase, so
 * "on mount" and "on first entering Recall" coincide); Apply inside the
 * "Learn -> Apply" transition handler, not during render — selection (and
 * therefore exposure-recording, in the production content source) is a
 * side effect, and side effects belong in event handlers, not render
 * bodies, so an incidental re-render never double-selects a variant.
 *
 * The Apply -> Feedback -> Repair sub-sequence (Phase 10B-1) is delegated
 * to the shared `QuestionAttemptFlow` primitive rather than owned
 * directly here — this component's own "attempt" phase only resolves
 * which question to show and what "complete" means (advance to
 * Completion), identical to its behavior before that extraction.
 *
 * All state is local useState, reset fresh on every mount — no
 * persistence.
 */
export function DailyStudySession({ contentSource, onDone, onExploreConcept, sourceContext }: DailyStudySessionProps): JSX.Element | null {
  const [phase, setPhase] = useState<Phase>("recall");
  const [recallCheck] = useState(() => contentSource.getRecall());
  const [applyState, setApplyState] = useState<ApplyQuestionState | null>(null);
  const [reinforcementContext, setReinforcementContext] = useState<ReinforcementContext | null>(null);
  const [reinforcementQuestions, setReinforcementQuestions] = useState<QuestionFixture[]>([]);
  const [reinforcementIndex, setReinforcementIndex] = useState(0);
  const [reinforcementMissedConcepts, setReinforcementMissedConcepts] = useState<MissedConcept[]>([]);

  switch (phase) {
    case "recall":
      return (
        <RecallScreen
          recallCheck={recallCheck}
          onContinue={(selectedKey: AnswerOptionFixture["key"], correct: boolean) => {
            const correctOption = recallCheck.options.find((o) => o.correct);
            recordQuestionAttempt({
              learningMode: "daily-study",
              sourceContext,
              attemptKind: "recall",
              questionId: recallCheck.questionId ?? null,
              selectedOptionKey: selectedKey,
              correctOptionKey: correctOption?.key ?? selectedKey,
              correct,
              confidence: null, // LI-1: no new confidence UI added to Recall (architecture §8 of the review)
              repairTargetId: null // Recall has no Repair step
            });
            setPhase("learn");
          }}
        />
      );

    case "learn":
      return (
        <DailyStudyLearnScreen
          lesson={contentSource.getLesson()}
          onApply={() => {
            setApplyState(contentSource.getApplyQuestion());
            setPhase("attempt");
          }}
        />
      );

    case "attempt": {
      if (!applyState) return null;
      return (
        <QuestionAttemptFlow
          question={applyState.question}
          meta={applyState.meta}
          buildFeedback={contentSource.buildFeedback}
          getRepairCheck={contentSource.getRepairCheck}
          learningMode="daily-study"
          sourceContext={sourceContext}
          onComplete={(correct) => {
            // Session-only evidence from exactly this attempt/recall — see
            // reinforcement.ts's own doc comment on why this is never a
            // historical-weakness claim.
            setReinforcementContext({
              primaryQuestionId: applyState.question.id,
              primaryCorrect: correct,
              secondaryQuestionId: recallCheck.questionId
            });
            setPhase("completion");
          }}
        />
      );
    }

    case "completion": {
      const { summary, domainPosition } = contentSource.getCompletion();
      const canReinforce = reinforcementContext ? reinforcementEligibleCount(reinforcementContext) > 0 : false;
      return (
        <CompletionScreen
          summary={summary}
          domainPosition={domainPosition}
          onDone={onDone}
          onReinforce={
            canReinforce
              ? () => {
                  const questions = buildReinforcementSession(reinforcementContext!, 3);
                  setReinforcementQuestions(questions);
                  setReinforcementIndex(0);
                  setReinforcementMissedConcepts([]);
                  setPhase("reinforcement");
                }
              : undefined
          }
        />
      );
    }

    case "reinforcement": {
      const current = reinforcementQuestions[reinforcementIndex];
      if (!current) return null;
      return (
        <QuestionAttemptFlow
          key={current.id}
          question={current}
          meta={`Quick reinforcement · Question ${reinforcementIndex + 1} of ${reinforcementQuestions.length}`}
          buildFeedback={contentSource.buildFeedback}
          getRepairCheck={contentSource.getRepairCheck}
          learningMode="reinforcement"
          sourceContext={sourceContext}
          onComplete={(correct) => {
            if (!correct) {
              const concept = conceptForQuestion(current.id);
              if (concept) {
                setReinforcementMissedConcepts((prev) =>
                  prev.some((existing) => existing.id === concept.id) ? prev : [...prev, concept]
                );
              }
            }
            if (reinforcementIndex + 1 >= reinforcementQuestions.length) {
              setPhase("reinforcement-complete");
            } else {
              setReinforcementIndex((i) => i + 1);
            }
          }}
        />
      );
    }

    case "reinforcement-complete":
      return (
        <ReinforcementCompleteScreen
          questionCount={reinforcementQuestions.length}
          missedConcepts={reinforcementMissedConcepts}
          onDone={onDone}
          onExploreConcept={(conceptId) => onExploreConcept?.(conceptId)}
        />
      );

    default:
      return null;
  }
}
