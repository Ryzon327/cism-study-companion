# Domain 1 Blueprint — Governance

**Status:** the fundamental question, core areas, and important patterns
below are **[CANONICAL]**, specified directly in the Phase 2
architectural discussion. Lesson sequencing suggestions, example scenarios,
and elaboration beyond the literal approved bullets are marked
**[CANDIDATE]**.

## Fundamental question

> Where should security go, why, and who has authority?

Every Domain 1 lesson and application question should trace back to this
question. If a piece of content doesn't help answer it, it likely belongs
in Domain 3 (program/execution) instead.

## Core areas

**[CANONICAL]**

- Business alignment
- Governance direction and oversight
- Accountability
- Roles and authority
- Information security strategy
- Policy / standards / governance framework
- Legal/regulatory organizational context
- Governance effectiveness and measurement

## Important patterns for this domain

- **Business objectives drive security** — [Pattern P01](PATTERN-LIBRARY.md#p01--business-alignment).
- **Governance is top-down** — direction flows from the Board/Senior Management and the Security Steering Committee (see [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md)) down through strategy into policy.
- **Authority follows accountability** — [Pattern P02](PATTERN-LIBRARY.md#p02--authority-follows-accountability).
- **Strategy precedes program/implementation** — see the [Domain 1 / Domain 3 conceptual model](LIFECYCLE-MODEL.md#domain-1--domain-3--conceptual-model-not-canonical) (`CANDIDATE`, not a canonical lifecycle); this is Domain 1's hand-off point into Domain 3.
- **The right participant can still be wrong authority** — a person legitimately involved in a decision (e.g., the security manager who identified an issue) is not automatically the one who approves it — [Pattern P02](PATTERN-LIBRARY.md#p02--authority-follows-accountability)/[P03](PATTERN-LIBRARY.md#p03--role-verb-matching).
- **Existence of policies does not prove governance effectiveness** — [Pattern P07](PATTERN-LIBRARY.md#p07--implementation--effectiveness).

## Confusing concepts specific to this domain

See [Confusing Concepts](CONFUSING-CONCEPTS.md) for full entries:
Governance vs. Management; Recommend vs. Approve vs. Implement vs.
Independently Verify; Policy vs. Standard vs. Procedure vs. Guideline.

## Characteristic roles

Domain 1 leans most heavily on **Board / Senior Management**, **Security
Steering Committee**, and **Information Security Manager / CISO** from the
[Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md) — the governance layer
of the organization, contrasted with the execution layer that Domain 3
covers. **Data Owner** and **Business / Process Owner** are also
characteristic Domain 1 roles: Domain 1's information-asset-accountability
reasoning (who classifies data, defines its protection requirements, and
approves access) is a distinct, heavily-tested reasoning target from the
governance-layer triad above, evidenced by the supplied Domain 1 source
material's dense data-ownership question cluster. This is an elaboration
of the existing canonical role model — approved during the Phase 7A/7B-1
review — not the creation of any new role; all five roles are already
canonical rows in the Role & Authority Matrix.

## Lesson design notes

**[CANDIDATE — sequencing suggestion, not a content claim.]**
Per the [Lesson Design Standard](LESSON-DESIGN-STANDARD.md), Domain 1
lessons should favor short scenarios that require distinguishing *who
decided* from *who executed* or *who was merely involved* — this is the
domain where role/authority reasoning (Foundation steps 4–5) gets its first
real content grounding, so early Domain 1 sessions are a natural place to
reinforce Foundation's ROLE and VERB steps against real governance
scenarios rather than introducing entirely new reasoning machinery.

## What Domain 1 must accomplish before Domain 2 begins

- The learner can distinguish governance from management in a scenario.
- The learner can correctly separate "recommend," "approve," "implement," and "independently verify" across a scenario involving multiple roles.
- The learner can recognize the policy/standard/procedure/guideline hierarchy.
- The learner understands that a published policy is not, by itself, evidence of effective governance.
- Recall of Foundation's eight-step process continues, now grounded in real governance scenarios (see [Curriculum Blueprint](CURRICULUM-BLUEPRINT.md) for the cumulative-recall requirement).

## Domain 1 readiness note (Phase 7C)

**[CANDIDATE — operational note, not a change to the canonical requirements
above.]** The Phase 7C read-only assessment found that Domain 1 exercises
the BEST/MOST qualifiers substantively but has no NEXT-qualifier practice.
This is a recorded architect decision, not an oversight: NEXT is part of
the canonical qualifier vocabulary (`schema/registry/qualifiers.json`),
but Domain 1 completion does not require artificial coverage of every
qualifier merely to satisfy a distribution target. Domain 1 should use
NEXT only when authentic, source-backed reasoning calls for it — its
current absence is not a blocking Domain 1 gap. This note does not modify
any canonical qualifier definition.

## Domain 1 readiness note (Phase 8B)

**[CANDIDATE — operational note, not a change to the canonical requirements
above.]** The Phase 8B Domain 1 Final Readiness Audit found and corrected
a family-level distractor-length bias affecting 7 questions across 2
families (`family.d1.governance-effectiveness`,
`family.d1.organizational-culture-governance`); see
[`PHASE-8B-GATE-RECORD.md`](PHASE-8B-GATE-RECORD.md) for the full audit,
correction, and founder Human Experience Gate. Following that gate,
**Domain 1 Final Readiness: PASS** for the current MVP curriculum
boundary — not a claim of perfection or immutability, and not a
`CANONICAL` promotion decision, which remains separate and future. U7's
greater length relative to other Domain 1 lessons was reviewed and
explicitly accepted, not trimmed: lesson-length uniformity is not itself a
curriculum-quality requirement, and "concise but fruitful" is judged by
felt learning experience, not character count.

## Cross-references

[Pattern Library](PATTERN-LIBRARY.md) · [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md) · [Lifecycle Model](LIFECYCLE-MODEL.md) · [Confusing Concepts](CONFUSING-CONCEPTS.md) · [Foundation Blueprint](FOUNDATION-BLUEPRINT.md)
