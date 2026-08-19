import type { ComponentChildren, JSX } from "preact";
import { TopBar } from "./TopBar";
import { BottomTabBar } from "./BottomTabBar";
import { PrototypeSwitcher, type PrototypeStateItem } from "./PrototypeSwitcher";
import type { ProductNavItem } from "./ProductNav";
import "./AppShell.css";

interface AppShellProps {
  mode: "full" | "session";
  productNavItems: ProductNavItem[];
  activeProductId: string;
  onSelectProduct: (id: string) => void;
  sessionLabel?: string;
  prototypeItems: PrototypeStateItem[];
  activePrototypeId: string;
  onSelectPrototype: (id: string) => void;
  children: ComponentChildren;
}

export function AppShell({
  mode,
  productNavItems,
  activeProductId,
  onSelectProduct,
  sessionLabel,
  prototypeItems,
  activePrototypeId,
  onSelectPrototype,
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
      <PrototypeSwitcher items={prototypeItems} activeId={activePrototypeId} onSelect={onSelectPrototype} />
    </div>
  );
}
