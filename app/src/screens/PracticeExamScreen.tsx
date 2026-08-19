import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { Question } from "../components/Question/Question";
import { ProgressLine } from "../components/ProgressLine/ProgressLine";
import { applyQuestion } from "../data/fixtures";
import type { AnswerOptionFixture } from "../types/content";
import "./PracticeExamScreen.css";

interface PracticeExamScreenProps {
  onOpenReview: () => void;
}

export function PracticeExamScreen({ onOpenReview }: PracticeExamScreenProps): JSX.Element {
  const [selected, setSelected] = useState<AnswerOptionFixture["key"] | null>(null);
  const [marked, setMarked] = useState(false);

  return (
    <div class="screen exam-screen">
      <div class="exam-header">
        <span class="exam-counter">4 / 12</span>
        <ProgressLine percent={33} label="Exam progress: question 4 of 12" />
        <span class="exam-timer">42:18</span>
        <button type="button" class="exam-review-link" onClick={onOpenReview}>
          Review answers
        </button>
      </div>

      {marked && <span class="exam-marked-badge">Marked for review</span>}

      <Question
        question={applyQuestion}
        selectedKey={selected}
        submitted={false}
        onSelect={setSelected}
        hideDomain
      />
      <p class="exam-quiet-note">No domain label, hint, memory rule, or answer feedback appears during the exam.</p>

      <div class="exam-footer">
        <button type="button" class="exam-footer-btn">← Previous</button>
        <button type="button" class="exam-footer-btn" onClick={() => setMarked((m) => !m)}>
          {marked ? "Unmark review" : "Mark for review"}
        </button>
        <button type="button" class="exam-footer-btn exam-footer-btn-primary">Next →</button>
      </div>
    </div>
  );
}
