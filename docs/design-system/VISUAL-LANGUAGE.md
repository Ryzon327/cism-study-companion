# Visual Language

**Status: [CANONICAL]** for the overall direction and the avoid/prefer
lists (stated directly during Phase 4 review); **[CANDIDATE]** for the
specific descriptive detail elaborating each point.

## The reference feeling

A **well-made reading/writing product** — the calm end of a good editorial
site or a thoughtful, focused SaaS tool — crossed with the seriousness of a
professional exam-prep product. Not a bootcamp portal, not an admin
console, not a quiz site.

## What this looks like in practice

- **Generous whitespace** is the primary structuring device — sections are separated by space, not boxes.
- **Quiet borders over shadows.** A 1px low-contrast border communicates "this is a distinct surface" more calmly than a drop shadow. Shadow is reserved for genuinely floating elements (dialogs, dropdowns) — two elevation levels total (see [`DESIGN-TOKENS.md`](DESIGN-TOKENS.md)), not a shadow scale.
- **One accent color**, used sparingly — primary actions, current-state indicators, focus rings — never as a background wash across large areas.
- **Rounded but not bubbly** — a single moderate corner radius used consistently across buttons, cards, inputs, and chips, not a different radius per component.
- **Minimal iconography** — icons appear only where they replace or reinforce a label meaningfully (phase indicators, status glyphs), never as pure decoration.
- **No hero imagery, no illustration, no photography.** Typography and layout carry the entire visual identity.

## Explicitly avoided

Per direct instruction, none of the following appear anywhere in this
design system: excessive gradients, glassmorphism, neon/cyber styling,
large decorative illustrations, badge clutter, rainbow semantic colors,
oversized dashboard tiles, unnecessary/decorative animation, dashboard
overload, excessive cards or widgets, dense enterprise-LMS styling,
excessive navigation choices, arbitrary decorative elements, and
overwhelming amounts of information on one screen.

## The five content-type visual identity

Concepts, patterns, roles, qualifiers, and lifecycle stages each get a
subtle, consistent visual identity — never a distinct color per instance.
Full treatment in [`SEMANTIC-VISUAL-LANGUAGE.md`](SEMANTIC-VISUAL-LANGUAGE.md);
the rule stated here is the constraint that document must satisfy:
**recognizable without turning the interface into a badge collection.**

## Relationship to Principle 0

Per [`DESIGN-PRINCIPLES.md`](DESIGN-PRINCIPLES.md), this restraint is not a
lack of ambition — it is the ambition. A visual system this quiet has to
get typography, spacing, and consistency exactly right, because it has no
decoration to hide behind. That is the premium feel being designed for.
