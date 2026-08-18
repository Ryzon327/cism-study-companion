# Domain 4 Blueprint — Incident Management

**Status:** the fundamental question, incident lifecycle, core concepts, and
governing pattern below are **[CANONICAL]**, specified directly in
the Phase 2 architectural discussion. Elaboration beyond the literal approved
bullets is marked **[CANDIDATE]**.

## Fundamental question

> When something happens, how do we minimize business impact, recover
> appropriately, preserve what matters, and improve afterward?

## Core lifecycle

**[CANONICAL]** — full detail in the
[Lifecycle Model](LIFECYCLE-MODEL.md#domain-4--incident-lifecycle):

```
PREPARE → IDENTIFY / CONFIRM → CONTAIN → ERADICATE
        → RECOVER → POST-INCIDENT REVIEW / IMPROVE
```

## Supporting activities that may intersect any stage

**[CANONICAL]** — these are not additional sequential stages;
they can arise alongside multiple stages above:

- Severity / classification
- Escalation
- Evidence preservation
- Communication
- Legal / regulatory involvement
- Business continuity

## Core concepts

**[CANONICAL]**

- Event vs. incident
- Containment vs. eradication vs. recovery
- Evidence preservation
- Chain of custody
- Trusted recovery sources
- RTO
- RPO
- SDO
- MTO
- Readiness
- Post-incident review
- Lessons learned
- Root-cause analysis
- Business impact

Full distinctions: [Event vs. Incident](CONFUSING-CONCEPTS.md#event-vs-incident),
[Containment vs. Eradication vs. Recovery](CONFUSING-CONCEPTS.md#containment-vs-eradication-vs-recovery),
[RTO vs. RPO vs. SDO vs. MTO](CONFUSING-CONCEPTS.md#rto-vs-rpo-vs-sdo-vs-mto).

## Important pattern — the governing rule for this domain

**Do not solve a stage that has already passed.**

> **Approved example (given directly in the architectural discussion):** if
> the question says the ransomware attack was successful, a prevention-only
> answer may no longer address what is being asked.

This is [Pattern P05 — No Lifecycle Reversal](PATTERN-LIBRARY.md#p05--no-lifecycle-reversal)
applied specifically and centrally to this domain. Nearly every Domain 4
distractor that isn't a role/authority trap is a version of this pattern —
an answer that would have been correct at an earlier stage than the one the
stem has already moved past.

## Characteristic roles

Domain 4 leans most heavily on the **Incident Response Team** during active
response, with **Legal / Compliance** and **Business / Process Owner**
becoming relevant for evidence/regulatory and business-impact questions, and
**Board / Senior Management** for post-incident accountability and
resourcing of improvements.

## Lesson design notes

**[CANDIDATE — sequencing suggestion, not a content claim.]**
Given the governing "already happened" pattern above, Domain 4 application
scenarios should consistently state a clear, unambiguous fact about what
stage has already occurred (an attack succeeded, evidence was already
collected, systems are already restored) so the learner practices reading
for that fact specifically — this is the domain where
[Foundation](FOUNDATION-BLUEPRINT.md)'s STATE step (what has already
happened) is most directly load-bearing.

## What Domain 4 must accomplish before post-curriculum reinforcement begins

- The learner can place a scenario correctly on the incident lifecycle from stated facts.
- The learner can distinguish containment, eradication, and recovery actions from each other.
- The learner recognizes when a supporting activity (evidence, legal, continuity) is the actual point of a question rather than the main lifecycle stage.
- The learner can distinguish RTO/RPO/SDO/MTO.
- Recall continues to include Foundation and all three prior domains (see [Curriculum Blueprint](CURRICULUM-BLUEPRINT.md)) — at this point the full four-domain curriculum has been taught.

## Cross-references

[Pattern Library](PATTERN-LIBRARY.md) · [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md) · [Lifecycle Model](LIFECYCLE-MODEL.md) · [Confusing Concepts](CONFUSING-CONCEPTS.md) · [Foundation Blueprint](FOUNDATION-BLUEPRINT.md)
