import type { JSX } from "preact";
import { useTheme } from "../../state/ThemeContext";
import "./ThemeToggle.css";

export function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      class="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
      <span class="theme-toggle-label">{isDark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
