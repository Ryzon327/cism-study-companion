import type { JSX } from "preact";
import "./QualifierMark.css";

/**
 * Typographic, not icon-based — a qualifier is a word to find in the stem;
 * see docs/design-system/SEMANTIC-VISUAL-LANGUAGE.md.
 */
export function QualifierMark({ label }: { label: string }): JSX.Element {
  return (
    <span class="qualifier-mark">
      <span class="visually-hidden">Qualifier: </span>
      {label}
    </span>
  );
}
