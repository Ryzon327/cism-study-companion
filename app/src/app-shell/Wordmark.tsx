import type { JSX } from "preact";
import "./Wordmark.css";

/**
 * Restrained product identity: the linked-circles glyph echoes
 * PatternCallout's pattern-recognition motif (see PatternCallout.tsx),
 * tying the mark to the app's actual pedagogy rather than an arbitrary
 * logo. No image asset — inline SVG, zero dependency.
 */
export function Wordmark(): JSX.Element {
  return (
    <span class="wordmark">
      <svg class="wordmark-glyph" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <circle cx="8" cy="8" r="4.2" />
        <circle cx="16" cy="16" r="4.2" />
        <path d="M11 11l2 2" />
      </svg>
      <span class="wordmark-text">
        <span class="wordmark-kicker">CISM</span>
        <span class="wordmark-name">Study Companion</span>
      </span>
    </span>
  );
}
