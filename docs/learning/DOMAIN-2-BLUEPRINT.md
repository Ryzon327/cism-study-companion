# Domain 2 Blueprint — Risk Management

**Status:** the fundamental question, risk lifecycle, core concepts, and
quantitative-risk requirement below are **[CANONICAL]**, specified
directly in the Phase 2 architectural discussion. Elaboration beyond the
literal approved bullets is marked **[CANDIDATE]**.

## Fundamental question

> What could interfere with business objectives, how significant is it, and
> what should the enterprise do about it?

## Core risk lifecycle

**[CANONICAL]** — full detail in the
[Lifecycle Model](LIFECYCLE-MODEL.md#domain-2--risk-lifecycle):

```
CONTEXT → IDENTIFY → ANALYZE → EVALUATE → TREAT
        → DETERMINE RESIDUAL RISK → VALIDATE ACCEPTABILITY → MONITOR / REASSESS
```

**Teach this through application, not only ordered lists** — the explicit
product requirement. Scenario-driven "where are we in this lifecycle"
exercises are the intended primary teaching mechanism, not recitation of the
sequence.

## Core concepts

**[CANONICAL]**

- Threat vs. vulnerability vs. risk
- Inherent vs. residual risk
- Risk assessment vs. treatment
- Risk analysis vs. evaluation
- Risk appetite vs. tolerance
- Qualitative vs. quantitative
- Treatment options
- Acceptance
- Cost-benefit
- Continuous reassessment
- Embedding risk into business processes

Full distinctions for the paired concepts above: see
[Confusing Concepts](CONFUSING-CONCEPTS.md#domain-2--risk-management-pairs).

## Quantitative risk

**[CANONICAL]**

| Term | Meaning |
|---|---|
| AV | Asset Value |
| EF | Exposure Factor — percentage of asset value lost in one occurrence |
| SLE | Single Loss Expectancy — expected monetary loss from one occurrence |
| ARO | Annualized Rate of Occurrence — expected frequency per year |
| ALE | Annualized Loss Expectancy — expected monetary loss per year |

```
SLE = AV × EF
ALE = SLE × ARO
```

**The learner must also understand what the calculation means for business
decision-making** — this is an explicit, non-negotiable requirement. The
formulas are not the learning objective by themselves; the objective is
using the resulting ALE figure to support a cost-benefit treatment decision
(does a control costing less than the ALE it prevents make business sense?)
— see [Pattern P10](PATTERN-LIBRARY.md#p10--method-fits-objective) and
[Pattern P08](PATTERN-LIBRARY.md#p08--risk-driven-prioritization). A lesson
that teaches the arithmetic without the decision it supports has not met
this requirement.

## Important patterns for this domain

- **Risk drives prioritization and resources** — [Pattern P08](PATTERN-LIBRARY.md#p08--risk-driven-prioritization).
- **Embed security into business processes** — [Pattern P09](PATTERN-LIBRARY.md#p09--security-embedded-in-business-process).
- **Risk is not the same as vulnerability** — [Pattern P12](PATTERN-LIBRARY.md#p12--risk-vs-vulnerability-vs-threat).
- **The goal is acceptable risk, not zero risk** — [Pattern P13](PATTERN-LIBRARY.md#p13--acceptable-risk-not-zero-risk).
- **Match the assessment/method to the objective** — [Pattern P10](PATTERN-LIBRARY.md#p10--method-fits-objective), directly relevant to the qualitative-vs-quantitative choice above.

## Characteristic roles

Domain 2 leans most heavily on **Risk Owner**, **Data Owner**, **Business /
Process Owner**, and **Information Security Manager / CISO** (in an
assess/recommend capacity, not a risk-acceptance capacity by default — see
the explicit contextual-authority nuance in the
[Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md)).

## Lesson design notes

**[CANDIDATE — sequencing suggestion, not a content claim.]**
Given the explicit "teach through application, not only ordered lists"
requirement, Domain 2's lifecycle-application exercises should present the
learner with a scenario stating some but not all of the lifecycle stages as
already complete, and ask what comes next — mirroring
[Foundation](FOUNDATION-BLUEPRINT.md)'s STATE/STAGE reasoning steps directly,
rather than a separate "memorize this list" exercise.

## What Domain 2 must accomplish before Domain 3 begins

- The learner can distinguish every pair in the core-concepts list above.
- The learner can locate the current risk-lifecycle stage from a scenario's stated facts.
- The learner can compute SLE and ALE and use the result in a cost-benefit reasoning statement, not just produce a number.
- The learner understands risk treatment options and when acceptance is the appropriate outcome.
- Recall continues to include Foundation and Domain 1 material (see [Curriculum Blueprint](CURRICULUM-BLUEPRINT.md)).

## Cross-references

[Pattern Library](PATTERN-LIBRARY.md) · [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md) · [Lifecycle Model](LIFECYCLE-MODEL.md) · [Confusing Concepts](CONFUSING-CONCEPTS.md) · [Foundation Blueprint](FOUNDATION-BLUEPRINT.md)
