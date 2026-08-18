# Example Content — Illustrative / Test-Only, Not Production Curriculum

**Read this before treating anything in this directory as approved
content.** The concepts, questions, and lessons in `concepts.example.json`,
`questions.example.json`, and `lessons.example.json` exist **only** to
exercise the canonical data model — relationships, validation, and failure
prevention — during Phase 3 (design/schema foundation). They are not, and
must not be interpreted as, approved production curriculum content.

## What this means concretely

- **This is not the CISM curriculum or question bank.** It is a handful of
  hand-written illustrative entities sized to prove the schema works, not
  a content set sized or vetted to teach or test a learner.
- **Example IDs do not pre-authorize a final content-taxonomy decision.**
  In particular: `concept.d1.policy-hierarchy` and
  `concept.d3.policy-hierarchy` are a **structural demonstration** that
  identical display text can safely coexist under distinct stable IDs —
  proof that the ID scheme prevents the BUG-001 collision class. They are
  **not** a product decision that the rebuilt curriculum should ultimately
  contain two distinct canonical "Policy hierarchy" concepts. Whether
  Domain 1 and Domain 3 genuinely need separate concepts here, or whether
  one should reference the other (per
  [`docs/data-model/ID-CONVENTIONS.md`](../../docs/data-model/ID-CONVENTIONS.md)'s
  reuse guidance), is a content-taxonomy question that belongs to the later
  content migration/reconstruction phase, informed by the actual supplied
  CISM source material — not decided here.
- **Actual canonical content promotion requires approved content
  migration/source validation.** Nothing in this directory became
  `CANONICAL` production content by virtue of existing in a JSON file with
  a passing test. Promotion from illustrative/example status to real,
  learner-facing canonical content is a distinct, separately-approved step.

## Content status of the entities in this directory

Per Phase 3 review, most example entities carry `content_status: CANDIDATE`
specifically so their non-production nature is visible in the data itself,
not just in this README. The one deliberate exception:
`concept.d2.residual-risk` and `question.d2.0001` are kept `CANONICAL`,
because [`tests/data-model/status-governance.test.mjs`](../../tests/data-model/status-governance.test.mjs)
needs at least one real, correctly-tagged canonical example to positively
prove that mechanism — a suite that only ever tests the *rejection* path
would not actually prove the *acceptance* path works. Even for that pair:
`concept.d2.residual-risk`'s definition is genuine approved Phase 2
terminology, but `question.d2.0001`'s specific stem wording is still
illustrative, written to exercise the schema's full field set, not sourced
from or verified against learner-supplied exam material. Every entity's
own `note` field repeats this distinction inline for anyone reading the
JSON directly rather than this file.

## Why illustrative content exists at all

To prove, with real data instead of only prose, that:
- domain-scoped concept IDs prevent the BUG-001 collision class (structurally, not by convention),
- referential integrity rejects a question referencing a nonexistent concept ID (the BUG-002 collision class),
- status governance rejects a `CANONICAL` question scoring against `CANDIDATE`/`PROTOTYPE_REFERENCE` content,
- the full multi-dimension question shape (concept + pattern + qualifier + role + lifecycle/stage + decision type + per-option repair targets + evidence dimensions) is actually usable, not just specified on paper.

See [`docs/data-model/README.md`](../../docs/data-model/README.md) for the
full Phase 3 scope statement, and
[`docs/data-model/MIGRATION-STRATEGY.md`](../../docs/data-model/MIGRATION-STRATEGY.md)
for how real content eventually gets promoted into this model.
