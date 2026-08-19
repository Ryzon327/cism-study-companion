import type { JSX } from "preact";
import type { ProductNavItem } from "./ProductNav";
import "./BottomTabBar.css";

const ICONS: Record<string, JSX.Element> = {
  home: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
    </svg>
  ),
  "daily-study": (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M5 4.5h10.5A2.5 2.5 0 0 1 18 7v13H7.5A2.5 2.5 0 0 1 5 17.5v-13Z" />
      <path d="M8.5 9h6M8.5 12.5h6" />
    </svg>
  ),
  explore: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.5-4.5" />
    </svg>
  )
};

interface BottomTabBarProps {
  items: ProductNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * Mobile's own navigation model — a bottom tab bar, not the desktop shell
 * compressed. Hidden during focused study/exam screens via AppShell's
 * session mode, matching the desktop ProductNav's recede behavior.
 */
export function BottomTabBar({ items, activeId, onSelect }: BottomTabBarProps): JSX.Element {
  return (
    <nav class="bottom-tab-bar" aria-label="Main">
      <ul class="bottom-tab-bar-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              class={`bottom-tab-bar-item ${activeId === item.id ? "bottom-tab-bar-item-active" : ""}`}
              onClick={() => onSelect(item.id)}
              aria-current={activeId === item.id ? "page" : undefined}
            >
              {ICONS[item.id]}
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
