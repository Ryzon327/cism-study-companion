# Phase Gate Record — Domain 3, D3-U5 & D3-U6

**Status: [CANONICAL record of what happened]**. This is the durable record
of the third Domain 3 production authoring batch: D3-U5 (Control
Implementation & Integration) and D3-U6 (Control Testing & Evaluation),
built per the approved
[`DOMAIN-3-CURRICULUM-ARCHITECTURE.md`](DOMAIN-3-CURRICULUM-ARCHITECTURE.md)
and the Architect's D3-U5/U6 authoring directive. All new content remains
`CANDIDATE`. This record does not rewrite any historical Domain 1/2/D3-U1-U4
gate record. (No separate D3-U3/U4 gate record exists — that batch's PR
description is the durable record for that batch; not addressed or altered
here.)

## Source coverage

- **D3-U5** grounded in the supplied `tools/input/domain-3.txt`'s
  Knowledge-Statement 3B2 (Information Security Control Implementation and
  Integrations) — specifically the process-owner item ("the level of
  security required by a specific business application is determined by
  the process owner," not the system analyst, quality control manager, or
  information security manager alone). The large majority of 3B2-tagged
  questions in the raw source are deeply technical (email-transport
  encryption, preventive/detective/corrective control labeling, incident-log
  storage architecture) rather than genuinely about implementation-vs-
  integration reasoning at a management level — these were reviewed and
  deliberately excluded, mirroring the same mistagging pattern already
  documented for 3A1 (D3-U1) and now 3B2.
- **D3-U6** grounded in 3B3 (Information Security Control Testing and
  Evaluation) — specifically the virus-definition-files item (a
  virus-detection tool's effectiveness depends on current signature files,
  not on whether the software is merely installed and running) and the
  residual-risk-sufficiency reasoning already established in Domain 2. As
  with 3B2, most 3B3-tagged material in the raw source is deeply technical
  (black-box penetration testing, source-code review for back doors,
  vulnerability scanning) and was excluded as out of scope for a
  management-level CISM treatment.

## Unit learning goals

- **D3-U5**: a control can be fully implemented — deployed, documented,
  installed — without being genuinely integrated into the business process
  it protects; integration means the control operates inside real workflow,
  at the point the risk actually occurs, rather than as a separate,
  parallel, security- or compliance-only activity alongside it.
- **D3-U6**: evidence of implementation (installed, documented, completed,
  deployed) is not evidence of effectiveness; effectiveness requires
  evidence of the specific outcome the control was selected to produce, and
  any gap a genuine evaluation reveals becomes residual risk the enterprise
  must decide whether to accept (direct recall of Domain 2's
  `concept.d2.residual-risk-acceptability`).

## Meridian Manufacturing story progression

Continues directly from D3-U4's control-design decision. D3-U5: Meridian
selected a dual-approval control for vendor payments at the newly acquired
Aldergate plant, but the finance team's real approvals still happen entirely
in its own spreadsheet while a separate, disconnected compliance form is
filed alongside it — resolved by embedding dual approval directly into the
finance team's own payment process. D3-U6 continues the same control
forward: Meridian's first formal evaluation of that now-embedded
dual-approval control finds that several "second approvals" were granted
within seconds of the first (consistent with the same approver clicking
twice, not independent review) — resolved by demanding evidence of genuine
independent review, not merely two log entries, and recognizing the gap as
residual risk to be evaluated against Meridian's accepted risk level. The
story remains business-centered throughout — no OT/ICS, network-engineering,
or technical-configuration content in either unit (verified by an automated
forbidden-term test in both units).

## Families / questions authored

| Unit | Concept | Family | Variants |
|---|---|---|---|
| D3-U5 | `concept.d3.control-implementation-integration` | `family.d3.control-implementation-integration` | `question.d3.0014` (Meridian/Aldergate anchor), `question.d3.0015` (hospital-network access-review transfer), `question.d3.0016` (professional-services-firm HR-offboarding transfer, reusing Pattern P09's own approved offboarding example) |
| D3-U6 | `concept.d3.control-testing-evaluation` | `family.d3.control-testing-evaluation` | `question.d3.0017` (Meridian/Aldergate anchor), `question.d3.0018` (university data-loss-prevention transfer), `question.d3.0019` (retail-chain board-briefing transfer, recalling Domain 2 residual-risk-acceptability) |

6 new questions total, 2 new concepts, 2 new families, 2 new lessons — all
`CANDIDATE`, `unverified`. Domain 3 now totals 6 units (U1–U6), 12 new
questions, 6 concepts, 6 families, 6 lessons since Domain 3 began.

## Cross-domain reinforcement

- D3-U6 explicitly recalls `concept.d2.residual-risk-acceptability` (D2-U7):
  controls are adequate once residual risk is at or below the enterprise's
  accepted level, not simply because controls exist. Reached through the
  normal cumulative prerequisite/recall chain (`ancestorFamilies`), asserted
  present and unmodified by an automated test — never by sharing or reusing
  its concept id. `concept.d3.control-testing-evaluation`'s own
  `lesson.concepts` deliberately excludes the Domain 2 concept id (recalled,
  not re-taught).
- Both units reuse existing CANONICAL patterns rather than inventing new
  ones: D3-U5 reuses Pattern P09 (Security Embedded in Business Process,
  shared with Domain 2, including its own approved HR-onboarding/offboarding
  example scenario); D3-U6 reuses Pattern P07 (Implementation ≠
  Effectiveness) — per `DOMAIN-3-BLUEPRINT.md`, Domain 3's single most
  load-bearing reasoning pattern, now finally receiving its own dedicated
  unit.

## Invented-lifecycle audit

No canonical Domain 3 lifecycle is introduced. Both new families and all 6
new questions declare `lifecycle: null` and `stage: null`/`stage_target:
null`, verified by an automated test. The U4 → U5 → U6 "design → implement →
test" relationship is used only as loose, source-supported narrative
sequencing (the same control followed across three units) — never as a
taught/tested stage-location exercise, never numbered, and no `NEXT`
qualifier was introduced anywhere in this batch (automated test).

## Distractor-quality / qualifier / role-authority review

- D3-U5 distractors represent genuine CISM reasoning traps: adding more
  oversight/audits around a control instead of embedding it
  (`distractor-temptation:duplicate-parallel-process`), assuming a control
  works because two disconnected activities were both completed, and
  positioning ongoing control operation with a role outside the process
  rather than the process owner.
- D3-U6 distractors represent the activity/existence-as-effectiveness trap
  in several distinct forms per variant: an activity count
  (`distractor-temptation:activity-and-configuration-as-effectiveness`),
  configuration/installation confirmation, training-completion counts,
  policy documentation, and cost/compliance-alignment substituted for
  outcome evidence
  (`distractor-temptation:cost-and-compliance-as-sufficiency`) — each
  automatically asserted present via the shared `wrongOptions.some(...)`
  check in `domain3-u5-u6.test.mjs`.
- No repair-target misuse of the kind found and fixed in D3-U1/U2
  (`repair.role-error` hardcoded to an unrelated Domain 1 scenario): all 18
  incorrect options across both families route through generic,
  domain-agnostic repair categories (`repair.business-context-error`,
  `repair.decision-error`, `repair.knowledge-gap`, `repair.vocabulary-error`)
  — confirmed both by inspection and by rendering the actual Repair screens
  during evidence capture.
- Qualifiers used: BEST (6/6) — source-appropriate per the approved
  architecture's qualifier-frequency finding; `NEXT` is absent from this
  batch (automated test).
- `role_target` is `null` on both new families because the tempting
  wrong-basis distractor shape varies by variant rather than pointing at one
  fixed role; no question in this batch sets `primary_role` (the reasoning
  target throughout is basis-based — what evidence/embedding is required —
  not role-identification-based).

## No defect found requiring a fix in this batch

Unlike D3-U1/U2 (which required a real `repair_target` fix caught during
evidence-first review), rendering both units' full Recall → Learn → Apply →
Feedback → Repair flow, plus a second-visit Apply revisit and Explore/
Practice discovery, surfaced no defect. Repair screens for both units
correctly draw a contextualized sibling variant from the questions'
respective own family, matching the mistake actually made.

## CANDIDATE status confirmation

All 2 concepts, 2 families, 2 lessons, and 6 questions are `content_status:
"CANDIDATE"`, `verification_status: "unverified"`, carrying a `note` field
documenting CANDIDATE/authorship status — enforced by the existing,
domain-agnostic `status-governance.test.mjs` and `provenance.test.mjs`
suites. No entity in this batch, or in Domain 3 so far, is `CANONICAL`.

## Production integration

Domain 3 U5/U6 content integrates through the exact same structures every
prior domain/unit uses —
`content/production/{concepts,families,lessons,questions}.json` loaded by
`app/src/content/registry.ts`, resolved by `resolve.ts`, served by
`productionContentSource.ts`. **Zero learning-mode code was modified**:
`explore.ts`, `practice.ts`, `reinforcement.ts`, `QuestionAttemptFlow.tsx`,
`selection.ts`, and `answerOrder.ts` are byte-for-byte unchanged.
`app/src/App.tsx`'s dev-only QA "today's lesson" review-lesson list gained
two entries (D3-U5, D3-U6 labels) — the same one-line-per-lesson data
addition every prior unit's authoring batch made to that list; not
learning-mode logic.

One pre-existing content-production test was narrowed rather than removed:
`domain3-u3-u4.test.mjs`'s own "no unit beyond U1-U4" batch-boundary guard is
superseded now that D3-U5/U6 legitimately exist (the new
`domain3-u5-u6.test.mjs` owns the current "U1-U6 only, no U7+" boundary
assertion) — mirroring the exact precedent already established when the
U1/U2 boundary was narrowed after U3/U4. `family-integrity.test.mjs`'s
expected-active-variant-count map gained the two new families (3 each);
neither change is a net-new test, and no existing assertion was weakened.

## Daily Study / Explore / Practice / Reinforcement discovery

Verified directly in a real rendered browser session (not inference); see
`/Users/demetrius/Downloads/cism-domain3-u5-u6-review.png` for the composed
evidence contact sheet (14 screenshots).

- **Daily Study**: selecting either D3-U5 or D3-U6 via the QA review-lesson
  panel renders a full, correct Recall → Learn → Apply → Feedback → Repair
  flow with Meridian Manufacturing content, exactly like every prior unit.
  A second, no-reload revisit to D3-U5's Apply screen correctly rotates to
  a different sibling variant (screenshot 11).
- **Explore**: "Security Program" continues to list all six Domain 3
  concepts, including both new ones, with zero code changes to `explore.ts`.
- **Practice**: "Security Program" continues to appear as a scope option
  alongside Foundation/Governance/Risk Management, with zero code changes
  to `practice.ts`.
- **Reinforcement**: unchanged, generic architecture — not separately
  exercised by this batch's evidence capture (structurally unaffected, since
  it operates purely on exposure history and family/variant resolution,
  both domain-agnostic).

## Evidence-first review

One continuous, real-browser walkthrough (D3-U5 Recall → Learn → Apply →
incorrect Feedback → Repair, then D3-U6 Recall → Learn → Apply → incorrect
Feedback → Repair, then a second D3-U5 Apply visit to confirm sibling
rotation, then Explore, then Practice, then a mobile Apply screen) was
captured as 14 screenshots and composed into one local contact sheet for
Architect review — not committed, not published:
`/Users/demetrius/Downloads/cism-domain3-u5-u6-review.png`

## Deferred / not touched

D3-U7 onward (not authored this batch); Domain 4; learning-mode architecture
(Explore/Practice/Reinforcement/shared Repair — all closed per Phase 10B-5);
`selection.ts`/`answerOrder.ts`; persistence; confidence adaptation;
Adaptive Reinforcement; BUG-001/002/003 (all still correctly `Open`,
untouched); Foundation/Domain 1/Domain 2 production curriculum
(byte-for-byte unchanged, confirmed via diff and via the full historical
Domain 1/2 test suites still passing unmodified); D3-U1 through D3-U4
(byte-for-byte unchanged aside from the single superseded batch-boundary
assertion in `domain3-u3-u4.test.mjs`, itself not a content change).

## Validation

Content-production 264/264 (293 pre-existing minus the one superseded
batch-boundary assertion, plus 29 new tests in `domain3-u5-u6.test.mjs`, and
`family-integrity.test.mjs`'s variant-count map gaining two entries — neither
a net-new test); legacy `tests/data-integrity`+`tests/data-model` pass aside
from the pre-existing, registered `todo` (BUG-003, unchanged, confirmed to
reproduce identically on the unmodified `main` baseline); Vitest 200/200
(unchanged by this batch); TypeScript clean; production build succeeds;
Chromium 43/43 and Firefox 43/43 e2e/accessibility; visual regression 32/32
unchanged (no CSS/markup changed — confirmed, no baseline updated); `npm
audit --audit-level=moderate` 0 vulnerabilities. The ad hoc, non-canonical
`node --test tests/` (whole-directory-argument) invocation fails locally
under Node v26.5.1 for both this batch and the unmodified `main` baseline
alike — a local Node-version quirk unrelated to this batch, not reproduced
under CI's actual Node 20 + per-directory invocation
(`node --test tests/data-integrity/ tests/data-model/` and
`node --test tests/content-production/`, per `.github/workflows/ci.yml`).
