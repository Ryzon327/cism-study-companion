# Mixed Practice

**Status: [CANONICAL]** for the requirement that reasoning-dimension
classification stay compact and not become a crowded taxonomy interface,
and — per the final Phase 4 decision — that Mixed Practice be **dimension-
aware**: it renders and scores only the reasoning dimensions a given
question actually tags, never a fixed set. **[CANDIDATE]** for the specific
layout below.

## The governing rule

> **Do not force a reasoning dimension that the question does not
> contain.**

This applies to every dimension Mixed Practice can classify (qualifier,
role, lifecycle, decision, and any future dimension), not just qualifier.
The canonical data model determines which dimensions are applicable to a
given question — per
[`docs/data-model/SCHEMA-QUESTION.md`](../data-model/SCHEMA-QUESTION.md),
`qualifier`, `roles_mentioned`/`primary_role`, `lifecycle`/`stage`, and
`decision_type` are all independently optional fields, and
`evidence_dimensions` names exactly which dimensions a question is capable
of producing evidence for. Mixed Practice reads that per-question shape and
renders/scores accordingly — it never assumes a fixed four-control layout.

### The specific case that drove this decision: `qualifier: null`

For a canonical question, `qualifier: null` means **there is no meaningful
qualifier signal to classify for that question** — not "the answer is
NONE." Per the Phase 3 data-model amendment,
[`qualifier.none` does not exist](../data-model/SCHEMA-QUALIFIER.md) and
must never be introduced or presented as a canonical learner choice. When a
question's `qualifier` is `null`, Mixed Practice must:

- **not** ask the learner to classify the qualifier for that question,
- **not** render an empty or disabled qualifier control,
- **not** score qualifier evidence for that question,
- **not** penalize the learner for the absence of a qualifier classification.

The same rule applies independently to role, lifecycle, and decision: each
is asked only when the question actually tags it, and only ever scored
when asked.

## The mindset gate — now dimension-aware

Instead of a fixed 2×2 grid of four groups, the gate renders **one group
per dimension the current question actually tags**, in the same stable
order (Qualifier, Role, Lifecycle, Decision) whenever a dimension is
present, laid out compactly (single column stacks naturally on mobile;
1–4 groups on desktop, never padded out to a fixed count):

```
Example: a question tagging qualifier + role + lifecycle + decision (all four)

Qualifier      [FIRST] [NEXT] [BEST] [MOST] [PRIMARY]
Role           [chip select — 12 options, searchable/scroll if needed]
Lifecycle      [chip select]
Decision       [chip select]

[Lock in mindset →]   (disabled until every RENDERED group is chosen)
```

```
Example: a question tagging only role + lifecycle (qualifier: null, no decision_type)

Role           [chip select]
Lifecycle      [chip select]

[Lock in mindset →]   (disabled until every RENDERED group is chosen)
```

The "Lock in mindset" gate condition is **"every group actually shown has
a selection,"** never "all four dimensions" as a hardcoded count — a
question with two applicable dimensions unlocks with two selections, not
four. Chips use the same restrained tag treatment as
[`SEMANTIC-VISUAL-LANGUAGE.md`](SEMANTIC-VISUAL-LANGUAGE.md) — no
color-coding per selection, no distinct treatment per option within a
group. Options draw from the canonical `qualifier.*`, `role.*`,
`lifecycle.*`, and `decision.*` registries in
[`schema/registry/`](../../schema/registry/); only `CANONICAL`-status
entries are offered as choices (per
[`docs/data-model/PROVENANCE-MODEL.md`](../data-model/PROVENANCE-MODEL.md)'s
status-governance rule) — a learner is never asked to classify against a
`CANDIDATE` or `PROTOTYPE_REFERENCE` value.

A single-dimension question (e.g., role-only) still passes through the
mindset-gate step, just with one group — the gate is never skipped
entirely, since even one correctly-identified dimension is real, useful
evidence, and the step still primes the "read like a CISM manager before
looking at options" habit the gate exists to build.

## Ordering constraint, rendered visually by omission

Per [`docs/learning/REPAIR-MODEL.md`](../learning/REPAIR-MODEL.md#relationship-to-mixed-practice),
Mixed Practice must not ask the learner to classify these dimensions before
Foundation has taught them — this is enforced upstream (a learner who
hasn't reached Mixed Practice in the curriculum sequence never sees this
screen), so the screen itself carries no instructional scaffolding: it
assumes competence. No inline hints, no "remember, FIRST means..." text —
this screen is explicitly the *application* of a decoder Foundation already
taught, so it stays terse rather than re-teaching.

## Answering

Once the mindset is locked in, the screen proceeds into the same Question
component as everywhere else
([`SCREEN-QUESTION-FEEDBACK.md`](SCREEN-QUESTION-FEEDBACK.md)) — domain
hidden until feedback, per existing behavior worth preserving. Feedback
afterward reveals which of the *rendered* dimensions were correctly
identified — never referencing a dimension the question didn't tag in the
first place — using the same quiet ✓/✕ vocabulary as answer correctness,
never a separate harsher treatment for a missed classification.

## Evidence implications

Only rendered-and-answered dimensions produce `AttemptEvidence` for their
corresponding `EvidenceDimension` (per
[`docs/data-model/RELATIONSHIPS.md`](../data-model/RELATIONSHIPS.md)'s
`evidence_dimensions_scored` shape). A dimension the question didn't tag
contributes nothing to that dimension's `MasteryRecord` for this attempt —
not a wrong answer, not a skipped answer, simply not evidence at all. This
keeps mastery evidence honest: a learner's qualifier-recognition mastery is
built only from questions that actually had a qualifier to recognize, the
same "do not fabricate precision" principle already governing historical
evidence migration in
[`docs/data-model/MIGRATION-STRATEGY.md`](../data-model/MIGRATION-STRATEGY.md)
applied here to real-time evidence instead of legacy evidence.
