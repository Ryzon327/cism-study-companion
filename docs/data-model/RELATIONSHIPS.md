# Relationships

All relationships are ID references, never display strings — checked by
[`tests/data-model/referential-integrity.test.mjs`](../../tests/data-model/referential-integrity.test.mjs).
Cardinality shown as (owning field) → (target).

| From | Field | → To | Cardinality |
|---|---|---|---|
| Concept | `home_domain` | Domain | many→one, required |
| Concept | `related_patterns` | Pattern | many↔many, optional |
| Question | `domain` | Domain | many→one, required |
| Question | `concepts` | Concept | many↔many, ≥1 required |
| Question | `patterns` | Pattern | many↔many, optional |
| Question | `qualifier` | Qualifier | many→one, optional — `null` means no qualifier signal (see [`SCHEMA-QUALIFIER.md`](SCHEMA-QUALIFIER.md)) |
| Question | `roles_mentioned` / `primary_role` | Role | many↔many / many→one, optional |
| Question | `lifecycle` + `stage` | Lifecycle + LifecycleStage | many→one each, only settable for Domain 2/4 (no canonical lifecycle exists for Domain 1/3) |
| Question | `decision_type` | DecisionType | many→one, optional |
| Question | `evidence_dimensions` | EvidenceDimension | many↔many |
| Question.options[].`repair_target` | — | RepairTarget | per-option, optional |
| Question | `family` | QuestionFamily | many→one, optional |
| QuestionFamily | `domain` | Domain | many→one, required |
| QuestionFamily | `concepts` | Concept | many↔many, ≥1 required |
| QuestionFamily | `patterns` | Pattern | many↔many, optional |
| QuestionFamily | `evidence_dimensions` | EvidenceDimension | many↔many, ≥1 required |
| QuestionFamily | `role_target` | Role | many→one, optional — may name a recurring distractor, not necessarily the correct answer (see SCHEMA-QUESTION-FAMILY.md) |
| QuestionFamily | `qualifier_target` | Qualifier | many→one, optional |
| QuestionFamily | `lifecycle` + `stage_target` | Lifecycle + LifecycleStage | many→one each, domain-gated same as Question |
| QuestionFamily | `decision_type` | DecisionType | many→one, optional |
| Question | `source` | Source | many→one, required for CANONICAL |
| Lesson | `domain`, `concepts`, `patterns`, `prerequisites` | Domain, Concept, Pattern, (Lesson\|Concept) | as named |
| Lesson | `retrieval_refs` | Question | many↔many |
| Pattern | `applicable_domains`, `related_roles`/`related_qualifiers`/`related_lifecycles` | Domain, Role, Qualifier, Lifecycle | many↔many, optional |
| Role | `characteristic_domains` | Domain | many↔many, **weighting only, never exclusivity** |
| LifecycleStage | `lifecycle`, `position`, `preceding`/`following` | Lifecycle, integer, LifecycleStage | ordered, one lifecycle |
| RepairTarget | `related_evidence_dimension` | EvidenceDimension | many→one |

## Family-membership invariant (Phase 6C)

**When `Question.family` is set, the variant's own `concepts` /
`patterns` / `evidence_dimensions` must each be a subset of the family's
declared set.** A variant can't silently test something its family doesn't
claim to measure — enforced by
[`tests/content-production/family-integrity.test.mjs`](../../tests/content-production/family-integrity.test.mjs).
This is the mechanism that makes "which family tests this target" (see
[`REPETITION-AND-RECALL-MODEL.md`](REPETITION-AND-RECALL-MODEL.md)) a
reliable query instead of a hopeful convention.

## Two fields per-question that carry more nuance than a single value would

**`primary_role` + `roles_mentioned`.** A scenario can name more than one
role while only one is the answer the reasoning actually turns on. Approved
during Phase 3 review with a required invariant: **`primary_role`, when
set, must appear in `roles_mentioned`** — enforced by
[`tests/data-model/question-structure.test.mjs`](../../tests/data-model/question-structure.test.mjs).
See [`schema/example/questions.example.json`](../../schema/example/questions.example.json)
(`question.d2.0001`) for a worked example: the security manager is
mentioned (a plausible-but-wrong authority) while the risk owner is
`primary_role`.

**`repair_target` on each option, not once per question.** Approved
explicitly: different distractors can represent different reasoning
failures — one option a lifecycle-jump trap, another an authority trap,
another a technical-vs-management trap. Tagging at the question level would
force one diagnosis regardless of which wrong option the learner actually
picked. See `question.d2.0001` and `question.d4.0001` for worked examples
with three differently-tagged wrong options each.

## Learner-evidence shapes (vocabulary only, not implemented this phase)

```
AttemptEvidence
  question              Question id
  option_chosen         option key ("a".."d")
  correct               boolean
  practice_mode         PracticeMode id     — operational context, does not itself score
  evidence_dimensions_scored   { EvidenceDimension id -> boolean }[]
  repair_targets_triggered     RepairTarget id[]   — derived from the chosen option, if wrong
  confidence             "high" | "low" | null   — calibration only, see EVIDENCE-VOCABULARY.md
  timestamp

MasteryRecord
  subject                id of a Concept | Pattern | Role | Qualifier | LifecycleStage | EvidenceDimension
  domain                 Domain id (derived from subject, denormalized for query convenience)
  attempts, correct, state   (shape TBD in Phase 4 — not designed here)

LegacyEvidenceRecord
  raw_concept_title       string — the original prototype display string, preserved verbatim
  mapping_confidence      "safe" | "ambiguous" | "colliding" | "unmappable"
  candidate_concept_id    Concept id | null — only set when mapping_confidence is "safe"
```

These three shapes exist to give
[`MIGRATION-STRATEGY.md`](MIGRATION-STRATEGY.md) something concrete to
describe. No storage engine, schema migration, or write path is designed
for them in Phase 3.
