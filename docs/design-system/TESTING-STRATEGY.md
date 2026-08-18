# Testing Strategy, including the Visual Prototype Gate

**Status: [CANONICAL].** The Visual Prototype Gate is Amendment 2 from
Phase 4 review — a required checkpoint, not an optional recommendation.
Nothing in this document is installed or executed in Phase 4; this is
strategy only, extending the Phase 1 engineering-foundation pattern
(committed, reproducible, CI-executed) into the visual layer once
implementation begins.

## Visual Prototype Gate

> **We do not want to discover after implementation that the application
> does not look or feel right.**

Before any full, learner-facing Phase 5 implementation proceeds, seven
representative screens must be built as prototypes and visually evaluated
— not pixel-perfect production code, but real enough to judge the actual
design decisions in this directory against rendered output rather than
prose.

### The seven required screens

1. **Home / Today** — [`SCREEN-HOME-JOURNEY.md`](SCREEN-HOME-JOURNEY.md)
2. **Daily Study — Learn** — [`SCREEN-DAILY-STUDY.md`](SCREEN-DAILY-STUDY.md)
3. **Question / Apply** — [`SCREEN-QUESTION-FEEDBACK.md`](SCREEN-QUESTION-FEEDBACK.md)
4. **Answer Feedback** — [`SCREEN-QUESTION-FEEDBACK.md`](SCREEN-QUESTION-FEEDBACK.md)
5. **Daily Study Completion** — [`SCREEN-DAILY-STUDY.md`](SCREEN-DAILY-STUDY.md)
6. **Practice Exam** — [`SCREEN-PRACTICE-EXAM.md`](SCREEN-PRACTICE-EXAM.md)
7. **Review Center** — [`SCREEN-PRACTICE-EXAM.md`](SCREEN-PRACTICE-EXAM.md)

### Minimum evaluation matrix

Each of the seven screens is evaluated across, at minimum:

|  | Desktop | Mobile |
|---|---|---|
| **Light mode** | required | required |
| **Dark mode** | required | required |

Four renders per screen, minimum — 28 total evaluation points across the
gate.

### What the gate validates

Not pixel-perfect production fidelity — the specific qualities named
during Phase 4 review:

- Visual hierarchy
- Navigation
- Density
- Typography
- Spacing
- Premium feel
- Calmness
- Readability
- Question prominence
- Feedback presentation
- Mobile usability
- Light/dark coherence

### Gate rule

**No complete application implementation proceeds until this gate is
passed.** This means: component-level and infrastructure work (the
technology decision in [`TECHNOLOGY-ASSESSMENT.md`](TECHNOLOGY-ASSESSMENT.md),
canonical-data-model wiring) may begin before the gate, but full
learner-facing screens beyond the seven prototypes above do not get built
out until the visual direction they establish is explicitly approved.
This is the direct mechanism that prevents Principle 0
([`DESIGN-PRINCIPLES.md`](DESIGN-PRINCIPLES.md) — beauty is a product
requirement) from being discovered as unmet only after the fact.

### Gate is a human visual-review checkpoint, not an automated test

Unlike everything else in this document, the gate itself is evaluated by
a person looking at rendered screens against the twelve qualities above —
it produces an explicit approve/revise decision, the same way each phase
of this rebuild has required explicit architectural approval before
proceeding. The automated checks below run continuously once
implementation exists; the gate is a one-time (or iterated-until-approved)
checkpoint sitting between "design documented" and "full implementation
begins."

---

## Ongoing automated testing (once implementation exists)

- **E2E core flows (Playwright, Chromium + Firefox):** full Daily Study session (Recall→Learn→Apply→Repair→Complete), Mixed Practice mindset-gate-to-feedback — explicitly including at least one question tagging all four dimensions and at least one with a `null` qualifier or a partial dimension set, to verify [`SCREEN-MIXED-PRACTICE.md`](SCREEN-MIXED-PRACTICE.md)'s dimension-aware rendering and scoring — Practice Exam including Review Center mark/unmark/navigate/submit, theme toggle, backup import/export.
- **Accessibility automation:** `axe-core` via Playwright on every major screen, both themes, extending [`ACCESSIBILITY-STANDARD.md`](ACCESSIBILITY-STANDARD.md) into a CI-blocking check; a manual keyboard-only pass (tab order, focus visibility, no traps) as part of the same suite.
- **Visual regression:** Playwright screenshot comparison on the same seven gate screens plus any others added later, at each breakpoint in [`SPACING-AND-LAYOUT.md`](SPACING-AND-LAYOUT.md), in both light and dark — catches unintended token/layout drift after the gate has been passed once.
- **Responsive/viewport checks:** automated runs at the four breakpoint widths, confirming no horizontal scroll and no content loss.
- **Focus-state checks:** an explicit assertion pass confirming every interactive element shows a visible focus ring when tab-reached.
- **Reduced-motion emulation:** Playwright's `prefers-reduced-motion` emulation confirming transitions collapse correctly, per [`MOTION-STANDARD.md`](MOTION-STANDARD.md).
- **Dependency/security scanning:** required from the moment any dependency is introduced (per [`TECHNOLOGY-ASSESSMENT.md`](TECHNOLOGY-ASSESSMENT.md)'s hard requirement), regardless of which architecture Phase 5 selects.

None of this is installed in Phase 4. This directly extends the Phase 1
engineering-foundation pattern (committed, reproducible, CI-executed) into
the visual layer — nothing here counts as "tested" until it's a blocking
CI check, per `CLAUDE.md`.
