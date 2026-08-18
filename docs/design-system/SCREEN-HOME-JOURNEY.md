# Home / Today and Journey

**Status: [CANONICAL]** for the requirement that Home stay calm and
non-analytical and that Journey remain visually separate from CISM
lifecycle models (both stated directly during Phase 4 review).
**[CANDIDATE]** for the specific layout below.

> **Gate screen.** "Home / Today" is one of the seven screens required by
> the [Visual Prototype Gate](TESTING-STRATEGY.md#visual-prototype-gate) —
> no complete application implementation proceeds until this screen is
> visually validated at desktop/mobile and light/dark.

## Home / Today

One hero module, not a dashboard:

```
[Domain pill: "D2 · Risk Management"]
Your study session is ready
[Today's focus title]
[One-line reason: "Continuing lifecycle sequencing from yesterday."]
[~20–30 min]
[Start Today's Study →]   ← single primary action
```

Below the fold, clearly secondary (smaller type, no card chrome competing
with the hero): a compact **Journey** strip (below) and a quiet
**Explore & Practice** entry ([`SCREEN-EXPLORE-PRACTICE.md`](SCREEN-EXPLORE-PRACTICE.md)).
Nothing analytical lives on this screen — no charts, no streak counters, no
"X days active" language, per [`DESIGN-PRINCIPLES.md`](DESIGN-PRINCIPLES.md)'s
calm-progress rule. Progress detail belongs on the separate Progress
screen, reached deliberately, not surfaced by default.

## Journey

A horizontal stepper (desktop/tablet) that collapses to vertical (mobile):
**Foundation → D1 → D2 → D3 → D4 → Adaptive Reinforcement**, six nodes,
three states only:

- **Completed** — filled node, small check glyph, `text-secondary` label
- **Current** — accent-outlined node, `text-primary` label, slightly larger
- **Upcoming** — quiet/muted node, `text-tertiary` label

State derives directly from `docs/learning/CURRICULUM-BLUEPRINT.md`'s
curriculum structure and the canonical `domain.*` entities in
[`docs/data-model/registry`](../../schema/registry/domains.json) — Journey
never introduces its own notion of progress independent of that structure.

## Explicit separation from lifecycle models

Journey uses a distinct visual vocabulary (round nodes, connecting line,
six fixed steps) that never appears anywhere else in the product. Risk and
incident lifecycle stages (see
[`SEMANTIC-VISUAL-LANGUAGE.md`](SEMANTIC-VISUAL-LANGUAGE.md)) use a
different shape (rectangular chips in a horizontal track, appearing only
inline within a question or lesson) and different sizing. A learner must
never be able to mistake "where am I in the curriculum" for "where are we
in this risk scenario." This is a hard visual-language boundary because the
underlying data model already keeps these structurally separate —
`lifecycle.risk`/`lifecycle.incident` versus curriculum domain progression,
per [`docs/data-model/SCHEMA-LIFECYCLE.md`](../data-model/SCHEMA-LIFECYCLE.md)
— and the UI must not blur what the schema deliberately kept apart. Domain
1/3's conceptual model (also per that document) is never rendered as a
lifecycle-shaped sequence anywhere in the UI, for the same reason.
