# Repetition and Recall Model

**Status: [CANONICAL mechanism/architecture; approved during Phase 6C
review]**. This document formalizes the Phase 6C Architecture Report into
the same kind of durable, implementation-facing specification
[`VALIDATION-INVARIANTS.md`](VALIDATION-INVARIANTS.md) already is for the
Phase 3 data model — the human-readable spec that
`app/src/content/selection.ts` and `tests/content-production/` actually
implement.

## The problem this document solves

Phase 6B's human experience gate surfaced a real product requirement: the
founder saw the same exact question every session, because Phase 6B's
vertical slice had exactly one question per lesson. The finding was not
"add more content" — it was "concept repetition is desirable; unnecessary
exact-question repetition is not," and the two were previously
indistinguishable because nothing in the architecture separated them. See
[`docs/data-model/PHASE-6B-GATE-RECORD.md`](PHASE-6B-GATE-RECORD.md).

## The layered model

```
Concept / Pattern / EvidenceDimension     WHAT is being taught
        ↑ tested by
QuestionFamily                             WHY a group of questions exists — the reasoning target
        ↑ instantiated as
Question ("variant" is a role, not a type) HOW one concrete scenario expresses it
        ↑ shown to a learner as
Exposure (in-memory only — see below)      WHEN a learner saw a specific variant
        ↑ answered via
Attempt (in-memory only — see below)       WHAT the learner did with that exposure
        ↑ aggregated into (future — not built)
RecallTarget selection / MasteryRecord     WHERE the system goes next
```

See [`SCHEMA-QUESTION-FAMILY.md`](SCHEMA-QUESTION-FAMILY.md) for the entity
shape.

## Exact-repeat policy

Deterministic priority order — never `Math.random()`:

1. Prefer a variant in the target family never shown to this learner.
2. If every variant has been shown: prefer the least-recently-shown variant.
3. Tie-break deterministically (lowest question id).
4. Exact repeats are allowed, not forbidden — when the pool is genuinely
   exhausted (rule 2 already produces this gracefully), when repair
   deliberately re-shows the same variant after a delay to confirm a
   correction stuck (not immediately — [`REPAIR-MODEL.md`](../learning/REPAIR-MODEL.md)'s
   existing "never simply repeat the same question immediately" rule is
   unchanged), or when Practice Exam intentionally samples deterministically
   for exam-form fidelity.

Implemented as a pure function: `selectVariant(candidateIds, history, now)`
— same inputs always produce the same output, so a selection bug is always
reproducible from a bug report, not a one-time fluke.

## Recall target-selection model

Three independently-testable stages:

1. **WHAT** needs reinforcement — a `(concept | pattern | evidenceDimension)`
   target. Phase 6C's two-family slice makes this trivial (one eligible
   target); the general model must still resolve it correctly once more
   targets exist.
2. **WHICH FAMILY** tests that target — families whose `concepts` /
   `patterns` / `evidence_dimensions` include the target, filtered to
   families entirely within the taught set (below).
3. **WHICH VARIANT** — the exact-repeat policy above, scoped to that family.

Never "pick a random old question."

## Taught-before-tested, extended

No new mechanism. The existing `Lesson.prerequisites` walk (built in Phase
6B) now also filters *family* eligibility, not just single-question
eligibility: a family is only recall-eligible if every concept it declares
is covered by the taught set. No future-domain leakage during first-pass
curriculum progression — recall never reaches ahead into an untaught
domain, checked both by construction (the taught-set walk) and by an
explicit redundant test, per [`CURRICULUM-BLUEPRINT.md`](../learning/CURRICULUM-BLUEPRINT.md)'s
untaught-material rule.

## Evidence-dimension interaction

A family declares which `evidence_dimensions` it can *measure*; an attempt
(future) records which dimensions were actually right/wrong for that
specific attempt — already possible today via each option's `repair_target`.
`MasteryRecord.subject` was already typed in Phase 3 to accept an
`EvidenceDimension` id directly, so a learner can be correctly identified as
weak specifically on "authority" even when their overall Domain 1 accuracy
looks fine — no schema gap, just an aggregation step that isn't built yet.

## Confidence interaction

Unchanged from Phase 3: `evidence.confidence.contributes_to_mastery` stays
`false`. Four states are defined for *future* selection use (classified by
`app/src/content/selection.ts`'s `classifyConfidenceSignal`, not yet wired
into live selection — see the Phase 6C implementation report):

| State | Meaning |
|---|---|
| incorrect + high confidence | Strongest repair-priority signal |
| incorrect + low confidence | Normal repair priority |
| correct + low confidence | Reinforcement candidate despite being "right" |
| correct + high confidence | Eligible for spacing-band promotion |

## Spacing model

Three bands, no calendar/interval math: `SOON → LATER → STABLE`. New target
starts `SOON`; correct+high-confidence promotes one band; any incorrect
attempt demotes to `SOON`; correct+low-confidence holds. `SOON`/`LATER`
targets are preferred over `STABLE` when multiple targets are due. This is
the entire model — not a spaced-repetition interval algorithm, and never
exposed as terminology in the learner-facing UI.

## Practice-mode differences

| Mode | Selection behavior |
|---|---|
| Daily Study | Full target→family→variant pipeline; strict taught-before-tested |
| Recall (a Daily Study phase) | Pure retrieval, no new teaching |
| Mixed Practice | Multiple targets per session; taught-before-tested pre-completion, evidence-driven post-completion |
| Practice Exam | **Must never** be weakness-driven — samples by exam-form blueprint (`domains.json`'s `exam_weight`) or a separately-seeded deterministic draw, never favoring the learner's weak spots mid-exam |
| Explore & Practice | Learner chooses scope; the unseen-then-least-recently-seen policy applies within it |

## Persistence boundary (not implemented this phase)

Phase 6C's exposure history is **in-memory only** — a module-scope store in
`app/src/content/exposureStore.ts`, explicitly designed to survive
navigation within one running application session but **not** a browser
reload, and explicitly shaped to make a future swap to real, structured
persistence a matter of implementing the same `get`/`record` interface
against a real store, not rewriting the selection algorithm. Recommended
future technology: IndexedDB, behind that same abstraction, for the reasons
in the Phase 6C architecture report (structured queryability, no
synchronous-blocking risk as history grows, adequate capacity) — not chosen
by default inertia, and not implemented here.

## What is explicitly deferred

Real persistence, `Exposure`/`Attempt` entities as stored records, live
`MasteryRecord` computation, spacing-band-driven target prioritization among
multiple candidate targets (Phase 6C's two-family slice never needs to
choose among targets), and any UI exposure of this machinery. Daily Study
stays exactly as simple as it already is.
