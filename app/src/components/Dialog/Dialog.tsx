import type { ComponentChildren, JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import "./Dialog.css";

interface DialogProps {
  open: boolean;
  titleId: string;
  title: string;
  onClose: () => void;
  children: ComponentChildren;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal primitive: role="dialog", aria-modal, a focus trap while
 * open, and focus returned to the triggering element on close — the direct
 * fix for the gap docs/engineering/BASELINE.md flagged in the prototype.
 * See docs/design-system/ACCESSIBILITY-STANDARD.md.
 */
export function Dialog({ open, titleId, title, onClose, children }: DialogProps): JSX.Element | null {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
    focusable?.[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div class="dialog-backdrop">
      <div
        class="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
      >
        <h2 id={titleId} class="dialog-title">{title}</h2>
        <div class="dialog-body">{children}</div>
      </div>
    </div>
  );
}
