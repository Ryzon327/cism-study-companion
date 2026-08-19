import type { JSX } from "preact";
import { Button } from "../components/Button/Button";
import { completionSummary, todayFocus } from "../data/fixtures";
import "./CompletionScreen.css";

interface CompletionScreenProps {
  onDone?: () => void;
}

export function CompletionScreen({ onDone }: CompletionScreenProps = {}): JSX.Element {
  return (
    <div class="screen completion-screen">
      <div class="completion-check" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12.5 10 17.5 19 7" />
        </svg>
      </div>
      <h1 class="completion-headline">{completionSummary.headline}</h1>
      <p class="completion-detail">{completionSummary.detail}</p>

      <ul class="completion-covered" aria-label="What today's session covered">
        {completionSummary.coveredItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p class="completion-journey">{todayFocus.domainPosition}</p>

      <button type="button" class="completion-optional">
        {completionSummary.optionalLabel}
      </button>

      <div class="completion-actions">
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}
