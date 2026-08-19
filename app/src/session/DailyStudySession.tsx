import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { RecallScreen } from "../screens/RecallScreen";
import { DailyStudyLearnScreen } from "../screens/DailyStudyLearnScreen";
import { QuestionApplyScreen } from "../screens/QuestionApplyScreen";
import { FeedbackScreen } from "../screens/FeedbackScreen";
import { RepairScreen } from "../screens/RepairScreen";
import { CompletionScreen } from "../screens/CompletionScreen";
import type { AnswerOptionFixture } from "../types/content";
import type { DailyStudyContentSource } from "./contentSource";

type Phase = "recall" | "learn" | "apply" | "feedback" | "repair" | "completion";

interface DailyStudySessionProps {
  contentSource: DailyStudyContentSource;
  onDone: () => void;
}

/**
 * The controlled, in-memory Daily Study experience: Recall → Learn →
 * Apply → Feedback → (Repair if incorrect) → Completion.
 *
 * This component is pure session orchestration — it never names a
 * specific lesson or question. Everything it renders comes from the
 * injected `contentSource`, which may be the Phase 5B prototype fixtures
 * or the production content-loader layer (app/src/content/); the phase
 * state machine and screen sequence are identical either way. All state
 * is local useState, reset fresh on every mount — no persistence.
 */
export function DailyStudySession({ contentSource, onDone }: DailyStudySessionProps): JSX.Element | null {
  const [phase, setPhase] = useState<Phase>("recall");
  const [selectedKey, setSelectedKey] = useState<AnswerOptionFixture["key"] | null>(null);

  switch (phase) {
    case "recall":
      return <RecallScreen recallCheck={contentSource.getRecall()} onContinue={() => setPhase("learn")} />;

    case "learn":
      return <DailyStudyLearnScreen lesson={contentSource.getLesson()} onApply={() => setPhase("apply")} />;

    case "apply": {
      const { question, meta } = contentSource.getApplyQuestion();
      return (
        <QuestionApplyScreen
          question={question}
          meta={meta}
          onSubmit={(key: AnswerOptionFixture["key"]) => {
            setSelectedKey(key);
            setPhase("feedback");
          }}
        />
      );
    }

    case "feedback": {
      if (!selectedKey) return null;
      const feedback = contentSource.buildFeedback(selectedKey);
      return (
        <FeedbackScreen
          feedback={feedback}
          onContinue={() => setPhase(feedback.correct ? "completion" : "repair")}
        />
      );
    }

    case "repair": {
      const feedback = selectedKey ? contentSource.buildFeedback(selectedKey) : undefined;
      const repairCheck = contentSource.getRepairCheck(feedback?.repairTargetId);
      return (
        <RepairScreen
          repairCheck={repairCheck}
          mistakeContext={feedback?.whySelectedWasWeaker}
          onContinue={() => setPhase("completion")}
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
