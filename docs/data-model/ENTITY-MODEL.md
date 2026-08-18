# Entity Model

Fifteen first-class, ID-addressable entity types, in three tiers.

## Vocabulary entities (small, mostly-fixed — the "alphabet")

| Entity | Registry file | Count (seeded) |
|---|---|---|
| Domain | `schema/registry/domains.json` | 5 (4 exam domains + Foundation) |
| Role | `schema/registry/roles.json` | 12 |
| Qualifier | `schema/registry/qualifiers.json` | 5 canonical + 3 prototype-reference |
| DecisionType | `schema/registry/decision-types.json` | 5 |
| EvidenceDimension | `schema/registry/evidence-dimensions.json` | 12 |
| RepairTarget | `schema/registry/repair-targets.json` | 10 |

`DecisionType` formalizes Mixed Practice's existing "decision" dimension
(business/risk/program-control/incident/recovery, per
[`docs/learning/REPAIR-MODEL.md`](../learning/REPAIR-MODEL.md#relationship-to-mixed-practice))
as a validated small vocabulary instead of a free string. Approved during
Phase 3 review with the explicit instruction not to over-expand it — it
stays at exactly these five values unless a future phase justifies more.

## Content entities (the growing curriculum surface)

| Entity | Registry/example file |
|---|---|
| Concept | `schema/example/concepts.example.json` |
| Pattern | `schema/registry/patterns.json` (P01–P15, fixed) |
| Lifecycle | `schema/registry/lifecycles.json` (exactly 2, fixed — see amendment below) |
| LifecycleStage | `schema/registry/lifecycle-stages.json` |
| Question | `schema/example/questions.example.json` |
| QuestionFamily | not yet seeded — no example needed multiple wording variants of one question in this phase |
| Lesson | `schema/example/lessons.example.json` |

## Support entities (infrastructure, not curriculum content)

| Entity | Registry file |
|---|---|
| Source | `schema/registry/sources.json` |
| PracticeMode | `schema/registry/practice-modes.json` |

`PracticeMode` (`mode.daily-study`, `mode.active-practice`,
`mode.mixed-practice`, `mode.practice-exam`) is **operational/context
metadata only** — per explicit Phase 3 review clarification, it describes
*where/how* evidence was generated, is not curriculum knowledge, and every
entry has `contributes_to_mastery: false`, enforced by
[`tests/data-model/evidence-confidence.test.mjs`](../../tests/data-model/evidence-confidence.test.mjs).

## Learner-evidence entities (vocabulary only — no storage implementation designed)

`AttemptEvidence`, `MasteryRecord`, `LegacyEvidenceRecord` are named and
their shape sketched in [`RELATIONSHIPS.md`](RELATIONSHIPS.md) and
[`MIGRATION-STRATEGY.md`](MIGRATION-STRATEGY.md), but **no learner-storage
implementation exists yet** — per explicit instruction, that is Phase 4+
work.

## Common entity envelope

Every content and vocabulary entity carries:

```
id                    stable, permanent, namespaced (see ID-CONVENTIONS.md)
display_name          human-readable, independently renameable
content_status        CANONICAL | CANDIDATE | PROTOTYPE_REFERENCE
verification_status   see PROVENANCE-MODEL.md — a separate axis
active                boolean, orthogonal to content_status (see VERSIONING-STRATEGY.md)
version                integer, starts at 1
replaced_by            id | null
source                 Source id
```

## Amendment: `domain.foundation`

Approved with an explicit constraint: `domain.foundation` is **not** a
fifth CISM exam domain. It is a namespace convenience for Foundation
lesson/content IDs. `domains.json` marks it `exam_domain: false,
exam_weight: null`, and it is structurally excluded from exam-domain
weighting, four-domain completion calculations, exam-domain analytics, and
adaptive domain selection among Domains 1–4 — enforced by
[`tests/data-model/concept-domain.test.mjs`](../../tests/data-model/concept-domain.test.mjs).

## Amendment: no `lifecycle.governance-program`

An earlier draft of this model proposed a `CANDIDATE`-status
`lifecycle.governance-program` entity to hold the Domain 1/3 conceptual
relationships. **This was rejected during Phase 3 review.** The lifecycle
registry now contains only the two approved canonical lifecycles
(`lifecycle.risk`, `lifecycle.incident`) — nothing else may occupy the
lifecycle namespace, canonical or otherwise, merely for structural
symmetry. The Domain 1/3 conceptual relationships remain in
[`docs/learning/LIFECYCLE-MODEL.md`](../learning/LIFECYCLE-MODEL.md#domain-1--domain-3--conceptual-model-not-canonical)
as prose only. See [`SCHEMA-LIFECYCLE.md`](SCHEMA-LIFECYCLE.md) for the
full rationale and the test that structurally enforces it.
