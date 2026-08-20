# Confusing Concepts

**Status:** every term pair below is drawn from concept lists given directly
as approved requirements in the Phase 2 architectural discussion (the
"Core concepts" lists in each domain section). The distinctions themselves —
what separates each term in a pair — are elaboration and are marked
**[CANDIDATE]**. This document exists because CISM distractor
design leans heavily on paired terms that sound similar but are tested as
distinct; collecting them in one place lets Foundation and each domain
blueprint point at a single definition instead of re-explaining the same
distinction in multiple places.

## Domain 2 — Risk Management pairs

### Threat vs. Vulnerability vs. Risk
A threat is a potential cause of an unwanted event. A vulnerability is a
weakness that a threat could exploit. Risk is the combination of threat,
vulnerability, likelihood, and business impact — not any one of the three
alone. See [Pattern P12](PATTERN-LIBRARY.md#p12--risk-vs-vulnerability-vs-threat). **[CANDIDATE]**

### Inherent Risk vs. Residual Risk
Inherent risk exists before considering the effect of controls. Residual
risk is what remains after controls or treatment have been applied. A
question describing risk "before any controls" is asking about inherent
risk; a question describing risk "after implementing X" is asking about
residual risk. **[CANDIDATE]**

### Risk Assessment vs. Risk Treatment
Assessment (identify → analyze → evaluate) is about *understanding*
exposure. Treatment is about *deciding what to do* with an already-understood
risk. A stem describing a risk that hasn't yet been analyzed cannot jump to
a treatment answer — see [Pattern P04](PATTERN-LIBRARY.md#p04--no-lifecycle-jumping). **[CANDIDATE]**

### Risk Analysis vs. Risk Evaluation
Analysis produces likelihood and impact. Evaluation compares the analyzed
risk against criteria (appetite/tolerance) to decide whether treatment is
needed. Analysis answers "how bad and how likely"; evaluation answers "is
that acceptable." **[CANDIDATE]**

### Risk Appetite vs. Risk Tolerance
Appetite is the broader amount and type of risk the organization is willing
to pursue or retain in support of its objectives — a strategic-level
statement. Tolerance is the acceptable variation around a specific objective
or metric — narrower and more operational. **[CANDIDATE]**

### Qualitative vs. Quantitative Risk Assessment
Qualitative assessment uses relative ratings (high/medium/low) and is faster
but less precise. Quantitative assessment uses numeric/monetary values (see
AV, EF, SLE, ARO, ALE in the
[Domain 2 blueprint](DOMAIN-2-BLUEPRINT.md#quantitative-risk)) and supports
direct cost-benefit comparison but requires more reliable data. Neither is
universally "better" — see [Pattern P10](PATTERN-LIBRARY.md#p10--method-fits-objective). **[CANDIDATE]**

## Domain 1 / Domain 3 pairs

### Governance vs. Management
Governance sets direction, accountability, alignment, and oversight from the
appropriate authority. Management executes within the direction governance
establishes. A question about "who sets the enterprise direction" is a
governance question; a question about "who carries out the resulting
activity" is a management question. **[CANDIDATE]**

### Recommend vs. Approve vs. Implement vs. Independently Verify
Four distinct verbs frequently mapped to four distinct roles in the
[Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md): the security manager
typically recommends; the accountable authority approves; the
custodian/control owner implements; internal audit independently verifies.
Confusing any two of these four is one of the most common distractor
patterns in CISM — see [Pattern P03](PATTERN-LIBRARY.md#p03--role-verb-matching). **[CANDIDATE]**

### Policy vs. Standard vs. Procedure vs. Guideline
Policy states high-level, durable management direction. A standard sets a
mandatory boundary that links policy to more detailed practice. A procedure
is the step-by-step method. A guideline is recommended, non-mandatory
practice. Policy is the least likely of the four to change simply because
technology changes. **[CANDIDATE]**

### Security Steering Committee vs. Board / Senior Management
Both are governance-layer bodies, and both are frequently "involved" in the
same decision — which is exactly why they're confused. The steering
committee reviews, prioritizes, and advocates: a cross-functional forum
that reconciles competing input and forwards a recommendation. The Board or
senior management funds, approves, and accepts risk: the body actually
accountable for the enterprise-level outcome. A stem describing the
committee "endorsing" or "forwarding" a proposal is a hand-off signal — the
decision is happening at the next level up, not at the committee. See
[Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md) and
[Domain 1 Blueprint](DOMAIN-1-BLUEPRINT.md). **[CANDIDATE]** — approved
Phase 7A/7B-1, evidenced by the supplied Domain 1 source material's
Organizational Structures, Roles, and Responsibilities sub-area.

### Business Case vs. Strategy vs. Roadmap
A strategy is the durable, high-level plan to achieve business objectives.
A business case is the specific rationale and cost-benefit justification
used to secure funding for an investment that advances the strategy. A
roadmap is the tactical, resourced, timelined detail of how an approved
initiative will actually be executed — developed *after* the strategy and
business case exist, not before. Confusing any two of these three — for
example, treating roadmap-level detail as if it were the strategy itself —
is a common Domain 1 distractor pattern. **[CANDIDATE]** — approved
Phase 7A as a future Domain 1 distinction (not yet taught; reserved for the
Phase 7B slice that implements D1-U5/U6).

### Preventive vs. Detective vs. Corrective vs. Compensating Controls
Preventive controls stop an event before it happens. Detective controls
identify that an event occurred (or is occurring). Corrective controls
restore or fix after an event. Compensating controls provide an alternative
form of protection when a primary control cannot be applied as designed.
This classification is determined by the control's *purpose*, not its
technology — see [Pattern P06](PATTERN-LIBRARY.md#p06--purpose-vs-activity). **[CANDIDATE]**

### KPI vs. KRI vs. KCI vs. OKR
A KPI (key performance indicator) measures how well a process is performing
against its goal. A KRI (key risk indicator) signals rising risk exposure
before it becomes a loss event. A KCI (key control indicator) measures
whether a specific control is operating as designed. An OKR (objective and
key result) frames a goal and the measurable results that indicate progress
toward it, generally at a more strategic/planning level than the other
three. **[CANDIDATE]**

## Domain 4 — Incident Management pairs

### Event vs. Incident
An event is any observable occurrence; not every event rises to the level of
an incident. An incident is an event (or set of events) that has been
confirmed to actually or potentially harm the organization and warrants a
response, per the [incident lifecycle](LIFECYCLE-MODEL.md#domain-4--incident-lifecycle)'s
Identify/Confirm stage. **[CANDIDATE]**

### Containment vs. Eradication vs. Recovery
Containment limits spread/damage without necessarily removing the cause.
Eradication removes the root cause. Recovery restores normal business
operation. A question describing an event still spreading is a containment
question; a question describing "the cause has been removed, now what"
is a recovery question. See [Pattern P04/P05](PATTERN-LIBRARY.md#p04--no-lifecycle-jumping). **[CANDIDATE]**

### RTO vs. RPO vs. SDO vs. MTO
RTO (recovery time objective) is how long a process can be down. RPO
(recovery point objective) is how much data loss (measured in time) is
tolerable. SDO (service delivery objective) is the level of service to be
restored during alternate processing. MTO (maximum tolerable outage) is the
absolute outer limit before the business impact becomes unacceptable, and is
generally the longest of the time-based measures. **[CANDIDATE]**

## Qualifier pair

### MOST vs. BEST
See the full entries in the [Qualifier Decoder](QUALIFIER-DECODER.md#most--most-important)
— MOST is a ranking/priority test among true statements; BEST is a
completeness/fit test among reasonable options. This single pair, per the
current prototype's own corpus analysis referenced in the engineering
baseline, accounts for a large share of real exam-style questions, which is
why it is called out specifically here in addition to its own decoder
entries. **[PROTOTYPE REFERENCE]**

## How this document is used elsewhere

- [Foundation](FOUNDATION-BLUEPRINT.md) and each domain blueprint reference specific pairs above instead of re-deriving the distinction inline.
- [Repair Model](REPAIR-MODEL.md)'s "vocabulary error" and "knowledge gap" failure types point back to this document as the remediation content.
