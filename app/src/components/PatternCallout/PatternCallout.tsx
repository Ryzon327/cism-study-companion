import type { JSX } from "preact";
import type { PatternFixture } from "../../types/content";
import "./PatternCallout.css";

export function PatternCallout({ pattern }: { pattern: PatternFixture }): JSX.Element {
  return (
    <aside class="pattern-callout" aria-label="Reasoning pattern">
      <div class="pattern-callout-glyph" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="8" cy="8" r="4.2" />
          <circle cx="16" cy="16" r="4.2" />
          <path d="M11 11l2 2" />
        </svg>
      </div>
      <div>
        <p class="pattern-callout-eyebrow">Pattern</p>
        <h4 class="pattern-callout-title">{pattern.displayName}</h4>
        <p class="pattern-callout-meaning">{pattern.recognitionClue}</p>
      </div>
    </aside>
  );
}
