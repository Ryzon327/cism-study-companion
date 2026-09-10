import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { RecallScreen } from "../screens/RecallScreen";
import { DailyStudyLearnScreen } from "../screens/DailyStudyLearnScreen";
import { CompletionScreen } from "../screens/CompletionScreen";
import { QuestionAttemptFlow } from "./QuestionAttemptFlow";
import type { QuestionFixture } from "../types/content";
import type { DailyStudyContentSource } from "./contentSource";

type Phase = "recall" | "learn" | "attempt" | "completion";

interface DailyStudySessionProps {
  contentSource: DailyStudyContentSource;
  onDone: () => void;
}

interface ApplyQuestionState {
  question: QuestionFixture;
  meta?: string;
}

/**
 * The controlled, in-memory Daily Study experience: Recall → Learn →
 * Apply → Feedback → (Repair if incorrect) → Completion.
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
export function DailyStudySession({ contentSource, onDone }: DailyStudySessionProps): JSX.Element | null {
  const [phase, setPhase] = useState<Phase>("recall");
  const [recallCheck] = useState(() => contentSource.getRecall());
  const [applyState, setApplyState] = useState<ApplyQuestionState | null>(null);

  switch (phase) {
    case "recall":
      return <RecallScreen recallCheck={recallCheck} onContinue={() => setPhase("learn")} />;

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
          onComplete={() => setPhase("completion")}
        />
      );
    }

    case "completion": {
      const { summary, domainPosition } = contentSource.getCompletion();
      return <CompletionScreen summary={summary} domainPosition={domainPosition} onDone={onDone} />;
    }

    default:
      return null;
  }
}
