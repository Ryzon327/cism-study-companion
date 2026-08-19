import type { JSX } from "preact";
import "./ProductNav.css";

export interface ProductNavItem {
  id: string;
  label: string;
}

interface ProductNavProps {
  items: ProductNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

/**
 * The learner's actual navigation — three destinations, matching what the
 * real application will offer. Deliberately separate from
 * PrototypeSwitcher, which exposes the Visual Prototype Gate's internal
 * states for QA and must never be mistaken for product navigation.
 */
export function ProductNav({ items, activeId, onSelect, className }: ProductNavProps): JSX.Element {
  return (
    <nav class={`product-nav ${className ?? ""}`} aria-label="Main">
      <ul class="product-nav-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              class={`product-nav-item ${activeId === item.id ? "product-nav-item-active" : ""}`}
              onClick={() => onSelect(item.id)}
              aria-current={activeId === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
