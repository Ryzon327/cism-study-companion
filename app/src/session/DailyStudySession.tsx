import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { RecallScreen } from "../screens/RecallScreen";
import { DailyStudyLearnScreen } from "../screens/DailyStudyLearnScreen";
import { QuestionApplyScreen } from "../screens/QuestionApplyScreen";
import { FeedbackScreen } from "../screens/FeedbackScreen";
import { RepairScreen } from "../screens/RepairScreen";
import { CompletionScreen } from "../screens/CompletionScreen";
import { buildFeedback } from "../data/fixtures";
import type { AnswerOptionFixture } from "../types/content";

type Phase = "recall" | "learn" | "apply" | "feedback" | "repair" | "completion";

interface DailyStudySessionProps {
  onDone: () => void;
}

/**
 * The controlled, in-memory Daily Study experience prototype:
 * Recall → Learn → Apply → Feedback → (Repair if incorrect) → Completion.
 *
 * All state is local useState, reset fresh on every mount (i.e. every time
 * the learner starts a new session from Home) — no persistence, no
 * localStorage, no evidence storage. This is a click-through experience
 * demonstration, not the production Daily Study engine.
 */
export function DailyStudySession({ onDone }: DailyStudySessionProps): JSX.Element | null {
  const [phase, setPhase] = useState<Phase>("recall");
  const [selectedKey, setSelectedKey] = useState<AnswerOptionFixture["key"] | null>(null);

  switch (phase) {
    case "recall":
      return <RecallScreen onContinue={() => setPhase("learn")} />;

    case "learn":
      return <DailyStudyLearnScreen onApply={() => setPhase("apply")} />;

    case "apply":
      return (
        <QuestionApplyScreen
          onSubmit={(key: AnswerOptionFixture["key"]) => {
            setSelectedKey(key);
            setPhase("feedback");
          }}
        />
      );

    case "feedback": {
      if (!selectedKey) return null;
      const feedback = buildFeedback(selectedKey);
      return (
        <FeedbackScreen
          feedback={feedback}
          onContinue={() => setPhase(feedback.correct ? "completion" : "repair")}
        />
      );
    }

    case "repair": {
      const feedback = selectedKey ? buildFeedback(selectedKey) : undefined;
      return (
        <RepairScreen
          mistakeContext={feedback?.whySelectedWasWeaker}
          onContinue={() => setPhase("completion")}
        />
      );
    }

    case "completion":
      return <CompletionScreen onDone={onDone} />;

    default:
      return null;
  }
}
