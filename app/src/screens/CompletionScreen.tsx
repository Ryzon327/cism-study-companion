import type { JSX } from "preact";
import { Button } from "../components/Button/Button";
import { completionSummary as defaultSummary, todayFocus } from "../data/fixtures";
import type { CompletionSummaryFixture } from "../types/content";
import "./CompletionScreen.css";

interface CompletionScreenProps {
  summary?: CompletionSummaryFixture;
  domainPosition?: string;
  onDone?: () => void;
}

export function CompletionScreen({
  summary = defaultSummary,
  domainPosition = todayFocus.domainPosition,
  onDone
}: CompletionScreenProps = {}): JSX.Element {
  return (
    <div class="screen completion-screen">
      <div class="completion-check" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12.5 10 17.5 19 7" />
        </svg>
      </div>
      <h1 class="completion-headline">{summary.headline}</h1>
      <p class="completion-detail">{summary.detail}</p>

      <ul class="completion-covered" aria-label="What today's session covered">
        {summary.coveredItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {domainPosition && <p class="completion-journey">{domainPosition}</p>}

      <button type="button" class="completion-optional">
        {summary.optionalLabel}
      </button>

      <div class="completion-actions">
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}
