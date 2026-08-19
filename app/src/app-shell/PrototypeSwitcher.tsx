import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import "./PrototypeSwitcher.css";

export interface PrototypeStateItem {
  id: string;
  label: string;
}

interface PrototypeSwitcherProps {
  items: PrototypeStateItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * Development/QA-only affordance for jumping directly to any of the Visual
 * Prototype Gate's eight states (the seven gate screens, Feedback split
 * into its two variants). Deliberately styled as tooling, not product
 * chrome, and never rendered as primary navigation — see the Phase 5B
 * redesign report for why this exists as its own control.
 */
export function PrototypeSwitcher({ items, activeId, onSelect }: PrototypeSwitcherProps): JSX.Element {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  return (
    <details class="prototype-switcher" ref={detailsRef}>
      <summary class="prototype-switcher-trigger">
        <span aria-hidden="true">&#x2039;/&#x203a;</span> Prototype
      </summary>
      <div class="prototype-switcher-panel" role="group" aria-label="Jump to a visual prototype gate state">
        <p class="prototype-switcher-heading">Visual prototype gate states</p>
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
    </details>
  );
}
