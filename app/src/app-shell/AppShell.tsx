import type { ComponentChildren, JSX } from "preact";
import { TopBar } from "./TopBar";
import { BottomTabBar } from "./BottomTabBar";
import { PrototypeSwitcher, type PrototypeStateItem, type ContentSourceMode } from "./PrototypeSwitcher";
import type { ProductNavItem } from "./ProductNav";
import "./AppShell.css";

interface AppShellProps {
  mode: "full" | "session";
  productNavItems: ProductNavItem[];
  activeProductId: string;
  onSelectProduct: (id: string) => void;
  sessionLabel?: string;
  // Product-environment follow-up: the QA/prototype panel (content-source
  // toggle + visual prototype gate states + review-lesson picker) is
  // intentional tooling, never ordinary learner or default-developer UI —
  // see docs/architecture/PRODUCT-ENVIRONMENT-FOLLOW-UP.md. Callers must
  // say explicitly whether to render it; there is no implicit default here.
  showQaTools: boolean;
  prototypeItems: PrototypeStateItem[];
  activePrototypeId: string;
  onSelectPrototype: (id: string) => void;
  contentSourceMode: ContentSourceMode;
  onSelectContentSourceMode: (mode: ContentSourceMode) => void;
  reviewLessons?: PrototypeStateItem[];
  activeReviewLessonId?: string;
  onSelectReviewLesson?: (id: string) => void;
  children: ComponentChildren;
}

export function AppShell({
  mode,
  productNavItems,
  activeProductId,
  onSelectProduct,
  sessionLabel,
  showQaTools,
  prototypeItems,
  activePrototypeId,
  onSelectPrototype,
  contentSourceMode,
  onSelectContentSourceMode,
  reviewLessons,
  activeReviewLessonId,
  onSelectReviewLesson,
  children
}: AppShellProps): JSX.Element {
  return (
    <div class="app-shell">
      <a class="skip-link" href="#main-content">Skip to content</a>
      <TopBar
        mode={mode}
        productNavItems={productNavItems}
        activeProductId={activeProductId}
        onSelectProduct={onSelectProduct}
        sessionLabel={sessionLabel}
        onExitSession={() => onSelectProduct("home")}
      />
      <main id="main-content" class="app-shell-main">
        <div class="app-shell-workspace">{children}</div>
      </main>
      {mode === "full" && (
        <BottomTabBar items={productNavItems} activeId={activeProductId} onSelect={onSelectProduct} />
      )}
      {showQaTools && (
        <PrototypeSwitcher
          items={prototypeItems}
          activeId={activePrototypeId}
          onSelect={onSelectPrototype}
          contentSourceMode={contentSourceMode}
          onSelectContentSourceMode={onSelectContentSourceMode}
          reviewLessons={reviewLessons}
          activeReviewLessonId={activeReviewLessonId}
          onSelectReviewLesson={onSelectReviewLesson}
        />
      )}
    </div>
  );
}
