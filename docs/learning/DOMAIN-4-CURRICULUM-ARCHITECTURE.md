# Domain 4 Curriculum Architecture — Incident Management

**Status: CANDIDATE architecture document.** This is the architecture and
source-mapping phase for Domain 4, mirroring the process already used for
Domain 3 ([`DOMAIN-3-CURRICULUM-ARCHITECTURE.md`](DOMAIN-3-CURRICULUM-ARCHITECTURE.md)).
**No Domain 4 production content (concepts, lessons, families, questions)
is authored in this phase.** This document proposes a unit sequence,
reference story, and synthesis design for Architect/Founder review; nothing
here is binding until explicitly approved, and none of it is authorized to
begin production authoring on its own.

Unlike Domain 3, Domain 4 already has an **existing, CANONICAL** blueprint
([`DOMAIN-4-BLUEPRINT.md`](DOMAIN-4-BLUEPRINT.md)) and an existing,
CANONICAL incident lifecycle
([`LIFECYCLE-MODEL.md`](LIFECYCLE-MODEL.md#domain-4--incident-lifecycle)),
both specified directly in the Phase 2 architectural discussion, with live
schema registry entries (`lifecycle.incident` and its six stages, already
present in `schema/registry/lifecycle-stages.json`). **This document
reconciles the proposed unit architecture to that existing lifecycle
exactly — it does not invent a new one.** Where this document elaborates
beyond the literal CANONICAL bullets already approved, it is marked
`[CANDIDATE]`, exactly as `DOMAIN-4-BLUEPRINT.md` itself already does.

## 1. Source inventory

Primary source: `tools/input/domain-4.txt` (406,164 bytes) — the same
question-bank format already used for Domains 1–3 (`Question` / lettered
options with blank-lettered filler rows / `Justification` per option /
`Domain` / `Knowledge Statement` / `Task Statement` blocks).

Approximate question count: **267** (counted via `is the correct
answer.`/`are the correct answer` occurrences), the largest of the four
domain source files (Domain 3's was ~264, in the same range). 257
Knowledge-Statement-tagged blocks were counted directly (a handful of
questions do not repeat their own KS tag a second time in the file, which
accounts for the small difference — consistent with the same minor
under-count pattern already observed and reported for prior domains).

Existing project documentation already covering Domain 4, inspected and
reconciled rather than duplicated:

- [`DOMAIN-4-BLUEPRINT.md`](DOMAIN-4-BLUEPRINT.md) — CANONICAL fundamental
  question, incident lifecycle (summary), core concepts, governing pattern
  (P05), characteristic roles.
- [`LIFECYCLE-MODEL.md`](LIFECYCLE-MODEL.md#domain-4--incident-lifecycle) —
  CANONICAL, full six-stage table with what-has/hasn't-happened columns.
- [`CONFUSING-CONCEPTS.md`](CONFUSING-CONCEPTS.md#domain-4--incident-management-pairs) —
  `[CANDIDATE]` Event vs. Incident, Containment vs. Eradication vs.
  Recovery, RTO vs. RPO vs. SDO vs. MTO.
- [`ROLE-AUTHORITY-MATRIX.md`](ROLE-AUTHORITY-MATRIX.md) — CANONICAL
  twelve-role list; Incident Response Team's characteristic
  verbs/context/pattern relationships already specified.
- [`PATTERN-LIBRARY.md`](PATTERN-LIBRARY.md) — CANONICAL fifteen patterns,
  all reusable; P04/P05 (lifecycle jumping/reversal) explicitly named as
  Domain 4's central governing pattern.
- `schema/registry/lifecycles.json` / `lifecycle-stages.json` —
  `lifecycle.incident` and its six stage IDs already exist, CANONICAL.
- `schema/registry/decision-types.json` — `decision.incident` and
  `decision.recovery` already exist as CANONICAL decision types, evidently
  reserved for this domain since Phase 2 (not used by any domain built so
  far).

No prior Domain 4 curriculum-architecture document existed before this one
(only the blueprint/lifecycle/confusing-concepts elaboration above, which
this document builds directly on rather than replaces).

## 2. Source quality / gaps

Reported transparently, per the same standard applied to Domains 2 and 3:

- **The source is rich and well-evidenced overall** — richer, in fact,
  than Domain 3's was in several areas. Every one of the twelve Domain 4
  Knowledge Statement codes found in the file (see §3) has double-digit
  question coverage; there is no near-zero-evidence area comparable to
  Domain 3's 3A3 (16 qs) or Domain 2's quantitative-risk terms (0
  occurrences for several CANONICAL-required terms).
- **RTO/RPO/SDO/MTO/AIW are well-evidenced**, unlike Domain 3's
  KPI/KRI/KCI/OKR situation — multiple direct-definition items were found
  for each term, including one item that names RTO, SDO, RPO, and MTO
  together in a single question's justification block (§8, distractor
  analysis).
- **Business Impact Analysis, Business Continuity Plan, and Disaster
  Recovery Plan (4A2/4A3/4A4 combined) account for roughly 61 of the
  domain's ~267 questions (~23%)** — a substantially larger share than the
  CANONICAL blueprint's brief "supporting activity" framing of business
  continuity might suggest on its own. This is reported as a notable
  finding, not a contradiction of the CANONICAL lifecycle: the blueprint
  is correct that BC/DR are not *sequential lifecycle stages* the way
  Contain/Eradicate/Recover are (nothing in the source contradicts that),
  but the sheer question volume devoted to BIA/BCP/DRP means this material
  needs real, dedicated unit space — comparable in scale to Domain 3's
  largest single area (3B1, 61 qs) — not a passing mention folded into
  another unit. §10 proposes a dedicated unit for this reason.
- **4B1 ("Incident Management Tools and Techniques," 26 qs) is a mixed
  bucket**, not a single coherent reasoning target: sampling showed it
  contains both continuous-monitoring/detection content (which belongs
  with Identify/Confirm reasoning) and forensic-evidence-handling content
  (which belongs with Investigation/Evidence reasoning). Per the same
  "don't force a single unit onto a mixed KS bucket" precedent already
  used for Domain 3's 3A3, this document proposes splitting 4B1's content
  across two other units rather than giving it its own, mirroring Domain
  3's D3-U1 absorption of 3A3.
- **No zero-evidence CANONICAL-required term was found** for Domain 4,
  unlike Domain 2 (SLE/ARO/EF/AV) and Domain 3 (KPI/KRI/KCI/OKR). This is
  reported as a genuine, favorable difference — Domain 4's authoring phase
  should not need a source-thin-gap transparency section comparable to
  those two domains' KPI/KRI/KCI/OKR or quantitative-risk treatments.
- **A small number of questions blend Domain 4 material with adjacent
  Domain 2/3 reasoning** (e.g., an E&O-insurance item reasoning about risk
  transfer, a data-governance item reasoning about reporting accuracy).
  These are noted but not mapped into the Domain 4 unit sequence unless
  their primary reasoning target is genuinely incident-management-specific
  — consistent with how Domain 3 treated occasional risk-adjacent items as
  cross-domain reinforcement opportunities rather than new Domain 3
  content.

## 3. Knowledge-area map

Actual Knowledge Statement codes and counts found in `tools/input/domain-4.txt`
(near-duplicate trailing-punctuation variants of the same code/title
merged):

| Code | Title | Count |
|---|---|---|
| 4A1 | Incident Response Plan | 28 |
| 4A2 | Business Impact Analysis (BIA) | 16 |
| 4A3 | Business Continuity Plan (BCP) | 27 |
| 4A4 | Disaster Recovery Plan (DRP) | 18 |
| 4A5 | Incident Classification/Categorization | 16 |
| 4A6 | Incident Management Training, Testing, and Evaluation | 19 |
| 4B1 | Incident Management Tools and Techniques | 26 |
| 4B2 | Incident Investigation and Evaluation | 36 |
| 4B3 | Incident Containment Methods | 17 |
| 4B4 | Incident Response Communications | 18 |
| 4B5 | Incident Eradication and Recovery | 18 |
| 4B6 | Post-incident Review Practices | 18 |

**Total: 257** KS-tagged blocks (see §2 for the small discrepancy against
the ~267 total-question estimate).

Representative sampling (5–10 questions read per code, prioritizing every
code at least once, with extra depth on the three largest: 4B2, 4A1, 4B1)
confirmed the following recurring reasoning targets per area:

- **4A1 (Incident Response Plan):** the *purpose* of incident
  response/management is to control impacts within acceptable levels and
  to prevent an incident from escalating into a problem, then a disaster
  (a direct, explicit sequencing claim found in-source); incident
  management's primary value is optimizing the balance between
  prevention/containment/restoration (a risk-management framing); the
  primary focus of incident response procedures is meeting business-defined
  service delivery objectives, not closing tickets or minimizing all
  disruption; a risk-based IR program's most serious design risk is
  overlooking the cumulative impact of repeated low-risk events.
- **4A2 (BIA):** impact assessment (not threat or vulnerability assessment
  alone) is the correct basis for determining asset criticality/sensitivity
  — a direct, strong echo of Domain 3's own asset-classification reasoning
  (D3-U2); BIA is what drives *prioritization* of incident response once an
  incident occurs, because at that point likelihood is no longer the open
  question — impact is.
- **4A3/4A4 (BCP/DRP):** RTO/RPO/SDO/MTO/AIW are each independently
  defined and distinguished multiple times; decentralizing authority to
  local management is the approved answer for maintaining continuity when
  central command may be disabled (a genuine authority/accountability
  question, not just a technical continuity question); human safety
  always has the highest priority, ahead of critical data, infrastructure,
  or vital records, in any emergency response plan; distributed,
  up-to-date key-process documentation matters more for global continuity
  than either a succession plan alone or strong leadership alone.
- **4A5 (Classification/Categorization):** severity determination
  benefits most from consulting the managers of the affected operational
  area (not just historical data or asset inventories alone); the
  escalation process and its authorized-recovery-action hierarchy must be
  clearly documented, not minimized "for simplicity"; legal/regulatory
  requirements are mandatory baseline standards, not optional guidelines;
  who has authority to declare a disaster must be established when the
  plan itself is established (Prepare stage), not during an active
  incident; the single most important reason to classify incidents is to
  optimize limited response resources, not merely to document counts.
- **4A6 (Training, Testing, Evaluation):** a simulation test is the most
  effective way to test an incident response plan specifically (as
  distinct from a red-team test, a penetration test, or a vulnerability
  scan, each of which tests something else); reduction in average
  incident-response *time* — not raw incident counts, not open-incident
  counts, not incidents-handled-per-month — is the best indicator of
  incident-response-process effectiveness. This is a direct, source-
  evidenced echo of Domain 3's own activity-vs-effectiveness reasoning
  (P07) applied specifically to incident response metrics.
- **4B1 (Tools and Techniques):** continuous monitoring's primary
  objective is minimizing impact magnitude through earlier detection, not
  aligning with IT goals or reducing policy exceptions (a byproduct, not
  the objective); forensic evidence handling requires working only from a
  bit-for-bit image of original media, never the original itself, to
  avoid altering evidence.
- **4B2 (Investigation and Evaluation, largest area):** confirming that a
  reported condition is a genuine incident is consistently the *first*
  step, before containment, notification, or law enforcement involvement;
  a broken chain of custody is a more significant concern than physical
  damage to evidence media, because it undermines the evidence's legal
  usability entirely; locating data and preserving its integrity is the
  first priority when electronically stored information is requested
  during an investigation, ahead of assigning responsibility, imaging, or
  litigation holds.
- **4B3 (Containment Methods):** containment is consistently the first
  priority once an incident is confirmed — ahead of documentation,
  monitoring, or restoration; human safety actions (e.g., verifying
  personnel are accounted for during a fire) come before invoking any
  recovery or continuity plan; containment responses should be
  proportionate to what is actually known to be affected (e.g., blocking
  only the specific attachment type implicated, not quarantining
  unrelated infrastructure).
- **4B4 (Communications):** an escalation process's most primary content
  is how long to wait for a response and what to do if none comes — not
  who to notify or how critical the incident is, which are also necessary
  but secondary to that timing/fallback structure; a communication plan's
  overarching goal is to improve incident response itself, not merely to
  raise awareness or satisfy compliance; the plan's primary benefit is
  ensuring staff know their specific roles/whom to contact, kept current.
- **4B5 (Eradication and Recovery):** eradication (removing the root
  cause) must be complete before recovery (restoring normal operations)
  begins, and lessons-learned documentation follows eradication, not the
  other way around — a direct, explicit confirmation of the CANONICAL
  lifecycle's own stated order; RTO is specifically the target for
  restoration of normal processing (distinguished directly from MTO, RPO,
  and SDO in the same question).
- **4B6 (Post-incident Review):** root-cause analysis (identifying the
  entry path / exploited vulnerability) is what actually indicates whether
  a similar incident will recur — not a fresh vulnerability assessment,
  automated log monitoring, or forensic investigation alone; senior
  management's review of incidents is primarily to ensure adequate
  corrective actions were taken, not to find fault with the response team
  or demonstrate management commitment for its own sake; post-incident
  reviews (not documentation, walk-throughs, or training alone) are the
  single best driver of continuous improvement to the incident response
  process itself.

## 4. Roles (source-derived)

All roles found map cleanly onto the twelve CANONICAL roles in
`ROLE-AUTHORITY-MATRIX.md` — no new role vocabulary was needed:

- **Incident Response Team** — the domain's characteristic role (already
  flagged as such in the existing blueprint); identifies/confirms,
  contains, coordinates, investigates. Directly evidenced throughout.
- **Information Security Manager / CISO** — defines/establishes the
  incident response plan and classification process, collaborates with
  management on escalation design, focuses procedures on meeting business-
  defined SDOs, reviews root cause and recommends corrective action.
- **Board / Senior Management** — reviews incidents (primarily to confirm
  adequate corrective action, not to find fault), provides leadership
  during continuity planning (though continuity execution should not
  *depend* on their availability during the event itself — see the
  succession-plan/local-authority item in §3), decides on program-level
  resourcing after post-incident review.
- **Business / Process Owner** — provides input to severity/impact
  determination for their own affected area (the "involve managers from
  affected operational areas" finding in §3); local management may receive
  delegated authority during a continuity event.
- **Legal / Compliance** — evidenced heavily around mandatory (not
  optional) regulatory requirements, chain-of-custody/evidence
  admissibility, and litigation holds during investigation.
- **Custodian / IT Operations** — executes technical containment/
  eradication/recovery actions under the Incident Response Team's
  direction; distinct from the Information Security Manager's planning/
  decision role (a genuine role-verb-matching opportunity, P03).
- **Users / Employees** — report suspected incidents, follow escalation
  procedures; not typically an incident-declaring or accountable authority.
- **Data Owner / Risk Owner / Control Owner** — appear more lightly than
  in Domains 2/3, mostly as recall-reinforcement targets (e.g., BIA's
  impact-assessment reasoning is the same reasoning Data Owners already
  apply to classification in Domain 3) rather than as this domain's own
  primary actors.

No role outside the existing twelve-role CANONICAL list was needed
anywhere in sampling.

## 5. Verbs/actions (source-derived)

Recurring, source-evidenced verbs, mapped to the ROLE + VERB + CONTEXT
principle already established project-wide:

- **confirm / validate** — confirming a reported condition is a genuine
  incident, consistently the first action in a sequence.
- **classify / categorize / prioritize** — by impact/severity, to
  optimize limited response resources.
- **escalate** — per a documented process with a defined wait-time/
  fallback structure.
- **contain** — to limit spread/damage, proportionate to what is actually
  affected; always before eradication.
- **preserve (evidence)** — maintaining chain of custody and using
  write-blockers/forensic images rather than originals.
- **investigate** — locating and preserving data integrity first, before
  assigning responsibility or imaging.
- **communicate / notify / report** — to the audience and at the
  cadence the communication plan defines, internally and externally.
- **eradicate** — removing the root cause completely, before recovery.
- **recover / restore** — returning to normal operations, only after
  eradication.
- **review** — post-incident, focused on root cause and corrective
  action, not fault-finding.
- **test / exercise** — via simulation (for IR-plan-specific testing,
  as distinct from red-team/pentest/vuln-scan, which test other things).
- **improve** — feeding lessons learned back into Prepare (P15, Closing
  the Loop).

No verb outside the existing project verb vocabulary (already implicit in
the ROLE-AUTHORITY-MATRIX and Repair Model) was needed.

## 6. Qualifiers (source-derived, frequency not fabricated)

Direct observation from sampled and grep-located items (not a formal
frequency count across all 267 questions — that would require full-corpus
reading beyond this architecture phase's scope, and is not claimed as
one):

- **FIRST** — very heavily represented; the single most recurring
  qualifier pattern observed. Nearly every "what's already happened, so
  what's the next real action" scenario samples used FIRST.
- **BEST** — heavily represented, especially for classification, testing-
  method selection, and evidence-handling questions.
- **MOST** (MOST important / MOST significant / MOST likely) — heavily
  represented, especially for severity/prioritization and communications
  reasoning.
- **PRIMARY / PRIMARILY** — represented for purpose/objective questions
  (primary value of incident management, primary focus of IR procedures,
  primary objective of continuous monitoring, primary reason senior
  management reviews incidents).
- **NEXT** — present but less prominent in the sampled set than FIRST;
  genuine source-grounded NEXT items exist (e.g., "what should happen
  next" once a contract/plan reaches a specific point), consistent with
  how Domain 3's D3-U8 found a smaller but real NEXT presence.

This qualifier profile is consistent with the domain's governing pattern
(P05, "do not solve a stage that has already passed") — FIRST/NEXT
questions are naturally frequent in a domain organized around a strict,
CANONICAL stage sequence.

## 7. Lifecycle/process evidence and recommendation

**An approved, CANONICAL Domain 4 incident lifecycle already exists** and
this document's every recommendation reconciles to it exactly:

```
PREPARE → IDENTIFY / CONFIRM → CONTAIN → ERADICATE
        → RECOVER → POST-INCIDENT REVIEW / IMPROVE
```

Sampling directly confirmed this exact stage order and its governing
pattern in the source material itself (§3's 4B2/4B3/4B5 findings: confirm
before contain, contain before eradicate, eradicate before recover/lessons-
learned) — **the source does not merely permit this lifecycle, it actively
demonstrates it**, unlike Domain 3's situation where no such stage sequence
existed to confirm or deny.

**Recommendation: adopt the existing CANONICAL lifecycle as-is, with no
proposed changes.** The six approved stages and their existing
`schema/registry` IDs (`stage.incident.prepare`,
`stage.incident.identify-confirm`, `stage.incident.contain`,
`stage.incident.eradicate`, `stage.incident.recover`,
`stage.incident.post-incident-review-improve`) should be used directly for
`family.stage_target` assignment during Domain 4 authoring, exactly as
Domain 2 already does with `lifecycle.risk`'s own stages (see the worked
precedent in §10).

**Supporting/cross-cutting activities** (already CANONICAL, not additional
sequential stages): severity/classification, escalation, evidence
preservation/chain of custody, communication, legal/regulatory
involvement, business continuity invocation. Source sampling confirms
these genuinely intersect multiple stages rather than occupying one (e.g.,
evidence preservation matters during both Contain and Eradicate;
communication happens throughout). **Recommendation: families built around
these supporting activities should carry `stage_target: null`** (cross-
cutting), exactly mirroring how Domain 2's own cross-cutting families
(`family.d2.risk-fundamentals`, `family.d2.risk-control-ownership`,
`family.d2.risk-management-synthesis`) already carry `stage_target: null`
while stage-bound families carry a specific stage ID — see §10's per-unit
table for the specific proposed assignment.

**No new lifecycle, stage, or process model is proposed.** This finding is
reported to the Architect as the single most important structural
difference from Domain 3's own architecture phase, where the opposite
conclusion (no canonical lifecycle exists, do not manufacture one) was
correctly reached.

## 8. Distractor patterns (source-evidenced only)

- **Technical/tactical action offered before the management/authority
  decision it depends on** — e.g., formatting a hard disk or running a
  virus scan before disconnecting/containing; jumping to eradication
  before confirmation.
- **Solving a stage that has already passed (P05, the domain's central
  trap)** — e.g., a prevention-only answer offered after the stem states
  an attack already succeeded; recommending re-establishing escalation
  criteria via training/enforcement before the criteria themselves have
  been defined.
- **Confirmation skipped** — jumping straight to containment, notification,
  or law enforcement before validating that a reported condition is a
  genuine incident.
- **Evidence handling that would compromise admissibility** — working
  from original media instead of a forensic image; continuing an
  investigation and merely documenting an alteration rather than having
  prevented it; treating a broken chain of custody as secondary to
  physical media damage.
- **Communication/escalation designed around notification content instead
  of response mechanics** — over-emphasizing who-to-notify or severity
  labeling ahead of the timing/fallback structure an escalation process
  actually needs first.
- **Confusing incident response with business continuity or disaster
  recovery** — offering BCP/DRP-scoped actions (e.g., "launch the DRP")
  as the first response to an active, still-developing incident, when the
  incident hasn't yet been confirmed/contained/escalated to that level.
- **Activity/output metrics substituted for incident-response
  effectiveness** — raw incident counts, open-incident counts, or
  incidents-handled-per-month offered in place of response-time reduction
  — a direct Domain-4-specific instance of Pattern P07, already flagged as
  a cross-domain reinforcement opportunity in §14.
- **Root-cause/lessons-learned skipped or treated as fault-finding** — a
  wrong answer that stops at "the threat was removed" without connecting
  back to why it succeeded, or that frames post-incident review as
  evaluating the team rather than the process.
- **Testing method mismatched to what is actually being tested** — a
  red-team test, penetration test, or vulnerability scan offered as the
  way to test the incident response *plan* specifically, when a
  simulation/tabletop exercise is what actually tests plan execution.
- **Absolute/unconditional authority claims** — implying that a role's
  authority in one part of the process (e.g., whoever selected the
  original control, or whoever identified the incident) carries over
  automatically to a later decision (e.g., committing to replace
  infrastructure, declaring a disaster) without the appropriate
  accountable authority being involved — the same P02 shape already used
  across Domains 1–3, evidenced again here.

**Patterns explicitly NOT force-included** because sampling did not surface
clear, repeated source evidence for them as a distinct Domain 4 distractor
shape (flagged per the brief's own instruction not to force categories):
"restoring service before preserving needed evidence" as its own dedicated
recurring trap (evidence-preservation-vs-speed tension appears, but more
often framed as evidence-handling-quality than as a race against recovery)
and "legal/compliance assumptions unsupported by scenario" as a distinct
shape beyond the general "requirements are mandatory, not optional" finding
already captured under confirmation/classification. Both should be
re-evaluated once full-corpus, batch-specific reading occurs during actual
unit authoring, rather than asserted here from architecture-phase sampling
alone.

## 9. Confusing-concept map

Building directly on the three pairs already `[CANDIDATE]` in
`CONFUSING-CONCEPTS.md`, plus source-supported additions:

| Pair | Already documented? | Source support found this phase |
|---|---|---|
| Event vs. Incident | Yes (`CONFUSING-CONCEPTS.md`) | Confirmed — "confirm the incident" as the first step presupposes a prior, unconfirmed event state. |
| Containment vs. Eradication vs. Recovery | Yes | Strongly confirmed — multiple items directly sequence and distinguish all three (§3, 4B5). |
| RTO vs. RPO vs. SDO vs. MTO | Yes | Strongly confirmed, plus AIW (allowable interruption window) found as a closely related fifth term in the same reasoning family — worth adding to the existing entry during authoring, not a new entry. |
| Incident Response vs. Business Continuity vs. Disaster Recovery | Not yet documented | Strongly source-supported — this is arguably the domain's second-most-repeated distinction after P05 itself (§3, 4A1/4A3/4A4 findings: IR is the "first response" that tries to prevent escalation to BCP/DRP invocation; BCP responds to disrupted business processes; DRP recovers a specific interrupted activity within defined time/cost). Recommend adding as a new `CONFUSING-CONCEPTS.md` entry during Domain 4 authoring. |
| Root cause vs. immediate containment/symptom | Not yet documented | Source-supported (§3, 4B6: root-cause analysis, not a fresh vulnerability scan or log monitoring, indicates recurrence risk). Recommend as a new entry. |
| Notification/reporting vs. broader communication planning | Lightly supported | The communications KS distinguishes a wait-time/fallback escalation structure from stakeholder notification content, but sampling did not find this framed as a sharp "confusing pair" the way the others are — treat as a nuance within the Communications unit rather than its own `CONFUSING-CONCEPTS.md` entry unless further reading surfaces stronger support. |
| Lessons learned vs. blame/fault-finding | Lightly supported | Found directly in one item (senior management review's purpose is corrective action, not fault-finding) but not repeated elsewhere in sampling — worth confirming with fuller reading before promoting to its own entry; likely fine as a Post-Incident-Review unit teaching point either way. |
| Technical responder vs. accountable manager | Already covered generally | This is the existing, cross-domain P02/P03 role-authority distinction, not a Domain-4-specific new pair — no new entry needed; Domain 4 reinforces it with new vocabulary (Incident Response Team vs. Information Security Manager/Board) rather than inventing a new confusing-concept category. |

**Not force-included:** "evidence preservation vs. rapid restoration" as
its own sharply-drawn confusing pair — see §8's note; the more precisely
source-supported version of this tension is chain-of-custody quality
during investigation, which fits naturally inside the Evidence &
Investigation unit rather than requiring a dedicated confusing-concept
entry.

## 10. Proposed unit sequence

**9 content units + 1 synthesis/capstone unit = 10 total**, landing
within the requested 8–12 range because that is where the evidence-driven
grouping below actually lands — not forced to match Domains 2/3's own
count. Two grouping decisions materially shaped this count and are
reported transparently: (1) 4B1's mixed-bucket content is split across two
other units rather than given its own (see §2); (2) 4A3+4A4 (BCP+DRP,
~45 qs combined) are combined into one unit because the CISM reasoning
skill they jointly teach — distinguishing IR from BCP from DRP, and their
shared recovery-objective vocabulary (RTO/RPO/SDO/MTO/AIW) — is a single,
unified target, not two separate topics, even though the combined
question volume is large (comparable to Domain 3's largest single unit,
3B1's 61 qs, which also received one dedicated unit despite its size).

| Unit | Working title | Core concepts | Source basis | Why it occurs here | Prerequisite(s) | Major CISM reasoning distinction | Recurring-story use | Transfer-scenario opportunity | Likely Repair target | Confusing concepts | Likely qualifiers | Synthesis dependency |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| D4-U1 | Incident Management Program Foundations & Readiness | IR plan purpose (prevent incident→problem→disaster escalation); roles/authority defined in advance (Prepare stage); testing method fit (simulation vs. red-team/pentest/vuln-scan) | 4A1 (28 qs) + 4A6 (19 qs) | Domain entry point — nothing downstream makes sense before "what is incident management for, and who's already been assigned what role" is established, exactly mirroring D3-U1's role as Domain 3's entry point | none (Domain 4 entry point; recalls Domain 1/2/3 program-management reasoning) | A plan/program is prepared *before* any event — the domain's own Prepare stage is itself a management-decision unit, not "nothing happens yet" | Story's incident response plan and roles are established/tested for the first time | A scenario contrasting a plan built during calm conditions with one improvised during an active event | Assuming a role/authority question can wait until an incident is underway | Incident management plan vs. business continuity plan vs. disaster recovery plan (introduced lightly here, taught fully in D4-U8) | PRIMARY, BEST | Supplies "what the program is for" and establishes roles the rest of the domain assumes |
| D4-U2 | Business Impact Analysis & Prioritization | Impact (not threat/vulnerability) as the basis for criticality; BIA drives incident-response prioritization once an incident occurs | 4A2 (16 qs) | Own Knowledge-Statement area; a natural early step because prioritization/classification (D4-U3) depends on it, mirroring D3-U2's early "classify what we protect" placement | D4-U1 | Once an incident occurs, likelihood is no longer the open question — impact is, and BIA is what quantifies it | Story's BIA, completed during Prepare, is what the incident response team consults once its first real incident occurs | A scenario re-deriving criticality from impact alone when threat/vulnerability data would be tempting but insufficient | Confusing impact assessment with a risk or vulnerability assessment | Impact vs. risk vs. vulnerability assessment (direct echo of Domain 2's own risk-vs-vulnerability distinction, P12) | BEST, PRIMARY | Supplies the objective basis D4-U3's classification decisions are checked against |
| D4-U3 | Incident Classification, Severity & Confirmation | Confirm before act; severity determined with input from affected-area management; escalation hierarchy must be documented, not simplified away | 4A5 (16 qs) + confirmation-focused portion of 4B2 + detection/monitoring portion of 4B1 | Own Knowledge-Statement area, and the domain's Identify/Confirm lifecycle stage; absorbs 4B1's detection-monitoring content here rather than giving 4B1 its own unit (see §2) | D4-U2 | Confirming a genuine incident, and classifying its severity, are two distinct, sequential judgments — neither substitutes for the other | Story's first ambiguous alert must be confirmed and classified before any further action is authorized | A scenario offering premature containment/escalation before confirmation is complete | Skipping confirmation and acting as if severity/escalation can be decided from the alert alone | Event vs. incident | FIRST, BEST, MOST | Supplies the "what's actually happening, and how bad is it" input every later unit assumes has already been settled |
| D4-U4 | Escalation & Incident Communications | Escalation process content (wait-time/fallback structure, not just who-to-notify); communication plan's purpose is improving response, not merely awareness/compliance | 4B4 (18 qs) | Own Knowledge-Statement area, and a CANONICAL supporting/cross-cutting activity (not a sequential stage) — `stage_target: null` | D4-U3 | The mechanics of an escalation/communication process (timing, fallback, role clarity) are themselves a distinct decision from the incident's severity or stage | Story's escalation reaches the wrong person too slowly the first time, then is redesigned | A scenario contrasting a compliance-driven notification with one built to actually speed up response | Treating notification content as the primary design question instead of response-timing mechanics | Notification vs. communication (nuance only, see §9) | PRIMARY, MOST, BEST | Supplies the audience-appropriate-communication reasoning D4-U9 (post-incident reporting) and the capstone both reuse |
| D4-U5 | Containment | Containment is the first priority once confirmed, ahead of documentation/monitoring/restoration; human safety before any plan invocation; proportionate response | 4B3 (17 qs) | Own Knowledge-Statement area, and the domain's Contain lifecycle stage | D4-U3 | Do not solve a stage that has already passed (P05) applied for the first time at full strength: an incident already confirmed calls for containment, not more analysis or a jump to eradication | Story's confirmed incident is contained for the first time, with a human-safety complication (a physical facility angle) tested directly | A scenario testing proportionate containment (contain only what's actually implicated) vs. overreaction | Reaching for eradication or recovery actions before containment is complete | Containment vs. eradication vs. recovery (first formal teaching, reinforced in D4-U7) | FIRST, MOST | Supplies the "already happened" reading skill D4-U7 depends on |
| D4-U6 | Evidence Preservation & Investigation | Chain of custody; forensic imaging vs. working from originals; locate-and-preserve before assigning responsibility; legal/regulatory requirements as mandatory baseline | 4B2 (36 qs, largest single area) + forensic-tooling portion of 4B1 | Domain's largest single Knowledge-Statement area; a CANONICAL supporting/cross-cutting activity — `stage_target: null` (can arise during Contain or Eradicate) | D4-U5 | Evidence integrity is a distinct concern from operational recovery speed, and a broken chain of custody is a bigger problem than physical damage to evidence | Story's incident turns out to have legal/regulatory implications, testing whether evidence handling holds up | A scenario contrasting fast operational cleanup with evidence-preserving investigation discipline | Treating incident handling as purely a technical/operational problem, ignoring evidence/legal exposure | (reinforces Domain 1's Legal/Compliance role rather than introducing a new pair) | BEST, FIRST | Supplies the evidence/legal thread the capstone's most integrated scenario draws on |
| D4-U7 | Eradication & Recovery | Root cause must be removed before recovery begins; RTO as the recovery-time target, distinguished from RPO/SDO/MTO | 4B5 (18 qs) | Own Knowledge-Statement area (already titled "Eradication and Recovery" as one KS in the source itself), and the domain's Eradicate + Recover lifecycle stages | D4-U6 | The lifecycle's own stated order (root cause removed, then normal operation restored, then lessons captured) is directly testable, reinforcing P05 again at the eradicate→recover boundary | Story's root cause is found and removed, then operations are restored against a stated RTO | A scenario where "the threat is gone" is offered as if it also means "recovery is complete" | Treating eradication and recovery as interchangeable, or recovering before eradication is confirmed complete | Containment vs. eradication vs. recovery (full teaching, building on D4-U5) | FIRST, BEST | Supplies the "the technical work is done" moment the capstone must resist treating as the whole story |
| D4-U8 | Business Continuity, Disaster Recovery & the Incident-Response Boundary | IR is the first response trying to prevent escalation to BCP/DRP invocation; BCP responds to disrupted business processes; DRP recovers a specific interrupted activity within defined time/cost; RTO/RPO/SDO/MTO/AIW as the recovery-objective vocabulary; decentralized/local authority during a continuity event; human safety as the highest-priority consideration in any emergency plan | 4A3 (27 qs) + 4A4 (18 qs) = 45 qs, second-largest combined area | A CANONICAL supporting/cross-cutting activity (business continuity "may intersect any stage") — `stage_target: null`; placed after D4-U7 so the learner already has the full lifecycle before layering the IR-vs-BCP-vs-DRP boundary on top of it | D4-U7 | This domain's second central distinction after P05 itself: three different, related plans exist, are invoked at different points, and are not interchangeable | Story's incident nearly escalates far enough to require BCP/DRP invocation, testing whether the learner can tell IR's boundary from BCP/DRP's | A scenario testing whether a stated fact belongs to IR, BCP, or DRP reasoning | Confusing incident response with business continuity or disaster recovery (a new, source-supported `CONFUSING-CONCEPTS.md` entry recommended, see §9) | Incident response vs. business continuity vs. disaster recovery (new entry, §9); RTO vs. RPO vs. SDO vs. MTO (existing entry, extended with AIW) | MOST, BEST | Supplies the domain's second-strongest transfer moment for the capstone, alongside D4-U6's evidence/legal thread |
| D4-U9 | Post-Incident Review, Lessons Learned & Corrective Action | Root-cause analysis (not a fresh vulnerability scan or log review alone) indicates recurrence risk; management review exists to confirm corrective action, not to find fault; post-incident review (not documentation or training alone) is the best continuous-improvement driver; response-time reduction (not incident-count reduction) is the best effectiveness metric | 4B6 (18 qs) | Own Knowledge-Statement area, and the domain's final CANONICAL lifecycle stage (Post-Incident Review / Improve), which explicitly "feeds back to Prepare for the next cycle" per Pattern P15 | D4-U8 | Closing the loop (P15): the domain's own lifecycle explicitly does not end at Recover — improvement feeds back into Prepare, directly recalling Domain 3's own metrics/effectiveness reasoning (P07) applied to incident response specifically | Story completes its first full incident cycle and formally reviews it, directly feeding back into the D4-U1 program it started with | A scenario distinguishing genuine root-cause corrective action from fault-finding or documentation-for-its-own-sake | Stopping at "the threat was removed" without root-cause analysis or corrective action; treating review as evaluating the team | Lessons learned vs. blame/fault-finding (lightly supported, see §9) | PRIMARY, BEST | The final content input the synthesis unit assembles, exactly mirroring D3-U9's role feeding D3-U10 |
| D4-U10 | Incident Management Synthesis / Capstone | Connects D4-U1 through D4-U9 through the domain's own CANONICAL lifecycle, in one live business scenario, per the general Domain Synthesis/Capstone principle | Integrative — no new source material | Closing/integrative unit, per `CURRICULUM-BLUEPRINT.md`'s Domain Synthesis / Capstone principle, mirroring D2-U10 and D3-U10 | D4-U9 (transitively covers D4-U1–U9, mirroring how D3-U10's single prerequisite edge transitively covered all of D3) | Seeing incident management as one coordinated business-management process — prioritization, authority, containment, evidence, recovery, communication, and learning together — not nine separate technical topics | Story's program completes its first full incident cycle end-to-end and heads into its next Prepare phase | A capstone-scale scenario requiring reasoning across multiple prior units at once, transferred to at least one other organization | Treating any single prior unit's answer as sufficient for a whole-incident question | N/A — integrative, not a new pair | MOST, BEST | Terminal — nothing recalls this; this unit recalls everything else |

**Proposed dependency structure** (linear, cumulative — mirroring the
structure Domain 3 actually ended up with rather than the more branched
structure Domain 3's own architecture phase originally proposed, since a
fully linear chain gives every later unit's Recall pool access to every
earlier unit's family with a single prerequisite edge, and is simpler to
reason about):

```
D4-U1 (program foundations/readiness)
   └── D4-U2 (BIA & prioritization)
          └── D4-U3 (classify/confirm)
                 └── D4-U4 (escalate/communicate)
                        └── D4-U5 (contain)
                               └── D4-U6 (evidence/investigation)
                                      └── D4-U7 (eradicate/recover)
                                             └── D4-U8 (BCP/DRP/IR boundary)
                                                    └── D4-U9 (post-incident review)
                                                           └── D4-U10 (synthesis)
```

This proposal is offered for Architect decision, not asserted as locked —
architecture phase only.

## 11. Unit dependencies

See the "Prerequisite(s)" column in §10 and the dependency diagram
immediately above. Every unit has exactly one prerequisite (its immediate
predecessor), matching the structure Domain 3 actually converged on. No
unit requires two prerequisite branches to merge (unlike Domain 3's own
D3-U4, which needed both D3-U2 and D3-U3) — Domain 4's own knowledge areas
did not surface a comparable natural fork during this phase's sampling.
This should be re-confirmed during actual authoring once full-corpus
reading is complete, in case D4-U6 (Evidence) or D4-U8 (BCP/DRP) genuinely
need a second prerequisite branch back to an earlier unit once their exact
content is authored.

## 12. Reference-story candidates

The Domain 2 payment-system story and the Domain 3 Meridian Manufacturing
story are excluded per binding instruction. Three candidates evaluated:

### Candidate A — Northbridge Logistics (regional freight/logistics carrier)

A ransomware incident affecting a warehouse-management system, with a
secondary physical-facility complication (directly echoing the source's
own "fire spreads through the building" containment example, §3/4B3).

- **Realism:** high — logistics/freight IT-plus-physical-operations
  incidents are common and well-understood.
- **Breadth across source concepts:** strong — supports classification
  (which routes/warehouses matter), containment, evidence (ransomware/
  criminal angle), BIA (which routes are critical), third-party (freight-
  tracking/WMS vendor), BCP/DRP (alternate routing, alternate facility).
- **Management decision opportunities:** strong.
- **Stakeholder diversity:** good — drivers/warehouse staff, dispatch,
  customers, vendor, possibly law enforcement.
- **Incident progression:** natural, multi-stage.
- **Memorability:** moderate-high.
- **Transfer potential:** good.
- **Risk of becoming overly technical:** low-moderate (ransomware
  scenarios can pull toward technical detail if not disciplined).
- **Risk of becoming melodramatic:** low.
- **Industry freshness within this app:** logistics/warehouse already
  appeared once as a Domain 3 *transfer* setting (D3-U7's warehouse-
  supervisor scenario) — not overused, but not entirely fresh either.

### Candidate B — a regional hotel/hospitality chain

A payment-card and guest-data breach, with a secondary guest-safety/
physical-evacuation complication (also echoing the source's fire-
evacuation containment example, and its human-safety-first BCP/DRP
finding, §3/4A4).

- **Realism:** high — hospitality payment-card breaches are a
  well-documented real-world incident category, and hotels genuinely
  combine guest-safety/physical-evacuation procedures with payment/
  reservation-system IT operations in one business.
- **Breadth across source concepts:** strong — supports classification/
  severity (payment-card exposure), containment, evidence (PCI/forensics),
  BIA (reservation-system downtime, seasonal timing), communications
  (guests, franchise corporate, media), third-party (property-management-
  system and payment-processor vendors — a genuine, natural Domain-3-
  external-services callback), BCP/DRP (the source's own "delegate
  authority to local management" finding maps directly onto a multi-
  property hotel chain where headquarters may be unreachable during a
  regional event), legal/regulatory (PCI-DSS, state breach-notification
  laws).
- **Management decision opportunities:** strong, and unusually well
  distributed across nearly every knowledge area sampled.
- **Stakeholder diversity:** strong — front-desk/property staff, corporate
  security, guests, franchise ownership, payment processor, regulators,
  media.
- **Incident progression:** natural, and uniquely supports a genuine
  human-safety-plus-cyber dual complication in one story without needing
  an unrelated second scenario.
- **Memorability:** high — hospitality is a distinctive, easily-visualized
  setting not yet used anywhere else in this application.
- **Transfer potential:** strong.
- **Risk of becoming overly technical:** low — payment-card/guest-data
  incidents at a hotel are naturally management-decision-shaped rather
  than SOC-console-shaped.
- **Risk of becoming melodramatic:** low-moderate (a guest-safety incident
  needs restrained, factual framing — a fire-alarm/evacuation event
  handled calmly and procedurally, not a dramatized disaster).
- **Industry freshness within this app:** genuinely fresh — hospitality
  has not been used anywhere else in Foundation, Domain 1, Domain 2, or
  Domain 3.

### Candidate C — a mid-size B2B SaaS company

A cloud-service outage combined with a customer-data-exposure incident
affecting the company's own hosted platform.

- **Realism:** high.
- **Breadth across source concepts:** good, but weaker on the physical-
  safety/facility side (no natural fit for the fire-evacuation/human-
  safety finding) and risks concentrating too heavily on
  technical-service-availability framing (RTO/SDO reasoning fits
  naturally; BIA/BCP/evidence reasoning fits less naturally without
  stretching).
- **Management decision opportunities:** moderate — many SaaS-outage
  scenarios tempt the story toward technical/engineering framing rather
  than management decisions.
- **Stakeholder diversity:** moderate — customers, engineering, support,
  possibly regulators for data exposure, but a thinner bench than
  Candidates A/B.
- **Incident progression:** natural for the outage/recovery arc, weaker
  for classification/severity and BCP/DRP.
- **Memorability:** moderate.
- **Transfer potential:** good.
- **Risk of becoming overly technical:** **highest of the three** — this
  is the candidate most likely to drift toward a technical SOC/DevOps
  narrative rather than a CISM management narrative, which the brief
  explicitly warns against.
- **Risk of becoming melodramatic:** low.
- **Industry freshness within this app:** fresh, but the technical-drift
  risk outweighs the freshness advantage.

### Recommendation

**Recommend Candidate B — a regional hotel/hospitality chain.**

## 13. Why the recommended story is superior

Candidate B is recommended over A and C for four concrete reasons, not
just industry novelty:

1. **It is the only candidate that naturally supports the domain's human-
   safety-first finding (§3, 4A4) alongside its cyber/data incident**,
   without needing a second, unrelated scenario to cover both — a hotel
   fire-alarm/evacuation moment and a payment-card breach are both
   genuinely things that happen at hotels, in the same business, without
   forcing an implausible combination.
2. **It maps onto more of the domain's twelve knowledge areas with
   management-level (not technical) framing than either other candidate**
   — including a natural, non-forced fit for BIA (seasonal reservation
   volume), BCP/DRP (multi-property, headquarters-may-be-unreachable
   structure, directly echoing the source's own "delegate to local
   management" finding), third-party accountability (PMS/payment
   processor, directly extending Domain 3's own external-services
   reasoning), and regulatory/legal (PCI, state breach law).
3. **It carries the lowest technical-drift risk of the three** — Candidate
   C's greatest weakness is precisely Candidate B's greatest strength.
4. **It is genuinely fresh within this application** — Meridian
   Manufacturing (Domain 3) and the payment-system story (Domain 2) are
   both excluded by binding instruction, but hospitality is also fresh
   relative to every *transfer* setting used so far (hospital, university,
   logistics, financial services, retail), reducing the risk that Domain 4
   feels like a recombination of settings the learner has already seen.

**Working name:** not finalized in this architecture phase (per the "do
not author full story content yet" instruction) — a working name such as
"Harborview Hotels" or "Cresthaven Hospitality Group" is suggested only as
a placeholder for Architect discussion, not a commitment.

## 14. Family architecture

Mapping source questions to candidate families, per the ten proposed
units in §10 (one family per unit, mirroring the one-family-per-unit
pattern already used for every unit in Domains 2 and 3 to date):

| Family (candidate) | Central concept | Invariant reasoning | Role/authority pattern | Lifecycle position | Qualifier pattern | Common wrong-answer reasoning | Likely Repair target | Sibling-scenario strategy | Cross-domain dependency |
|---|---|---|---|---|---|---|---|---|---|
| `family.d4.program-foundations-readiness` | IR plan purpose; roles defined in advance; testing method fit | Correct answer keeps purpose framed as controlling impact within acceptable levels and preventing escalation; wrong answer over-focuses on ticket/incident-count metrics or picks the wrong testing method for what's being tested | P02 (authority defined before, not during, an event) | `stage.incident.prepare` | PRIMARY, BEST | Confusing incident management's purpose with eliminating all incidents/threats | `repair.business-context-error`, `repair.decision-error` | Vary the organization and the specific readiness gap being tested | Domain 1 (governance/policy-setting before execution), Domain 3 (program readiness generally) |
| `family.d4.business-impact-analysis` | Impact as the basis for criticality and prioritization | Correct answer ties classification/prioritization to impact; wrong answer substitutes threat/vulnerability data or a generic industry benchmark | (basis-based, not role-based) | `stage_target: null` (feeds Identify/Confirm but is not itself a stage) | BEST, PRIMARY | Confusing BIA with a risk or vulnerability assessment | `repair.knowledge-gap`, `repair.vocabulary-error` | Vary the industry and the specific asset/process under analysis | Domain 3 (asset classification, D3-U2); Domain 2 (risk vs. vulnerability, P12) |
| `family.d4.classification-severity-confirmation` | Confirm before classify; severity input from affected-area management; documented escalation hierarchy | Correct answer confirms first, consults affected-area management for severity, and keeps escalation criteria documented; wrong answer skips confirmation or improvises severity from insufficient input | P03 (which role's input actually informs severity) | `stage.incident.identify-confirm` | FIRST, BEST, MOST | Acting on an unconfirmed event as if it were a confirmed incident | `repair.sequence-error`, `repair.knowledge-gap` | Vary the industry and the ambiguity of the initial alert | Domain 3 (control effectiveness evidence, P07, applied to alert triage) |
| `family.d4.escalation-communications` | Escalation timing/fallback structure; communication plan's purpose is improving response | Correct answer designs escalation around response mechanics (wait time, fallback) and frames communication's purpose as improving response; wrong answer over-indexes on notification content/audience alone | P11 (audience-appropriate communication) | `stage_target: null` (supporting activity) | PRIMARY, MOST, BEST | Treating notification recipients/content as the primary design question | `repair.business-context-error`, `repair.decision-error` | Vary the industry and which stakeholder communication is being designed for | Domain 2 (`concept.d2.risk-monitoring-reporting`, P11); Domain 3 (`concept.d3.program-metrics-reporting`, P11) |
| `family.d4.containment` | Containment first, proportionate to what's known; human safety before any plan invocation | Correct answer contains proportionately and immediately once confirmed; wrong answer jumps ahead to eradication/recovery or overreacts beyond what's implicated | (P05 governing pattern) | `stage.incident.contain` | FIRST, MOST | Solving a stage that has already passed, or acting on unconfirmed scope | `repair.sequence-error`, `repair.lifecycle-error` | Vary the industry and the specific containment proportionality trap | Domain 3 (P09, embedding response into the actual affected process, loosely) |
| `family.d4.evidence-investigation` | Chain of custody; forensic imaging vs. originals; locate/preserve before assigning responsibility | Correct answer preserves integrity/chain of custody first; wrong answer works from originals, skips imaging, or prioritizes speed over admissibility | Legal/Compliance vs. Incident Response Team (P03) | `stage_target: null` (supporting activity, spans Contain/Eradicate) | BEST, FIRST | Treating an incident as a purely technical/operational problem with no legal exposure | `repair.technical-vs-management-error`, `repair.knowledge-gap` | Vary the industry and the specific type of legal/regulatory exposure | Domain 1 (Legal/Compliance role); Domain 3 (external-services accountability, P02, when a vendor is implicated) |
| `family.d4.eradication-recovery` | Root cause fully removed before recovery; RTO as the recovery-time target | Correct answer sequences eradication before recovery and ties recovery to the stated RTO; wrong answer treats "the threat is gone" as sufficient or restores before eradication is confirmed complete | (P05 governing pattern) | `stage.incident.eradicate` / `stage.incident.recover` (a single family may need to represent both, or split into two — an authoring-time decision, see §31) | FIRST, BEST | Recovering before eradication is confirmed, or conflating the two | `repair.sequence-error`, `repair.vocabulary-error` | Vary the industry and which of eradication/recovery is being tested | Domain 3 (P07, implementation/activity vs. genuine effectiveness, applied to "is it really eradicated") |
| `family.d4.business-continuity-disaster-recovery-boundary` | IR vs. BCP vs. DRP; RTO/RPO/SDO/MTO/AIW; decentralized authority during continuity events; human safety first | Correct answer identifies which of the three plans actually applies to the stated fact pattern, and (where relevant) which recovery-objective term is being asked about; wrong answer applies the wrong plan's reasoning or confuses two recovery-objective terms | P02 (decentralized/local authority during continuity) | `stage_target: null` (supporting activity) | MOST, BEST | Confusing incident response with business continuity or disaster recovery | `repair.vocabulary-error`, `repair.lifecycle-error` | Vary the industry and which of the three plans/terms is being tested | Domain 1 (authority/accountability, P02); Domain 2 (business impact, residual risk framing) |
| `family.d4.post-incident-review` | Root-cause analysis indicates recurrence risk; review exists for corrective action, not fault-finding; response-time reduction as the effectiveness metric | Correct answer performs/uses root-cause analysis and frames review around corrective action and response-time improvement; wrong answer substitutes a fresh scan/log-review, treats review as evaluating the team, or uses incident-count reduction as the effectiveness metric | P15 (closing the loop) | `stage.incident.post-incident-review-improve` | PRIMARY, BEST | Treating "the threat was removed" as the end of the process, or measuring effectiveness by activity/incident-count instead of response-time/outcome | `repair.business-context-error`, `repair.decision-error` | Vary the industry and what corrective action the root cause actually points to | Domain 3 (P07, activity/output vs. effectiveness metrics, D3-U9's own metrics reasoning) |
| `family.d4.incident-management-synthesis` | Whole-program integration | Correct answer connects two or more prior D4 reasoning targets in one scenario; wrong answer answers from only one prior unit's lens | (multiple, per-variant) | `stage_target: null` (cross-cutting, mirrors `family.d3.program-synthesis`/`family.d2.risk-management-synthesis`) | MOST, BEST | Treating any single prior unit's answer as sufficient for a whole-incident question | (per-variant, generic categories only) | One anchor (hotel chain) + at least one transfer scenario per the binding transfer rule | All of Domains 1–4 |

No source questions are rewritten in this phase — this table maps
*candidate* families for Architect review only.

## 15. Foundation reinforcement opportunities

- The **STAGE** reasoning step ("where are we in the relevant lifecycle")
  is more directly load-bearing in Domain 4 than in any domain built so
  far — already noted in the existing `DOMAIN-4-BLUEPRINT.md`. Every D4
  unit's Apply design should lean on Foundation's STAGE step explicitly.
- The **STATE** step ("what has already happened") is the single most
  repeated reading skill across every sampled Domain 4 area — nearly
  every FIRST-qualifier item hinges on correctly reading what has already
  occurred before choosing the next action.
- The **ELIMINATE** step (identifying attractive wrong answers) applies
  directly to the domain's P05 governing pattern: an eliminated option is
  very often "correct, but for an earlier stage."

## 16. Domain 1 reinforcement opportunities

- **Authority follows accountability (P02)** — who declares a disaster,
  who has authority to invoke BCP/DRP, and decentralized/local authority
  during a continuity event are all genuine P02 applications with new
  Domain 4 vocabulary, not a re-teach.
- **Legal/Compliance role** — already established in Domain 1; Domain 4
  extends it into evidence admissibility and mandatory regulatory
  baselines rather than re-teaching the role from scratch.
- **Policy vs. standard vs. procedure vs. guideline** — an incident
  response *plan* and its documented escalation hierarchy are naturally
  describable in this vocabulary; a light callback, not a re-teach.

## 17. Domain 2 reinforcement opportunities

- **Impact vs. risk vs. vulnerability (P12)** — BIA's own reasoning (§3,
  4A2) is a direct, source-evidenced re-application of this existing
  Domain 2 pattern to a new context.
- **Business impact / residual risk framing** — an incident is, in a
  real sense, a materialized risk; the domain's own reasoning ("once an
  incident occurs, likelihood is no longer the open question — impact is")
  is a natural, source-grounded bridge back to Domain 2's risk-evaluation
  reasoning, without re-teaching Domain 2's own risk lifecycle.
- **Third-party/vendor risk** — where a Domain 4 scenario involves a
  vendor-caused incident (e.g., the recommended hotel story's PMS/payment
  processor), Domain 2's third-party risk reasoning is a light recall
  target alongside Domain 3's external-services accountability (below).

## 18. Domain 3 reinforcement opportunities

This is Domain 4's richest cross-domain reinforcement surface, given how
recently Domain 3 was completed:

- **P07 (Implementation ≠ Effectiveness)** — directly re-evidenced in
  Domain 4's own source material (§3, 4A6: response-time reduction, not
  incident-count reduction, is the effectiveness metric) and in D4-U9's
  post-incident-review reasoning generally. This should be an explicit,
  named recall in D4-U9 and the capstone, exactly as D3-U7 and D3-U9 each
  reapplied P07 to a new context rather than re-teaching it.
- **P11 (Audience-Appropriate Communication)** — D4-U4's escalation/
  communication design and D4-U9's post-incident reporting are both
  natural P11 applications, extending Domain 2's and Domain 3's own use of
  this pattern into a third domain.
- **External-services accountability (P02, via D3-U8)** — directly
  relevant wherever a Domain 4 scenario involves a third-party vendor
  causing or complicating an incident (a strong fit for the recommended
  hotel story's PMS/payment-processor vendor).
- **Asset classification (D3-U2)** — BIA's impact-based reasoning is the
  same reasoning Domain 3 already taught for classifying what to protect,
  now applied to what to prioritize once something goes wrong.
- **Program metrics/reporting (D3-U9)** — D4-U9's "response time, not
  incident count" finding and D4-U4's communication-design reasoning are
  both natural, explicit callbacks to D3-U9's own activity-vs-effectiveness
  and audience-appropriate-reporting teaching.
- **Whole-program synthesis mindset (D3-U10)** — the capstone's own target
  realization ("incident management is a coordinated business-management
  process, not isolated technical actions") directly parallels D3-U10's
  own "the program is a coordinated management capability, not any single
  artifact" realization — the two capstones should be recognizably
  siblings in structure without duplicating each other's content.

## 19. Likely Aha moments

| # | What the learner may believe before | What they should realize | Reference-story moment that could create the realization | Later units that reuse it |
|---|---|---|---|---|
| 1 | "Incident response starts once something bad happens." | Incident response is prepared *before* anything happens — the Prepare stage, including who has authority to declare a disaster, is itself a management decision made in advance. | Story's plan is built and roles assigned before any incident occurs, then tested against a scenario where an undefined role causes confusion. | D4-U3, D4-U8, D4-U10 |
| 2 | "The right first move is whatever fixes the technical problem fastest." | Confirming a genuine incident, and classifying its severity with input from the affected business area, comes before any technical fix. | Story's ambiguous first alert is nearly acted on before confirmation; the correct path pauses to confirm and classify first. | D4-U5, D4-U7, D4-U10 |
| 3 | "Once the cause is contained/removed, the incident is basically over." | Eradication, recovery, and post-incident review are three more distinct steps after containment — and the loop isn't closed until lessons feed back into the next Prepare cycle. | Story's team declares victory after removing malware, then discovers recovery and root-cause work still remain, and only later closes the loop with a program improvement. | D4-U7, D4-U9, D4-U10 |
| 4 | "If the technical work is done well, legal/evidence concerns are a side issue." | A broken chain of custody can undo an otherwise well-handled technical response entirely — evidence integrity is not optional, is not the same problem as data loss, and doesn't wait for a "more serious" incident to matter. | Story's fast, technically competent response is undermined when evidence handling doesn't hold up to later scrutiny. | D4-U6, D4-U8, D4-U10 |
| 5 | "Incident response, business continuity, and disaster recovery are basically the same thing under different names." | Each plan answers a different question at a different point (contain the current incident vs. keep the business running vs. recover a specific interrupted activity within defined time/cost) — and knowing which one a stated fact belongs to is itself the tested skill. | Story's incident nearly escalates to the point of requiring BCP/DRP invocation, and the learner must correctly identify which plan the current fact pattern actually calls for. | D4-U10 (the domain's second-strongest transfer moment alongside #4) |
| 6 | "A good incident-response metric is fewer incidents." | Response-time reduction — not raw incident-count reduction — is what actually shows the response process is getting better; incident volume is driven by controls and threat landscape, not response-team performance alone. | Story's post-incident review resists reporting "fewer incidents this quarter" as the headline metric and instead reports the trend in response time. | D4-U9, D4-U10 (directly parallels D3-U9's own Aha) |

## 20. Synthesis/capstone design

Per `CURRICULUM-BLUEPRINT.md`'s Domain Synthesis/Capstone principle and
mirroring the D2-U10/D3-U10 precedent (one synthesis family, several
genuinely integrated variants, not nine mechanical checkpoints):

**Purpose:** bring D4-U1 through D4-U9 together through the domain's own
approved CANONICAL lifecycle, in one continuous story scenario covering
the recommended hotel chain's first full incident cycle — explicitly not
a stage-by-stage lifecycle walkthrough presented as a list, and not a
recap of definitions.

**Likely reference-story culmination:** the hotel chain's first full
incident — a payment-card/guest-data exposure with a concurrent physical-
safety complication — is confirmed, classified, escalated, contained,
investigated (with a genuine evidence/chain-of-custody stake), eradicated,
recovered against a stated RTO, and reviewed, surfacing a root cause that
traces back to an under-classified system (a direct callback to D4-U2's
BIA reasoning) and an implicated third-party vendor (a direct callback to
D4-U6's evidence/legal thread and Domain 3's external-services
accountability).

**Multi-concept decisions:** mirroring D3-U10's approach, each of the
(likely three) variants should combine 2–4 prior Domain 4 concepts, not
one — e.g., one variant combining classification + containment
proportionality; one combining evidence/investigation + third-party
accountability + what to report; one combining BCP/DRP-boundary
recognition + post-incident review's response-time-metric reasoning.

**Transfer scenario:** at least one variant transferred to a different
organization type (a hospital, university, or financial-services setting
already used elsewhere in this app would work as a *transfer* setting
here too, since only the domain's own *primary anchor* story must avoid
reuse — this is a genuine authoring-time choice, not decided in this
architecture phase).

**Qualifier reasoning:** MOST/BEST primarily, consistent with §6's
qualifier findings and with D2-U10/D3-U10's own capstone qualifier
patterns.

**Role/authority reasoning:** each capstone variant should require
correctly identifying which role has authority for the specific decision
in play (Incident Response Team executing vs. Information Security
Manager deciding vs. Board/Senior Management resourcing improvements vs.
Legal/Compliance on evidence/regulatory matters) — a genuine P02/P03
application at capstone scale.

**Post-incident integration:** the capstone should explicitly close the
loop (P15) by connecting its own root-cause finding back to a concrete
Prepare-stage improvement, giving the domain's ending the same "feeds back
into the next cycle" shape its own CANONICAL lifecycle already specifies.

**Target Aha (candidate, not finalized):** *"Managing an incident is not a
sequence of isolated technical actions; it is a coordinated business-
management process involving prioritization, authority, communication,
response, recovery, evidence, and organizational learning."* This exact
framing is offered as a strong candidate because it follows directly from
§19's Aha moments and mirrors the structure (not the content) of D3-U10's
own capstone realization, but it is not asserted as final — the Architect
may prefer different wording once the story is fully designed.

**No new production content authored in this phase**, per the binding
instruction — this section is design intent only.

## 21. Learning-mode compatibility

No mode-specific Domain 4 implementation is anticipated. Specifically:

- **Daily Study, Explore, Practice, Reinforcement** — all operate purely
  on the existing domain-agnostic content schema (`concepts`, `lessons`,
  `families`, `questions` + `schema/registry/*`), exactly as Domains 1–3
  already do. Domain 4's lifecycle/stage usage is not new — it mirrors
  Domain 2's already-proven `lifecycle.risk`/`stage_target` pattern
  exactly, just with `lifecycle.incident`'s own six stages, which already
  exist in the registry.
- **Shared Feedback/Repair** — Domain 4's proposed repair targets (§14)
  are drawn entirely from the existing, domain-agnostic
  `schema/registry/repair-targets.json` list; no new repair category is
  needed.
- **exposureStore / answer-order rotation** — both operate on
  question/family identity generically; nothing about Domain 4's content
  shape (including its cross-cutting, `stage_target: null` families)
  differs structurally from what Domain 2 and Domain 3 already exercise
  successfully.
- **Architecture risk assessment: none identified.** Domain 4 does not
  appear to require any mode-specific logic. The one item worth flagging
  for authoring-time attention (not a mode-compatibility risk, but a
  schema-usage decision) is whether `family.d4.eradication-recovery` (§14)
  should be one family covering both `stage.incident.eradicate` and
  `stage.incident.recover`, or split into two families each bound to one
  stage — both are schema-legal; see §31.

## Content-status boundary

All Domain 4 architecture and any future authored content remain
`CANDIDATE`. No `CANONICAL` promotion occurs in this phase or is proposed
by it. The CANONICAL sections of `DOMAIN-4-BLUEPRINT.md` and
`LIFECYCLE-MODEL.md` (fundamental question, incident lifecycle, core
concepts, governing pattern, roles) are elaborated above, never redefined
or contradicted.

## Deferred / not-now items

- Full Domain 4 lesson/family/question authoring — this phase is
  architecture only.
- Reference-story content (the hotel chain's specific narrative beats,
  property names, staff names) — a candidate is recommended, not written.
- A precise, reconciled Domain-4-only Task Statement frequency table —
  Knowledge Statement is the primary structural signal used instead,
  consistent with prior domains.
- Full-corpus reading of all ~267 Domain 4 questions — this phase used
  representative sampling (5–10+ questions per Knowledge Statement code,
  every code covered at least once); full reading should occur unit-by-
  unit during actual authoring, exactly as it did for Domains 2 and 3.
- A new `CONFUSING-CONCEPTS.md` entry for "Incident Response vs. Business
  Continuity vs. Disaster Recovery" — recommended in §9, not added in this
  phase (this document does not modify other canonical docs).
- Whether `family.d4.eradication-recovery` should be one family or two
  (§21) — an authoring-time decision.
- Whether D4-U6 or D4-U8 need a second prerequisite branch (§11) — to be
  confirmed once full-corpus reading occurs.
- Any Domain 4 production authoring, learning-mode changes, or visual
  baseline changes.

## Recommended authoring sequence

Mirroring the small, human-reviewable batching precedent used for every
prior domain (each batch independently gate-able before the next begins):

| Batch (proposed) | Units | Rationale |
|---|---|---|
| 1 | D4-U1, D4-U2 | Establishes "what incident management is for, and what basis prioritization rests on" — nothing later is meaningfully reviewable without this |
| 2 | D4-U3, D4-U4 | Classification/confirmation and escalation/communication are closely related (confirm → classify → escalate → communicate is one continuous early-response arc) |
| 3 | D4-U5, D4-U6 | Containment and evidence/investigation are the domain's central active-response arc, sharing the P05 governing pattern at full strength |
| 4 | D4-U7, D4-U8 | Eradication/recovery and the BCP/DRP/IR boundary are closely related (both concern "what does 'back to normal' actually mean, and via which plan") |
| 5 | D4-U9, D4-U10 | Post-incident review and synthesis are the closing, integrative units, reviewed last since they deliberately recall everything built in batches 1–4 |

**Recommended first Domain 4 batch: D4-U1 (Incident Management Program
Foundations & Readiness) + D4-U2 (Business Impact Analysis &
Prioritization)** — mirroring exactly how Domain 3 began with its own two
foundational, prerequisite-free-or-nearly-so units before any lifecycle-
stage-bound content was authored.

Each batch would follow the same approved gate sequence used for every
prior domain: implementation → automated validation → Architect Evidence-
First review → correction if necessary → closeout → merge. **Not started
in this phase** — this is a proposed sequence for Architect/Founder
review, not an authorization to begin.

## Cross-references

[Domain 4 Blueprint](DOMAIN-4-BLUEPRINT.md) · [Lifecycle Model](LIFECYCLE-MODEL.md) ·
[Pattern Library](PATTERN-LIBRARY.md) · [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md) ·
[Confusing Concepts](CONFUSING-CONCEPTS.md) · [Curriculum Blueprint](CURRICULUM-BLUEPRINT.md) ·
[Foundation Blueprint](FOUNDATION-BLUEPRINT.md) · [Domain 3 Curriculum Architecture](DOMAIN-3-CURRICULUM-ARCHITECTURE.md) (process precedent)
