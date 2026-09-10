# Domain 3 Curriculum Architecture — Security Program

**Status: [CANDIDATE] — a planning artifact, not implemented content.**
Produced during the Domain 3 curriculum architecture / source-mapping phase,
a read-only/planning-only phase: no Domain 3 lesson, concept, family, or
question was authored. It elaborates the CANONICAL sections of
[`DOMAIN-3-BLUEPRINT.md`](DOMAIN-3-BLUEPRINT.md) (fundamental question, core
areas, patterns, roles) — it does not redefine any of them. Everything below
is a proposal for Architect/Founder review, mirroring the precedent set by
[`DOMAIN-2-BLUEPRINT.md`](DOMAIN-2-BLUEPRINT.md#phase-9a--domain-2-curriculum-architecture-approved-architecture-not-yet-implemented)'s
own architecture-phase section. No Domain 3 production content has been
authored as of this revision.

## 1. Source inventory

**Authoritative source:** `tools/input/domain-3.txt` (17,360 lines, largest
of the four domain source files — Domain 1: 7,903, Domain 2: 9,588, Domain 4:
11,677 — consistent with Domain 3 carrying the largest exam weight, 33%, per
`schema/registry/domains.json`). Extracted programmatically the same way as
every prior domain: each question block carries its own embedded ISACA
Knowledge-Statement/Task-Statement tags. No question text has been
reproduced into production content; the file is evidence for curriculum
coverage and reasoning patterns only.

**`data/domains/domain-3.json` is NOT a source for this analysis.** It is the
pre-existing dead/stub file tracked as `BUG-003` in
[`docs/regressions/REGISTRY.md`](../regressions/REGISTRY.md) — nine
one-line "cluster" labels, self-labeled `"status": "content-engine-ready"`
from an early build stage, never loaded by any code path. It was inspected
and explicitly excluded, not overlooked.

**Question-block count — reported transparently with its own uncertainty:**
counting `Justification` headers gives 401; counting `is the correct
answer.` lines gives 422 (this phrase also appears inside some justification
prose referring to a *different* option, e.g. "...is not the correct
answer..." false positives are excluded by the literal-affirmative match but
some remain); summing the eleven Knowledge-Statement tag counts below gives
399. These three independent counts agree to within 1% of each other. The
architecture below treats **~400 distinct question+justification blocks** as
the working figure — precise enough for unit-sequencing decisions, not
precise enough to cite as an exact count in any future production claim.

## 2. Source-derived knowledge areas (by ISACA Knowledge Statement)

| Code | Knowledge Statement | Question count |
|---|---|---|
| 3A1 | Information Security Program Resources (e.g., people, tools, technologies) | 40 |
| 3A2 | Information Asset Identification and Classification | 27 |
| 3A3 | Industry Standards and Frameworks for Information Security | 16 |
| 3A4 | Information Security Policies, Procedures, and Guidelines | 51 |
| 3A5 | Information Security Program Metrics | 23 |
| 3B1 | Information Security Control Design and Selection | 61 |
| 3B2 | Information Security Control Implementation and Integrations | 56 |
| 3B3 | Information Security Control Testing and Evaluation | 44 |
| 3B4 | Information Security Awareness and Training | 29 |
| 3B5 | Management of External Services (providers, suppliers, third/fourth parties) | 32 |
| 3B6 | Information Security Program Communications and Reporting | 20 |

**Task-Statement extraction is unreliable and is reported as a gap, not
force-fit.** Unlike the clean single-token Knowledge-Statement tags, several
Task Statement lines wrap across 2–3 raw lines with inconsistent breaks,
producing corrupted partial-line matches on mechanical extraction (e.g. a
line reading only `"5 an acceptable level"`). A second problem is more
substantive: several Task Statement numbers/text that appear inside
`domain-3.txt` (22, 24, 25, 26, 27, 28 — "participate in risk identification
and treatment," "determine whether controls... manage risk," etc.) are
**textually identical** to Task Statements already documented as Domain 2's
own task range in
[`DOMAIN-2-BLUEPRINT.md`](DOMAIN-2-BLUEPRINT.md#source-bank-inventory).
This is a genuine property of the source corpus (ISACA's task statements are
organized by job practice area, and several risk-related tasks are
legitimately cross-referenced from the Security Program domain because a
program manages controls that treat risk) — not a parsing error — but it
means Task Statement counts cannot be cleanly attributed to Domain 3 alone
without deeper reconciliation than this architecture-only phase performs.
**Stated as a gap:** a precise Domain-3-only Task Statement frequency table
is not produced here; Knowledge Statement is used as the primary structural
signal throughout this document instead, exactly as it was the more reliable
signal for Domain 1 and Domain 2 as well.

## 3. Roles, verbs, lifecycle positions, qualifiers

**Roles/terms (occurrence counts, whole file):** information security
manager 89, vendor 61, senior management 49, third-party 47, outsourc(ing)
32, service provider 24, steering committee 13, CISO 11, custodian 10, data
owner 17, information owner 4, process owner 8, administrator 19, board of
directors 5, internal audit 5, system owner 1, asset owner 1, **control
owner 0, risk owner 0**.

**Gap, stated explicitly:** `DOMAIN-3-BLUEPRINT.md`'s CANONICAL
"Characteristic roles" section names **"Control Owner"** as one of Domain
3's two most heavily-leaned-on roles. The literal phrase "control owner"
does not occur anywhere in `domain-3.txt` (0 occurrences) — nor does "risk
owner" (Domain 2's own vocabulary, also 0, correctly absent here). What the
source actually uses instead is a mix of **"custodian"** (10), generic
**"administrator"** (19), and, most often, unnamed structural phrasing
("who is responsible for implementing/operating this control" without a
title at all — the accountable/responsible split is tested through Role &
Authority Matrix reasoning, not through a title token). This does not
contradict the CANONICAL blueprint — "Control Owner" is a real, standard
CISM role concept the source clearly tests *functionally* — but it means
Domain 3 lessons should not expect to find the literal term "control owner"
quotable from source text the way "risk owner"/"control owner" both were
directly quotable in Domain 2's source. Flagged here rather than silently
assumed present.

**Qualifier frequency (whole-word occurrences):** MOST 144, BEST 99, FIRST
19, PRIMARY 18, PRIMARILY 11, GREATEST 8, MAIN 9, NEXT 1, LEAST 0. **Approved
qualifier treatment, proposed consistent with Domain 1/2 precedent:**
MOST/BEST dominate overwhelmingly (243 of ~314 total qualifier hits, ~77%);
FIRST/PRIMARY/PRIMARILY are genuinely present and usable; GREATEST/MAIN are
present but minor. **NEXT is essentially absent (1 hit)** — the same
situation as Domain 1 (not Domain 2, which had a real, if thin, NEXT
pocket). Per the existing Domain 1 precedent
(`DOMAIN-1-BLUEPRINT.md#domain-1-readiness-note-phase-7c`), NEXT must not
be manufactured for Domain 3 merely to balance the five-qualifier vocabulary
— consistent with `QUALIFIER-DECODER.md` remaining unchanged.

**Lifecycle positions — binding constraint, not a gap.** Domain 3 has **no
canonical stage-by-stage lifecycle**, and none should be manufactured. Per
[`LIFECYCLE-MODEL.md`](LIFECYCLE-MODEL.md#domain-1--domain-3--conceptual-model-not-canonical):
an earlier draft's eight-stage "governance-to-program lifecycle" for
Domains 1 and 3 was **explicitly withdrawn** at Phase 2 review and replaced
with two conceptual (not lifecycle-stage) relationships:

```
business objectives → governance → strategy          (Domain 1's relationship)
strategy → program → controls → measurement/improvement   (Domain 3's relationship)
```

These carry no "what has happened / what hasn't happened yet" STAGE-location
exercise the way Domain 2's and Domain 4's canonical lifecycles do, and
Foundation's STAGE reasoning step is explicitly not expected to apply to
Domain 3 the way it applies to Domains 2 and 4. **This is the single most
important structural constraint on the unit sequence below**: Domain 3's
unit order follows the source's own knowledge-area groupings and the
`strategy → program → controls → measurement/improvement` conceptual
relationship as a loose narrative arc, never as a taught/tested lifecycle
with stage-location questions.

**Common distractor patterns found, with direct source evidence:**

- **Implementation ≠ effectiveness (P07).** Directly evidenced repeatedly in
  3B1/3B3 ("Inherent control strength is mainly achieved by proper design...
  even good implementation is not likely to overcome poor design"; virus
  detection "effectiveness... depends on... definition files," not on
  unrelated controls). This is the domain's single strongest, most
  repeatedly-evidenced trap, matching the CANONICAL blueprint's own claim
  that P07 is "the single most load-bearing pattern in this domain."
- **Purpose vs. activity / control classification by purpose, not
  technology (P06).** Directly evidenced: "MOST effective at preventing
  tailgating" rejects three technology-sounding options (card key locks,
  photo ID, biometric scanners) in favor of awareness training, because the
  question asks what *prevents* the specific failure mode, not what sounds
  most technical.
- **Generic vs. role-specific/targeted awareness.** Directly evidenced
  ("customized for different types of audiences... new employees, system
  administration, sales and delivery channels" beats "embedded into
  orientation" alone) — confirms the CANONICAL pattern verbatim.
- **Discretionary vs. mandatory policy artifacts.** Directly evidenced
  ("MOST likely to be discretionary" → Guidelines, because Policies/
  Standards/Procedures all bind while Guidelines only recommend) — this is
  the same policy/standard/procedure/guideline hierarchy Domain 1 already
  teaches (see §9, cross-domain reinforcement, and the BUG-001 note below)
  tested from a mandatory-vs-discretionary angle.
- **"Eliminate all risk" / absolute-language traps**, reused from Domain 1/2
  ("focus on eliminating all risk" rejected as impractical) — confirms
  Domain 3 continues, rather than reinvents, this cross-domain trap shape.
- **Zero-source-evidence gap, stated explicitly:** `KPI`/`KRI`/`KCI`/`OKR`
  — all four CANONICAL-required metric-type terms — appear only 3/5/2/2
  times respectively in the entire source file. This mirrors Domain 2's own
  quantitative-risk situation (`SLE`/`ARO`/`EF`/`AV` at 0 occurrences each,
  `ALE` at 3) almost exactly: **a CANONICAL, mandate-driven requirement that
  is not source-frequency-evidenced.** It should be taught because Phase 2
  architecture requires it, reported here transparently as thin-evidenced
  rather than claimed as strongly source-supported.

## 4. Proposed unit sequence

**9 content units + 1 synthesis/capstone unit = 10 total.** This count is
**not** a default-to-Domain-2's-ten; it falls out of the evidence-driven
grouping below (one Knowledge-Statement area absorbed for source-thinness,
one pair of adjacent areas combined because they are two halves of one
reasoning arc), reported transparently rather than asserted as a target.
Roughly 8–12 was the requested range; 10 is where the source evidence
actually lands this time, coincidentally matching Domain 2's count for
unrelated, independently-derived reasons.

| Unit | Working title | Core concepts | Why it belongs here | Prerequisite(s) | Major CISM reasoning distinction | Recurring-story use | Transfer-scenario opportunity | Likely repair target | Likely confusing concepts | Synthesis dependency |
|---|---|---|---|---|---|---|---|---|---|---|
| D3-U1 | Program Foundations: Strategy to Program | People/process/technology/resources; program is not merely a technology stack; aligning the program to an external framework's structure without cataloging frameworks (3A1, 40 qs + 3A3, 16 qs absorbed) | Domain entry point — nothing downstream makes sense before "what is a security program, and what is it made of" is established; 3A3 (16 qs, thinnest area) absorbed here as scenario variety rather than a dedicated framework-cataloging unit, mirroring the explicit Domain 1/2 "not a framework-cataloging lesson" exclusion | none (Domain 3 entry point) | Program ≠ technology stack; a program exists to close the gap between current and required control state, in service of strategy, not for its own sake | Story's program formally launches/is chartered here | A scenario framed as "just buy the tool" vs. "build the program" | Reaching for a technology purchase when the actual gap is people/process | Program vs. project; program vs. a single control | D3-U10 (synthesis opens the loop this unit starts) |
| D3-U2 | Asset Identification & Classification | Classification basis (criticality/sensitivity, not cost/threat/likelihood alone); accountability for classification | Own Knowledge-Statement area (3A2, 27 qs), well-evidenced, and a natural early step — you classify what the program will protect before designing controls for it | D3-U1 | Classification follows business impact, not acquisition cost or threat exposure alone | Story's newly-onboarded business unit's assets get classified for the first time | A scenario with a high-cost, low-impact asset vs. a low-cost, high-impact one | Confusing high monetary value with high classification level | Classification vs. risk assessment (classification informs risk assessment, not the reverse) | Supplies the "what are we protecting" half of the synthesis chain |
| D3-U3 | Program-Level Policy Governance | Mandatory (policy/standard/procedure) vs. discretionary (guideline); policy-driven principles (proportionality, accountability) (3A4, 51 qs — second-largest area) | Second-largest single Knowledge-Statement area; directly, heavily reinforces Domain 1's already-existing `concept.d1.policy-artifact-hierarchy` — see the BUG-001 note in §9 for why this must be its own, distinctly-scoped Domain 3 concept, not a re-teach | D3-U1 | A guideline is discretionary; policies/standards/procedures are not — and access/controls should be *proportionate* to classification, not uniform | Story's program formalizes its first policy set, discovering some existing local practices were only ever "guidelines" | A scenario asking which artifact type a given rule actually is, by its binding/non-binding nature | Treating a guideline as if it were mandatory, or a standard as if it were optional | Policy vs. standard vs. procedure vs. guideline (recalls D1, adds the mandatory/discretionary lens) | Supplies the "what governs the program" half |
| D3-U4 | Control Design & Selection | Preventive/detective/corrective/compensating classification by purpose; defense in depth (3B1, 61 qs — largest single area) | Largest Knowledge-Statement area in the entire domain; purpose-vs-technology classification (P06) is directly, repeatedly evidenced here | D3-U2, D3-U3 | A control's classification follows its *purpose* in a specific failure scenario, not its technology or name | Story selects controls for its newly-classified assets | A scenario where the "obviously technical" answer is not the one whose purpose actually fits the stated failure mode | Classifying a control by its label/technology instead of the specific gap it closes | Preventive vs. detective vs. corrective vs. compensating | Supplies the "what protects it" half |
| D3-U5 | Control Implementation & Integration | Embedding controls into organizational processes, not as a bolt-on (3B2, 56 qs) | Second-largest area; directly shares Pattern P09 ("security embedded in business process") with Domain 2, extending it from risk management specifically into control operation generally | D3-U4 | A control that exists on paper is not yet a control that operates inside the actual business process | Story's controls get built into day-to-day plant/department operations, not run as a parallel checklist | A scenario contrasting an integrated control with a standalone compliance exercise that duplicates it | A control that exists as a document but was never actually integrated into the workflow it's meant to protect | Implementation vs. integration (a control can be implemented but still not integrated) | Supplies the "how it actually operates" half |
| D3-U6 | Control Testing & Evaluation | Existence ≠ effectiveness; evidence of outcome, not evidence of activity (3B3, 44 qs) | This domain's single most load-bearing pattern (P07), per the CANONICAL blueprint, and the most repeatedly source-evidenced trap found in this analysis — deserves its own dedicated, undiluted unit | D3-U5 | "It's implemented" and "it works" are different claims requiring different evidence | Story's controls undergo their first formal test/audit cycle | A scenario where a control clearly exists (documented, deployed) but the question asks what would prove it *works* | Citing implementation/deployment as proof of effectiveness | Testing vs. evaluation vs. audit (three related but distinct assurance activities) | The domain's central Aha moment feeds directly into D3-U10 |
| D3-U7 | Security Awareness & Training | Role-specific/targeted awareness beats generic training; awareness vs. training as distinct activities (3B4, 29 qs) | Own, well-evidenced Knowledge-Statement area; the generic-vs-targeted distinction is directly and repeatedly evidenced, and pairs naturally with D3-U5's "actually integrated, not bolted on" theme | D3-U1 | A generic, one-size-fits-all program is a weaker answer than one tailored to the specific audience's actual exposure | Story tailors training for its plant-floor/OT staff differently from its corporate staff | A scenario offering "more training" as an answer when the real gap is relevance/targeting, not volume | "More training" chosen over "better-targeted training" | Awareness vs. training (attitude/vigilance vs. skill/knowledge transfer) | A concrete "the program adapts to its people" example for the synthesis |
| D3-U8 | Managing External Services | Vendor/third-party/outsourcing; accountability does not transfer with outsourced work; contract-embedded security requirements (3B5, 32 qs) | Own Knowledge-Statement area; the single strongest, most direct opportunity in Domain 3 to reapply Domain 1's authority-follows-accountability pattern (P02) to genuinely new vocabulary — this domain's closest analog to how Domain 2's Risk-Owner-vs-Control-Owner unit was its own strongest Domain-1 transfer moment | D3-U3 (contract terms extend policy), D3-U5 (integration extends past the org boundary) | Outsourcing the *work* does not outsource the *accountability* for its outcome | Story's plant-equipment/managed-service vendors are brought under the program's own requirements via contract | A scenario where a vendor failure is nonetheless the enterprise's own accountability | Assuming a vendor's failure is "the vendor's problem," not the enterprise's | Outsourcing responsibility vs. outsourcing accountability | Supplies the "program extends past the org boundary" half |
| D3-U9 | Program Metrics & Reporting | KPI/KRI/KCI/OKR (mandate-driven, thin-evidenced — see §3 gap note); audience-appropriate reporting; continuous improvement (3A5, 23 qs + 3B6, 20 qs combined) | Two adjacent, smaller areas combined because they are two halves of one reasoning arc — define what to measure, then report it usefully — matching the domain's own `...→ measurement/improvement` conceptual endpoint; directly recalls Domain 1's P07 (activity ≠ effectiveness) and P11 (audience-appropriate communication) | D3-U6 (evaluation results feed reporting) | A metric is only useful if it's the *right type* for the decision it informs, and reported to the audience that needs it | Story reports its first full-cycle program results to its steering committee/board | A scenario contrasting a technically-complete report with one the actual audience can act on | The most detailed report offered as the best report, regardless of recipient | KPI vs. KRI vs. KCI vs. OKR; metric vs. report | The final content input the synthesis unit assembles |
| D3-U10 | Program Synthesis: Strategy → Program → Controls → Improvement | Connects D3-U1 through D3-U9 through the domain's own approved conceptual relationship, in a live business scenario | Closing/integrative unit — assembles the pieces into one connected picture, per the general Domain synthesis/capstone principle in `CURRICULUM-BLUEPRINT.md` | D3-U8, D3-U9 (all prior units feed this one) | Seeing the whole program as one connected effort, not nine separate topics | Story's program completes its first full cycle and prepares for its next iteration | A capstone-scale scenario requiring reasoning across multiple prior units at once | Treating any single prior unit's answer as sufficient for a whole-program question | N/A — integrative, not a new pair | Terminal — nothing recalls this; this unit recalls everything else |

**Dependency structure (informal narrative order, not a tested lifecycle):**

```
D3-U1 (foundations)
   ├── D3-U2 (classify assets)
   │      └── D3-U4 (design controls for classified assets)
   │             └── D3-U5 (implement/integrate)
   │                    └── D3-U6 (test/evaluate — central Aha)
   │                           └── D3-U9 (measure/report)
   │                                  └── D3-U10 (synthesis)
   ├── D3-U3 (policy governance) ──────┘ (feeds D3-U4 design and D3-U8 contracts)
   ├── D3-U7 (awareness/training) ─────┘ (feeds D3-U10 as a people-side example)
   └── D3-U8 (external services) ──────┘ (feeds D3-U9 reporting and D3-U10)
```

D3-U3, D3-U7, and D3-U8 are **non-adjacent** prerequisites to D3-U10 —
each can be taught any time after D3-U1, in parallel with the
U2→U4→U5→U6→U9 spine, exactly as Domain 2's U8 (ownership) was deliberately
non-adjacent to its U2–U7 lifecycle spine. This is a genuine structural
echo of Domain 2's approved shape, not a copy: it falls out of Domain 3
having one central technical-execution spine (classify → design → implement
→ test → report) plus several cross-cutting concerns (governance, people,
external parties) that touch every stage rather than occupying one of them.

## 5. Reference-story candidates

Domain 2's payment-system story is explicitly **not** reused as Domain 3's
primary anchor, per binding instruction. Three candidates, evaluated against
realism, D3 coverage, ability to show management decisions and stakeholder
variety, memorability, transfer potential, and repetitiveness risk:

| Candidate | Realism | D3 coverage | Stakeholder variety | Memorability | Transfer potential | Repetitiveness risk |
|---|---|---|---|---|---|---|
| **A — Meridian Manufacturing**: a mid-size manufacturer building/maturing its security program while integrating a newly acquired plant (IT + OT) | High — acquisition integration is a common, realistic driver for exactly this unit sequence | Very high — every unit has a natural "why now" (newly acquired plant has unknown assets, no policies, ad hoc controls, untrained staff, uncontracted equipment vendors) | High — CISO, plant management, corporate IT, OT/plant-floor staff, equipment vendors, board | High — "the newly acquired plant" is a concrete, sticky frame | High — acquisition-driven urgency naturally motivates each unit's decision, without vocabulary giveaways | Low-moderate — must keep reasoning at management level, not drift into OT-technical jargon |
| **B — Northfield University**: a decentralized university formalizing one enterprise security program across previously-autonomous departments | High — decentralized-then-centralizing IT is a very common real CISM scenario shape | High, but weaker on "external services"/contracts (fewer natural vendor-management moments) and "control testing" (less naturally dramatic than an acquisition/audit) | High — CISO, deans/department heads, faculty, students, research-data owners, Board of Regents | Moderate — "the university" is a familiar setting but less distinctive than a specific company | Moderate — decentralization motivates policy/classification units strongly, less so control design/testing | Moderate — risk of every unit reducing to "one department did its own thing," feeling repetitive by unit 5–6 |
| **C — Harbor Health Network**: a multi-facility healthcare provider building its program under regulatory and clinical-operations pressure | High — healthcare is a genuinely rich CISM-relevant vertical | High, especially for classification (PHI), training (clinical staff), and external services (medical-device/EHR vendors) | High — CISO, clinicians, facility administrators, medical-device vendors, compliance/legal, board | High — healthcare stakes are inherently memorable | Moderate-high, but risks pulling reasoning toward *regulatory-compliance* framing over *management-judgment* framing, which is not what CISM tests | Moderate — clinical/regulatory flavor could crowd out the program-management reasoning that is the actual teaching target |

**Recommended: Candidate A — Meridian Manufacturing.**

**Why it is superior:** the acquisition-integration frame gives every one of
the ten units a concrete, non-vocabulary-giving reason to exist in sequence
— assets must be classified *because* they were just acquired and are
unknown; policy must be established *because* the acquired plant had none;
controls must be designed and then tested *because* the newly-combined
organization cannot assume the acquired plant's informal practices were
adequate; awareness training must be re-targeted *because* the plant-floor
audience is new and different from corporate; vendor/contract management
must be extended *because* the acquired plant brought its own equipment
vendors with it; and reporting to the board closes the loop by showing the
program matured across the acquisition. This is a stronger forcing function
for "why does this unit happen now" than either alternative, without
reducing to a single industry's compliance-checklist framing (Candidate C's
risk) or a loosely-federated-department framing that risks feeling
repetitive by mid-sequence (Candidate B's risk). It is also structurally
and thematically distinct from Domain 2's single-system payment-processing
story: different industry, different narrative driver (acquisition/growth
vs. steady-state risk decisions), different asset types (mixed IT/OT vs.
transaction data).

Story content itself is **not authored in this phase** — this is a
recommendation for Architect/Founder selection, not an implemented artifact.

## 6. Question-family architecture (proposed, source-evidenced)

One primary family per unit proposed initially (10 units → ~10 initial
families), matching the Domain 1/Domain 2 minimum-3-variant-per-family
floor. Families are not authored in this phase.

| Unit | Family concept (proposed) | Invariant reasoning | Role/authority pattern | Qualifier pattern | Common wrong-answer logic | Candidate repair target | Sibling-scenario strategy |
|---|---|---|---|---|---|---|---|
| D3-U1 | Program is not a technology stack | A security program is people + process + technology + resources aligned to strategy, not a tool purchase | CISO/program owner defines the program; senior management funds/charters it | MOST, BEST | Technology-only answer offered as "the program" | Reframe: what non-technology element is still missing | Vary the tempting technology across finance/manufacturing/retail settings |
| D3-U2 | Classification follows business impact | Criticality/sensitivity (business impact), not cost, threat count, or likelihood alone, determines classification | Data/information owner classifies; custodian implements protection per classification | MOST, PRIMARY | Cost-of-asset or threat-exposure substituted for business-impact | Ask what would change if impact (not cost/threat) were different | Vary asset type (financial system, HR record, plant-control system) |
| D3-U3 | Mandatory vs. discretionary policy artifacts | Policies/standards/procedures bind; guidelines recommend | Senior management approves policy; business management applies discretion within guidelines | MOST, BEST | Treating a guideline as binding, or a standard as optional | Ask which artifact type is actually being described, by its binding nature | Vary the artifact type being misidentified across scenarios |
| D3-U4 | Control classification follows purpose | Preventive/detective/corrective/compensating follows what a control is *for* in the stated failure scenario | Control owner/custodian selects and operates; ISM designs | MOST, BEST | Classifying by technology/label instead of the specific failure it addresses | Ask what the control's purpose is in this specific scenario, independent of its name | Vary the failure mode being defended against |
| D3-U5 | Integration, not a bolt-on | A control must operate inside the actual business process, not run as a parallel/duplicate check | ISM designs integration; business/process owner absorbs the control into workflow | BEST, MOST | A standalone compliance exercise offered as equivalent to integration | Ask what would make the control part of the actual workflow | Vary the business process the control must integrate into |
| D3-U6 | Existence ≠ effectiveness | Evidence of outcome (measured, verified) is required; evidence of activity/deployment is not sufficient | Internal audit/control owner supplies evidence; ISM interprets it | MOST, BEST | Citing deployment/documentation as proof of effectiveness | Ask what evidence would actually demonstrate the outcome, not the activity | Vary the control type being tested (technical, procedural, physical) |
| D3-U7 | Targeted awareness beats generic training | Role-relevant, audience-specific content outperforms uniform "more training" | ISM designs; delivered per-audience | BEST, MOST | "More training" chosen over "better-targeted training" | Ask what would make the content relevant to this specific audience | Vary the audience (executives, developers, plant floor, new hires) |
| D3-U8 | Accountability doesn't transfer with outsourcing | The enterprise remains accountable for outcomes even when work/operation is outsourced | Enterprise/ISM retains accountability; vendor/service provider performs the work | MOST, PRIMARY | A vendor failure treated as solely the vendor's problem | Ask who remains accountable to the business regardless of who performed the work | Vary the outsourced function (managed security service, equipment maintenance, cloud hosting) |
| D3-U9 | Metric type and audience both matter | The right metric type (KPI/KRI/KCI/OKR) and the right audience-fit both determine reporting usefulness | ISM reports; board/steering committee/senior management decide | BEST, MOST | Most detailed/technical report offered regardless of recipient's decision need | Ask what decision this specific audience needs to make, and what they need to make it | Vary the audience and the decision they need to make |
| D3-U10 | Whole-program reasoning | A capstone scenario requires connecting classification, controls, testing, people, vendors, and reporting together | Multiple roles across the program, reasoned about together | MOST, BEST | Answering from only one prior unit's lens when the scenario needs several | Ask what earlier-established fact from a different unit changes this answer | Vary which combination of prior units' concepts a given capstone scenario draws on |

No source questions are rewritten here; no family or concept is promoted to
`CANONICAL`.

## 7. Confusing-concept map

| Pair | What appears similar | Actual distinction | Trap | Taught in | Recalled in |
|---|---|---|---|---|---|
| Policy vs. Standard vs. Procedure vs. Guideline (recalls D1's `concept.d1.policy-artifact-hierarchy`) | All four are "documented rules" | Only Guidelines are discretionary; the other three bind | Treating a guideline as mandatory or a standard as optional | D3-U3 | D3-U8 (contracts extend mandatory terms) |
| Preventive vs. Detective vs. Corrective vs. Compensating controls (CANONICAL, already in `CONFUSING-CONCEPTS.md`) | All are "security controls" | Classification follows the control's purpose in the specific scenario, not its technology | Classifying by label/technology instead of purpose | D3-U4 | D3-U6 (testing must match the claimed purpose) |
| KPI vs. KRI vs. KCI vs. OKR (CANONICAL, already in `CONFUSING-CONCEPTS.md`) | All are "program measurements" | Each answers a different question (performance vs. risk-warning vs. control-health vs. objective-progress) | Wrong metric type offered for the stated reporting need | D3-U9 | D3-U10 |
| Implementation vs. Effectiveness (this domain's central trap, P07) | Both describe "the control is in place" | Implementation is a state; effectiveness is a measured outcome | Citing deployment as proof of effectiveness | D3-U5, D3-U6 | D3-U9, D3-U10 |
| Awareness vs. Training | Both are "teaching people something" | Awareness builds vigilance/attitude; training builds a specific skill | Assuming more of one substitutes for the other | D3-U7 | D3-U10 |
| Outsourcing responsibility vs. outsourcing accountability | Both look like "someone else is now handling this" | Day-to-day work can be delegated; accountability for the outcome cannot | Treating a vendor's failure as solely the vendor's problem | D3-U8 | D3-U9, D3-U10 |
| **Policy Hierarchy — Domain 1 vs. Domain 3 (see BUG-001 note, §9)** | Both domains discuss "policy, standard, procedure, guideline" | D1 teaches the artifact hierarchy as a governance-layer concept (`concept.d1.policy-artifact-hierarchy`); D3 must teach the mandatory/discretionary and program-governance angle as its **own**, distinctly-scoped concept, recalling D1 rather than re-defining it | Silently re-teaching D1's concept under a new id, or worse, reusing the same concept id across two domains (the exact historical defect BUG-001 describes in the legacy prototype architecture) | D3-U3 (new angle only) | D1 recall, not new content |

## 8. Aha-point candidates

| # | Belief before | Realization | Scenario/story moment | Reused in |
|---|---|---|---|---|
| 1 | "A security program is basically a set of tools and technologies." | The program is people + process + technology + resources aligned to strategy — a technology purchase alone is not a program. | Story's CISO is handed a budget for "the best tools" but must first define what the program even needs. | D3-U10 |
| 2 | "A guideline is basically the same as a policy, just less formal wording." | Only guidelines are discretionary; policies/standards/procedures all bind, regardless of tone. | Story discovers the acquired plant's "policy" was actually only ever a guideline, and nothing was ever mandatory. | D3-U8, D3-U10 |
| 3 | "If a control exists and is deployed, it's working." | Existence and deployment are not evidence of effectiveness — only measured outcomes are. | Story's first formal control test reveals a fully-deployed control that has never actually caught anything. | D3-U9, D3-U10 (the domain's central Aha, mirroring Domain 1's own P07 origin) |
| 4 | "More security training is always better." | Targeted, role-relevant awareness beats generic, one-size-fits-all training volume. | Story's corporate-style training program fails to change plant-floor behavior until it's redesigned for that specific audience. | D3-U10 |
| 5 | "Once we outsource this function, it's the vendor's responsibility." | The enterprise remains accountable for the outcome regardless of who performs the work. | Story's outsourced equipment-maintenance vendor causes an incident, and the board asks the CISO — not the vendor — what happened. | D3-U9, D3-U10 |
| 6 | "The most detailed, technically complete report is the best report." | A report is only as good as the decision it enables its specific audience to make. | Story's first board report is technically exhaustive and is sent back, unread, with a request for "what do we actually need to decide." | D3-U10 |

## 9. Cross-domain reinforcement

Only included where genuinely load-bearing for a Domain 3 reasoning problem
— not a re-teach of any prior unit.

| Domain 3 unit | Prior concept recalled | Why it helps |
|---|---|---|
| D3-U1 | D1's business-justification/roadmap sequencing (`concept.d1.business-justification-roadmap`, P01) | A program's existence must trace to strategy, exactly like Domain 1's roadmap-follows-business-case sequencing — the same "don't act before the justification exists" reasoning, new vocabulary |
| D3-U2 | D1's data-ownership/accountability concept (`concept.d1.data-ownership`) | Classification accountability sits with the same data-owner role D1 already established owns data-related decisions — not a new accountability model |
| D3-U3 | **D1's `concept.d1.policy-artifact-hierarchy` — mandatory recall target, not a re-teach.** See the BUG-001 note below. | Both domains discuss the same four artifact types; recalling D1's concept rather than re-defining it is the only way to avoid recreating the historical concept-identity collision |
| D3-U4 | D2's risk-driven prioritization (P08) | Control selection should be driven by the risk it addresses, not by cost or technological appeal alone — the same reasoning shape D2 already established for treatment selection |
| D3-U6 | D2's residual risk concept | A tested/evaluated control's remaining gap is itself a residual-risk input — closing the loop (P15) back into Domain 2's model, not a new idea |
| D3-U8 | D1's authority-follows-accountability (`concept.d1.authority-accountability`, P02) | Outsourcing work does not outsource accountability — the exact same accountability-vs-delegation reasoning D1 already teaches, applied to vendor relationships instead of internal roles. This is Domain 3's strongest expected transfer moment, structurally analogous to how Domain 2's Risk-Owner-vs-Control-Owner unit was its own strongest D1 transfer moment. |
| D3-U9 | D1's governance-effectiveness (`concept.d1.governance-effectiveness`, P07) and D2's audience-appropriate reporting (P11) | "Report outcomes, not activity" and "match the report to the audience's decision" are both already-established cross-domain principles, not Domain-3-only rules |

**BUG-001 note — read before authoring D3-U3.** The registry entry for
[BUG-001](../regressions/REGISTRY.md#bug-001--concept-identity-collision-policy-hierarchy-spans-domain-1-and-domain-3)
documents a *historical* defect in the legacy prototype architecture
(`data/active-learning.js`, `js/app.js`, `js/storage.js`) where a
Domain-1/Domain-3 "Policy hierarchy" concept was represented by the same
literal title string in two domains, causing their mastery evidence to
merge incorrectly. **The current production architecture
(`content/production/concepts.json`, `registry.ts`) already structurally
prevents this**: every concept id is domain-scoped
(`concept.d1.policy-artifact-hierarchy` already exists and belongs to
Domain 1 alone). The correct, current-architecture resolution — proposed
here, not yet implemented — is that Domain 3's policy-governance concept
must be authored under its **own**, distinctly-scoped id (e.g.
`concept.d3.policy-governance` or similar, to be finalized at authoring
time), teaching the mandatory/discretionary and program-principle angle
that is genuinely new in the source material, while the connection to
Domain 1's existing concept is expressed purely through the **recall
graph** (D3-U3 recalls `concept.d1.policy-artifact-hierarchy`), never
through id-sharing or content duplication. This does not fix BUG-001 itself
(that remains correctly deferred to the legacy architecture, per its own
resolution plan) — it is a note to ensure Domain 3's *new* content does not
recreate the same shape of problem in a codebase that already has the
structural fix available.

## 10. Synthesis / capstone design

**Purpose:** bring D3-U1 through D3-U9 together through the domain's own
approved conceptual relationship (`strategy → program → controls →
measurement/improvement`), in one continuous Meridian Manufacturing scenario
covering the program's first full cycle — explicitly **not** a stage-by-
stage lifecycle walkthrough (Domain 3 has no canonical lifecycle to walk),
and explicitly not a long recap or a list of definitions.

**Structure (proposed, not authored):** a single extended scenario in which
the story's program is asked, across several decision checkpoints, to (1)
justify a program element against strategy (D3-U1), (2) classify a newly
surfaced asset (D3-U2), (3) resolve a mandatory-vs-discretionary policy
question (D3-U3), (4) select and classify a control by purpose (D3-U4), (5)
determine whether that control is actually integrated (D3-U5), (6) evaluate
whether it's effective, not merely deployed (D3-U6 — the domain's central
Aha, revisited at capstone scale), (7) decide how its people-side response
should be targeted (D3-U7), (8) resolve an accountability question
involving an outsourced vendor (D3-U8), and (9) choose what to report to the
board and why (D3-U9) — each checkpoint asking the same shape of question
already proven across the unit sequence ("what type of artifact/control/
metric is this, actually?", "who is accountable here?", "does this prove
the outcome or just the activity?"), not a separate "memorize this list"
exercise.

**Target Aha:** *"Now I can see the entire program as one connected effort
— strategy drives what gets built, controls only matter if they're proven
effective, and accountability runs through the whole thing whether or not
the work itself is outsourced."*

**Flow may differ from ordinary Domain 3 lessons**, per the general
synthesis-flow allowance in
[`CURRICULUM-BLUEPRINT.md`](CURRICULUM-BLUEPRINT.md#domain-synthesis--capstone-principle),
matching the precedent set for Domain 2's own D2-U10 capstone. Content is
not authored in this phase.

## 11. Content-status boundary

All Domain 3 architecture and any future authored content remain
`CANDIDATE`. No `CANONICAL` promotion occurs in this phase or is proposed by
it. The CANONICAL sections of `DOMAIN-3-BLUEPRINT.md` (fundamental question,
core areas, patterns, roles) are elaborated above, never redefined or
contradicted.

## 12. Deferred / not-now items

- Full Domain 3 lesson/family/question authoring — this phase is
  architecture only.
- Reference-story content (Meridian Manufacturing's specific narrative
  beats) — a candidate is recommended, not written.
- Resolving BUG-001 itself — remains correctly deferred to the Phase 3
  canonical concept-identity model; this document only ensures new Domain 3
  content doesn't recreate its shape.
- A precise, reconciled Domain-3-only Task Statement frequency table (see
  §2 gap note) — Knowledge Statement is the primary structural signal used
  instead, consistent with prior domains.
- Any Domain 4 material.
- Reopening learning modes (Explore/Practice/Reinforcement/Daily Study) —
  explicitly out of scope and untouched by this phase.
- Persistence, mastery tracking, authentication, analytics, AI-assisted
  tutoring features — unrelated to this planning phase.

## 13. Recommended authoring sequence

Mirroring the small, human-reviewable batching precedent from Domain 1 and
Domain 2 (each batch independently gate-able before the next begins):

| Batch (proposed) | Units | Rationale |
|---|---|---|
| 1 | D3-U1, D3-U2 | Establishes the shared "what is a program, what are we protecting" vocabulary nothing later can be meaningfully reviewed without |
| 2 | D3-U3, D3-U4 | Policy governance and control design/selection are closely related (policy drives control requirements) and share the mandatory/purpose-classification reasoning shape |
| 3 | D3-U5, D3-U6 | Implementation/integration and testing/evaluation are the domain's central execution arc, culminating in its single most load-bearing pattern (P07) — reviewed together to judge whether that Aha lands |
| 4 | D3-U7, D3-U8 | Awareness/training and external services are Domain 3's two strongest cross-cutting, non-adjacent concerns, including its strongest Domain 1 transfer moment (U8) |
| 5 | D3-U9, D3-U10 | Metrics/reporting and synthesis are the closing, integrative units, reviewed last since they deliberately recall everything built in batches 1–4 |

Each batch would follow the same approved gate sequence used for every
prior domain: implementation → automated validation → Founder Human
Experience Gate → correction if necessary → closeout → merge. No batch
proceeds to the next until its own merge is complete. **Not started in this
phase** — this is a proposed sequence for Architect/Founder review, not an
authorization to begin.

## Cross-references

[Domain 3 Blueprint](DOMAIN-3-BLUEPRINT.md) · [Pattern Library](PATTERN-LIBRARY.md) · [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md) · [Lifecycle Model](LIFECYCLE-MODEL.md) · [Confusing Concepts](CONFUSING-CONCEPTS.md) · [Curriculum Blueprint](CURRICULUM-BLUEPRINT.md) · [Domain 2 Blueprint](DOMAIN-2-BLUEPRINT.md) (architecture-phase precedent) · [Regression Registry](../regressions/REGISTRY.md) (BUG-001)
