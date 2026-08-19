import type { JSX } from "preact";
import type { LifecycleStageFixture } from "../../types/content";
import "./LifecycleTrack.css";

/**
 * Deliberately distinct from Journey: rectangular chips in a horizontal
 * track, shown only inline within a question/feedback context, never a
 * full-width fixed six-step sequence. See
 * docs/design-system/SCREEN-HOME-JOURNEY.md#explicit-separation-from-lifecycle-models.
 */
export function LifecycleTrack({ stages }: { stages: LifecycleStageFixture[] }): JSX.Element {
  return (
    <ol class="lifecycle-track" aria-label="Lifecycle stage">
      {stages.map((stage) => (
        <li
          key={stage.label}
          class={`lifecycle-chip ${stage.current ? "lifecycle-chip-current" : ""}`}
          aria-current={stage.current ? "step" : undefined}
        >
          {stage.label}
        </li>
      ))}
    </ol>
  );
}
