# Phase Gate Record — Domain 4, D4-U9 & D4-U10 (Final Batch)

**Status: [CANONICAL record of what happened]**. This is the durable
record of Domain 4's fifth and **final** production authoring batch:
D4-U9 (Post-Incident Review) and D4-U10 (Incident Management Synthesis /
Capstone), built per the approved
[`DOMAIN-4-CURRICULUM-ARCHITECTURE.md`](DOMAIN-4-CURRICULUM-ARCHITECTURE.md)
and the Architect's D4-U9/U10 authoring directive. All new content remains
`CANDIDATE`.

## Architect review decision

Following Evidence-First review of the 14-panel review artifact
(`/Users/demetrius/Downloads/cism-domain4-u9-u10-review.png`, described
below under Evidence-First self-review), the Architect recorded:

- D4-U9 (Post-Incident Review): **APPROVED**.
- D4-U10 (Incident Management Synthesis / Capstone): **APPROVED**.
- Founder UAT: **WAIVED** under the established Evidence-First UAT model.
- Harborview final Domain 4 arc: **APPROVED**.
- U9 `stage.incident.post-incident-review-improve` lifecycle binding:
  **APPROVED**.
- U10 cross-cutting (`lifecycle: null`, `stage_target: null`) treatment:
  **APPROVED**.
- U9 root-cause/corrective-action model (root cause first examined
  during eradication, completed in post-incident review if unresolved;
  management review confirms implementation, never finds fault):
  **APPROVED**.
- U9 "recovery restores operations; review improves the organization"
  Aha: **APPROVED**.
- U10 integrated capstone design: **APPROVED**.
- All three capstone variants integrating exactly four Domain 4 concepts
  each (the synthesis concept plus three prior-unit concepts):
  **APPROVED**.
- Hospital and airline transfer scenarios: **APPROVED**.
- IR/BCP/DRP integration: **APPROVED**.
- Evidence/containment/recovery integration: **APPROVED**.
- Qualifier treatment: **APPROVED**.
- Role/authority treatment: **APPROVED**.
- `CONFUSING-CONCEPTS.md` left unchanged this batch: **APPROVED**.
- No registry changes this batch: **APPROVED**.
- **The narrow `DOMAIN-4-CURRICULUM-ARCHITECTURE.md` correction recording
  that the earlier response-time-specific effectiveness-metric assumption
  was not confirmed during comprehensive 4B6 source review: APPROVED** —
  the correction was confirmed to not manufacture a replacement metric,
  not claim response time is useless, and not alter production
  curriculum, while preserving the source-supported principle that
  effectiveness should be evaluated against the actual objective/outcome
  being assessed.
- All new D4-U9/U10 entities remain `CANDIDATE`/`unverified`: confirmed.
- Domain 4 curriculum design: **APPROVED FOR SOURCE-CONTROL CLOSEOUT** —
  subject to that closeout and final main CI succeeding, Domain 4 is
  complete for the current MVP curriculum boundary.
- The reported validation matrix (content-production 477/477, legacy
  591 total/588 pass/0 fail/3 registered `todo`, frontend/Vitest
  200/200, Chromium 43/43, Firefox 43/43, accessibility passing, visual
  regression 32/32, TypeScript clean, production build succeeds,
  `npm audit` 0 vulnerabilities) is **accepted**, re-confirmed by a final
  validation re-run at closeout. BUG-001/002/003 remain
  unchanged/deferred.

**Domain 4 completion: APPROVED FOR SOURCE-CONTROL CLOSEOUT.** Subject to
that closeout succeeding, this batch completes Domain 4 — all ten units
(D4-U1 through
D4-U10) now exist — for the current MVP curriculum boundary.

## Source coverage

- **D4-U9** grounded in `tools/input/domain-4.txt`'s 4B6 (Post-incident
  Review Practices) sub-area, read comprehensively in full (all 18
  question blocks, read directly rather than via a research fork given
  the section's manageable size). Key findings: the PRIMARY goal of a
  post-incident review is explicitly "to derive ways in which the
  incident response process can be improved," with gathering legal
  evidence, identifying individuals who failed to act, and merely
  preparing a management report all explicitly rejected as the primary
  goal in the same source item; the PRIMARY reason for senior management
  review of incidents is explicitly "to ensure adequate corrective
  actions were implemented," with the source directly stating "management
  will not perform a review for fault findings such as examining the
  incident response process for deficiencies" or "evaluating the ability
  of the security team"; a root-cause analysis for a new incident "is
  FIRST performed during" eradication, not containment, recovery, or
  post-incident review, with the source noting "if the root-cause
  analysis performed in the [eradication] phase was not successful, a
  second root-cause analysis can be performed in the post-incident
  assessment"; root cause analysis is independently confirmed as the BEST
  indicator of reoccurrence risk, ahead of a vulnerability assessment or
  automated log monitoring; maintaining an incident history exists "to
  record progress and document exceptions," explicitly NOT "to track
  errors to assign accountability"; when a previously unmonitored process
  is found and monitoring is implemented, the BEST-expected result is
  explicitly "improvement in identification," NOT a reduction in incident
  duration.
- **D4-U10** is integrative — no new source material, per the general
  Domain Synthesis/Capstone principle established for D2-U10 and D3-U10.
  Every claim tested is already source-grounded from D4-U1 through D4-U9;
  this unit combines that already-established reasoning inside new,
  genuinely multi-concept scenarios.

## Learning outcomes

- **D4-U9**: recovery restores operations, post-incident review improves
  the organization; the review's purpose is deriving concrete process
  improvement and confirming corrective actions were actually
  implemented, never identifying someone to blame; root-cause analysis,
  first begun during eradication, is completed here if it was not fully
  resolved earlier; a corrective action's benefit should be stated
  honestly and specifically, not overclaimed.
- **D4-U10**: incident management is one coordinated management
  capability — readiness, business impact, confirmation, escalation,
  containment, evidence, eradication/recovery, continuity, and
  post-incident improvement all connect, and a real situation rarely
  arrives labeled with which piece is actually in play; the facts of the
  situation, not a fixed sequence of labels, determine the correct
  action.

## Harborview progression

Continues directly from D4-U7/U8's fully recovered incident. D4-U9:
Harborview's post-incident review identifies that failed-login alerts on
privileged accounts were only reviewed during business hours (not
monitored in real time overnight) as the root cause of the original
detection delay, and recommends real-time, 24/7 alerting; the executive
team's review confirms that recommendation was actually implemented, not
merely written up. D4-U10 (capstone): eight months later, a new,
later management situation tests the accumulated understanding at
once — the same real-time monitoring (installed as D4-U9's corrective
action) correctly catches a fresh overnight login anomaly at a different
property, triage shows it is not a genuine compromise, but the property's
general manager has already made an unauthorized comment to a local
reporter; the learner must recognize which concern is genuinely still
open (the communication problem) versus which is already resolved (the
monitoring worked, and the event is not a confirmed incident). No new
incident was introduced merely to teach either unit — D4-U9 reviews the
same incident's own story, and D4-U10's capstone situation is an explicit
epilogue, not a repeat of any prior scene.

## Concepts / families / lessons / questions

| Unit | Concept | Family | Variants |
|---|---|---|---|
| D4-U9 | `concept.d4.post-incident-review` | `family.d4.post-incident-review` | `question.d4.0026` (Harborview anchor — executive review confirms corrective action, not fault-finding), `question.d4.0027` (regional university — completing unresolved root-cause analysis), `question.d4.0028` (national financial services firm — PRIMARY goal is process improvement) |
| D4-U10 | `concept.d4.incident-management-synthesis` | `family.d4.incident-management-synthesis` | `question.d4.0029` (Harborview capstone — event-vs-incident + spokesperson authority + closing-the-loop, integrating 3 prior concepts), `question.d4.0030` (mid-size hospital system — proportionate containment + notification authority, integrating 3 prior concepts), `question.d4.0031` (regional airline — RTO-vs-full-recovery + BCP-success-vs-closure + post-incident-review-before-closure, integrating 3 prior concepts) |

One family per unit, 3 variants each. 6 new questions total
(`question.d4.0026` through `question.d4.0031`), 2 new concepts, 2 new
families, 2 new lessons — all `CANDIDATE`, `unverified`. Domain 4 is now
complete: 10 units, 30 questions total (`question.d4.0002`–`0031`), 127
total production questions.

## Lifecycle treatment

- **D4-U9**: genuinely bound to `stage.incident.post-incident-review-improve`
  — the domain's own final CANONICAL stage, and every one of 4B6's 18
  source items concerns this phase specifically.
  `family.lifecycle: "lifecycle.incident"`,
  `family.stage_target: "stage.incident.post-incident-review-improve"`.
- **D4-U10**: deliberately cross-cutting (`lifecycle: null`,
  `stage_target: null`), matching `family.d3.program-synthesis` and
  `family.d2.risk-management-synthesis`'s own precedent exactly — the
  capstone integrates across the whole lifecycle rather than binding to
  one stage.

## Root-cause / corrective-action reasoning

Root-cause analysis is source-confirmed as first performed during
eradication (D4-U7's own stage), not post-incident review — post-incident
review's job is completing that analysis if it was not fully resolved
earlier, not originating it from scratch every time. Senior management
review's PRIMARY purpose is confirming corrective actions were actually
implemented, not evaluating team performance or assigning blame — a
distinction taught directly in `question.d4.0026` and reinforced
narratively in the lesson's own Harborview scenario.

## Metrics disposition

`DOMAIN-4-CURRICULUM-ARCHITECTURE.md`'s own working table proposed
"response-time reduction (not incident-count reduction) is the best
effectiveness metric" as a D4-U9 outcome. A full read of all 18 4B6
source items found no direct support for this specific claim — it is
**not taught or tested** in this batch. What the source does directly
support is a narrower, more honest point: a corrective action (e.g.
implementing monitoring on a previously unmonitored process) has a
specific, honest expected benefit — improved identification — and should
not be credited with a broader benefit (like shortening active-incident
duration) it doesn't actually provide. This narrower point is taught in
`concept.d4.post-incident-review`'s own plain text and the lesson's
Harborview narrative, without inflating it into a dedicated Apply
question or the unsupported "best effectiveness metric" claim. See
"Source tensions" below.

## D4-U10 synthesis design

Mirrors `family.d3.program-synthesis` (D3-U10) and
`family.d2.risk-management-synthesis` (D2-U10) exactly: one synthesis
family, three genuinely integrated variants, cross-cutting stage_target,
a `concepts` array listing the synthesis concept plus every other
Domain 4 concept the family's variants genuinely integrate (8 total:
the synthesis concept plus U2, U3, U4, U5, U7, U8, U9's own concepts).

## Capstone family architecture

One family (`family.d4.incident-management-synthesis`), 3 variants,
`difficulty_band: "standard"` (not `"introductory"`, matching the D3-U10/
D2-U10 capstone precedent). `minimum_variant_count: 3`.

## Integrated-concept counts

Every variant integrates at least 4 Domain 4 concepts (the synthesis
concept plus 3 prior-unit concepts) — confirmed by a dedicated test
(`domain4-u9-u10.test.mjs`) that fails if any variant falls below this
bar. Specifically: `question.d4.0029` integrates
`concept.d4.incident-classification-severity` (U3),
`concept.d4.escalation-communications` (U4), and
`concept.d4.post-incident-review` (U9); `question.d4.0030` integrates
`concept.d4.business-impact-analysis-prioritization` (U2),
`concept.d4.incident-containment` (U5), and
`concept.d4.escalation-communications` (U4); `question.d4.0031`
integrates `concept.d4.eradication-recovery` (U7),
`concept.d4.ir-bcp-drp-boundary` (U8), and
`concept.d4.post-incident-review` (U9). Per the explicit instruction to
prefer 3-5 integrated concepts over superficial references to every
unit, no variant forces in all nine prior units merely for coverage.

## Transfer design

`question.d4.0029` anchors Harborview; `question.d4.0030` transfers to a
mid-size hospital system (non-critical research-data server, overbroad-
shutdown-vs-proportionate-containment plus unauthorized-notification
temptation); `question.d4.0031` transfers to a regional airline
(RTO-met-but-not-fully-verified plus business-continuity-success-vs-
incident-closure). Each transfer variant independently satisfies the
same ≥3-integrated-concept bar as the anchor, confirmed by a dedicated
test.

## Qualifier use

PRIMARY (`0026`, `0028`), NEXT (`0027`), MOST (`0029`), BEST (`0031`),
null (`0030`, no explicit stem superlative — consistent with the 30+
existing production questions across Domains 1-4 that already use
`qualifier: null`). No manufactured qualifier usage; NEXT is used for the
first time with direct source support in this batch (4B5's own "most
appropriate NEXT step" framing, reused here for U9's root-cause-
continuation item).

## Role/authority

Only existing CANONICAL roles used: `role.security-manager`,
`role.incident-response-team`, `role.board-senior-management`. No new
role invented.

## Lifecycle/process reasoning

D4-U9 and D4-U10 together close the domain's own CANONICAL lifecycle
loop (Pattern P15): D4-U9 is the lifecycle's own final stage, and D4-U10
explicitly reads the lifecycle as a narrative backbone the scenario's
facts must still be checked against — never a mnemonic that answers a
question by itself, and never exposed as raw stage IDs in Learn content
(confirmed by a dedicated test).

## Cross-domain reinforcement

D4-U9 recalls Domain 3's own metrics/effectiveness reasoning (P07)
narratively, without re-teaching it directly (per the explicit "no
metrics claim beyond source evidence" constraint - see Metrics
disposition above). D4-U10's recall pool transitively reaches Domain 1's
authority/accountability family and Domain 2's and Domain 3's own
capstone families, confirmed via a dedicated cumulative-recall-pool test
(≥35 families reachable from D4-U10).

## Source tensions

The architecture document's own working table proposed a
"response-time-reduction is the best effectiveness metric" outcome for
D4-U9 that direct, comprehensive source reading did not confirm — flagged
explicitly in `concept.d4.post-incident-review`'s own note (see "Metrics
disposition" above) rather than silently taught or silently dropped
without record, per the binding "source evidence wins, report
discrepancies" instruction.

## CANDIDATE boundary

All 2 concepts, 2 families, 2 lessons, and 6 questions carry
`content_status: "CANDIDATE"`, `verification_status: "unverified"` — no
CANONICAL promotion occurred. Domain 4's completion for the MVP
curriculum boundary does not itself constitute or imply CANONICAL
promotion of any Domain 4 content.

## Validation

- `tests/content-production/` (full glob): 477/477 pass, including 34 new
  tests in `domain4-u9-u10.test.mjs` (one self-caught test-authoring
  defect fixed during the same session — see "Defects found/fixed").
- `family-integrity.test.mjs`'s expected-variant-count map gained 2
  entries (`family.d4.post-incident-review`: 3,
  `family.d4.incident-management-synthesis`: 3).
- Legacy `node --test` full suite: 591 tests, 588 pass, 0 fail, 3 `todo`
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

1. **A length-bias self-catch** (same category as nearly every prior
   batch): `family.d4.incident-management-synthesis`'s three capstone
   correct answers were initially the longest option in all 3 variants —
   an expected consequence of genuinely integrated answers naturally
   running longer than single-concern distractors. Fixed by lengthening
   `question.d4.0029`'s option d (meaning unchanged) until only 2 of 3
   variants have the correct answer as longest.
2. **A test-authoring defect in the newly authored `domain4-u9-u10.test.mjs`
   itself** (not a content defect): a test's root-cause-continuation
   variant finder matched on the literal phrase "root cause," which
   incidentally also appears in the Harborview anchor question's own
   prompt (`question.d4.0026`), rather than the intended
   `question.d4.0027`. Fixed by matching on a phrase unique to the
   intended variant. No content change was required.

No content-quality defect (incorrect reasoning, mis-grounded source
claim, or unfair distractor) was found.

## Evidence-First self-review

One continuous, real-browser walkthrough (D4-U9 Recall → Learn → Apply →
incorrect Feedback → Repair, then D4-U10 Recall → Learn → Apply →
incorrect Feedback → Repair, then a transfer capstone scenario, then
Explore, then Practice, then a mobile Apply screen for D4-U10) was
captured as 14 screenshots and composed into one local contact sheet for
Architect review — not committed, not published:
`/Users/demetrius/Downloads/cism-domain4-u9-u10-review.png`

Self-review findings (all judged satisfactory, no further defects): D4-U9
clearly distinguishes recovery from post-incident review and confirms/
never-blames framing throughout; D4-U10 makes the domain feel like one
coordinated capability rather than a stage-labeling exercise, confirmed
live in the Learn screen's concise journey summary and the Apply screen's
genuinely multi-concern scenario; Harborview continuity flows naturally
from D4-U7/U8 through D4-U9 into D4-U10's new, later epilogue situation;
Recall correctly retrieves prior-unit content (confirmed live — D4-U9's
Recall pulled D4-U7's own retrieval question, D4-U10's Recall pulled
D4-U9's); Learn text is concise in both units; Apply withholds the
answer-determining concept in every question; distractors are plausible
and source-grounded; Feedback names the actual selected option and
explains the missed reasoning; Repair surfaces genuine near-transfer via
the shared, domain-agnostic repair-target template; mobile renders
legibly at 390px; Explore and Practice both show the complete, ten-unit
Domain 4, confirmed live; AnswerOrder shuffling is visibly active.

## Production integration

Domain 4 U9/U10 content integrates through the exact same structures
every prior domain/unit uses. Zero learning-mode code modified.

## Evidence paths

Raw screenshots were captured to `.tmp-d4-u9u10-screens/` (14 PNGs),
reviewed by the Architect, and deleted after review per the closeout
authorization (user-executed after sandbox denial, verified absent).
Composed review artifact: `/Users/demetrius/Downloads/cism-domain4-u9-u10-review.png`
(local only, not committed, preserved).

## Architect review

**APPROVED.** See "Architect review decision" above for the full,
itemized disposition.

## Domain 4 completion

**APPROVED FOR SOURCE-CONTROL CLOSEOUT.** See the companion
`DOMAIN 4 — FINAL POST-MERGE / DOMAIN COMPLETE REPORT` (delivered to the
Architect/Founder in the same turn as this record's closeout update) for
the exact commit SHA, PR number/URL, CI results, and post-merge
verification confirming Domain 4 is complete for the current MVP
curriculum boundary. This gate record remains the durable record of the
curriculum/content decision; the final post-merge report is the durable
record of the closeout mechanics.

## Founder-UAT recommendation

Does not appear necessary — the Evidence-First artifact above covers the
same ground the prior four Domain 4 batches' waived-UAT decisions
covered, using the same established evidence-capture and self-review
process.
