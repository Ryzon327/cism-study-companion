import type { JSX } from "preact";
import type { AnswerOptionFixture } from "../../types/content";
import "./AnswerOption.css";

interface AnswerOptionProps {
  option: AnswerOptionFixture;
  selected: boolean;
  submitted: boolean;
  onSelect: () => void;
}

export function AnswerOption({ option, selected, submitted, onSelect }: AnswerOptionProps): JSX.Element {
  const isCorrectAnswer = submitted && option.correct;
  const isWrongSelected = submitted && selected && !option.correct;

  let stateClass = "";
  if (isCorrectAnswer) stateClass = "answer-option-correct";
  else if (isWrongSelected) stateClass = "answer-option-wrong";
  else if (selected) stateClass = "answer-option-selected";

  return (
    <button
      type="button"
      class={`answer-option ${stateClass}`}
      onClick={() => {
        if (!submitted) onSelect();
      }}
      disabled={submitted}
      aria-pressed={selected}
    >
      <span class="answer-option-letter" aria-hidden="true">{option.key.toUpperCase()}</span>
      <span class="answer-option-text">{option.text}</span>
      {isCorrectAnswer && (
        <span class="answer-option-icon answer-option-icon-correct" aria-hidden="true">✓</span>
      )}
      {isWrongSelected && (
        <span class="answer-option-icon answer-option-icon-wrong" aria-hidden="true">✕</span>
      )}
    </button>
  );
}
