import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import "./PrototypeSwitcher.css";

export interface PrototypeStateItem {
  id: string;
  label: string;
}

export type ContentSourceMode = "prototype" | "production";

interface PrototypeSwitcherProps {
  items: PrototypeStateItem[];
  activeId: string;
  onSelect: (id: string) => void;
  contentSourceMode: ContentSourceMode;
  onSelectContentSourceMode: (mode: ContentSourceMode) => void;
}

/**
 * Development/QA-only affordance for jumping directly to any of the Visual
 * Prototype Gate's eight states (the seven gate screens, Feedback split
 * into its two variants). Deliberately styled as tooling, not product
 * chrome, and never rendered as primary navigation — see the Phase 5B
 * redesign report for why this exists as its own control.
 *
 * Also carries the Phase 6B dev-only Daily Study content-source toggle
 * (prototype fixtures vs. production candidate content), kept in this
 * same QA panel rather than becoming a second, permanent piece of chrome
 * — see the Phase 6B report's "production Daily Study entry" section.
 */
export function PrototypeSwitcher({
  items,
  activeId,
  onSelect,
  contentSourceMode,
  onSelectContentSourceMode
}: PrototypeSwitcherProps): JSX.Element {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  return (
    <details class="prototype-switcher" ref={detailsRef}>
      <summary class="prototype-switcher-trigger">
        <span aria-hidden="true">&#x2039;/&#x203a;</span> Prototype
      </summary>
      <div class="prototype-switcher-panel">
        <p class="prototype-switcher-heading">Daily Study content source (dev only)</p>
        <div class="prototype-switcher-source-toggle" role="radiogroup" aria-label="Daily Study content source">
          <button
            type="button"
            role="radio"
            aria-checked={contentSourceMode === "prototype"}
            class={`prototype-switcher-source-item ${contentSourceMode === "prototype" ? "prototype-switcher-source-item-active" : ""}`}
            onClick={() => onSelectContentSourceMode("prototype")}
          >
            Prototype fixtures
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={contentSourceMode === "production"}
            class={`prototype-switcher-source-item ${contentSourceMode === "production" ? "prototype-switcher-source-item-active" : ""}`}
            onClick={() => onSelectContentSourceMode("production")}
          >
            Production (candidate)
          </button>
        </div>

        <p class="prototype-switcher-heading prototype-switcher-heading-divided">Visual prototype gate states</p>
        <div role="group" aria-label="Jump to a visual prototype gate state">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              class={`prototype-switcher-item ${activeId === item.id ? "prototype-switcher-item-active" : ""}`}
              aria-current={activeId === item.id ? "true" : undefined}
              onClick={() => {
                onSelect(item.id);
                if (detailsRef.current) detailsRef.current.open = false;
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}
