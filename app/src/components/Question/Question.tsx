import type { JSX } from "preact";
import type { QuestionFixture, AnswerOptionFixture } from "../../types/content";
import { AnswerOption } from "../AnswerOption/AnswerOption";
import "./Question.css";

interface QuestionProps {
  question: QuestionFixture;
  selectedKey: AnswerOptionFixture["key"] | null;
  submitted: boolean;
  onSelect: (key: AnswerOptionFixture["key"]) => void;
  meta?: string;
  hideDomain?: boolean;
}

export function Question({ question, selectedKey, submitted, onSelect, meta, hideDomain }: QuestionProps): JSX.Element {
  return (
    <article class="question">
      {meta && <p class="question-meta">{meta}</p>}
      <h3 class="question-stem">{question.prompt}</h3>
      <div class="question-options" role="group" aria-label="Answer options">
        {question.options.map((option) => (
          <AnswerOption
            key={option.key}
            option={option}
            selected={selectedKey === option.key}
            submitted={submitted}
            onSelect={() => onSelect(option.key)}
          />
        ))}
      </div>
      {!hideDomain && !submitted && (
        <p class="question-quiet-note">No domain label, hint, or answer feedback appears until you submit.</p>
      )}
    </article>
  );
}
