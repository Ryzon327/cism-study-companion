# Explore & Practice

**Status: [CANONICAL]** for Explore & Practice remaining visually secondary
to Daily Study and never feeling required (stated directly during Phase 4
review). **[CANDIDATE]** for the specific treatment below.

## Visual weight

Deliberately lower than Today: smaller card, `text-secondary`-weight
heading, no primary-button styling on its entry point — a quiet labeled
link/card, not a hero (see
[`SCREEN-HOME-JOURNEY.md`](SCREEN-HOME-JOURNEY.md)'s Home layout, where
this entry sits below the fold).

## Internal structure

Presents By-Domain and Weak-Areas practice as clearly-optional side quests,
each with its own small "start" affordance, never using the same visual
language (size, color, position) as "Start Today's Study." The goal is
that a learner can *feel* the difference between the recommended path and
optional extra work without reading any label — **Daily Study = recommended
path; Explore & Practice = intentional optional additional work**, and the
UI must not make optional work feel required.

## Weak-areas practice and the canonical data model

Any "weak areas" surface must query mastery evidence by canonical
`concept.*`/`pattern.*` IDs and their `home_domain`
([`docs/data-model/RELATIONSHIPS.md`](../data-model/RELATIONSHIPS.md)),
never by display-string matching — this is a direct implementation
consequence of the BUG-001/BUG-002 root cause the canonical data model was
built to prevent, and the design system inherits that constraint rather
than reintroducing it at the UI layer.
