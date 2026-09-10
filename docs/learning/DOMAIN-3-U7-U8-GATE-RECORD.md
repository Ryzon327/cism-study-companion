# Phase Gate Record — Domain 3, D3-U7 & D3-U8

**Status: [CANONICAL record of what happened]**. This is the durable record
of the fourth Domain 3 production authoring batch: D3-U7 (Security
Awareness & Training) and D3-U8 (Managing External Services), built per the
approved
[`DOMAIN-3-CURRICULUM-ARCHITECTURE.md`](DOMAIN-3-CURRICULUM-ARCHITECTURE.md)
and the Architect's D3-U7/U8 authoring directive. All new content remains
`CANDIDATE`. This record does not rewrite any historical Domain 1/2/D3-U1-U6
gate record.

## Architect review decision

Following Evidence-First review of the 13-panel review artifact
(`/Users/demetrius/Downloads/cism-domain3-u7-u8-review.png`, described
below under Evidence-first review), the Architect recorded:

- D3-U7 (Security Awareness & Training): **APPROVED**.
- D3-U8 (Managing External Services): **APPROVED**.
- Curriculum reasoning, Recall → Learn → Apply → Feedback → Repair
  rendering, near-transfer Repair behavior, Explore integration, Practice
  integration, and the representative mobile experience: all **PASS**.
- Founder UAT: **WAIVED** under the Evidence-First UAT model.
- No redesign or curriculum re-authoring was requested.
- D3-U9/U10 and Domain 4 remain explicitly out of scope for this phase.

## Source coverage

- **D3-U7** grounded in the supplied `tools/input/domain-3.txt`'s
  Knowledge-Statement 3B4 (Information Security Awareness and Training):
  the BEST metric for training effectiveness is an increase in reported
  incidents, not a completion rate, password-reset count, or
  access-violation count; the PRIMARY objective of awareness is to
  influence employee behavior, not merely ensure policy is read; role-
  specific/customized training is repeatedly identified as the MOST
  effective delivery method; awareness/training must be renewed because
  threats change constantly; end-user awareness is repeatedly identified
  as the BEST defense against phishing/social engineering, ahead of
  purely technical controls; active awareness programs PRIMARILY
  influence residual risk. Unlike 3B2/3B3 (D3-U5/U6), this sub-area's raw
  source material is already almost entirely management-level throughout
  — no mistagged deep-technical items required wholesale exclusion. One
  item (a live social-engineering phone-verification callback procedure)
  was excluded as incident-response/verification procedure rather than
  awareness-program design or evaluation, and is out of scope for this
  unit rather than silently folded in.
- **D3-U8** grounded in 3B5 (Management of External Services): ownership/
  responsibility for the adequate protection of data stored at a third
  party remains with the outsourcing enterprise; information security
  should be involved from when requirements are being established, not at
  contract negotiation or later; a periodic, independent audit/review is
  repeatedly identified as the MOST effective compliance mechanism, ahead
  of contracts, SLAs, penetration testing, or provider claims/
  certifications; once a vendor contract is signed, the security
  manager's NEXT step is establishing ongoing vendor monitoring (a
  genuine source-supported sequencing item); when a long-standing vendor
  disappoints senior management, the FIRST step is confirming the
  agreement itself still reflects current business requirements, before
  assessing vendor capability or automating reporting.

## Unit learning goals

- **D3-U7**: awareness (the ongoing, broad effort to keep every employee
  conscious of expected behavior) and training (role-specific skill-
  building, most effective when customized to the audience) are related
  but distinct; delivering either is an activity, not evidence of
  effectiveness; the program must be evaluated by behavior change or risk
  reduction, and technical controls do not eliminate the need for this
  people/process work.
- **D3-U8**: outsourcing the performance of a service does not outsource
  accountability for its business outcome; security requirements belong
  at the start of the vendor relationship; a contract, SLA, or provider
  claim/certification is not itself the ongoing assurance the enterprise
  needs — independent verification is (direct extension of Domain 1's
  `concept.d1.authority-accountability`).

## Meridian Manufacturing story progression

Continues directly from D3-U5/U6's dual-approval payment control at the
Aldergate plant. D3-U7: Meridian runs a phishing simulation across
Aldergate's finance team — the same team operating that control — and
finds a high click rate on a simulated vendor-payment-change email;
resolved by securing senior leadership's support for a redesigned,
role-specific program judged by actual behavior change, not by repeating
the same generic module. D3-U8 continues the integration story forward:
Meridian signs a contract with a new external IT-support vendor for
Aldergate, and the information security manager recognizes that the
contract alone does not protect Aldergate — establishing ongoing,
independent vendor monitoring is the real next step, because Meridian
remains accountable regardless of who performs the work. The story stays
business-centered throughout — no deep technical training-platform or
vendor-security-tooling content in either unit (verified by an automated
forbidden-term test in both units).

## Families / questions authored

| Unit | Concept | Family | Variants |
|---|---|---|---|
| D3-U7 | `concept.d3.awareness-training-effectiveness` | `family.d3.awareness-training` | `question.d3.0020` (Meridian/Aldergate anchor, FIRST-step leadership-support), `question.d3.0021` (hospital clinical-workstation transfer), `question.d3.0022` (logistics warehouse-supervisor transfer) |
| D3-U8 | `concept.d3.external-services-accountability` | `family.d3.external-services` | `question.d3.0023` (Meridian/Aldergate anchor, NEXT-step vendor monitoring), `question.d3.0024` (university outsourced-hosting transfer, FIRST-step requirements-currency), `question.d3.0025` (retail-chain payroll-outsourcing transfer, recalling Domain 1 accountability) |

6 new questions total, 2 new concepts, 2 new families, 2 new lessons — all
`CANDIDATE`, `unverified`. Domain 3 now totals 8 units (U1–U8), 18 new
questions, 8 concepts, 8 families, 8 lessons since Domain 3 began.

## Cross-domain reinforcement

- D3-U8 explicitly recalls `concept.d1.authority-accountability` and
  `concept.d1.data-ownership` (both Domain 1): accountability for a
  business outcome stays internal even when performance of the
  underlying work does not. Reached through the normal cumulative
  prerequisite/recall chain (`ancestorFamilies`), asserted present and
  unmodified by an automated test — never by sharing or reusing their
  concept ids. `concept.d3.external-services-accountability`'s own
  `lesson.concepts` deliberately excludes both Domain 1 concept ids
  (recalled, not re-taught). The chain also confirms
  `family.d2.risk-control-ownership` (Risk Owner vs. Control Owner) and
  `family.d2.residual-risk-acceptability` remain reachable.
- Both units reuse existing CANONICAL patterns rather than inventing new
  ones: D3-U7 reuses Pattern P07 (Implementation ≠ Effectiveness, already
  Domain 3's load-bearing pattern per D3-U6) for a distinct reasoning
  target — training delivery vs. behavior change, not control-testing —
  per the Architect's explicit instruction not to simply repeat U6. D3-U8
  reuses Pattern P02 (Authority Follows Accountability, established in
  Domain 1 and already reused in D3-U2), applied here to relationships
  that cross the enterprise's own boundary.

## Invented-lifecycle audit

No canonical Domain 3 lifecycle is introduced. Both new families and all 6
new questions declare `lifecycle: null` and `stage: null`/`stage_target:
null`, verified by an automated test. Two genuinely source-grounded
sequencing qualifiers are used — `qualifier.first` (D3-U7's "obtain
leadership support FIRST" item, D3-U8's "confirm requirements are current
FIRST" item) and `qualifier.next` (D3-U8's "establish vendor monitoring
NEXT" item, copied directly from the source's own "contract just signed
... NEXT" stem) — both reproduced from explicit source language, not
invented, and neither carries a lifecycle or stage. This differs from
D3-U5/U6, where no such source-grounded FIRST/NEXT item existed; the
batch's own test documents this distinction rather than silently reusing
the prior batch's "MOST/BEST only" assertion.

## Distractor-quality / qualifier / role-authority review

- D3-U7 distractors represent genuine CISM reasoning traps: a completion-
  rate or signed-acknowledgment substituted for behavior evidence, a
  generic one-size-fits-all repeat/extension substituted for role-specific
  content, a premature policy update, and a purely technical fix (email
  filtering, session-timeout software) substituted for confirming or
  changing the underlying behavior — each avoiding the "just send annual
  training again" / "buy another tool" strawman by making the distractor
  plausible on its own terms.
- D3-U8 distractors represent the accountability-transfer and contract-
  as-assurance traps in distinct forms per variant: concluding
  obligations are satisfied because a contract legally requires security,
  sequencing errors (NDA/SLA steps out of order, assessing vendor
  capability before confirming requirements are current), an indemnity/
  liability sign-off mistaken for reduced likelihood, and a provider's own
  certification or policy copy mistaken for the enterprise's own
  assurance — each automatically asserted present via the shared
  `wrongOptions.some(...)`/contract-vs-assurance checks in
  `domain3-u7-u8.test.mjs`.
- No repair-target misuse: all 24 incorrect options across both families
  route through generic, domain-agnostic repair categories
  (`repair.business-context-error`, `repair.decision-error`,
  `repair.sequence-error`, `repair.knowledge-gap`,
  `repair.technical-vs-management-error`) — confirmed both by inspection
  and by rendering the actual Repair screens during evidence capture.
- Qualifiers used: MOST (`question.d3.0021`, `question.d3.0022`) and BEST
  (`question.d3.0025`) — 3/6; FIRST (`question.d3.0020`,
  `question.d3.0024`) — 2/6; NEXT (`question.d3.0023`) — 1/6. Every
  FIRST/NEXT usage is genuine, source-grounded sequencing text, not
  lifecycle position, and carries no lifecycle/stage (automated test).
- `role_target` is `null` on both new families because the tempting
  wrong-basis distractor shape varies by variant rather than pointing at
  one fixed role; no question in this batch sets `primary_role`.

## No defect found requiring a fix in this batch (one authoring-time defect self-caught and fixed)

Length-bias self-check: while authoring `family.d3.awareness-training`,
the project's own `variation-quality.test.mjs` length-bias detector
correctly flagged that the correct option was the longest option in all 3
of the family's variants (a systematic answer-length tell — exactly the
kind of defect the Architect's brief explicitly warned against). This was
caught before evidence capture, not discovered afterward: one distractor's
wording (`question.d3.0021`, option D) was lengthened without changing its
meaning so the correct option is no longer the longest in every variant.
No other defect was found rendering both units' full Recall → Learn →
Apply → Feedback → Repair flow, plus Explore and Practice discovery, and a
representative mobile Apply screen.

## CANDIDATE status confirmation

All 2 concepts, 2 families, 2 lessons, and 6 questions are `content_status:
"CANDIDATE"`, `verification_status: "unverified"`, carrying a `note` field
documenting CANDIDATE/authorship status — enforced by the existing,
domain-agnostic `status-governance.test.mjs` and `provenance.test.mjs`
suites. No entity in this batch, or in Domain 3 so far, is `CANONICAL`.

## Production integration

Domain 3 U7/U8 content integrates through the exact same structures every
prior domain/unit uses —
`content/production/{concepts,families,lessons,questions}.json` loaded by
`app/src/content/registry.ts`, resolved by `resolve.ts`, served by
`productionContentSource.ts`. **Zero learning-mode code was modified**:
`explore.ts`, `practice.ts`, `reinforcement.ts`, `QuestionAttemptFlow.tsx`,
`selection.ts`, and `answerOrder.ts` are byte-for-byte unchanged.
`app/src/App.tsx`'s dev-only QA "today's lesson" review-lesson list gained
two entries (D3-U7, D3-U8 labels) — the same one-line-per-lesson data
addition every prior unit's authoring batch made to that list; not
learning-mode logic.

Two pre-existing content-production tests were narrowed rather than
removed, mirroring the exact precedent from every prior batch transition:
`domain3-u5-u6.test.mjs`'s own "no unit beyond U1-U6" batch-boundary guard
is superseded now that D3-U7/U8 legitimately exist (the new
`domain3-u7-u8.test.mjs` owns the current "U1-U8 only, no U9+" boundary
assertion). `family-integrity.test.mjs`'s expected-active-variant-count
map gained the two new families (3 each). Neither change is a net-new
test, and no existing assertion was weakened.

## Daily Study / Explore / Practice / Reinforcement discovery

Verified directly in a real rendered browser session (not inference); see
`/Users/demetrius/Downloads/cism-domain3-u7-u8-review.png` for the composed
evidence contact sheet (13 screenshots).

- **Daily Study**: selecting either D3-U7 or D3-U8 via the QA review-lesson
  panel renders a full, correct Recall → Learn → Apply → Feedback → Repair
  flow with Meridian Manufacturing content, exactly like every prior unit.
- **Explore**: "Security Program" continues to list all eight Domain 3
  concepts, including both new ones, with zero code changes to `explore.ts`.
- **Practice**: "Security Program" continues to appear as a scope option
  alongside Foundation/Governance/Risk Management, with zero code changes
  to `practice.ts`.
- **Reinforcement**: unchanged, generic architecture — not separately
  exercised by this batch's evidence capture (structurally unaffected,
  since it operates purely on exposure history and family/variant
  resolution, both domain-agnostic).

## Evidence-first review

One continuous, real-browser walkthrough (D3-U7 Recall → Learn → Apply →
incorrect Feedback → Repair, then D3-U8 Recall → Learn → Apply → incorrect
Feedback → Repair, then Explore, then Practice, then a mobile Apply screen)
was captured as 13 screenshots and composed into one local contact sheet
for Architect review — not committed, not published:
`/Users/demetrius/Downloads/cism-domain3-u7-u8-review.png`

## Deferred / not touched

D3-U9/U10 onward (not authored this batch); Domain 4; learning-mode
architecture (Explore/Practice/Reinforcement/shared Repair — all closed
per Phase 10B-5); `selection.ts`/`answerOrder.ts`; persistence; confidence
adaptation; Adaptive Reinforcement; BUG-001/002/003 (all still correctly
`Open`, untouched); Foundation/Domain 1/Domain 2 production curriculum
(byte-for-byte unchanged, confirmed via diff and via the full historical
Domain 1/2 test suites still passing unmodified); D3-U1 through D3-U6
(byte-for-byte unchanged aside from the single superseded batch-boundary
assertion in `domain3-u5-u6.test.mjs`, itself not a content change).

## Validation

Content-production 294/294 (previously 264, minus the one superseded
batch-boundary assertion, plus 31 new tests in `domain3-u7-u8.test.mjs`,
and `family-integrity.test.mjs`'s variant-count map gaining two entries —
neither a net-new test); legacy `tests/data-integrity`+`tests/data-model`
111/0/3-todo, unchanged (BUG-001/002/003, unchanged, confirmed to
reproduce identically); Vitest 200/200 (unchanged by this batch);
TypeScript clean; production build succeeds; Chromium 43/43 and Firefox
43/43 e2e/accessibility (unchanged — no new e2e specs); visual regression
32/32 unchanged (no CSS/markup changed — confirmed, no baseline updated);
`npm audit --audit-level=moderate` 0 vulnerabilities. The ad hoc,
non-canonical `node --test tests/` (whole-directory-argument) invocation
fails locally under Node v26.5.1 for both this batch and the unmodified
`main` baseline alike — a local Node-version quirk unrelated to this
batch, not reproduced under CI's actual Node 20 + per-directory invocation
(`node --test tests/data-integrity/ tests/data-model/` and
`node --test tests/content-production/`, per `.github/workflows/ci.yml`).
