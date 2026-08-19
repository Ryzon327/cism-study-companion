import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { ProgressLine } from "../components/ProgressLine/ProgressLine";
import { Question } from "../components/Question/Question";
import { ConfidenceControl, type Confidence } from "../components/ConfidenceControl/ConfidenceControl";
import { Button } from "../components/Button/Button";
import { applyQuestion } from "../data/fixtures";
import type { AnswerOptionFixture } from "../types/content";
import "./QuestionApplyScreen.css";

interface QuestionApplyScreenProps {
  onSubmit?: (selectedKey: AnswerOptionFixture["key"], confidence: Confidence) => void;
}

export function QuestionApplyScreen({ onSubmit }: QuestionApplyScreenProps = {}): JSX.Element {
  const [selected, setSelected] = useState<AnswerOptionFixture["key"] | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);

  return (
    <div class="screen apply-screen">
      <div class="daily-study-header">
        <ProgressLine percent={60} label="Daily Study progress: phase 3 of 5" />
      </div>

      <Question
        question={applyQuestion}
        selectedKey={selected}
        submitted={false}
        onSelect={setSelected}
        meta="Question 1 of 1 · Domain 2"
      />

      <ConfidenceControl value={confidence} onChange={setConfidence} />

      <div class="apply-actions">
        <Button
          disabled={!selected || !confidence}
          onClick={() => {
            if (selected && confidence) onSubmit?.(selected, confidence);
          }}
        >
          Check answer
        </Button>
      </div>
    </div>
  );
}
