# Validation Invariants

This document is the human-readable specification that
[`tests/data-model/`](../../tests/data-model/) implements. Per
[`CLAUDE.md`](../../CLAUDE.md)'s rule — a check only counts as regression
protection if it's committed, reproducible, and CI-executed — every
invariant below has a corresponding blocking test; this document should
never claim an invariant that isn't actually checked.

| Invariant | Test file |
|---|---|
| Every ID matches its namespace's format | `id-integrity.test.mjs` |
| Every ID is unique, within and across collections | `id-integrity.test.mjs` |
| Every referenced ID resolves to a real entity of the expected type | `referential-integrity.test.mjs` |
| Every relationship field value is id-shaped, never a display string | `referential-integrity.test.mjs` |
| Every `Concept.home_domain` resolves to a real domain | `concept-domain.test.mjs` |
| Every `Question.concepts[]` resolves to a concept with a valid `home_domain` | `concept-domain.test.mjs` |
| `domain.foundation` is excluded from exam-domain weighting/completion/analytics | `concept-domain.test.mjs` |
| Exactly the 4 ISACA domains are `exam_domain: true`, weights sum to 100 | `concept-domain.test.mjs` |
| The lifecycle registry contains only `lifecycle.risk` and `lifecycle.incident` | `lifecycle-integrity.test.mjs` |
| Lifecycle stage positions are unique and contiguous per lifecycle | `lifecycle-integrity.test.mjs` |
| Stage `preceding`/`following` agree with position order | `lifecycle-integrity.test.mjs` |
| No Domain 1 or Domain 3 question references a lifecycle or stage | `lifecycle-integrity.test.mjs` |
| Every question has exactly 4 unique, non-empty options | `question-structure.test.mjs` |
| Every question has exactly one correct option; every wrong option has a rationale | `question-structure.test.mjs` |
| `primary_role`, when set, is a member of `roles_mentioned` | `question-structure.test.mjs` |
| `qualifier.none` does not exist in the registry | `question-structure.test.mjs` |
| No question uses the literal string `"qualifier.none"` | `question-structure.test.mjs` |
| No `CANONICAL` question/lesson references `CANDIDATE`/`PROTOTYPE_REFERENCE` content in a scoring field | `status-governance.test.mjs` |
| Every `CANONICAL` entity has a non-null `source` | `status-governance.test.mjs` |
| `content_status` is always one of the three approved values | `status-governance.test.mjs` |
| `evidence.confidence.contributes_to_mastery` is `false` | `evidence-confidence.test.mjs` |
| Every `PracticeMode.contributes_to_mastery` is `false` | `evidence-confidence.test.mjs` |
| Every evidence dimension with a mapped repair target has `contributes_to_mastery: true` | `evidence-confidence.test.mjs` |

## Scope of "scoring-relevant" for the status-governance invariant

`status-governance.test.mjs` treats these `Question` fields as
scoring-relevant (and therefore status-governed): `concepts`, `patterns`,
`qualifier`, `roles_mentioned`, `primary_role`, `lifecycle`, `stage`,
`decision_type`, `evidence_dimensions`, and each option's `repair_target`.
A `related_*` "see also" link on a `Pattern` or `Role` entity is
*informational*, not scoring-relevant, and is intentionally not governed by
this check — a `CANONICAL` pattern is allowed to note a `PROTOTYPE_REFERENCE`
qualifier as a related concept for context, but a `CANONICAL` question is
never allowed to actually *use* that qualifier to test the learner.

## Phase 6C additions — QuestionFamily / variant repetition model

These extend `tests/content-production/`, not this file's own suite (which
covers `schema/example/` only) — see
[`REPETITION-AND-RECALL-MODEL.md`](REPETITION-AND-RECALL-MODEL.md) and
[`SCHEMA-QUESTION-FAMILY.md`](SCHEMA-QUESTION-FAMILY.md).

| Invariant | Test file |
|---|---|
| Family IDs unique, format `family.<domain>.<slug>` | `family-integrity.test.mjs` |
| Every family field reference resolves | `family-integrity.test.mjs` |
| `Question.family`, when set, resolves to a real family | `family-integrity.test.mjs` |
| A variant's `concepts`/`patterns`/`evidence_dimensions` are a subset of its family's declared set | `family-integrity.test.mjs` |
| A `CANONICAL` family meets its `minimum_variant_count`; a `CANDIDATE` family is reported, not blocked, below it | `family-integrity.test.mjs` |
| No two variants in one family share an identical stem or identical option-text set (blocking) | `variation-quality.test.mjs` |
| Prompt-similarity above threshold is a **warning**, not a blocking failure — human review remains authoritative for genuine diversity | `variation-quality.test.mjs` |
| Every `variation_tags` value is a member of the fixed variation-strategy vocabulary | `variation-quality.test.mjs` |
| Selection algorithm: unseen-preferred, least-recently-seen fallback, deterministic tie-break, exact repeat allowed only when the pool is exhausted | `tests/frontend/unit/selection-engine.test.ts` (pure-function tests, constructed fake histories) |
| Confidence never independently increments a mastery signal | `tests/frontend/unit/selection-engine.test.ts` |

## Todo tests intentionally not affected by this suite

BUG-001, BUG-002, and BUG-003 remain `todo` in
[`tests/data-integrity/`](../../tests/data-integrity/) (Phase 1). This is
correct and expected: those tests check the *existing prototype's*
`data/*.js` content, which this phase did not touch. The Phase 3 suite
proves the *new model* prevents the same class of defect for *new*
content — it does not and cannot resolve defects in content this phase
never migrated. See [`MIGRATION-STRATEGY.md`](MIGRATION-STRATEGY.md) for
how that migration would eventually close those three tickets.
