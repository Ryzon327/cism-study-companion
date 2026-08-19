import type { ComponentChildren, JSX } from "preact";
import "./Scenario.css";

export function Scenario({ children }: { children: ComponentChildren }): JSX.Element {
  return (
    <blockquote class="scenario">
      <p class="scenario-eyebrow">Scenario</p>
      <p>{children}</p>
    </blockquote>
  );
}
