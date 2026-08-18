# Domain 3 Blueprint — Security Program

**Status:** the fundamental question, core areas, and important patterns
below are **[CANONICAL]**, specified directly in the Phase 2
architectural discussion. Elaboration beyond the literal approved bullets is
marked **[CANDIDATE]**.

## Fundamental question

> How do we turn strategy and risk decisions into an effective security
> program?

This is Domain 3's defining hand-off relationship: Domain 1 decides
direction and authority; Domain 2 decides what risk needs addressing; Domain
3 is where that becomes an actual, running program. See the
[Domain 1 / Domain 3 conceptual model](LIFECYCLE-MODEL.md#domain-1--domain-3--conceptual-model-not-canonical) (`CANDIDATE`, not a canonical lifecycle).

## Core areas

**[CANONICAL]**

- Strategy → program → controls
- People / process / technology / resources
- Control purpose
- Preventive / detective / corrective / compensating controls
- Defense in depth
- Integration into organizational processes
- Awareness / training
- Program effectiveness
- KPI / KRI / KCI / OKR
- Communication
- Management reporting
- Program risk
- Continuous improvement

Full distinctions: [Preventive/Detective/Corrective/Compensating](CONFUSING-CONCEPTS.md#preventive-vs-detective-vs-corrective-vs-compensating-controls)
and [KPI/KRI/KCI/OKR](CONFUSING-CONCEPTS.md#kpi-vs-kri-vs-kci-vs-okr).

## Important patterns for this domain

- **Program is not merely a technology stack** — echoes people/process/technology/resources; a technology-only answer is a recurring distractor shape here.
- **Implementation does not prove effectiveness** — [Pattern P07](PATTERN-LIBRARY.md#p07--implementation--effectiveness), the single most load-bearing pattern in this domain.
- **Purpose determines control classification** — [Pattern P06](PATTERN-LIBRARY.md#p06--purpose-vs-activity); a control's preventive/detective/corrective/compensating classification follows from what it's *for*, not its technology.
- **Reporting should enable the audience's decision** — [Pattern P11](PATTERN-LIBRARY.md#p11--audience-appropriate-communication).
- **Role-specific/relevant awareness is stronger than generic training** — a targeted, role-relevant awareness answer beats a generic "more training" answer.
- **Security should be embedded into business processes** — [Pattern P09](PATTERN-LIBRARY.md#p09--security-embedded-in-business-process), shared with Domain 2.

## Confusing concepts specific to this domain

See [Confusing Concepts](CONFUSING-CONCEPTS.md): Preventive vs. Detective vs.
Corrective vs. Compensating Controls; KPI vs. KRI vs. KCI vs. OKR.

## Characteristic roles

Domain 3 leans most heavily on **Control Owner** and **Custodian / IT
Operations** for execution, **Information Security Manager / CISO** for
program design/coordination, and **Internal Audit** for independent
assurance of program effectiveness — the execution/assurance layer,
contrasted with Domain 1's governance layer.

## Lesson design notes

**[CANDIDATE — sequencing suggestion, not a content claim.]**
Because [Pattern P07](PATTERN-LIBRARY.md#p07--implementation--effectiveness)
is this domain's central trap, Domain 3 application scenarios should
routinely present a control or program element that clearly *exists* and ask
a question that can only be answered correctly by reaching past "it exists"
toward measurement, monitoring, or verified outcomes.

## What Domain 3 must accomplish before Domain 4 begins

- The learner can classify a control's purpose (preventive/detective/corrective/compensating) from a scenario, not from its name alone.
- The learner can distinguish "the control exists" from "the control is effective" and identify what evidence would close that gap.
- The learner can distinguish KPI/KRI/KCI/OKR and pick the metric type appropriate to a stated reporting need.
- The learner can identify audience-appropriate reporting versus technically-complete-but-unusable reporting.
- Recall continues to include Foundation, Domain 1, and Domain 2 material (see [Curriculum Blueprint](CURRICULUM-BLUEPRINT.md)).

## Cross-references

[Pattern Library](PATTERN-LIBRARY.md) · [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md) · [Lifecycle Model](LIFECYCLE-MODEL.md) · [Confusing Concepts](CONFUSING-CONCEPTS.md) · [Foundation Blueprint](FOUNDATION-BLUEPRINT.md)
