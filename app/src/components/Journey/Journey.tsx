import type { JSX } from "preact";
import type { JourneyStep } from "../../types/content";
import "./Journey.css";

interface JourneyProps {
  steps: JourneyStep[];
  currentDetail?: string;
}

/**
 * Deliberately distinct visual vocabulary from LifecycleTrack — round
 * nodes, connecting line, a fixed six steps — so curriculum progress can
 * never be mistaken for a CISM risk/incident lifecycle. See
 * docs/design-system/SCREEN-HOME-JOURNEY.md.
 */
export function Journey({ steps, currentDetail }: JourneyProps): JSX.Element {
  return (
    <ol class="journey" aria-label="Your learning journey">
      {steps.map((step) => (
        <li class={`journey-step journey-step-${step.state}`} key={step.id}>
          <span class="journey-node" aria-hidden="true">
            {step.state === "completed" ? "✓" : ""}
          </span>
          <span class="journey-label">
            {step.label}
            <span class="visually-hidden"> — {step.state}</span>
          </span>
          {step.state === "current" && currentDetail && (
            <span class="journey-current-detail">{currentDetail}</span>
          )}
        </li>
      ))}
    </ol>
  );
}
