# Repair Model

**Status: [CANONICAL].** The failure-type list and repair
principles below were specified directly in the Phase 2 architectural
discussion. This document also folds in the approved "Mixed Practice"
specification, because Mixed Practice's reasoning-dimension evidence and
this document's diagnostic failure types are the same underlying model
viewed from two angles — evidence gathered (Mixed Practice) and diagnosis
produced (Repair). `docs/learning/README.md` records this folding decision
explicitly, since Mixed Practice was not listed as its own required file in
the Phase 2 file list.

## Principle: a wrong answer should be diagnosed, not just marked wrong

Per the explicit product requirement: a wrong answer should eventually be
diagnosed, and repair should be **small and targeted** — never a full
re-teach of the whole concept, and never simply repeating the same question
immediately.

## Diagnostic failure types

**[CANONICAL]**

| Failure type | What it means | Related pattern / document |
|---|---|---|
| Knowledge gap | The learner doesn't yet know the underlying fact or concept. | [Confusing Concepts](CONFUSING-CONCEPTS.md), relevant domain blueprint |
| Role error | The learner picked the wrong role for the scenario. | [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md), [Pattern P03](PATTERN-LIBRARY.md#p03--role-verb-matching) |
| Authority error | The learner picked a role that was *involved* but not the one with actual decision authority. | [Pattern P02](PATTERN-LIBRARY.md#p02--authority-follows-accountability) |
| Qualifier error | The learner misread or ignored the qualifier (e.g., answered a MOST question as if it were a BEST question). | [Qualifier Decoder](QUALIFIER-DECODER.md) |
| Lifecycle error | The learner placed the scenario at the wrong stage. | [Lifecycle Model](LIFECYCLE-MODEL.md), [Pattern P04](PATTERN-LIBRARY.md#p04--no-lifecycle-jumping)/[P05](PATTERN-LIBRARY.md#p05--no-lifecycle-reversal) |
| Sequence error | The learner understood the lifecycle but picked the wrong relative order of two adjacent actions. | [Lifecycle Model](LIFECYCLE-MODEL.md) |
| Decision error | The learner misclassified what kind of decision was being made (business / risk / program-control / incident / recovery). | Domain blueprints |
| Vocabulary error | The learner confused two similar-sounding terms. | [Confusing Concepts](CONFUSING-CONCEPTS.md) |
| Business-context error | The learner ignored or misapplied the stated business objective/consequence. | [Pattern P01](PATTERN-LIBRARY.md#p01--business-alignment) |
| Technical-vs-management error | The learner chose a technically correct answer to what was actually a management-level question (or vice versa). | [Foundation elimination traps](FOUNDATION-BLUEPRINT.md#8-eliminate--identify-attractive-wrong-answers) |

These ten failure types are the canonical diagnostic vocabulary. Repair
content, feedback copy, and any future "what went wrong" reporting should
resolve to one (or more) of these ten, not invent ad hoc categories per
question.

## Relationship to Mixed Practice

**[CANONICAL].** Mixed Practice should eventually measure the
learner's reasoning *dimensions*, not merely correctness. The evidence
dimensions Mixed Practice gathers map directly onto the failure types above:

- Knowledge
- Role
- Authority
- Qualifier
- Lifecycle
- Sequence
- Decision type
- Business alignment
- Vocabulary
- CISM mindset / pattern

**Ordering constraint (structural, not optional):** Mixed Practice must not
ask the learner to classify these dimensions before
[Foundation](FOUNDATION-BLUEPRINT.md) has taught them. Foundation's eight-step
process (see [Foundation Blueprint](FOUNDATION-BLUEPRINT.md)) is what makes a
learner capable of correctly labeling "this is a qualifier problem" versus
"this is a role problem" in the first place — asking for that classification
earlier produces noise, not evidence.

## Repair mechanics

- **Small and targeted:** repair addresses the specific failure type diagnosed, using the smallest useful piece of content (a [Confusing Concepts](CONFUSING-CONCEPTS.md) entry, a [pattern](PATTERN-LIBRARY.md)'s trap description, a [role matrix](ROLE-AUTHORITY-MATRIX.md) row) — not a full lesson replay.
- **Not an immediate repeat:** the same question should not simply reappear right after being missed. Reinforcement of the underlying concept should use varied wording/scenario, consistent with the "controlled wording variation" product requirement.
- **Feeds forward:** a diagnosed failure type becomes part of the learner's evidence profile and informs future [Daily Study](DAILY-STUDY-MODEL.md) session selection — but only in a way consistent with the first-pass-learning constraint (untaught material is never diagnosed as a failure; see [Daily Study Model](DAILY-STUDY-MODEL.md#first-pass-learning-vs-post-curriculum)).

## What this document does not decide

The specific data model, storage schema, or identifier scheme used to record
failure-type evidence is a Phase 3 (canonical data model) decision, not
decided here. This document specifies *what* should be diagnosable and
*how* repair should behave from the learner's perspective, not how it is
implemented or stored.

## Cross-references

[Pattern Library](PATTERN-LIBRARY.md) · [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md) · [Qualifier Decoder](QUALIFIER-DECODER.md) · [Lifecycle Model](LIFECYCLE-MODEL.md) · [Confusing Concepts](CONFUSING-CONCEPTS.md) · [Foundation Blueprint](FOUNDATION-BLUEPRINT.md) · [Daily Study Model](DAILY-STUDY-MODEL.md)
