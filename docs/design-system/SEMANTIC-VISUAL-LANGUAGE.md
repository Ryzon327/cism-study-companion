# Semantic Visual Language: Concept, Pattern, Role, Qualifier, Lifecycle Stage

**Status: [CANONICAL]** for the requirement that these five content types
be recognizable but restrained, sharing a coherent identity rather than
random per-instance colors (stated directly during Phase 4 review).
**[CANDIDATE]** for the specific treatment per type below.

## The shared family

A shared restrained "family" — same corner radius, same neutral tag
surface (`tag-bg`/`tag-border`/`tag-text` from
[`DESIGN-TOKENS.md`](DESIGN-TOKENS.md)), same border weight — differentiated
by icon and label prefix, **never by color**. This directly answers "do not
assign each pattern a random color" and the general instruction to remain
"recognizable without turning the interface into a badge collection."

| Type | Treatment | Canonical source |
|---|---|---|
| **Concept** | No tag at all — expressed as a heading, not a badge. | [`docs/data-model/SCHEMA-QUESTION.md`](../data-model/SCHEMA-QUESTION.md) (`concepts[]`) |
| **Pattern** | A **callout block** (not an inline chip) — small abstract glyph + "PATTERN" eyebrow + pattern name as title + one-line meaning. | [`schema/registry/patterns.json`](../../schema/registry/patterns.json), P01–P15 |
| **Role** | A small **pill tag** with a minimal person-glyph + role display name. | [`schema/registry/roles.json`](../../schema/registry/roles.json) |
| **Qualifier** | Treated **typographically**, not as an icon-tag — bold, letter-spaced, slightly tinted-background inline text (e.g., **FIRST**). | [`schema/registry/qualifiers.json`](../../schema/registry/qualifiers.json) |
| **Lifecycle stage** | A **chip within a horizontal sequence track**, current stage highlighted (accent outline), others muted. | [`schema/registry/lifecycle-stages.json`](../../schema/registry/lifecycle-stages.json) |

## Why Pattern is the one block-level exception

A pattern is a reasoning shape worth pausing on, not a metadata tag — it
gets its own component (`PatternCallout`,
[`COMPONENT-INVENTORY.md`](COMPONENT-INVENTORY.md)) reused identically in
Lesson (Learn phase), Feedback, and Repair
([`SCREEN-DAILY-STUDY.md`](SCREEN-DAILY-STUDY.md),
[`SCREEN-QUESTION-FEEDBACK.md`](SCREEN-QUESTION-FEEDBACK.md)) — visual
consistency across all three contexts reinforces that it's the same idea
being reinforced, not three different features.

## Why Qualifier is typographic, not iconic

A qualifier is literally a word to find in the stem (FIRST, NEXT, BEST,
MOST, PRIMARY — the canonical five, per
[`docs/learning/QUALIFIER-DECODER.md`](../learning/QUALIFIER-DECODER.md)).
The typographic treatment reinforces "spot this word in the text," which is
the actual exam skill being trained — an icon-based tag would abstract away
exactly the thing the learner needs to practice noticing.

## Why Lifecycle stage is visually distinct from Journey

Covered fully in
[`SCREEN-HOME-JOURNEY.md`](SCREEN-HOME-JOURNEY.md#explicit-separation-from-lifecycle-models):
different shape, different size, different context (always inline within a
question, never full-width, never a fixed six-step sequence). Lifecycle
stage chips only render for Domain 2/4 canonical-lifecycle content — per
[`docs/data-model/SCHEMA-LIFECYCLE.md`](../data-model/SCHEMA-LIFECYCLE.md),
Domain 1/3 has no canonical lifecycle, so this component simply does not
render for that content, rather than rendering a placeholder or a
lower-fidelity substitute.

## Status governance, rendered

Per [`docs/data-model/PROVENANCE-MODEL.md`](../data-model/PROVENANCE-MODEL.md),
only `CANONICAL`-status patterns/roles/qualifiers/lifecycle-stages may
appear in a scoring-relevant context (a question, a mindset-gate choice).
`CANDIDATE` or `PROTOTYPE_REFERENCE` content, if ever surfaced at all (e.g.,
in a future content-review tool), must use a visually distinct treatment —
not the same tag family used for live learner-facing content — so a
reviewer can never mistake unpromoted content for something a learner
would actually see.
