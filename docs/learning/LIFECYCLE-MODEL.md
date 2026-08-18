# Lifecycle Model

**Status:** the Domain 2 risk lifecycle and Domain 4 incident lifecycle
below are **[CANONICAL]**, specified directly in the Phase 2 architectural
discussion. **Domain 1 and Domain 3 do not have a canonical lifecycle.**
Per explicit Phase 2 review decision, no formal, stage-by-stage lifecycle
has been approved for either domain, and none should be manufactured merely
for structural symmetry with Domains 2 and 4. Domain 1 and Domain 3 instead
have two simple `[CANDIDATE]` conceptual relationships — see
[Domain 1 / Domain 3 — Conceptual Model](#domain-1--domain-3--conceptual-model-not-canonical)
below.

## Why a shared lifecycle document exists

Two of this application's most important, hardest-to-get-right reasoning
patterns are lifecycle patterns:
[P04 — No Lifecycle Jumping](PATTERN-LIBRARY.md#p04--no-lifecycle-jumping)
and
[P05 — No Lifecycle Reversal](PATTERN-LIBRARY.md#p05--no-lifecycle-reversal).
Both require the learner to know, precisely, what stage comes before and
after another stage, in each domain's own lifecycle. This document is the
single canonical definition of each domain's lifecycle so that Foundation,
every domain blueprint, and Daily Study's lifecycle-application phase all
teach and test the same stage sequence.

## Domain 2 — Risk Lifecycle
**[CANONICAL]**

```
CONTEXT → IDENTIFY → ANALYZE → EVALUATE → TREAT
        → DETERMINE RESIDUAL RISK → VALIDATE ACCEPTABILITY → MONITOR / REASSESS
```

| Stage | What has happened by this point | What has NOT happened yet |
|---|---|---|
| Context | Scope, objectives, and criteria for the risk process are established. | Nothing about a specific risk is known yet. |
| Identify | A risk (asset/threat/vulnerability combination) has been named. | Likelihood and impact are not yet understood. |
| Analyze | Likelihood and impact have been assessed. | The risk has not yet been judged against criteria. |
| Evaluate | The analyzed risk has been compared against risk criteria/appetite. | A treatment decision has not yet been made. |
| Treat | A treatment option (avoid/mitigate/transfer/accept) has been selected and applied. | Residual risk after treatment is not yet determined. |
| Determine residual risk | What remains after treatment is known. | Whether that remainder is acceptable has not yet been decided. |
| Validate acceptability | The accountable risk owner has judged the residual risk acceptable or not. | Ongoing change has not yet been accounted for. |
| Monitor / reassess | The risk is watched for change in likelihood, impact, or context over time. | (Ongoing — feeds back to Context/Identify as conditions change.) |

This is taught **through application, not only as an ordered list** —
per the explicit product requirement — meaning Daily Study and the domain
blueprint should present scenarios that require *locating* the current
stage from context clues, not merely reciting the sequence.

## Domain 4 — Incident Lifecycle
**[CANONICAL]**

```
PREPARE → IDENTIFY / CONFIRM → CONTAIN → ERADICATE
        → RECOVER → POST-INCIDENT REVIEW / IMPROVE
```

| Stage | What has happened by this point | What has NOT happened yet |
|---|---|---|
| Prepare | Plans, roles, tools, and readiness exist before any event. | No event has occurred yet. |
| Identify / confirm | A potential event has been detected and confirmed as a real incident. | The incident is not yet contained. |
| Contain | Spread/damage has been limited. | The cause has not yet been removed. |
| Eradicate | The root cause (malware, unauthorized access, vulnerability exploited) has been removed. | Normal operation has not yet been restored. |
| Recover | Systems and business operations are restored to normal function. | Lessons have not yet been captured. |
| Post-incident review / improve | Root cause analysis and lessons learned feed back into preparedness. | (Feeds back to Prepare for the next cycle — see [Pattern P15](PATTERN-LIBRARY.md#p15--closing-the-loop).) |

**Supporting activities that may intersect any stage** (approved, not
sequential stages themselves): severity/classification, escalation, evidence
preservation and chain of custody, communication, legal/regulatory
involvement, business continuity invocation. These can occur alongside
multiple stages and should not be taught as if they were a ninth sequential
box — a scenario can raise an evidence-preservation question during
containment *or* eradication, for example.

**Governing pattern:** *do not solve a stage that has already passed.* The
approved example: if the stem says a ransomware attack was already
successful, a prevention-only answer no longer addresses what is being
asked — see [Pattern P05](PATTERN-LIBRARY.md#p05--no-lifecycle-reversal).

## Domain 1 / Domain 3 — Conceptual Model (Not Canonical)

**[CANDIDATE] — explicitly NOT a canonical lifecycle.** Per Phase 2 review,
Domain 1 and Domain 3 do not get a manufactured, formal, stage-by-stage
lifecycle merely for structural symmetry with the Domain 2 and Domain 4
lifecycles above. An earlier draft of this document synthesized an
eight-stage "governance-to-program lifecycle" for Domains 1 and 3; that
synthesis has been withdrawn and replaced with the two simpler conceptual
relationships below, which were given directly during Phase 2 review as the
only things permitted to remain at this time. Nothing else should be
inferred or reconstructed beyond these two relationships without a separate
approval.

**Conceptual relationship 1 — direction:**
```
business objectives → governance → strategy
```

**Conceptual relationship 2 — execution:**
```
strategy → program → controls → measurement / improvement
```

These are **conceptual models, not lifecycle stages** — there is no
associated "what has happened / what hasn't happened" table, no canonical
stage list, and no expectation that Foundation's STAGE reasoning step (see
[Foundation Blueprint](FOUNDATION-BLUEPRINT.md#3-stage--where-are-we-in-the-relevant-lifecycle))
be applied to Domain 1 or Domain 3 the way it is applied to Domains 2 and 4.
They exist only to show, at a glance, how Domain 1 (governance/direction)
and Domain 3 (program/execution) relate to each other and to
[Pattern P01](PATTERN-LIBRARY.md#p01--business-alignment) and
[Pattern P15](PATTERN-LIBRARY.md#p15--closing-the-loop). Before any future
phase treats these as more than a conceptual aid — for example, before
building lifecycle-application exercises for Domain 1 or Domain 3 the way
[Domain 2](DOMAIN-2-BLUEPRINT.md) and [Domain 4](DOMAIN-4-BLUEPRINT.md) do —
they require explicit source validation and a separate promotion decision to
`CANONICAL`, per [`README.md`](README.md#content-status-terminology).

## How this document is used elsewhere

- [Foundation](FOUNDATION-BLUEPRINT.md)'s STAGE reasoning step is taught directly against the two canonical lifecycles (Domain 2, Domain 4); Domain 1 and Domain 3 use the conceptual model instead, per the explicit non-canonical status above.
- Domain 2 and Domain 4's lifecycle-application content must use the exact canonical stage names given here.
- [Repair Model](REPAIR-MODEL.md) defines "lifecycle error" and "sequence error" as distinct diagnostic failure types against the two canonical stage sequences.
