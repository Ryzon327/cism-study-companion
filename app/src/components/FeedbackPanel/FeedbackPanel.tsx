import type { JSX } from "preact";
import type { FeedbackFixture } from "../../types/content";
import { RoleTag } from "../RoleTag/RoleTag";
import { QualifierMark } from "../QualifierMark/QualifierMark";
import { LifecycleTrack } from "../LifecycleTrack/LifecycleTrack";
import { MemoryRule } from "../MemoryRule/MemoryRule";
import { displayLetterForPosition } from "../../content/answerOrder";
import "./FeedbackPanel.css";

export function FeedbackPanel({ feedback }: { feedback: FeedbackFixture }): JSX.Element {
  // `feedback.question.options` is the exact already-ordered array the
  // learner saw during Apply — letters here must be derived from POSITION
  // in this array, not from `.key` (semantic identity), or the letter
  // printed in feedback could name a different on-screen slot than what
  // the learner actually saw and chose from.
  const options = feedback.question.options;
  const selectedOption = options.find((o) => o.key === feedback.selectedKey);
  const correctOption = options.find((o) => o.correct);
  const selectedLetter = selectedOption ? displayLetterForPosition(options.indexOf(selectedOption)) : "";
  const correctLetter = correctOption ? displayLetterForPosition(options.indexOf(correctOption)) : "";

  return (
    <section class="feedback-panel" aria-label="Answer feedback">
      <h1 class={`feedback-outcome ${feedback.correct ? "feedback-outcome-correct" : "feedback-outcome-incorrect"}`}>
        {feedback.correct ? "Correct" : "Repair the reasoning"}
      </h1>

      <div class="feedback-question-recap">
        <p class="feedback-eyebrow">Question</p>
        <p class="feedback-question-text">{feedback.question.prompt}</p>
      </div>

      <div class="feedback-answers">
        <div class="feedback-answer-row">
          <span class="feedback-answer-label">Your answer</span>
          <span class={`feedback-answer-value ${feedback.correct ? "feedback-answer-correct" : "feedback-answer-wrong"}`}>
            <span aria-hidden="true">{feedback.correct ? "✓" : "✕"}</span>
            {selectedLetter}. {selectedOption?.text}
          </span>
        </div>
        {!feedback.correct && (
          <div class="feedback-answer-row">
            <span class="feedback-answer-label">Correct answer</span>
            <span class="feedback-answer-value feedback-answer-correct">
              <span aria-hidden="true">✓</span>
              {correctLetter}. {correctOption?.text}
            </span>
          </div>
        )}
      </div>

      <div class="feedback-why">
        <p class="feedback-eyebrow">Why</p>
        <p class="feedback-why-text">{feedback.why}</p>
      </div>

      {!feedback.correct && feedback.whySelectedWasWeaker && (
        <details class="feedback-details">
          <summary>Why {selectedLetter} was weaker</summary>
          <p>{feedback.whySelectedWasWeaker}</p>
        </details>
      )}

      {(feedback.qualifier || feedback.role) && (
        <div class="feedback-chips" aria-label="Reasoning dimensions for this question">
          {feedback.qualifier && <QualifierMark label={feedback.qualifier.label} />}
          {feedback.role && <RoleTag label={feedback.role.label} />}
        </div>
      )}
      {feedback.lifecycle.length > 0 && <LifecycleTrack stages={feedback.lifecycle} />}

      <MemoryRule>{feedback.memoryRule}</MemoryRule>
    </section>
  );
}
