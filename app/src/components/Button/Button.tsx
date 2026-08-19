import type { ComponentChildren, JSX } from "preact";
import "./Button.css";

type Variant = "primary" | "secondary" | "text";

interface ButtonProps {
  variant?: Variant;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  children: ComponentChildren;
  ariaLabel?: string;
}

export function Button({
  variant = "primary",
  onClick,
  disabled = false,
  type = "button",
  children,
  ariaLabel
}: ButtonProps): JSX.Element {
  return (
    <button
      type={type}
      class={`btn btn-${variant}`}
      onClick={() => {
        // Explicit guard, not just the native `disabled` attribute: some
        // environments still dispatch a synthetic click to a disabled
        // element's listener, so the handler must not rely on the browser
        // alone to suppress it.
        if (!disabled) onClick?.();
      }}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
