import type { JSX } from "preact";
import { Wordmark } from "./Wordmark";
import { ProductNav, type ProductNavItem } from "./ProductNav";
import { ThemeToggle } from "../components/ThemeToggle/ThemeToggle";
import "./TopBar.css";

interface TopBarProps {
  mode: "full" | "session";
  productNavItems: ProductNavItem[];
  activeProductId: string;
  onSelectProduct: (id: string) => void;
  sessionLabel?: string;
  onExitSession: () => void;
}

/**
 * Full mode (Home, Review Center): wordmark + the learner's real three-item
 * navigation. Session mode (Daily Study, Question/Apply, Feedback,
 * Completion, Practice Exam): navigation recedes to a single Exit action so
 * study material is not competing with chrome, per the Phase 5B redesign
 * direction.
 */
export function TopBar({
  mode,
  productNavItems,
  activeProductId,
  onSelectProduct,
  sessionLabel,
  onExitSession
}: TopBarProps): JSX.Element {
  return (
    <header class="topbar">
      <div class="topbar-inner">
        <div class="topbar-brand">
          <Wordmark />
        </div>

        {mode === "full" ? (
          <ProductNav
            items={productNavItems}
            activeId={activeProductId}
            onSelect={onSelectProduct}
            className="topbar-product-nav"
          />
        ) : (
          <div class="topbar-session">
            <button type="button" class="topbar-exit" onClick={onExitSession}>
              <span aria-hidden="true">&larr;</span> Exit
            </button>
            {sessionLabel && <span class="topbar-session-label">{sessionLabel}</span>}
          </div>
        )}

        <div class="topbar-controls">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
