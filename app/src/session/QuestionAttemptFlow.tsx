import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { QuestionApplyScreen } from "../screens/QuestionApplyScreen";
import { FeedbackScreen } from "../screens/FeedbackScreen";
import { RepairScreen } from "../screens/RepairScreen";
import type { AnswerOptionFixture, FeedbackFixture, QuestionFixture, RepairCheckFixture } from "../types/content";

type AttemptPhase = "apply" | "feedback" | "repair";

export interface QuestionAttemptFlowProps {
  question: QuestionFixture;
  meta?: string;
  buildFeedback: (question: QuestionFixture, selectedKey: AnswerOptionFixture["key"]) => FeedbackFixture & { repairTargetId?: string };
  getRepairCheck: (feedback: FeedbackFixture & { repairTargetId?: string }) => RepairCheckFixture;
  // Phase 10B-3: carries whether THIS attempt was ultimately correct, so a
  // multi-question caller (Practice) can tally results without re-deriving
  // correctness itself or wrapping buildFeedback. Existing callers
  // (DailyStudySession, ExploreScreen) that only care "this attempt is
  // over" remain valid unchanged — a callback expecting fewer parameters
  // is assignable to one expecting more.
  onComplete: (correct: boolean) => void;
}

/**
 * The shared QUESTION -> ANSWER -> FEEDBACK -> (REPAIR if needed) ->
 * complete primitive, extracted from DailyStudySession's existing
 * apply/feedback/repair phases (Phase 10B-1) so future learning modes
 * (Explore, Practice, Optional Reinforcement) can reuse the exact same
 * behavior instead of a second question engine.
 *
 * Deliberately knows nothing about lessons, domains, families, or "today" —
 * it only consumes an already-resolved `question` and two caller-supplied
 * functions, exactly mirroring the caller-agnostic shape
 * DailyStudyContentSource already proved out for content. This is what
 * makes it usable by any caller (Daily Study today; Explore/Practice/
 * Reinforcement once those phases are separately authorized) without any
 * per-mode or per-domain branching inside this component.
 *
 * `onComplete` fires once, exactly when the attempt is fully resolved: a
 * correct answer skips straight to it from Feedback; an incorrect answer
 * reaches it only after Repair. Callers decide what "complete" means for
 * them (Daily Study moves to Completion; a future Practice loop would
 * advance to its next question or its own summary).
 */
export function QuestionAttemptFlow({
  question,
  meta,
  buildFeedback,
  getRepairCheck,
  onComplete
}: QuestionAttemptFlowProps): JSX.Element | null {
  const [phase, setPhase] = useState<AttemptPhase>("apply");
  const [selectedKey, setSelectedKey] = useState<AnswerOptionFixture["key"] | null>(null);

  switch (phase) {
    case "apply":
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

    case "feedback": {
      if (!selectedKey) return null;
      const feedback = buildFeedback(question, selectedKey);
      return (
        <FeedbackScreen
          feedback={feedback}
          onContinue={() => (feedback.correct ? onComplete(true) : setPhase("repair"))}
        />
      );
    }

    case "repair": {
      if (!selectedKey) return null;
      const feedback = buildFeedback(question, selectedKey);
      const repairCheck = getRepairCheck(feedback);
      return (
        <RepairScreen
          repairCheck={repairCheck}
          mistakeContext={feedback.whySelectedWasWeaker}
          onContinue={() => onComplete(false)}
        />
      );
    }

    default:
      return null;
  }
}
