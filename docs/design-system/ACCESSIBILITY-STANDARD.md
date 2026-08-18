# Accessibility Standard

**Status: [CANONICAL].** Target WCAG 2.2 AA, stated directly during Phase 4
review, treated as a design requirement — not a QA afterthought — and as a
deliberate, direct improvement over gaps the engineering baseline flagged
in the current prototype (missing dialog semantics, no focus trapping; see
[`docs/engineering/BASELINE.md`](../engineering/BASELINE.md)).

## Structure

- Semantic landmarks (`header`, `nav`, `main`) on every screen.
- One `h1` per page; strictly nested heading hierarchy beneath it — no skipped levels.
- Every interactive element keyboard-reachable in a logical order.

## Focus

- Visible focus ring always present (`focus-ring` token,
  [`DESIGN-TOKENS.md`](DESIGN-TOKENS.md)) — never suppressed via
  `outline: none` without an equally visible replacement.
- Dialogs (`Dialog`, [`COMPONENT-INVENTORY.md`](COMPONENT-INVENTORY.md))
  use `role="dialog"`, `aria-modal="true"`, trap focus while open, and
  **return focus to the triggering element on close** — the direct fix for
  the baseline's specifically-flagged gap.
- All five overlay-style surfaces (Daily Study, Mixed Practice, Practice
  Exam, Active Practice, Target Practice — carried forward as concepts from
  the current prototype) get this same modal treatment, not just formal
  `Dialog` instances.

## Targets and contrast

- Minimum 44×44px interactive targets everywhere, including desktop.
- Text contrast ≥4.5:1 (body text), ≥3:1 (large text/UI elements), in both light and dark — verified against the token values in [`DESIGN-TOKENS.md`](DESIGN-TOKENS.md) once those are finalized at implementation time.

## Status communication

- **No status is color-only.** Correct/incorrect, marked/unmarked, answered/unanswered all pair an icon or text label with any color cue — see [`SCREEN-QUESTION-FEEDBACK.md`](SCREEN-QUESTION-FEEDBACK.md)'s ✓/✕ treatment as the canonical example.
- Dynamic feedback regions (answer submission, timer warnings, storage warnings) use `aria-live="polite"`.

## Forms

- Confidence selector and Mixed Practice mindset chips use proper `fieldset`/`legend`/`radiogroup` semantics — continuing the one accessibility pattern the current prototype already does well (per the engineering baseline), not regressing it. Since [`SCREEN-MIXED-PRACTICE.md`](SCREEN-MIXED-PRACTICE.md)'s gate is dimension-aware (only the dimensions a question actually tags are rendered), this applies per rendered group, not to a fixed count of four — a one-dimension question still gets one properly-labeled `fieldset`, not three empty or hidden ones.
- Validation/error states are announced to assistive technology, not conveyed by visual styling alone.

## Motion and zoom

- `prefers-reduced-motion: reduce` is respected globally — see [`MOTION-STANDARD.md`](MOTION-STANDARD.md).
- Layout tolerates 200% browser zoom and OS-level text-size increases without content loss or horizontal scroll.

## Verification

Per [`TESTING-STRATEGY.md`](TESTING-STRATEGY.md), this standard becomes a
CI-blocking check via automated `axe-core` scanning and a manual
keyboard-only pass, once implementation begins — nothing here counts as met
until it is verified this way, consistent with `CLAUDE.md`'s rule that an
unverified claim is not regression protection.
