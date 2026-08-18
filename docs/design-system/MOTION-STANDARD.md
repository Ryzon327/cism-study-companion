# Motion Standard

**Status: [CANONICAL].** Stated directly during Phase 4 review: motion
should be minimal and purposeful, and `prefers-reduced-motion` must be
respected. **[CANDIDATE]** for the specific durations below.

## Durations

Two only:
- **~150ms** — hover, selection, focus state changes.
- **~250ms** — phase transitions, dialog open/close.

Standard ease-out. Nothing longer exists in this system.

## Allowed

- Subtle Daily Study phase fade/slide ([`SCREEN-DAILY-STUDY.md`](SCREEN-DAILY-STUDY.md)).
- Answer-selection state change (neutral → selected).
- Navigation drawer/rail open/collapse.
- A single gentle entrance for the Completion screen's checkmark — not celebratory, just a quiet acknowledgment.

## Forbidden

Confetti, bouncing, progress-bar animation beyond a simple linear fill,
decorative motion of any kind, and any animation that delays an already-
available interaction (a user must never wait for a transition to finish
before their next action registers).

## Reduced motion

`prefers-reduced-motion: reduce` disables all non-essential transitions
globally — state changes become instant, never removed or hidden. This is
a hard requirement, verified as part of the Visual Prototype Gate's
implementation follow-through and by automated `prefers-reduced-motion`
emulation in [`TESTING-STRATEGY.md`](TESTING-STRATEGY.md).
