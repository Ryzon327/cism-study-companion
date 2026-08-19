import type { JSX } from "preact";
import "./MemoryRule.css";

export function MemoryRule({ children }: { children: string }): JSX.Element {
  return (
    <div class="memory-rule">
      <span class="memory-rule-icon" aria-hidden="true">↳</span>
      <div>
        <p class="memory-rule-eyebrow">Memory rule</p>
        <p class="memory-rule-text">{children}</p>
      </div>
    </div>
  );
}
