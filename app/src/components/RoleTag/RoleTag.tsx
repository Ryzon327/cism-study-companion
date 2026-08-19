import type { JSX } from "preact";
import "./RoleTag.css";

export function RoleTag({ label }: { label: string }): JSX.Element {
  return (
    <span class="role-tag">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" />
      </svg>
      <span class="visually-hidden">Role: </span>
      {label}
    </span>
  );
}
