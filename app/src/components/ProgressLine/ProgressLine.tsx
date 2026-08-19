import type { JSX } from "preact";
import "./ProgressLine.css";

interface ProgressLineProps {
  percent: number;
  label: string;
}

export function ProgressLine({ percent, label }: ProgressLineProps): JSX.Element {
  return (
    <div
      class="progress-line"
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span class="progress-line-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
