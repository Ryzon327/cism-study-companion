# Phase Gate Record — Domain 4, D4-U7 & D4-U8

**Status: [CANONICAL record of what happened]**. This is the durable
record of Domain 4's fourth production authoring batch: D4-U7
(Eradication / Recovery) and D4-U8 (IR / BCP / DRP Boundary), built per
the approved
[`DOMAIN-4-CURRICULUM-ARCHITECTURE.md`](DOMAIN-4-CURRICULUM-ARCHITECTURE.md)
and the Architect's D4-U7/U8 authoring directive. All new content remains
`CANDIDATE`.

## Architect review decision

Following Evidence-First review of the 14-panel review artifact
(`/Users/demetrius/Downloads/cism-domain4-u7-u8-review.png`, described
below under Evidence-First self-review), the Architect recorded:

- D4-U7 (Eradication / Recovery): **APPROVED**.
- D4-U8 (IR / BCP / DRP Boundary): **APPROVED**.
- Founder UAT: **WAIVED** under the established Evidence-First model.
- Harborview continuity: **APPROVED**.
- **D4-U7 lifecycle treatment: APPROVED.** `lifecycle.incident` with
  `stage_target: null` is confirmed correct — U7 genuinely spans
  eradication and recovery, and the current single-value `stage_target`
  model must not be forced to represent the family inaccurately. A
  narrow, clearly-marked authoring-decision addendum was added to
  `DOMAIN-4-CURRICULUM-ARCHITECTURE.md` recording this (see that
  document's own "Post-authoring corrections" section) — the original
  working tables were left unedited, no lifecycle/schema redesign
  occurred, and the CANONICAL lifecycle registry was not altered.
- **D4-U8 lifecycle treatment: APPROVED** as cross-cutting
  (`lifecycle: null`, `stage_target: null`).
- **D4-U8 prerequisite on D4-U7 only: APPROVED.** No redundant
  prerequisite edges are to be added.
- **IR/BCP/DRP concurrent/coordinated treatment: APPROVED.**
- **RTO/RPO/SDO/MTO/AIW treatment: APPROVED**, including the narrow AIW
  extension already made to the existing CANDIDATE
  `CONFUSING-CONCEPTS.md` entry.
- **Containment/eradication/recovery distinctions: APPROVED.**
- **Evidence-preservation vs. eradication/recovery tension: APPROVED as
  left nuanced.** No always/never rule was manufactured, and none is to
  be added.
- Feedback/Repair: **PASS**.
- Explore/Practice: **PASS**.
- Mobile rendering: **PASS**.
- No redesign or Domain-4-specific learning-mode implementation was
  authorized or required.
- The reported validation matrix (content-production 443/443, legacy
  557 total/554 pass/0 fail/3 registered `todo`, frontend/Vitest
  200/200, Chromium 43/43, Firefox 43/43, accessibility passing, visual
  regression 32/32, TypeScript clean, production build succeeds,
  `npm audit` 0 vulnerabilities) is **accepted**, re-confirmed by a final
  validation re-run at closeout. BUG-001/002/003 remain
  unchanged/deferred.

**Architect review: PENDING.**

## Source coverage

- **D4-U7** grounded in `tools/input/domain-4.txt`'s 4B5 (Incident
  Eradication and Recovery) sub-area, read comprehensively (18-19 question
  blocks; the source itself titles this ONE combined Knowledge Statement
  area, not two separate ones). Key findings: eradication "requires
  determining and eliminating the root cause so that it cannot cause
  further damage," explicitly distinguished from containment ("finding
  what the incident has impacted and limiting the extent that it spreads")
  and recovery ("simply returning the system to normal operations...
  accomplished after eradication and during recovery phase"); when a
  superuser/privileged account is compromised, "rebuilding the system from
  the original installation medium is the only way to ensure all security
  vulnerabilities and potential stealth malicious programs have been
  destroyed" — explicitly not a verified backup, since "the verified
  backup may have been compromised by the super-user at a different
  time"; RTO is explicitly distinguished from full recovery — "RTO is an
  objective, and full restoration may or may not coincide with the RTO...
  RTO can be the minimum acceptable operational level, far short of
  normal operations," with "return to business as usual" occurring
  "significantly later than the RTO"; the single most load-bearing
  recovery-verification finding: "until end-to-end transaction flow is
  established, recovery is not complete... whether the RTO has been met
  is less important than achieving full recovery."
- **D4-U8** grounded in 4A3 (Business Continuity Plan, 27 questions) and
  4A4 (Disaster Recovery Plan, 18 questions), both read comprehensively.
  The single cleanest BCP-vs-DRP boundary statement: "MOST closely
  associated with a business continuity program" is "developing recovery
  time objectives for critical functions," explicitly rejecting
  "confirming detailed technical recovery plans exist," "periodically
  testing network redundancy," and "updating hot site equipment
  configuration" as all "associated with infrastructure disaster
  recovery" instead. Echoed from the DRP side: "the disaster recovery
  plan (DRP) focuses on restoring IT systems and data. This is not
  necessarily covered when testing the business continuity plan (BCP)."
  Regular joint BCP+DRP drills are recommended specifically "to align"
  the two toward shared RTO/RPO targets — evidencing coordinated,
  concurrent programs, not a hand-off sequence. RPO is "the maximum loss
  of data acceptable by the business... will directly determine the
  basic elements of the backup strategy," explicitly NOT RTO ("will not
  have any impact on the backup strategy"); SDO is "the level of services
  to be reached during the alternate process mode until the normal
  situation is restored," demonstrated cleanly in a scenario where a team
  correctly reports a system restored to half throughput as having met
  the SDO, not the RTO; MTO is "the amount of time the enterprise can
  operate in alternate mode," normally exceeding the allowable
  interruption window (AIW); AIW is "defined by business management" and
  "determines the acceptable time frame between a disaster and the
  restoration of critical services," directly driving the alternate-site
  strategy choice, with "RTO must be shorter than the AIW."

## Learning outcomes

- **D4-U7**: eradication (removing the actual cause) and recovery
  (restoring and verifying normal business operation) are two distinct,
  sequential steps after containment, neither interchangeable with the
  other or with containment itself; a compromise involving privileged
  access requires rebuilding from known-clean original media, not a
  possibly-tainted backup; meeting a stated recovery time objective does
  not by itself prove recovery is complete — only verified, end-to-end
  business function does; retreating to re-do an already-completed stage,
  or declaring closure before recovery is actually verified, are both
  errors.
- **D4-U8**: incident response, business continuity, and disaster
  recovery are three coordinated but distinct disciplines that can
  operate at the same time on the same incident, depending on what is
  actually disrupted; business continuity keeps critical business
  PROCESSES running, not an IT-only concern; activating one plan does not
  automatically activate the others; recovery objectives (RTO, RPO, SDO)
  describe different dimensions of a business-defined restoration
  commitment and must be matched to a described scenario by reasoning
  from the facts, not acronym recall.

## Harborview progression

Continues directly from D4-U6's preserved evidence. D4-U7: Harborview's
IT team wants to restore reservations service quickly by reinstalling
from last week's backup; the security manager instead directs a rebuild
from original, clean installation media, since the compromised account
had privileged access and the backup itself could carry the same
exposure forward. Once rebuilt, corporate leadership wants to declare the
incident resolved the moment reservations start flowing again, but the
security manager insists on verifying bookings, payment, and other
guest-facing functions work end to end first. D4-U8: while the server is
being rebuilt, the property's front desk is checking guests in manually
on paper — a parallel business continuity need distinct from the
disaster recovery work restoring the server itself, continuing the same
incident and the same Harborview property established across D4-U3
through D4-U7. The story remains management-level throughout — no
malware-removal or forensic-tool-operation detail was introduced in
either unit.

## Concepts / families / lessons / questions

| Unit | Concept | Family | Variants |
|---|---|---|---|
| D4-U7 | `concept.d4.eradication-recovery` | `family.d4.eradication-recovery` | `question.d4.0020` (Harborview anchor — rebuild from clean media, not backup), `question.d4.0021` (regional airline — RTO met, recovery not verified), `question.d4.0022` (national manufacturing company — eradication complete, what's NEXT) |
| D4-U8 | `concept.d4.ir-bcp-drp-boundary` | `family.d4.ir-bcp-drp-boundary` | `question.d4.0023` (Harborview anchor — manual check-in is BCP, not IR/DRP), `question.d4.0024` (mid-size hospital system — RPO drives backup frequency), `question.d4.0025` (national telecommunications provider — half-throughput restored meets SDO, not RTO) |

One family per unit, 3 variants each. 6 new questions total
(`question.d4.0020` through `question.d4.0025`), 2 new concepts, 2 new
families, 2 new lessons — all `CANDIDATE`, `unverified`.

## Lifecycle decisions

- **D4-U7**: `family.lifecycle: "lifecycle.incident"`,
  `family.stage_target: null` — a deliberate, source-grounded deviation
  from the architecture document's original single-stage assumption
  (`DOMAIN-4-CURRICULUM-ARCHITECTURE.md` line 492 proposed "the domain's
  Eradicate + Recover lifecycle stages," and line 686 itself flagged this
  as an open authoring-time decision: "a single family may need to
  represent both, or split into two"). Direct source analysis confirms
  the source's own single combined Knowledge Statement title genuinely
  spans two adjacent CANONICAL stages (`stage.incident.eradicate`,
  `stage.incident.recover`) as one continuous invariant. The schema's
  `stage_target` field accepts only one value, so mechanically picking
  either stage would misrepresent half of what the family teaches;
  `stage_target: null` with `lifecycle` still set to `lifecycle.incident`
  is the most accurate representation available in the schema — flagged
  explicitly, not a default or an oversight. **This mapping deviates from
  the architecture document's original assumption; reported here per the
  Architect's own "source evidence wins" instruction, not forced.**
- **D4-U8**: `family.lifecycle: null`, `family.stage_target: null` —
  cross-cutting. Business continuity invocation is one of the CANONICAL
  incident lifecycle's own documented "supporting activities that may
  intersect any stage" (see `LIFECYCLE-MODEL.md`), and this family's own
  three variants span recovery-in-progress, backup-strategy-design, and
  alternate-site-operation — not one lifecycle moment. Matches the
  architecture document's own original proposal for this unit.

## Prerequisite decisions

- **D4-U7**: `lesson.d4.eradication-recovery.prerequisites =
  ["lesson.d4.evidence-investigation"]` (D4-U6 only) — continues the
  linear chain.
- **D4-U8**: `lesson.d4.ir-bcp-drp-boundary.prerequisites =
  ["lesson.d4.eradication-recovery"]` (D4-U7 only). Confirmed via the same
  direct inspection of `app/src/content/resolve.ts`'s `recallPoolFor`
  used for D4-U6's own dependency decision: the recall pool is the full
  transitive closure of every reachable prerequisite lesson's
  `retrieval_refs`/families, not distance-weighted, so a second direct
  edge back to an earlier unit (e.g. D4-U3/U4) would be functionally
  inert for recall purposes. Domain 4 remains a strictly linear chain
  through all eight units authored so far, with no branching requiring
  reconvergence.

## IR/BCP/DRP treatment

Taught as three coordinated, concurrent disciplines addressing different
facts (the security incident itself / business-process continuity /
technology restoration), never as a strict sequence, a subset
relationship, or an automatic joint-activation rule. Harborview's D4-U8
scenario demonstrates this directly: the front-desk paper workaround
(business continuity) runs in parallel with the server rebuild (disaster
recovery, from D4-U7) on the same incident. No source item states or
implies that activating one plan automatically activates the others —
confirmed absent from both 4A3 and 4A4's full read.

## RTO / RPO / MTO / AIW / SDO disposition

- **RTO**: well-evidenced across 4A3/4A4/4B5; tested via reasoning-from-
  facts in D4-U7 (`question.d4.0021`, an RTO met but the business function
  not verified) and referenced as a discrimination distractor in D4-U8.
- **RPO**: well-evidenced, directly tested via reasoning-from-facts in
  D4-U8 (`question.d4.0024`, a stated data-loss tolerance driving backup
  frequency, not a definition-recall prompt).
- **SDO**: well-evidenced with an exceptionally clean, concrete source
  scenario (half-throughput restoration meeting SDO, not RTO); directly
  tested via reasoning-from-facts in D4-U8 (`question.d4.0025`), closely
  modeled on the source's own scenario shape.
- **MTO**: evidenced (source defines it directly and ties it to AIW), but
  used in Learn narrative only, not tested in Apply — judged more
  supporting/peripheral to this unit's own core reasoning than RTO/RPO/
  SDO, per the explicit instruction against cramming all five terms into
  three questions merely because they are related.
- **AIW**: evidenced (drives the alternate-site strategy choice, and the
  RTO-must-be-shorter-than-AIW / MTO-normally-exceeds-AIW relationships),
  used in Learn narrative only, not tested in Apply, for the same reason
  as MTO. `CONFUSING-CONCEPTS.md`'s existing "RTO vs. RPO vs. SDO vs.
  MTO" entry was narrowly extended to add AIW (see that file), since AIW
  is materially necessary to correctly explain the MTO/RTO relationship
  this unit's Learn narrative references, and the architecture document's
  own working table (line 493) had already anticipated this exact
  extension during D4-U8 authoring.

## Cross-domain reinforcement

- D4-U7 reinforces the existing `CONFUSING-CONCEPTS.md` "Containment vs.
  Eradication vs. Recovery" entry directly (not duplicated).
- D4-U8 reuses Pattern P01 (Business Alignment, already Domain-4-
  approved) — every recovery objective and plan-boundary distinction
  traces to what the business itself actually needs.
- D4-U7 reuses Pattern P04 (No Lifecycle Jumping) and, for the first time
  at full strength in Domain 4 production content, Pattern P05 (No
  Lifecycle Reversal) — `question.d4.0022`'s stage-retreat distractors are
  P05's own textbook recognition shape.
- Both units' recall pools transitively reach Domain 1's authority/
  accountability family, Domain 2's and Domain 3's own capstone families,
  and every prior Domain 4 unit — confirmed via `domain4-u7-u8.test.mjs`'s
  own cumulative-recall-pool test (≥31 families reachable from D4-U8).

## Aha moments

- **D4-U7**: "Stopping the damage isn't removing the cause, and removing
  the cause isn't safely restoring the business - each is a separate,
  necessary step," plus the secondary realization that meeting a
  recovery time objective doesn't by itself prove recovery is complete.
- **D4-U8**: incident response, business continuity, and disaster
  recovery are three coordinated disciplines that can all be active on
  one incident depending on what's actually disrupted — not an IT-only
  reduction of business continuity, and not an automatic joint-activation
  rule.

## Distractor analysis

Every distractor across both families maps to a real, source-documented
temptation: restoring from a possibly-tainted backup, treating a met RTO
as full recovery, retreating to an already-completed stage, declaring
closure prematurely, reducing business continuity to IT restoration,
assuming automatic joint plan activation, and swapping one recovery
objective's defining fact for another's. None is a throwaway or
obviously-wrong strawman.

## Qualifier analysis

FIRST: none this batch (D4-U7's rebuild-reasoning question uses BEST
instead, since the source's own "only way to ensure X is secure" framing
is a completeness/fit test, not a sequencing test). BEST: `0020`. MOST:
`0021`, `0025`. NEXT: `0022` — the first legitimate use of NEXT in Domain
4 production content, directly source-grounded (4B5 itself asks "most
appropriate NEXT step" in its own items). PRIMARY: `0024`. No manufactured
qualifier usage.

## Role/authority analysis

Only existing CANONICAL roles used: `role.security-manager`,
`role.incident-response-team`. No new role invented for "business
management" or "local/regional management" mentioned in source findings
(4A3's decentralized-authority and BC-strategy-approval material) — these
did not map cleanly to a distinct existing role beyond
`role.board-senior-management`, and were not forced into a question
merely to reuse them; left as Learn-narrative color only where they
appear, consistent with the "don't cram callbacks" instruction.

## Source tensions

1. **D4-U7's own eradication-before-recovery sequencing**: one 4B5 item's
   correct answer moves directly from "containment complete" to "restore
   systems" without naming an explicit intervening eradication step, in
   apparent tension with the multiple other items establishing clear
   eradication-before-recovery order. Not staged into a question that
   would force an artificial resolution; `question.d4.0022` instead
   grounds its own sequencing reasoning in the multiple, consistent items
   that do state the order explicitly. Documented in
   `concept.d4.eradication-recovery`'s own note.
2. **D4-U7's lifecycle-mapping deviation** (see "Lifecycle decisions"
   above) — the architecture document's own single-stage assumption did
   not survive direct source analysis; corrected with a `stage_target:
   null` representation and full documentation, not forced.

## CANDIDATE boundary

All 2 concepts, 2 families, 2 lessons, and 6 questions carry
`content_status: "CANDIDATE"`, `verification_status: "unverified"` — no
CANONICAL promotion occurred.

## Generic learning-mode integration

Zero learning-mode code modified. `explore.ts`, `practice.ts`,
`reinforcement.ts`, `QuestionAttemptFlow.tsx`, `selection.ts`,
`answerOrder.ts`, and the shared Repair system are byte-for-byte
unchanged. `app/src/App.tsx`'s dev-only QA review-lesson list gained two
entries (D4-U7, D4-U8 labels) — the only application-code change in this
batch. Confirmed live during Evidence-First capture: Daily Study
(Recall/Learn/Apply/Feedback/Repair/Completion), Explore, and Practice
all discover and serve the new content correctly with zero Domain-4-
specific code.

## Validation

- `tests/content-production/` (full glob): 443/443 pass, including 34 new
  tests in `domain4-u7-u8.test.mjs` (one self-caught test-authoring
  defect fixed during the same session — see "Defects found/fixed").
- `family-integrity.test.mjs`'s expected-variant-count map gained 2
  entries (`family.d4.eradication-recovery`: 3,
  `family.d4.ir-bcp-drp-boundary`: 3).
- Legacy `node --test` full suite: 557 tests, 554 pass, 0 fail, 3 `todo`
  (BUG-001/002/003, pre-existing, unchanged).
- Vitest frontend: 200/200 pass, 18 files.
- TypeScript (`tsc --noEmit`): clean.
- Production build (`npm run build`): succeeds.
- Playwright Chromium (functional + `@a11y`): 43/43 pass.
- Playwright Firefox (functional + `@a11y`): 43/43 pass.
- Playwright visual regression: 32/32 pass against existing baselines — no
  baseline updates, since no UI/markup/CSS change occurred this batch.
- `npm audit --audit-level=moderate`: 0 vulnerabilities.

## Defects found/fixed during authoring

1. **A test-authoring defect in the newly authored `domain4-u7-u8.test.mjs`
   itself** (not a content defect): a test asserted the stage_target-
   deviation reasoning would appear in `family.d4.eradication-recovery`'s
   own `note` field, but that detailed reasoning was actually written into
   `concept.d4.eradication-recovery`'s note instead. Fixed by correcting
   the test to check the concept note (where the content genuinely lives
   and is genuinely thorough), not by adding redundant text to the family
   note. No content change was required.
2. **An evidence-capture script defect** (not a content defect): the
   initial capture script's "transfer scenario" panel used `page.goto()`
   between attempts to find a non-Harborview Apply variant, which resets
   in-memory exposure history on every reload and made the deterministic,
   unseen-preferred, lowest-id-tie-break selection always re-pick the same
   Harborview-anchor variant. Fixed by continuing in the same page
   instance (completing one full session first, `Done` returning home via
   in-app navigation, then starting a second session without reloading) —
   matches the established D4-U5/U6 evidence-capture precedent exactly.

No content-quality defect (incorrect reasoning, mis-grounded source
claim, or unfair distractor) was found. No length-bias failure occurred
this batch (both new families' correct answers were the longest option in
only 2 of 3 variants, never 3/3).

## Evidence-First self-review

One continuous, real-browser walkthrough (D4-U7 Recall → Learn → Apply →
incorrect Feedback → Repair, then D4-U8 Recall → Learn → Apply →
incorrect Feedback → Repair, then a transfer-scenario panel illustrating
D4-U8's RPO-vs-RTO discrimination, then Explore, then Practice, then a
mobile Apply screen for D4-U8) was captured as 14 screenshots and
composed into one local contact sheet for Architect review — not
committed, not published:
`/Users/demetrius/Downloads/cism-domain4-u7-u8-review.png`

Self-review findings (all judged satisfactory, no further defects):
containment/eradication/recovery are clearly distinguished, with no
technical-remediation training introduced; IR/BCP/DRP is made intuitive
through the Harborview scenario rather than taught as a glossary
triad; RTO/RPO/SDO are used only where directly Apply-tested, and
MTO/AIW are confirmed absent from Apply content (Learn-narrative-only, as
designed and enforced by a dedicated test); Harborview continuity flows
naturally from D4-U6's preserved evidence through D4-U7's rebuild into
D4-U8's parallel business-continuity need; Recall correctly retrieves
prior-unit content (confirmed live — D4-U7's Recall pulled D4-U6's own
retrieval question, D4-U8's Recall pulled D4-U7's); Learn text is
concise; Apply withholds the answer-determining concept in every
question; distractors are plausible and source-grounded; Feedback names
the actual selected option and explains the missed reasoning; Repair
surfaces genuine near-transfer via the shared, domain-agnostic
repair-target template (no Domain-4-specific repair code); mobile
renders legibly at 390px; Explore and Practice both discover Domain 4
through U8 generically, confirmed live; AnswerOrder shuffling is visibly
active (option-letter assignment differs from the JSON's own a/b/c/d
authoring order in the captured screenshots).

## Production integration

Domain 4 U7/U8 content integrates through the exact same structures every
prior domain/unit uses.

## Deferred / not touched

D4-U9 onward (not authored this batch); Domain 5 (does not exist);
learning-mode architecture; `selection.ts`/`answerOrder.ts`; persistence;
confidence adaptation; Adaptive Reinforcement; BUG-001/002/003 (all still
correctly `Open`, untouched); Foundation/Domain 1/Domain 2/Domain 3/
D4-U1 through D4-U6 production curriculum (byte-for-byte unchanged);
the existing `CONFUSING-CONCEPTS.md` "Incident Response vs. Business
Continuity vs. Disaster Recovery" entry (reviewed against fresh source
findings and found to remain fully accurate — left unchanged, per the
explicit instruction not to touch an entry that remains correct);
`schema/registry/patterns.json`'s `applicable_domains` arrays (no edit
needed or made this batch — all three patterns reused were already
Domain-4-approved).

## Founder-UAT recommendation

Does not appear necessary — the Evidence-First artifact above covers the
same ground the prior three Domain 4 batches' waived-UAT decisions
covered, using the same established evidence-capture and self-review
process.

## Final closeout disposition

Architect review is complete and this batch is **APPROVED** for
source-control closeout (commit → push → PR → merge → post-merge
verification). See the companion `DOMAIN 4 — U7/U8 FINAL POST-MERGE
REPORT` (delivered to the Architect/Founder in the same turn as this
record's closeout update) for the exact commit SHA, PR number/URL, CI
results, and post-merge verification. This gate record remains the
durable record of the curriculum/content decision; the final post-merge
report is the durable record of the closeout mechanics.
