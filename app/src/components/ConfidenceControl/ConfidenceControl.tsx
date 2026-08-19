import type { JSX } from "preact";
import "./ConfidenceControl.css";

export type Confidence = "sure" | "not-sure" | "guessing";

const OPTIONS: { value: Confidence; label: string }[] = [
  { value: "sure", label: "Sure" },
  { value: "not-sure", label: "Not sure" },
  { value: "guessing", label: "Guessing" }
];

interface ConfidenceControlProps {
  value: Confidence | null;
  onChange: (value: Confidence) => void;
}

export function ConfidenceControl({ value, onChange }: ConfidenceControlProps): JSX.Element {
  return (
    <fieldset class="confidence-control">
      <legend>How confident are you?</legend>
      <div class="confidence-options" role="radiogroup" aria-label="Answer confidence">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            class={`confidence-option ${value === opt.value ? "confidence-option-selected" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
