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

## Phase 9A — Domain 2 curriculum architecture (approved architecture, not yet implemented)

**Status: [CANDIDATE] — a planning artifact, not implemented content.**
Everything below this line was produced during Phase 9A, a read-only/
planning-only phase: no Domain 2 lesson, concept, family, or question was
authored. It elaborates the CANONICAL sections above (fundamental question,
risk lifecycle, core concepts, quantitative risk, patterns, roles) — it does
not redefine any of them. The architecture below reflects the founder's
Phase 9A architectural review and decisions (unit structure, prerequisite/
recall graph shape, Risk Owner vs. Control Owner addition, AI/emerging-risk
treatment, quantitative-risk depth, and implementation batching) — these are
recorded here as **approved architecture decisions**, not claims
independently verified by Claude Code. See
[`PHASE-9A-GATE-RECORD.md`](PHASE-9A-GATE-RECORD.md) for the process record.
No Domain 2 production content has been authored as of this revision.

### Source-bank inventory

Authoritative source: `tools/input/domain-2.txt` (338,685 bytes, ~232
distinct question+justification blocks, extracted programmatically via each
question's own embedded ISACA Knowledge-Statement/Task-Statement tags — the
same source-evidence approach used for Domain 1's `domain-1.txt`). No
question text was reproduced into production content; the file is evidence
for curriculum coverage and reasoning patterns only.

**By ISACA Knowledge Statement (the source's own subdomain tags):**

| Code | Knowledge Statement | Question count |
|---|---|---|
| 2A1 | Emerging Risk and Threat Landscape | 21 |
| 2A2 | Vulnerability and Control Deficiency Analysis | 23 |
| 2A3 | Risk Assessment and Analysis | 89 |
| 2B1 | Risk Treatment/Risk Response Options | 47 |
| 2B2 | Risk and Control Ownership | 22 |
| 2B3 | Risk Monitoring and Reporting | 30 |

**By ISACA Task Statement (the source's own task-level tags, 22–28):**

| # | Task Statement |
|---|---|
| 22 | Participate in and/or oversee the risk identification, risk assessment, and risk treatment process |
| 23 | Participate in and/or oversee the vulnerability assessment and threat analysis process |
| 24 | Identify, recommend, or implement appropriate risk treatment and response options to manage risk to acceptable levels based on organizational risk appetite |
| 25 | Determine whether information security controls are appropriate and effectively manage risk to an acceptable level |
| 26 | Facilitate the integration of information risk management into business and IT processes |
| 27 | Monitor for internal and external factors that may require reassessment of risk |
| 28 | Report on information security risk, including noncompliance and changes in information risk, to key stakeholders to facilitate the risk management decision-making process |

**Qualifier frequency (whole-word occurrences across the source file):**
MOST 62, BEST 50, FIRST 21, PRIMARY 20, PRIMARILY 8, GREATEST 6, MAIN 2,
NEXT 2. **Approved qualifier treatment:** the source-driven distribution is
preserved as-is — MOST/BEST/FIRST/PRIMARY are materially present and should
be used accordingly; NEXT is rare but genuinely present, and **unlike
Domain 1** (where NEXT is essentially absent and was explicitly not
manufactured — see [`DOMAIN-1-BLUEPRINT.md`](DOMAIN-1-BLUEPRINT.md#domain-1-readiness-note-phase-7c)),
Domain 2 **may** use NEXT where the source supports genuine lifecycle-
sequence reasoning (D2-U7 is exactly this case — both real NEXT-tagged
questions in the entire bank are residual-risk/security-review sequencing
questions). Extra NEXT questions must not be manufactured merely to
achieve balance with the other four qualifiers. The canonical five-qualifier
vocabulary itself ([`QUALIFIER-DECODER.md`](QUALIFIER-DECODER.md)) is
unchanged.

**Role/term frequency (selected, whole-file occurrences):** information
security manager 62, control owner 50, risk owner 27, senior management 25,
board of directors 5, steering committee 3, internal audit 4; risk
assessment 304, risk treatment 161, threat 194, vulnerability 141, risk
appetite 66, residual risk 34, risk analysis 27, quantitative 19,
qualitative 12, control deficiency 22, key risk indicator 11.

**Quantitative-risk term check (important, reported transparently):** the
literal acronyms SLE, ARO, EF, and AV do **not** appear anywhere in the
source file (0 occurrences each); ALE appears exactly 3 times, in one
question testing a *conceptual limitation* of ALE (subjectivity of the
inputs), not the arithmetic itself. The CANONICAL quantitative-risk
requirement above (SLE = AV × EF, ALE = SLE × ARO, used for cost-benefit
decision-making) is **not** heavily source-frequency-evidenced — it stands
on the explicit Phase 2 product mandate ("non-negotiable requirement"), not
on exam-frequency. This is reported here so that requirement is understood
as intentionally retained by direct mandate, not as something the source
material happens to emphasize.

**A small, real "emerging" pocket:** approximately 6–8 of the 232 questions
concern AI-specific risk scenarios (e.g., "which function is PRIMARILY
responsible for cultivating a culture of risk management... using
artificial intelligence (AI) systems," AI vendor/model risk in a
collaboration scenario, generative-AI code-review ownership). This is
genuine content in the supplied source material, not fabricated, but is a
small fraction (~3%) of the bank and was not anticipated by the original
Phase 2 CANONICAL architecture above. **Decided:** absorbed as scenario
variety within D2-U1 and D2-U8 (see "AI / emerging-risk treatment" below
for the exact, KS-tag-verified placement) — not a dedicated unit, and not a
reason to expand domain scope.

### Source-coverage map

Reasoning-pattern coverage, not raw topic frequency, drove this map — per
the explicit Phase 9A instruction, this is not "one lesson per source-bank
heading."

| Source area (KS) | Underlying concept | Reasoning skill | Qualifier(s) seen | Role/authority issue | Lifecycle relationship | Common wrong-answer temptation | Explicit teaching needed? | Unit or absorbed? |
|---|---|---|---|---|---|---|---|---|
| 2A3 (Risk Assessment and Analysis, 89 qs — largest area) | Threat vs. vulnerability vs. risk; likelihood × impact | Distinguishing a technical weakness from actual business risk | MOST, BEST | — | Identify → Analyze | Treating vulnerability count as risk; ignoring likelihood or impact | Yes | Own unit (U1 fundamentals) + Own unit (U2 identify/analyze) |
| 2A3 (method-selection sub-slice) | Qualitative vs. quantitative assessment | Matching method to objective (P10) | BEST, MOST | — | Analyze | "More rigorous" assumed to mean "more correct" regardless of objective | Yes | Own unit (U3) |
| 2A3 + explicit CANONICAL mandate | SLE/ALE/ARO/EF arithmetic, used for cost-benefit | Using a number to support a treatment decision, not compute for its own sake | — (mandate-driven, not qualifier-driven) | — | Analyze → Treat | Doing the arithmetic without connecting it to a decision | Yes (mandated regardless of frequency) | Own unit (U4) |
| 2A3 (evaluation/appetite sub-slice) | Risk appetite vs. risk tolerance; when to accept vs. escalate | Evaluating an analyzed risk against criteria | MOST, PRIMARY | Risk Owner, Board | Evaluate | Treating appetite as a hard ceiling instead of an aspirational target with a tolerance band around it | Yes | Own unit (U5) |
| 2B1 (Risk Treatment/Response, 47 qs) | Avoid/mitigate/transfer/accept; risk-driven prioritization (P08) | Selecting and justifying a treatment option under constrained resources | BEST, MOST | Risk Owner, Board | Treat | Prioritizing by cost/audit-finding alone instead of risk | Yes | Own unit (U6) |
| 2B1 (residual-risk sub-slice) | Determine residual risk → validate acceptability sequencing | Locating "what comes next" after treatment | NEXT (both real hits found are here) | Risk Owner | Determine Residual Risk → Validate Acceptability | Jumping to transfer/insurance/formal acceptance before validating acceptability | Yes | Own unit (U7) |
| 2B2 (Risk and Control Ownership, 22 qs) | Risk Owner vs. Control Owner vs. Data Owner accountability | Matching accountability to the specific decision, not a title (P02/P03) | MOST, PRIMARY | Risk Owner, Control Owner, Data Owner, CISO | Cross-cutting (applies at Evaluate/Treat/Monitor) | Technical expertise or day-to-day proximity mistaken for accountability | Yes | Own unit (U8) |
| 2B3 (Risk Monitoring and Reporting, 30 qs) | Monitor/reassess; lead vs. lag indicators; audience-appropriate reporting (P11) | Recognizing what changed and reporting it usefully to the right audience | BEST | Risk Owner, Board | Monitor / Reassess | Reporting activity/incident counts instead of outcome-relevant, decision-useful information | Yes | Own unit (U9) |
| 2A2 (Vulnerability and Control Deficiency Analysis, 23 qs) | Prioritizing remediation by business impact, not ease/cost alone; embedding into process (P09) | Applying risk-driven prioritization to a specific control-deficiency/remediation context | BEST, MOST | Business/Process Owner | Analyze → Treat (applied) | Prioritizing the technically easiest or cheapest fix over the highest-impact one | Partially — mostly reinforces U2/U6/U8 in a new business setting | Absorbed into U6 + a closing unit (U10) on embedding |
| 2A1 (Emerging Risk and Threat Landscape, 21 qs, incl. the small AI pocket) | Continuous environmental scanning; new/changing threats feed back into Context/Identify | Recognizing that risk management is not a one-time exercise | BEST | Governance, Information Security function | Monitor/Reassess feeds back to Context | Assuming last year's risk assessment still holds; historical-data-only thinking | Partially — reinforces U1 (fundamentals) and U9 (monitor/reassess); AI-specific pocket flagged separately (not its own unit) | Absorbed into U1 + U9 |

### Confusing-concept inventory

The first six pairs below are the CANONICAL core-concept pairs already
listed above and in [`CONFUSING-CONCEPTS.md`](CONFUSING-CONCEPTS.md#domain-2--risk-management-pairs)
(Phase 2-approved); they are restated here only to confirm source coverage,
not redefined. The seventh — **Risk Owner vs. Control Owner** — was
proposed during the initial Phase 9A analysis and **approved by the founder**
as a planned Domain 2 distinction; it has been added to
`CONFUSING-CONCEPTS.md` accordingly. Its approved framing: the Risk Owner is
accountable *for the risk* (owns the business risk decision, within
appropriate authority, subject to governance); the Control Owner is
accountable *for a specific control's* design/operation/maintenance/
effectiveness and supplies control-performance evidence — a Control Owner
does not automatically become the Risk Owner merely by operating a control
that addresses the risk. This is explicitly **not** "Risk Owner is always
more senior" — it remains a ROLE + VERB + CONTEXT judgment, per the existing
[Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md) principle.

| Pair | What appears similar | Actual distinction | Question-clue | Common trap | Candidate memory rule | Taught in | Recalled in |
|---|---|---|---|---|---|---|---|
| Threat vs. Vulnerability vs. Risk (CANONICAL concept) | All three describe "something bad that could happen" | Risk = threat × vulnerability × business impact; neither alone is risk | Stem gives only a weakness count, or only a threat type, without impact | Treating vulnerability count as risk (P12) | "Risk = threat × vulnerability × impact, not any one alone" (existing P12 memory rule) | U1 | U2, U6 (via P08) |
| Inherent vs. Residual Risk (CANONICAL) | Both are "the risk level" | Inherent = before controls; residual = after treatment | "before any controls" vs. "after implementing X" | Assuming eliminating inherent risk is achievable/the goal | Existing CONFUSING-CONCEPTS.md rule | U1 | U6, U7 |
| Risk Assessment vs. Risk Treatment (CANONICAL) | Both are "dealing with risk" | Assessment understands exposure; treatment decides what to do about an already-understood risk | Stem describes a risk not yet analyzed, but an answer jumps to a treatment action | Lifecycle jumping (P04) | Existing CONFUSING-CONCEPTS.md rule | U2 | U6 |
| Risk Analysis vs. Risk Evaluation (CANONICAL) | Both happen "during assessment" | Analysis produces likelihood/impact; evaluation compares against criteria/appetite | "how bad and how likely" vs. "is that acceptable" | Confusing "we measured it" with "we judged it acceptable" | Existing CONFUSING-CONCEPTS.md rule | U2 | U5 |
| Risk Appetite vs. Risk Tolerance (CANONICAL) | Both are "how much risk is OK" | Appetite = broader, strategic willingness; tolerance = acceptable variation around a specific objective | A risk "exceeds appetite but is within tolerance" — genuinely source-evidenced (see U5 sample below) | Treating appetite as a hard ceiling with zero variation allowed | Existing CONFUSING-CONCEPTS.md rule | U5 | U7 |
| Qualitative vs. Quantitative Assessment (CANONICAL) | Both are "ways to assess risk" | Qualitative = relative ratings, fast, less precise; quantitative = numeric/monetary, supports direct cost-benefit comparison | Stem states the objective (subjective/customer-perception input vs. defensible dollar-figure comparison) | "More rigorous" assumed universally "more correct" (P10) | Existing CONFUSING-CONCEPTS.md rule | U3 | U4 |
| **Risk Owner vs. Control Owner (APPROVED — new)** | Both "own" something risk-related | Risk owner holds authority/accountability over a *specific risk's disposition* (accept/treat/transfer), within appropriate governance; control owner is accountable for a *specific control's* design/operation/maintenance/effectiveness, not the underlying risk decision | Stem asks who is accountable for *loss/the risk decision* (risk owner) vs. who ensures a *control operates effectively and reports on it* (control owner) | Assuming technical/operational proximity to a control (or to a system, e.g. an AI/ML implementation) implies risk-acceptance authority | "Control owner runs the control; risk owner owns the outcome." | U8 | U6, U7, U9 |

### Reasoning-pattern inventory

All patterns below map onto the existing CANONICAL [Pattern Library](PATTERN-LIBRARY.md)
(P01–P15) — no new pattern IDs are proposed; Domain 2's source material is
evidence for *which existing patterns apply here and how strongly*, not a
reason to invent new ones.

| Pattern ID | Name | Recognition clue | Correct reasoning tendency | Common trap | Candidate memory rule | Source evidence | Proposed unit(s) |
|---|---|---|---|---|---|---|---|
| P04 | No Lifecycle Jumping | Stem states risk not yet analyzed/evaluated; an answer proposes treatment or acceptance | Analysis and evaluation must precede treatment | The "obviously good" treatment action offered too early | "A correct action at the wrong stage is still wrong" | Strong — both real NEXT-tagged questions and multiple 2A3/2B1 justifications explicitly reject "jumping ahead" | U2, U6, U7 |
| P05 | No Lifecycle Reversal | Stem states residual risk/treatment already determined; an answer proposes re-analyzing or re-treating | Respect what has already happened; move forward, not backward | Re-doing an earlier stage instead of validating/monitoring | "If it already happened, don't re-solve it" | Moderate — residual-risk sequencing question directly demonstrates forward-only progression | U7 |
| P02 | Authority Follows Accountability | Stem asks "who is the risk owner," "who approves," "who is accountable for loss" | Match accountability to the specific risk/decision, not a title | Risk manager's technical expertise mistaken for risk-acceptance authority | "Expertise identifies; accountability decides" (existing P02 rule) | Strong — direct source example: risk manager with vulnerability-testing expertise is explicitly the wrong answer vs. "the individual accountable for loss" | U8 |
| P03 | Role-Verb Matching | Stem's verb (own/operate/approve/report) is load-bearing | Match the verb to the correct of the 12 canonical roles | Plausible role paired with a verb it doesn't perform | "Read the verb before the role" (existing P03 rule) | Strong — Risk Owner vs. Control Owner pair is essentially this pattern applied to Domain 2's own vocabulary | U8 |
| P08 | Risk-Driven Prioritization | Stem describes limited budget/resources and competing risks or vulnerabilities | Prioritize by likelihood × impact / business exposure, not cost or ease alone | Prioritizing by cost, audit-finding-count, or technical ease alone | Existing P08 rule | Strong — direct source example: prioritize vulnerability assessment by business-interruption-insurance-covered systems, not externally-facing systems alone | U2, U6, U10 |
| P09 | Security Embedded in Business Process | Stem describes risk assessment/BIA disagreement or a bolt-on security review | Integrate risk management into existing business process/decision-making rather than a standalone gate | A standalone security review that duplicates rather than integrates | Existing P09 rule | Moderate — BIA-disagreement-escalation-to-executive-management sample; embedding-into-procurement/BYOD sample | U10 |
| P10 | Method Fits Objective | Stem states the objective (precision, speed, comparability) before asking which method | Choose qualitative or quantitative based on what the objective actually needs | "More rigorous" quantitative method assumed universally better | Existing P10 rule | Strong — direct source examples for both directions (customer-perception → qualitative; defensible dollar comparison → quantitative) | U3, U4 |
| P12 | Risk vs. Vulnerability vs. Threat | Stem uses these three terms in ways that could be confused | Risk requires threat + vulnerability + business impact together | Treating vulnerability count/existence as risk | Existing P12 rule | Strong — direct source example: likelihood × impact beats "existence of threats and vulnerabilities" alone | U1, U2 |
| P13 | Acceptable Risk, Not Zero Risk | An answer implies eliminating all risk/inherent risk | The goal is residual risk within an accepted range, decided by the appropriate authority | "Eliminate," "remove all," "zero" language | Existing P13 rule | Strong — direct source example: reducing risk to zero is explicitly rejected as "impossible... cost-prohibitive" | U5, U6 |
| P11 | Audience-Appropriate Communication | Stem involves reporting risk/metrics to a specific stakeholder | Match the report/metric to what the recipient needs to decide | Most technically complete report offered regardless of recipient | Existing P11 rule | Moderate — lead/lag-indicator and stakeholder-reporting samples in 2B3 | U9 |
| P15 | Closing the Loop | Stem describes the end of monitoring/reassessment | Feed results back into Context/Identify, not just "watch and stop" | Treating monitoring as a dead end rather than a feedback loop | Existing P15 rule | Moderate — Monitor/Reassess explicitly feeds back to Context per the CANONICAL lifecycle table | U9 |
| P07 (analog) | Implementation ≠ Effectiveness | Stem reports activity/incident counts and asks about program effectiveness | Effectiveness requires outcome measurement (limited impact/disruption), not activity counts | Activity-count or compliance-count offered as proof of effectiveness | Existing P07 rule, reapplied from Domain 1 | Strong — direct source example: effectiveness of risk management BEST measured by incidents causing *significant loss*, not identification counts or compliance counts | U9 (direct cross-domain recall target for D1's P07 content) |
| P06 | Purpose vs. Activity | Stem asks the PRIMARY purpose/reason a control or process exists | Purpose is the reason it exists, not everything it involves | A true side-activity offered as if it were the reason | Existing P06 rule | Moderate | U6, U10 |
| P01 | Business Alignment | Stem states a business objective competing with a "more secure" option | The decision traces to the stated business objective | Technically superior option that isn't what the business asked for | Existing P01 rule | Moderate — cost-benefit-analysis and BIA-disagreement samples | U6 |
| P14 | Formal Repeatable Process | Stem contrasts ad hoc vs. defined risk process | Formal, repeatable, accountable process preferred | One-off fix that doesn't establish repeatability | Existing P14 rule | Light-to-moderate | U9 |

### Domain 2 unit structure (APPROVED)

**Ten units** — approved by the founder, explicitly not assumed to match
Domain 1's nine merely for symmetry. The backbone is the CANONICAL
eight-stage risk lifecycle (which Domain 1 and Domain 3 explicitly do not
have), so most units map onto lifecycle stages; U1, U8, and U10 are
cross-cutting rather than stage-bound.

| Unit | Title | Core concept | Learner objective | Why its own unit | Major reasoning target | Confusing concepts addressed | Likely qualifiers | Prerequisite(s) | Recall target(s) | Family count | Min. variants | Source areas | Memory-rule direction | Expected Aha moment |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| D2-U1 | Risk Fundamentals & Emerging Risk | Threat vs. vulnerability vs. risk; inherent vs. residual; emerging risk as a live example of the same discipline | Distinguish a technical weakness from actual business risk, and recognize that a new/emerging technology (e.g., an AI/ML system, used here only as one illustrative example, not a specialty topic) still goes through the same identify → assess → treat → monitor discipline, not a separate process | Every later unit assumes this vocabulary is already solid; source material treats it as foundational (2A3's largest sub-slice), and 2A1's emerging-risk material (21 qs, 2 of the AI-scenario questions) fits naturally here as scenario variety | P12 | Threat/Vulnerability/Risk; Inherent/Residual | MOST, BEST | none (Domain 2 entry point) | Domain 1 P07 (structure ≠ proof) | 1 | 3 | 2A3, 2A1 | "Risk needs a threat AND a vulnerability AND an impact — not any one alone; new technology doesn't bypass this" | Realizing a "high vulnerability count" scenario can still be lower risk than a "few vulnerabilities, severe impact" one — and that an AI system is just one more asset to reason about the same way |
| D2-U2 | Risk Assessment Lifecycle | Locating the CANONICAL lifecycle's Context → Identify → Analyze → Evaluate sequence | Locate the current lifecycle stage from stated facts across all four early stages; recognize analysis (likelihood/impact) as distinct from identification, and evaluation as distinct from analysis | First real payoff of Foundation's STAGE reasoning step — Domain 2 is the first domain with an actual canonical lifecycle; introduces Evaluate as a stage-location skill (U5 later returns to it for evaluation *reasoning* depth) | P04, P12 | Risk Assessment vs. Risk Treatment (partial); Risk Analysis vs. Risk Evaluation (partial — sequencing side) | FIRST, BEST | D2-U1 | Foundation STAGE step; D1-U6 sequencing (roadmap follows strategy/business case) | 1 | 3 | 2A3 | "Name it, then measure it, then judge it — don't skip to deciding what to do about it" | Seeing that "select a treatment" is wrong not because it's a bad idea, but because it's premature |
| D2-U3 | Risk Analysis Methods | Qualitative vs. quantitative, method-fit to objective | Select qualitative or quantitative assessment based on the stated objective, not a general "rigor" hierarchy | Distinct, well-evidenced reasoning skill (P10) independent of lifecycle position | P10 | Qualitative vs. Quantitative | BEST, MOST | D2-U2 | — | 1 | 3 | 2A3 | "Ask what the method needs to prove, not which method sounds more rigorous" | Realizing "more precise" isn't automatically "more correct" for the stated goal |
| D2-U4 | Quantitative Risk for Decisions | AV/EF/SLE/ARO/ALE, taught only to the depth a management decision requires | Compute SLE/ALE and use the result in an explicit cost-benefit statement about a control — not perform arithmetic for its own sake | CANONICAL, explicitly non-negotiable product requirement, independent of source-frequency (see inventory note above); deliberately scoped narrow per the founder's explicit depth decision | P10 (method fits objective, applied) | Qualitative vs. Quantitative (applied) | BEST | D2-U3 | D1 GRC/measurement (P07) | 1 | 3 (differing scenarios/decisions, not just differing numbers) | Mandate-driven; 1 direct ALE-limitation question in source | "A risk number matters because it helps make a better decision — not because CISM wants you to be an actuary" | Realizing the formula is a means to a business answer, not the answer itself |
| D2-U5 | Risk Evaluation | Risk appetite vs. tolerance; evaluation criteria; acceptability | Distinguish appetite (strategic willingness) from tolerance (acceptable variation), and reason about a risk that exceeds one but not the other | Directly, richly source-evidenced distinct reasoning skill — deepens the "Evaluate" stage U2 only located | P13 | Risk Appetite vs. Risk Tolerance; Risk Analysis vs. Risk Evaluation | MOST, PRIMARY | D2-U2 | D1 business-decision authority (Board/Senior Management approve appetite) | 1 | 3 | 2A3, 2B1 | "Appetite sets the target; tolerance is the acceptable wobble around it" | Realizing "exceeds appetite" doesn't automatically mean "must be treated" |
| D2-U6 | Risk Treatment / Response Selection | Avoid/mitigate/transfer/accept; risk-driven prioritization by business context | Select and justify a treatment option, prioritizing by risk (not cost/ease) under real resource constraints | Largest non-assessment KS area (2B1, 47 qs); distinct decision-type from assessment | P08, P13, P01 | Risk Assessment vs. Risk Treatment | BEST, MOST | D2-U5 | D1-U6 business alignment / business-case reasoning (P01) | 1 | 3 | 2B1, 2A2 | "Limited resources, many risks: prioritize by risk, not convenience" | Realizing the cheapest fix isn't automatically the right one |
| D2-U7 | Residual Risk & Acceptability | Determine Residual Risk → Validate Acceptability | Sequence what happens immediately after treatment is applied, before monitoring begins | Both real NEXT-qualifier questions in the entire source bank live here — a distinct, well-evidenced sequencing skill; NEXT is genuinely usable here, unlike Domain 1 | P04, P05 | Inherent vs. Residual (applied) | NEXT, BEST | D2-U6 | D2-U8 (non-adjacent — who validates) | 1 | 3 | 2B1 | "Determine what's left, then judge if that's OK — in that order" | Realizing "transfer/insure/accept" all come *after* validating acceptability, not before |
| D2-U8 | Risk Owner vs. Control Owner | Ownership, accountability, decision authority, control operation, role/verb distinction | Match accountability for a risk decision to the correct owner (risk owner), and distinguish that from who operates/maintains a control (control owner) — including when the "system" in question is something new, like an AI/ML implementation | Own KS area (2B2, 22 qs, including 4 of the 6 AI-scenario questions — see AI/emerging-risk treatment below); directly reapplies D1's P02/P03 to new vocabulary — the strongest cross-domain transfer candidate in the domain | P02, P03 | Risk Owner vs. Control Owner (APPROVED new pair) | MOST, PRIMARY | D2-U1 | D1 Role & Authority Matrix — accountability → authority → advice/implementation chain (P02/P03) | 1 | 3 | 2B2 | "Control owner runs the control; risk owner owns the outcome" | Realizing the person with the most technical expertise (or closest to a new AI system) is often the *wrong* answer to "who is accountable" |
| D2-U9 | Risk Monitoring, Reassessment & Reporting | Monitor/reassess feeding back to Context; lead/lag indicators where supported; audience-appropriate, decision-useful reporting | Recognize what changed, and report it usefully to the right stakeholder | Own KS area (2B3, 30 qs); closes the lifecycle loop (P15) and directly recalls D1's P07/P11 | P11, P15, P07 (recall) | — (reinforces prior pairs) | BEST | D2-U7 | D1 P07 (activity ≠ effectiveness), D1 P11 (audience) | 1 | 3 | 2B3 | "A metric is only as good as the decision it lets someone make" | Realizing "number of incidents identified" is a worse effectiveness measure than "incidents causing real loss" |
| D2-U10 | Embedding Risk Management Into the Business | Risk management integrated into procurement, BYOD, development, BIA disagreements, and continuous management | Apply treatment-prioritization and ownership reasoning together in a live business-process scenario, not an abstract one | Closing/integrative unit — reinforces U6/U8 in new settings rather than teaching new vocabulary (P09) | P09, P08 (applied) | — (integrative) | BEST | D2-U6, D2-U8 | D1 governance-effectiveness / GRC (structure vs. outcome; integration reduces duplication) | 1 | 3 | 2A2, 2B2 | "Security that lives outside the business process gets bypassed by it" | Realizing "escalate the disagreement to executive management" beats either party unilaterally deciding |

**Total approved: 10 units, ~10 initial families, minimum-3-variant floor →
~30 initial Domain 2 questions** (vs. Domain 1's 9 units / 11 families / 37
questions at closeout) — a comparable scale, derived independently from
Domain 2's own source distribution and CANONICAL lifecycle backbone, not
copied from Domain 1's count. This is an initial floor, not a quota: a
family may reasonably grow to 4 variants where source density and genuine
reasoning variation warrant it (as several Domain 1 families did), but
variants must never be added merely to inflate the count.

### AI / emerging-risk treatment (APPROVED)

**No dedicated AI-risk unit.** AI is treated as one example scenario within
existing emerging-risk and ownership reasoning, per the founder's explicit
decision: *"Emerging risks do not bypass the risk-management discipline"* —
not *"AI risk management."*

A closer look at exactly where the ~6–8 AI-scenario questions actually sit
(re-checked against their own Knowledge-Statement tags for this revision)
refines the originally-proposed placement:

| Placement | Count | Nature of the questions |
|---|---|---|
| 2A1 (Emerging Risk and Threat Landscape) → **D2-U1** | 2 | E.g., which function is PRIMARILY responsible for cultivating a risk-management culture for AI systems — a governance/culture framing, fits U1's "new technology, same discipline" reasoning directly. |
| 2B2 (Risk and Control Ownership) → **D2-U8** | 4 | E.g., "who is the PRIMARY owner of the risk and controls" for a CRM system using AI/ML, and "which BEST addresses risk and control ownership" for a generative-AI coding tool — these are Risk-Owner-vs-Control-Owner questions that merely use an AI scenario as the business setting. |
| 2B3 (Risk Monitoring and Reporting) → D2-U9 | 0 | **Not source-supported.** No AI-scenario question falls under this Knowledge Statement. |

This means the AI material's strongest, most natural home is actually
**split between U1 (2 questions, emerging-risk/culture framing) and U8 (4
questions, ownership framing)**, not concentrated in U1 with optional U9
reinforcement as originally proposed. **U9 reinforcement is explicitly not
supported by the source material and will not be pursued**, consistent
with the founder's own "ONLY if supported by the actual source material"
condition. This refinement is reported transparently rather than
force-fitting the originally-suggested homes.

Per the founder's explicit boundary: no AI governance policy content, no
AI-specific frameworks, no model-risk-management material, no AI ethics
curriculum, no AI product features, and no domain expansion merely because
AI is a current topic. AI appears only as scenario variety inside D2-U1
and D2-U8's already-approved reasoning targets (P12 and P02/P03
respectively) — never as its own teaching objective.

### Prerequisite graph (APPROVED)

```
D2-U1 (fundamentals & emerging risk)
   ├── lifecycle/assessment branch
   │   D2-U2 (context → identify → analyze → evaluate, stage-location)
   │   ├── D2-U3 (method fit)
   │   │      └── D2-U4 (quantitative)
   │   └── D2-U5 (evaluate depth: appetite/tolerance)
   │          └── D2-U6 (treat)
   │                 └── D2-U7 (residual/validate)
   │                        └── D2-U9 (monitor/reassess/report)
   │
   └── ownership branch
       D2-U8 (risk owner vs. control owner)
              \
               → D2-U10 (embedding)
              /
       D2-U6 ──┘
```

This is the approved shape (refined from the original proposal only by
naming U2's scope through Evaluate, per the founder's revised unit
description). The lifecycle-stage units (U2→U5→U6→U7→U9) are
**genuinely** sequential —
per the CANONICAL lifecycle table, you cannot evaluate before analyzing,
treat before evaluating, determine residual risk before treating, or
validate acceptability before determining residual risk. This is not
artificial `U1→U2→U3…` numbering; it reflects the lifecycle's own stated
"what has happened / what hasn't happened yet" constraints.

U3 (method fit) and U4 (quantitative) branch off U2 rather than sitting
strictly in the main lifecycle chain, because method selection and
quantitative calculation are *tools used during* analysis, not lifecycle
stages themselves — a learner could reasonably encounter U5 (evaluate)
having only seen U2, with U3/U4 filling in "how" analysis was done rather
than gating whether evaluation can happen.

U8 (risk/control ownership) is prerequisite only on U1 (needs the basic
risk vocabulary) — it does **not** require U2–U7, because accountability
reasoning applies at every lifecycle stage, not one specific stage. This is
a deliberate **non-adjacent** prerequisite: U8 can be taught in parallel
with the U2–U7 chain rather than only at the end.

U10 (embedding) is the only unit with two prerequisites (U6 and U8)
because it is explicitly integrative — it applies treatment-prioritization
and ownership reasoning together in a live business scenario, and would
teach nothing new if placed before either.

### Recall graph (APPROVED)

Recall is **not** simply "the previous unit." The deliberate non-adjacent
recall design is preserved:

- **D2-U7 recalls D2-U8** (not D2-U6, its immediate predecessor) — because
  "who validates that residual risk is acceptable" is an ownership
  question, and testing it only via the immediately-prior unit would make
  the connection too easy/predictable. Placing the recall on U8 forces
  genuine retrieval rather than short-term memory.
- **D2-U9 recalls D2-U1** (risk vs. vulnerability vs. threat), not only
  D2-U7 — because "emerging risk"/reassessment explicitly requires
  re-checking whether the *fundamental* threat/vulnerability picture has
  changed, not just whether the previous treatment is still being
  monitored.

Every unit's recall pool also includes Foundation and prior Domain 1
material by default, per [`CURRICULUM-BLUEPRINT.md`](CURRICULUM-BLUEPRINT.md)'s
cumulative-recall requirement — the cross-domain edges below are the
*load-bearing* additions specific to Domain 2, not the only recall that
occurs.

### Cross-domain recall design (Domain 1 → Domain 2) — APPROVED

The five edges below are the founder-specified minimum; each is tied to a
specific, already-CANONICAL Domain 1 pattern, and each explains *why*
recalling it helps solve the new Domain 2 problem — not recall for its own
sake. Two additional edges found during analysis (D2-U1, D2-U9) are kept as
supporting connections beyond the specified minimum, clearly marked as
such.

| Domain 2 unit | Domain 1 concept/unit recalled | Why recall helps solve the Domain 2 problem | Expected reasoning transfer |
|---|---|---|---|
| **D2-U2** (risk assessment lifecycle) | Foundation's STAGE reasoning step; D1-U6's sequencing rule (a roadmap is developed *after* strategy and business case exist, not before) | Domain 2 is the first domain with an actual CANONICAL lifecycle, but "don't act before the right stage" was already introduced conceptually in Domain 1's roadmap sequencing — recalling it shows the learner this is one reasoning skill, not a Domain-2-only rule | Learner sees Foundation's abstract "where are we" step, and Domain 1's "sequence matters" rule, both become concrete and load-bearing here |
| **D2-U5** (risk evaluation) | D1 business-decision authority (Board/Senior Management approve strategy and, by extension, risk appetite) | Risk appetite doesn't originate in Domain 2 — it is set by the same governance layer (Board/Senior Management) Domain 1 already taught holds strategic-direction authority | Learner connects "who sets appetite" (Domain 1 authority) to "how appetite is used" (Domain 2 evaluation criterion), instead of treating appetite as a Domain-2-only artifact |
| **D2-U6** (treatment selection) | D1-U6 business-justification-roadmap (P01: business alignment) | Treatment selection under constrained resources is the same "trace the decision back to the stated business objective" reasoning as Domain 1's business-case/roadmap content | Learner reapplies "what does the business actually need" instead of relearning business-alignment reasoning from scratch |
| **D2-U8** (risk owner vs. control owner) | D1 Role & Authority Matrix — the accountability → authority → advice/implementation chain (P02, P03; specifically P02's existing memory rule: "security identifies, analyzes, advises, recommends... the accountable authority owns the decision") | Risk Owner vs. Control Owner is the *exact same* accountability-vs-expertise reasoning shape as Domain 1's Recommend/Approve/Implement/Verify confusion — a control owner operates/advises, a risk owner is accountable, mirroring exactly how a security manager advises while the accountable authority decides | Strongest expected transfer in the whole domain — same pattern, new vocabulary, tests genuine generalization rather than memorized role associations |
| **D2-U10** (embedding into the business) | D1 governance-effectiveness / GRC content (P07: implementation ≠ effectiveness; GRC integrates rather than duplicates) | "Embed risk management into business process rather than bolting it on" is the same integration-over-duplication reasoning as Domain 1's GRC content, which exists specifically to integrate related assurance activities rather than run them in parallel | Learner recognizes that "don't build a disconnected parallel process" is a domain-general governance/risk principle, not a Domain-2-only rule |

**Additional supporting connections found during analysis** (beyond the
founder-specified minimum, kept for completeness, not required reading):

| Domain 2 unit | Domain 1 concept recalled | Why it helps |
|---|---|---|
| D2-U1 (fundamentals) | D1-U7 governance-effectiveness (P07) | "Vulnerability count ≠ risk" is the same shape of mistake as "framework adoption ≠ effectiveness" — existence/count mistaken for the real measure |
| D2-U9 (monitoring/reporting) | D1-U7 governance-effectiveness (P07) and D1's audience-appropriate-reporting content (P11) | "Report incidents causing real loss, not identification counts" is the same shape as "measure outcomes, not activity" |

Every edge above reinforces a *specific, already-identified reasoning
pattern* (P01, P02, P03, P07 — all CANONICAL, plus the Board/Senior
Management authority role) rather than recalling a Domain 1 fact for
repetition's own sake.

### Question-family requirements (carried forward from Domain 1)

**Approved: one primary family per unit initially (10 units → ~10 initial
Domain 2 families), minimum 3 meaningful variants per family → an
approximately-30-question initial floor, not a quota.** A family may
justify a 4th variant where source density and genuinely new reasoning
variation warrant it — never added simply to inflate the count.

Every Domain 2 family, before any authoring begins, must satisfy:

- One invariant reasoning target (stated in the unit table above).
- Minimum 3 meaningful variants, matching every existing Domain 1 family's
  `minimum_variant_count` — a higher minimum requires a documented reason,
  not a default.
- Genuinely different business scenarios per variant (different industry/
  role/asset framing), not pure-paraphrase stem variants of the same
  scenario.
- No duplicate option sets across variants, and genuinely different
  distractor temptations per variant — not the same wrong answer reworded.
- No systematic answer-length giveaway — the Phase 8B family-level
  length-bias regression test (`tests/content-production/variation-quality.test.mjs`)
  already covers any family added to `content/production/questions.json`
  regardless of domain, so this is inherited automatically, not
  re-implemented per domain.
- No systematic correct-answer position — the existing answer-position
  randomization architecture (`app/src/content/answerOrder.ts`) already
  applies domain-agnostically; Domain 2 questions require no new display
  logic.
- Rationale and repair target follow semantic option identity (by `key`,
  not array position) — already guaranteed structurally by the existing
  `Question.options[].rationale`/`repair_target` schema and the
  `answer-order.test.ts` invariants; no schema change needed for Domain 2.
- Question (variant) rotation remains independent of answer-position
  rotation — already true architecturally (`selectVariant` in
  `app/src/content/selection.ts` and `answerOrder`'s exposure-count-driven
  rotation are two independent mechanisms); Domain 2 questions inherit both
  automatically once authored against the existing schema.

### Distractor-quality requirements (Domain 2-specific traps)

Beyond the general Phase 8B standard (plausible, recognizable CISM mistake;
clearly wrong under the stated scenario; aligned to a real repair target;
professional wording; no mechanical padding; no accidental second
defensible answer), Domain 2 content should draw specifically on the traps
evidenced above:

- Acting (treating/accepting) before assessing (analyzing/evaluating) — P04.
- Re-litigating or reversing a stage already completed — P05.
- Confusing a risk's existence/count with its business severity — P12.
- Choosing the "more rigorous-sounding" quantitative method regardless of
  whether the objective actually calls for it — P10.
- Treating risk appetite as a hard ceiling rather than a strategic target
  with a tolerance band — the Domain 2-specific evolution of "absolute
  language" traps already avoided in Domain 1.
- Assuming technical/operational proximity to a system or control implies
  risk-acceptance authority (control owner mistaken for risk owner) — P02/P03.
- Prioritizing remediation by cost or ease instead of risk — P08.
- Reporting activity/incident counts instead of outcome-relevant metrics — P07 (recalled from Domain 1).
- Implying zero risk or elimination of all vulnerabilities is the goal — P13.

Only traps with direct source evidence (cited per pattern in the reasoning-
pattern inventory above) should be used — this list is not a generic CISM
trap catalog, it is scoped to what `domain-2.txt` actually supports.

### Learning-design requirements (carried forward, unchanged)

Concise but fruitful; Aha/realization effect; taught before tested; recall
for transfer, not busywork; reasoning over memorization; calm/uncluttered
experience; **no artificial lesson-length uniformity** — a Domain 2 lesson
(e.g., D2-U4's quantitative-risk unit, which must additively cover AV/EF/
SLE/ARO/ALE arithmetic *and* the cost-benefit decision it supports) may
legitimately run longer than a single-concept unit like D2-U3, exactly as
Domain 1's U7 was accepted longer than its siblings at the Phase 8B Human
Experience Gate. Lessons must not be padded to look uniform, and must not
be trimmed of necessary instruction merely to normalize character counts.

### Explicit exclusions / NOT NOW items

- SLE/ALE/ARO/EF arithmetic depth beyond what supports a cost-benefit
  decision statement — not a finance/actuarial course.
- Named framework cataloging (e.g., ISO 31000, COSO ERM, NIST RMF) unless a
  specific framework is directly source-evidenced and load-bearing for a
  reasoning point — mirrors Domain 1's explicit "not a framework-cataloging
  lesson" precedent (`lesson.d1.governance-effectiveness`).
- Heat-map/specific risk-register tool mechanics beyond the conceptual
  qualitative/quantitative distinction.
- A dedicated AI-risk-governance unit — **decided (not open):** the founder
  approved absorbing the ~6–8 source AI-scenario questions as example
  material within D2-U1 (2 questions, emerging-risk framing) and D2-U8 (4
  questions, ownership framing) rather than a standalone unit; no
  reinforcement in D2-U9 (not source-supported). No AI governance policy
  content, AI-specific frameworks, model-risk-management material, AI
  ethics curriculum, or AI product features — AI appears only as scenario
  variety inside already-approved reasoning targets.
- Any Domain 3 or Domain 4 material.
- Persistence, mastery tracking, authentication, analytics, AI-assisted
  tutoring features — unrelated to this planning phase.
- `CANONICAL` promotion of anything — all Domain 2 planning artifacts and
  any future authored content remain `CANDIDATE` until a separate,
  explicit promotion decision.

### Domain 2 implementation sequence (APPROVED)

Small, human-reviewable batches, each independently gate-able at a founder
Human Experience Gate before the next begins — mirroring how Domain 1 was
actually built (6B → 6C → 7A → 7B-1/2/3 → 7C → 8B), not a single large
authoring pass:

| Batch | Units | Rationale for this grouping |
|---|---|---|
| Phase 9B-1 | D2-U1, D2-U2 | Establishes the shared vocabulary (threat/vulnerability/risk, inherent/residual) and the first two lifecycle stages — nothing later can be meaningfully reviewed without this foundation in place. |
| Phase 9B-2 | D2-U3, D2-U4 | The two method/calculation units (qualitative/quantitative, SLE/ALE) are closely related and best reviewed together — the founder can judge whether the quantitative unit's necessarily-longer lesson still reads as "concise but fruitful" per the learning-design requirement above. |
| Phase 9B-3 | D2-U5, D2-U6 | Evaluation (appetite/tolerance) and treatment selection are the two most decision-heavy units and the core of the "risk management as judgment, not arithmetic" experience — reviewed together to judge whether that judgment-oriented Aha moment lands. |
| Phase 9B-4 | D2-U7, D2-U8 | Residual-risk sequencing and risk/control ownership are Domain 2's two most direct opportunities for cross-domain transfer (Domain 1 recall) — grouped so the founder can specifically judge whether that transfer feels genuine or forced. |
| Phase 9B-5 | D2-U9, D2-U10 | Monitoring/reporting and embedding are the closing, integrative units — reviewed last since they deliberately recall everything built in 9B-1 through 9B-4. |

**Each batch follows the same approved gate sequence before the next
begins:** implementation → automated validation → Founder Human Experience
Gate → correction if necessary → closeout → merge. No batch proceeds to the
next until its own merge is complete — mirroring exactly how Domain 1's
6B → 6C → 7A → 7B-1/2/3 → 7C → 8B phases were actually gated, not a single
large authoring pass.

Each batch's founder review should ask the same questions used at every
prior gate: did it click, was there an Aha moment, was it concise, were
the questions fair, were distractors believable, did recall help, did
anything feel repetitive or predictable — plus, specific to Domain 2, "did
this feel like a formula/reasoning problem to solve or an arithmetic
exercise" (D2-U4) and "did the Domain 1 connection feel earned or forced"
(D2-U8/wherever cross-domain recall fires first).

## Cross-references

[Pattern Library](PATTERN-LIBRARY.md) · [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md) · [Lifecycle Model](LIFECYCLE-MODEL.md) · [Confusing Concepts](CONFUSING-CONCEPTS.md) · [Foundation Blueprint](FOUNDATION-BLUEPRINT.md)
