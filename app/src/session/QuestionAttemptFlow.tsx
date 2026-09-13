import type { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import { QuestionApplyScreen } from "../screens/QuestionApplyScreen";
import { FeedbackScreen } from "../screens/FeedbackScreen";
import { RepairScreen } from "../screens/RepairScreen";
import type { AnswerOptionFixture, FeedbackFixture, QuestionFixture, RepairCheckFixture } from "../types/content";
import type { Confidence } from "../components/ConfidenceControl/ConfidenceControl";
import { recordQuestionAttempt, recordRepairAttempt, type LearningMode, type SourceContext } from "../learning-history";

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
  // LI-1 (Learning Intelligence v1, persistence foundation): every caller
  // must say which learning mode and content source it is — this is the
  // one shared seam all four learning modes' Apply/Repair attempts pass
  // through, so this is also the one place their evidence is recorded. See
  // docs/architecture/LEARNING-INTELLIGENCE-V1.md §7/§24.
  learningMode: LearningMode;
  sourceContext: SourceContext;
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
 *
 * LI-1: records exactly one QUESTION_ATTEMPT event the moment Apply is
 * definitively resolved (the "Check answer" click — the same moment
 * `selectedKey` is first set), never later at Feedback/Continue, and
 * exactly one REPAIR_ATTEMPT event (linked via `parentAttemptId`, never
 * mutating the original attempt) when Repair is actually resolved. A
 * correct Apply never produces a Repair event at all. Each recording site
 * is guarded by a ref so a duplicate call (fast double-click, a re-render)
 * can never record the same resolution twice.
 */
export function QuestionAttemptFlow({
  question,
  meta,
  buildFeedback,
  getRepairCheck,
  onComplete,
  learningMode,
  sourceContext
}: QuestionAttemptFlowProps): JSX.Element | null {
  const [phase, setPhase] = useState<AttemptPhase>("apply");
  const [selectedKey, setSelectedKey] = useState<AnswerOptionFixture["key"] | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const hasRecordedApply = useRef(false);
  const hasRecordedRepair = useRef(false);

  switch (phase) {
    case "apply":
      return (
        <QuestionApplyScreen
          question={question}
          meta={meta}
          onSubmit={(key: AnswerOptionFixture["key"], confidence: Confidence) => {
            if (hasRecordedApply.current) return;
            hasRecordedApply.current = true;

            const feedback = buildFeedback(question, key);
            const correctOption = question.options.find((o) => o.correct);
            const { event } = recordQuestionAttempt({
              learningMode,
              sourceContext,
              attemptKind: "apply",
              questionId: question.id,
              selectedOptionKey: key,
              correctOptionKey: correctOption?.key ?? key,
              correct: feedback.correct,
              confidence,
              repairTargetId: feedback.correct ? null : (feedback.repairTargetId ?? null)
            });

            setAttemptId(event.attemptId);
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
          onContinue={(repairSelectedKey) => {
            if (!hasRecordedRepair.current && attemptId) {
              hasRecordedRepair.current = true;
              const repairCorrect = repairCheck.options.find((o) => o.key === repairSelectedKey)?.correct ?? false;
              recordRepairAttempt({
                learningMode,
                sourceContext,
                parentAttemptId: attemptId,
                repairTargetId: feedback.repairTargetId ?? null,
                selectedOptionKey: repairSelectedKey,
                correct: repairCorrect
              });
            }
            onComplete(false);
          }}
        />
      );
    }

    default:
      return null;
  }
}
