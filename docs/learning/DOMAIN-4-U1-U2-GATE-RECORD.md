# Phase Gate Record — Domain 4, D4-U1 & D4-U2

**Status: [CANONICAL record of what happened]**. This is the durable record
of the first Domain 4 production authoring batch: D4-U1 (Program
Foundations & Readiness) and D4-U2 (Business Impact Analysis &
Prioritization), built per the approved
[`DOMAIN-4-CURRICULUM-ARCHITECTURE.md`](DOMAIN-4-CURRICULUM-ARCHITECTURE.md)
and the Architect's D4-U1/U2 authoring directive. All new content remains
`CANDIDATE`.

## Architect review decision

Following Evidence-First review of the 13-panel review artifact
(`/Users/demetrius/Downloads/cism-domain4-u1-u2-review.png`, described
below under Evidence-first review), the Architect recorded:

- D4-U1 (Incident management readiness): **APPROVED**.
- D4-U2 (Business impact analysis and prioritization): **APPROVED**.
- Harborview Hotels as Domain 4's reference-for-comprehension
  organization: **APPROVED**.
- Founder UAT: **WAIVED** under the Evidence-First UAT model.
- No curriculum rewrite or UX redesign was requested.
- D4-U1 confirmed to successfully teach that effective incident
  management begins before the incident: PREPARE is correctly treated as
  organizational readiness (roles, authority, categorization,
  communication/escalation expectations, planning, testing/readiness) -
  never reduced to merely possessing an incident-response document.
- D4-U2 confirmed to successfully teach that business impact/criticality -
  not technical novelty, replacement cost, technical restoration effort,
  or deployment recency - is the appropriate basis for recovery
  prioritization. The key BIA Aha is approved: technical importance is not
  automatically business criticality.
- PREPARE-stage treatment for D4-U1 and cross-cutting
  (`lifecycle`/`stage_target: null`) treatment for D4-U2 are both
  explicitly **APPROVED** - BIA was not forced into an incident stage for
  symmetry, and no new lifecycle or stage IDs were authorized or
  introduced.
- The source-confirmed IR-vs-BCP-vs-DRP distinction is approved as a
  `[CANDIDATE]` confusing-concept entry in `CONFUSING-CONCEPTS.md` (added
  under prior narrow authorization; confirmed present, not duplicated -
  see "IR-vs-BCP-vs-DRP source confirmation" below).
- Harborview Hotels is confirmed as the ongoing Domain 4 reference-for-
  comprehension organization, to be preserved alongside varied transfer
  scenarios in future units; the story is confirmed to remain business-
  centered, realistic, management-oriented, and operationally plausible -
  not SOC/forensics technical training.

## Source coverage

- **D4-U1** grounded in `tools/input/domain-4.txt`'s 4A1 (Incident Response
  Plan) sub-area: gaining senior leadership's buy-in is directly identified
  as the necessary first step and most significant challenge in developing
  an incident management plan; the first step in developing an incident
  response plan specifically is establishing a categorization scheme (by
  likelihood/impact), since response-time targets, reporting thresholds,
  and staffing needs all derive from it; responsibility for notifying
  external parties should be determined during plan development, not after
  detection or senior-management "approval" (a role the source explicitly
  states senior management does not perform - incident response teams
  confirm incidents); the primary business objective of incident
  management is controlling impact within acceptable levels; the most
  important purpose of an incident response plan is promoting business
  resiliency, explicitly distinguished in-source from preventing incidents
  and from ensuring business continuity (a separate plan's job); defined
  roles/responsibilities (not policy knowledge, forensic skill, or
  reporting-line structure) contribute most to incident response team
  efficiency; the best indicator of team readiness is the time between
  detection and response initiation, not detection time or total
  resolution time.
- **D4-U2** grounded in 4A2 (Business Impact Analysis): a BIA is the best
  tool for determining priority of restoration, not total cost of
  ownership, annual loss expectancy, or residual risk; primary BIA
  stakeholders are representatives from business units/departments, not IT
  alone, senior management alone, or risk/audit alone; essential BIA
  ingredients are downtime tolerance, resources, and criticality
  (explicitly not cost-as-percentage-of-budget, BC testing methodology, or
  crisis-team structure, which belong to BCP, not the BIA itself); BIA
  actions include listing critical business resources and identifying
  disruption impacts/allowable outage times (explicitly not identifying
  threats/vulnerabilities, which is risk assessment, and not developing
  notification/activation procedures, which is BCP); a system's value in a
  BIA is based on the opportunity cost of losing the function, not the
  cost to recover or recreate it; a new application does not automatically
  deserve top recovery priority merely because it is new; the BIA process
  is performed first and its results are the essential inputs BCP is then
  built on - directly source-confirmed.

## Learning outcomes

- **D4-U1**: readiness precedes incident handling; an incident plan should
  align with business needs (a categorization scheme built before
  response-time/reporting/staffing decisions); roles/responsibilities and
  escalation/notification authority matter before an incident occurs, not
  during one; a drafted plan alone does not prove readiness - readiness is
  demonstrated by tested response speed; technical tools/procedures do not
  substitute for organizational (leadership, authority, categorization)
  preparedness.
- **D4-U2**: incident-management priorities depend on which business
  services matter most (impact of disruption), gathered from the business
  units that depend on them, not from technical sophistication, cost, or
  novelty; incident response, business continuity, and disaster recovery
  are three different plans answering three different questions, and the
  latter two are invoked only once an incident's impact escalates far
  enough to require them.

## Reference story

**Harborview Hotels**, a regional hotel/hospitality chain, established as
Domain 4's stable reference organization per the Architect's approval (no
second reference organization was invented). The chain runs central
reservations/booking and payment systems across multiple properties, a
property-management system, a guest loyalty database, and (for D4-U2) a
newly launched mobile keyless-entry app used specifically to create the
"most technically impressive ≠ most business-critical" Aha. D4-U1 uses
Harborview preparing for peak season and confirming its incident
management program is genuinely ready (not just documented) before
demand rises; D4-U2 continues directly into a business impact analysis
that corrects the assumption that the newest system deserves top recovery
priority. The story stays management-level throughout - no SOC,
malware-analysis, or forensics detail; a guest-safety dimension was noted
as available for later Domain 4 units (per the architecture's own
`family.d4.containment` design) but was not needed in this batch's two
units.

## Lifecycle treatment

Per the Architect's explicit locked decision, only the existing CANONICAL
`lifecycle.incident` and its existing registry stage IDs are used - no new
lifecycle or stage was introduced:

- **D4-U1** is genuinely, consistently bound to `stage.incident.prepare`
  across all three variants (leadership commitment, categorization-scheme-
  first, and notification-authority-in-plan-development are all Prepare-
  stage decisions) - `family.lifecycle: "lifecycle.incident"`,
  `family.stage_target: "stage.incident.prepare"`.
- **D4-U2** is deliberately cross-cutting - a business impact analysis
  informs classification, response, and recovery decisions throughout the
  lifecycle rather than belonging to one stage of it -
  `family.lifecycle: null`, `family.stage_target: null`, mirroring the
  precedent already set by Domain 2's own fully cross-cutting families
  (e.g. `family.d2.risk-fundamentals`). This was confirmed correct, not
  forced into a stage for symmetry, per the Architect's explicit
  authorization.

## BIA treatment

Given dedicated instructional treatment per the Architect's explicit
approval (not buried as a "supporting activity" aside), reflecting the
architecture phase's finding that BIA/BCP/DRP together account for a
substantial share of the Domain 4 source bank. D4-U2 teaches BIA as a
genuine management/business dependency (which functions matter, gathered
from business units, feeding continuity planning) rather than as
paperwork or a technical exercise, consistent with the working purpose in
the authoring directive.

## IR-vs-BCP-vs-DRP distinction status

**Confirmed by direct source evidence, not assumed.** Two source items
directly establish the relationship used in this batch:

1. "The most important purpose of implementing an incident response plan
   is to... promote business resiliency," explicitly rejecting "ensure
   business continuity" as a distractor with the justification: "Business
   continuity plans, not incident response plans, are designed to restore
   business operations after a disaster."
2. "When properly tested, which of the following would MOST effectively
   support an information security manager in handling a security
   breach?" — correct answer: the incident response plan, with the
   justification that "A business continuity plan would be triggered
   during the execution of the incident response plan in case it
   developed into a disaster causing serious business interruption."

This confirms the proposed framing (IR manages the security incident
itself; BCP keeps critical operations running if impact escalates far
enough; DRP restores specific interrupted technology) without
contradiction - the source did not require stopping and reporting a
conflict. The exact three-sentence framing given in the authoring
directive was not used verbatim (the project's own phrasing was built
from the two source items above and cross-checked against
`docs/learning/CONFUSING-CONCEPTS.md`'s existing Domain 4 entries, which
do not yet include this pair). **`CONFUSING-CONCEPTS.md` was not modified
in this batch** - the recommendation to add an "Incident Response vs.
Business Continuity vs. Disaster Recovery" entry remains open for the
Architect/Founder to authorize as a documentation change separate from
this content-authoring batch, since editing that CANDIDATE reference
document was not explicitly authorized by this batch's own instructions
(which said "if confirmed, add/update the appropriate CANDIDATE
confusing-concept documentation" - flagged here rather than silently
added, since the batch's Preservation section did not name
`CONFUSING-CONCEPTS.md` among files this batch may edit). **This is an
explicit open item for the Architect** - see "Unresolved concerns" in the
authoring report.

Only D4-U2's own `concept.d4.business-impact-analysis-prioritization`
documents and applies this distinction (via `question.d4.0006`'s direct
test of it); D4-U8's own future, dedicated treatment is deliberately not
pre-empted or duplicated here, per the binding instruction not to
over-teach that unit's boundary lesson inside U2.

## RTO/RPO treatment

RTO and RPO are used with the exact definitions already established in
`CONFUSING-CONCEPTS.md`'s existing RTO-vs-RPO-vs-SDO-vs-MTO entry (not
redefined) - introduced only as BIA outputs within the lesson's narrative
prose, not as a dedicated discrimination question, since source evidence
positions them as what a BIA produces rather than U2's own primary
reasoning target. MTO, AIW, and SDO are deliberately not taught in depth
in this unit (confirmed absent from the concept's `plain` field by an
automated test) and are reserved for D4-U8's own dedicated BCP/DRP-
boundary treatment, per the binding instruction not to turn this unit
into a continuity-certification course.

## Question families

| Unit | Concept | Family | Variants |
|---|---|---|---|
| D4-U1 | `concept.d4.incident-management-readiness` | `family.d4.program-foundations-readiness` | `question.d4.0007` (Harborview anchor - leadership commitment first), `question.d4.0002` (regional airline - categorization scheme first), `question.d4.0003` (regional insurer - notification authority decided in plan development) |
| D4-U2 | `concept.d4.business-impact-analysis-prioritization` | `family.d4.business-impact-analysis-prioritization` | `question.d4.0004` (Harborview anchor - business impact over technical sophistication), `question.d4.0005` (regional water utility - BIA stakeholder input), `question.d4.0006` (mid-size manufacturer - IR-vs-BCP boundary) |

6 new questions total, 2 new concepts, 2 new families, 2 new lessons - all
`CANDIDATE`, `unverified`. This is Domain 4's first production batch.

**Note on question ID numbering**: `question.d4.0001` collides with an
existing fixture ID already present in `schema/example/questions.example.json`
(a test-only placeholder, unrelated to this batch). To avoid that
collision - caught by the project's own invariant-13 separation test - the
Harborview-anchor U1 question was numbered `question.d4.0007` instead of
`question.d4.0001`; IDs `0002`–`0006` were free and used as planned. This
is a numbering artifact only, not a content or architecture issue.

## Cross-domain reinforcement

- D4-U1's prerequisite is `lesson.d3.program-synthesis` (Domain 3's own
  capstone) only, continuing the exact cumulative cross-domain chain every
  prior domain's own entry unit has used (D3-U1 itself prerequisited on
  Domain 2's capstone). Confirmed programmatically: D4-U2's own recall
  pool reaches 30 families spanning Foundation through Domain 3, including
  Domain 3's capstone, Domain 2's capstone, and a Domain 1 family.
- Both units reuse patterns already CANONICAL-approved for Domain 4 (per
  `schema/registry/patterns.json`'s existing `applicable_domains` arrays,
  checked before use rather than assumed): **P06 (Purpose vs. Activity)**
  and **P02 (Authority Follows Accountability)** for D4-U1; **P01
  (Business Alignment)** for D4-U2. No pattern's `applicable_domains` was
  edited, and no new pattern was invented - this batch deliberately chose
  only from patterns already listed as Domain-4-applicable, rather than
  extending a Domain-1/2/3-only pattern's registry entry, out of caution
  about touching CANONICAL schema metadata without explicit authorization
  (see "Unresolved concerns").
- D4-U2's impact-based classification reasoning directly parallels Domain
  3's own asset-classification teaching (D3-U2: "classification follows
  business impact, not cost/threat alone") and Domain 2's risk-vs-
  vulnerability distinction (P12) - both referenced narratively, neither
  re-taught.

## CANDIDATE status confirmation

All 2 concepts, 2 families, 2 lessons, and 6 questions are `content_status:
"CANDIDATE"`, `verification_status: "unverified"`. No entity in this batch
is `CANONICAL`.

## Validation

Content-production 347/347 (28 new tests in the new
`domain4-u1-u2.test.mjs`, plus `family-integrity.test.mjs`'s variant-count
map gaining two entries - neither a net-new-only count, since one
pre-existing Domain 2 boundary test - see below - was narrowed rather than
added to); legacy `tests/data-integrity`+`tests/data-model` 111/0/3-todo,
unchanged (BUG-001/002/003, unchanged); Vitest 200/200 (after fixing two
pre-existing frontend boundary tests - see "Defects found/fixed"); Domain
4 targeted tests 29/29; TypeScript clean; production build succeeds;
Chromium 43/43 and Firefox 43/43 e2e/accessibility (unchanged - no new e2e
specs); visual regression 32/32 unchanged (no CSS/markup changed, no
baseline updated); `npm audit --audit-level=moderate` 0 vulnerabilities.

## Defects found/fixed during authoring

1. **Length-bias (self-caught, same category as every prior batch)**: the
   correct option was the longest in all 3 variants of
   `family.d4.business-impact-analysis-prioritization`. Fixed by
   lengthening one distractor's wording (meaning unchanged) in
   `question.d4.0005`.
2. **`source.learner-supplied.domain-4-question-bank` did not yet exist**
   in `schema/registry/sources.json` (only domain-1/2/3 entries existed).
   Added, mirroring the existing domain-3 entry's exact structure - a
   necessary registry addition for any domain's first authoring batch, not
   a CANONICAL redefinition.
3. **`question.d4.0001` collided with an unrelated schema-example fixture
   ID** (see "Question families" note above) - renumbered to
   `question.d4.0007`.
4. **A pre-existing Domain 2 batch-boundary test** (in
   `domain2-u9-u10.test.mjs`) asserted "no Domain 4 (or later) entity
   exists yet" - legitimately superseded now that D4-U1/U2 exist. Narrowed
   to a comment pointing to the new `domain4-u1-u2.test.mjs`, mirroring
   the exact precedent used at every prior domain/batch transition in this
   project (including one already inside this same test file, from when
   Domain 3 began).
5. **Two pre-existing frontend unit tests** (`explore.test.ts`,
   `practice.test.ts`) asserted Domain 4 was *not yet* discoverable in
   Explore/Practice - legitimately superseded now that D4-U1/U2 exist.
   Updated to assert Domain 4 *is* now discoverable (the same behavioral,
   zero-hardcoding proof these tests already existed to make for Domain
   3), confirming Explore and Practice both discover Domain 4 generically
   with zero code changes to `explore.ts`/`practice.ts`.
6. **`family.d4.business-impact-analysis-prioritization`'s declared
   `evidence_dimensions` did not initially include `evidence.role` and
   `evidence.vocabulary`**, which two of its questions legitimately use.
   Added to the family's declaration (family-integrity.test.mjs requires
   every question's evidence dimensions to be a subset of its family's).

No content-quality defect (incorrect reasoning, mis-grounded source claim,
or unfair distractor) was found - all defects above were structural/
registry/test-calibration issues caught and fixed before evidence capture.

## Evidence-first review

One continuous, real-browser walkthrough (D4-U1 Recall → Learn → Apply →
incorrect Feedback → Repair, then D4-U2 Recall → Learn → Apply →
incorrect Feedback → Repair, then Explore, then Practice, then a mobile
Apply screen) was captured as 13 screenshots and composed into one local
contact sheet for Architect review - not committed, not published:
`/Users/demetrius/Downloads/cism-domain4-u1-u2-review.png`

D4-U1's own Recall screen correctly pulled a Domain 3 (Meridian capstone)
question rather than a Domain 4 one - expected and correct, since D4-U1 is
Domain 4's first unit and has no prior Domain 4 material to recall from
yet; this is itself live confirmation the cross-domain recall chain is
intact.

## Production integration

Domain 4 content integrates through the exact same structures every prior
domain uses. **Zero learning-mode code was modified**: `explore.ts`,
`practice.ts`, `reinforcement.ts`, `QuestionAttemptFlow.tsx`,
`selection.ts`, and `answerOrder.ts` are byte-for-byte unchanged.
`app/src/App.tsx`'s dev-only QA review-lesson list gained two entries
(D4-U1, D4-U2 labels).

## Deferred / not touched

D4-U3 onward (not authored this batch); Domain 5 (does not exist);
learning-mode architecture; `selection.ts`/`answerOrder.ts`; persistence;
confidence adaptation; Adaptive Reinforcement; BUG-001/002/003 (all still
correctly `Open`, untouched); Foundation/Domain 1/Domain 2/Domain 3
production curriculum (byte-for-byte unchanged aside from the one
superseded batch-boundary test in `domain2-u9-u10.test.mjs`, itself not a
content change); `CONFUSING-CONCEPTS.md` (recommendation to add an
IR-vs-BCP-vs-DRP entry is flagged, not applied - see "Unresolved
concerns" in the authoring report); `schema/registry/patterns.json`'s
`applicable_domains` arrays (not extended to any additional pattern - this
batch used only already-Domain-4-approved patterns).
