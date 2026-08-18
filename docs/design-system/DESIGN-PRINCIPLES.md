# Design Principles

**Status: [CANONICAL].** Approved directly during Phase 4 review, including
Amendment 3 (beauty is a product requirement), folded in as Principle 0
below rather than appended, because it governs how every other principle
should be read.

## Principle 0 — Visual quality is a product requirement, not cosmetic polish

The rebuilt application must feel intentionally designed and premium.
**A functionally complete but visually mediocre implementation is not
considered a complete deliverable.** This is not in tension with the other
principles — it is bounded by them: polish must never cost clarity,
accessibility, learning effectiveness, performance, or calm. The rule that
resolves any apparent conflict is the same one that opened Phase 4 review:

> **Beautiful does not mean busy.**

A screen that is visually striking but harder to read, slower to use, or
less accessible than a plainer alternative is not "more premium" — it has
failed this principle, not satisfied it. Premium, here, means restraint,
clarity, and craftsmanship in the details that matter (typography, spacing,
consistency), not decoration.

## The eight supporting principles

1. **One primary action per screen.** If two buttons compete for attention, one of them is wrong.
2. **Content is the interface.** Chrome (nav, headers, controls) recedes; the question, lesson, or explanation is the visually loudest thing on screen.
3. **Calm progress, not gamified progress.** Progress is communicated, never pressured. No streaks, no red "overdue" states, no counters designed to provoke anxiety.
4. **Restraint over decoration.** Every visual distinction (color, icon, border) must encode real meaning (a semantic token, a content type). Nothing is decorative.
5. **One consistent semantic language, not per-instance styling.** A pattern always looks like a pattern; a role always looks like a role — never a bespoke treatment per screen.
6. **Accessibility is the default rendering, not a mode.** There is no "accessible version" — there is one version, and it's accessible.
7. **Motion serves comprehension.** Motion explains a state change (this became that); it never performs.
8. **Light and dark are two first-class designs sharing one token system**, not one design with an inverted filter.

## How these principles are enforced, not just stated

Prose principles drift without a mechanism. Three mechanisms hold these in
place:

- **The Visual Prototype Gate** ([`TESTING-STRATEGY.md`](TESTING-STRATEGY.md#visual-prototype-gate)) is the checkpoint where Principle 0 and Principles 1–8 are actually evaluated against rendered screens, before full implementation proceeds — not assumed from documentation alone.
- **Automated accessibility and visual-regression testing** ([`TESTING-STRATEGY.md`](TESTING-STRATEGY.md)) makes Principles 6 and 8 CI-checkable, not aspirational.
- **The token system** ([`DESIGN-TOKENS.md`](DESIGN-TOKENS.md)) makes Principle 5 structurally difficult to violate — an implementer reaching for a color or spacing value has to go through a named semantic token, not an arbitrary literal.

## Preserved product requirements this design system exists to express

Carried forward from [`docs/learning/CURRICULUM-BLUEPRINT.md`](../learning/CURRICULUM-BLUEPRINT.md#product-requirement-user-interface--experience)
and reaffirmed unchanged during Phase 4 review: Daily Study as the visual
and functional center of the product; restrained navigation; capped reading
width; generous whitespace; minimal dashboard behavior; no streaks, no
guilt mechanics, no gamification pressure; Journey kept visually separate
from CISM lifecycle/big-picture models; immersive Daily Study; concise-but-
fruitful lessons; the original question staying visible during feedback;
explanations for both correct and incorrect answers; optional practice
visually secondary to the recommended path; targeted repair without
punishment; an explicit, calm stopping point; first-class light and dark
modes; responsive/mobile-first behavior; a WCAG 2.2 AA target; reduced-
motion support; restrained semantic visual language; a Practice Exam free
of coaching hints; and the existing Review Center's behavior preserved.
Every one of these is elaborated in its corresponding document below, not
restated as a checklist substitute for the real design.
