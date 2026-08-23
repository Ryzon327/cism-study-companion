# Phase 9B-3 Gate Record — D2-U5 (Risk Evaluation) and D2-U6 (Risk Treatment / Response Selection)

**Status: [CANONICAL record of what happened; the curriculum content it
describes is CANDIDATE, not canonical]**. This is the durable record of
Phase 9B-3 — the third Domain 2 production-content implementation batch,
built per the approved Phase 9A architecture
([`DOMAIN-2-BLUEPRINT.md`](DOMAIN-2-BLUEPRINT.md)) — following Phase
9B-2's merge ([`PHASE-9B2-GATE-RECORD.md`](PHASE-9B2-GATE-RECORD.md)). It
records outcomes and founder-reported feedback, not implementation
narrative.

## Scope

D2-U5 (Risk Evaluation) and D2-U6 (Risk Treatment / Response Selection)
only, per the approved Phase 9B-3 batch — the third of five implementation
batches (9B-1 through 9B-5) in the approved Domain 2 sequence. No D2-U7 or
later unit was authored. New production content: 2 concepts, 2 lessons, 2
families, 6 questions — all `CANDIDATE`.

## Implementation

- `concept.d2.risk-evaluation` / `lesson.d2.risk-evaluation` /
  `family.d2.risk-evaluation` (3 variants: `question.d2.0014`–`0016`) —
  distinguishes Analysis ("what does the risk look like") from Evaluation
  ("what does it mean to the organization"), teaches Risk Appetite vs. Risk
  Tolerance without collapsing them into identical thresholds, and
  reinforces Pattern P02 (Authority Follows Accountability) applied to
  acceptability decisions specifically. Prerequisite is
  `lesson.d2.risk-assessment-lifecycle` (D2-U2) only — D2-U5 branches
  directly off D2-U2 per the approved Phase 9A graph, not chained through
  D2-U3/D2-U4 (quantitative analysis is one analysis method, not a
  prerequisite for evaluation generally).
- `concept.d2.risk-treatment-response` / `lesson.d2.risk-treatment-response`
  / `family.d2.risk-treatment-response` (3 variants: `question.d2.0017`–
  `0019`) — teaches Avoid/Mitigate/Transfer-Share/Accept as business-fit
  decisions (Pattern P01), explicitly correcting the traps that transfer
  eliminates accountability and that acceptance is passive/unauthorized
  inaction. Prerequisite is `lesson.d2.risk-evaluation` (D2-U5). Both
  lessons continue one shared scenario anchor (a customer-facing online
  payment system) from Evaluate into Treat, carrying forward the D2-U2
  scenario-anchor learning-design finding.
- Prerequisite chain: D2-U1 → D2-U2 → {D2-U3 → D2-U4} and D2-U2 → D2-U5 →
  D2-U6 (a genuine branch, verified live: D2-U5's recall correctly
  surfaces D2-U2's family, not D2-U3/D2-U4's).
- Regression coverage added in `tests/content-production/domain2-u5-u6.test.mjs`
  (24 tests); two stale batch-boundary assertions in the Phase 9B-2 test
  file (`domain2-u3-u4.test.mjs`) were updated, since they had asserted "no
  Domain 2 unit beyond U1-U4 exists" as a Phase-9B-2-specific guard that
  Phase 9B-3 legitimately supersedes.

## Founder Human Experience Gate

**Result: PASS for both units.**

Founder-reported feedback, verbatim: *"The lesson was great."*

Recorded as the founder's reported subjective experience — Claude Code did
not and cannot independently verify a human's subjective learning
experience.

## Answer-position investigation (concern raised during this gate, resolved before closeout)

During this same review, the founder also reported a possible
learner-visible bias toward the correct answer appearing in the first
displayed position, explicitly citing the project's prior history of a
genuine fixed-first-answer defect and asking that this concern be
investigated thoroughly, not dismissed on the strength of existing tests'
passing status alone.

**Investigation performed:** the full path was traced end to end
(production content → `resolve.ts`/`productionContentSource.ts` →
`answerOrder.ts` → rendered `AnswerOption` components), verified two
independent ways that had to agree — a hand-traced replication of
`orderOptionsForDisplay`'s exact pure-function logic, and live Playwright
sessions reading the actual rendered DOM — and cross-checked against raw
`questions.json` to confirm ground truth. Real learner-visible sequences
were captured for the exact D2-U5 → D2-U6 continuous session (Recall→C,
Apply→B, Recall→C, Apply→A) and for a full D2-U1 → D2-U6 walkthrough
(B, C, C, C, B, A); an aggregate 36-exposure sample across all six D2-U5/U6
questions showed the correct answer in position A exactly 9/36 = 25.0% of
the time — matching chance for four options almost exactly, with no drift
across repeated exposures.

**Result: NOT CONFIRMED — no production defect found.** The investigation
confirmed: `orderOptionsForDisplay()` is active on both learner-visible
paths that matter (Recall and Apply); semantic correctness remains fully
independent of display position; Feedback and Repair reuse the exact
resolved, already-ordered fixture (so the order shown, evaluated, and
explained are provably the same object); exposure-based variation
functions correctly; question-selection and answer-ordering remain
architecturally independent; and the historical fixed-first-answer defect
has not returned. The founder's report is best explained as an ordinary
small-sample coincidence — a short local streak that a correctly-functioning,
statistically unbiased algorithm will naturally produce from time to time,
not a systemic bias. Quantitatively, across the ~13 adjacent lesson-to-lesson
transitions in a full curriculum walkthrough, encountering at least one
coincidental "two in a row" moment has roughly a 30–40% chance even under
perfect randomness — a single such moment is not evidence of a defect.

**Decision: no production answer-order or selection-engine change was made
or is authorized.** `app/src/content/answerOrder.ts` and
`app/src/content/selection.ts` are unmodified by this phase. Naturally
occurring short answer-position streaks remain an accepted, expected
property of the existing deterministic architecture; no session-level
anti-streak safeguard was implemented or is currently authorized. The
existing deterministic answer-order architecture remains authoritative and
unchanged.

**Regression coverage retained from the investigation:** one durable,
generic test was kept in `tests/frontend/unit/answer-order.test.ts` —
every production question's correct answer must visit more than one
display position across 8 exposures and must never be stuck at position A
for all 8 — evaluated against every real production question currently
authored (not a fixed sample), so it automatically extends to future
batches. This closes a genuine, pre-existing coverage gap: prior tests in
that file checked only 5 hardcoded Domain 1/Foundation IDs and had never
actually exercised any Domain 2 question. Two additional, narrower tests
written during the investigation (hardcoding the specific
`question.d2.0014`–`0019` IDs from this batch) were deliberately **not**
kept at closeout — they were redundant with the generic test above and
were investigation-specific artifacts rather than durable, forward-looking
protection, per the explicit instruction not to preserve a test merely
because it was created during investigation.

## Explicitly deferred / unchanged by this phase

- Domain 1 — completely unchanged.
- D2-U1 through D2-U4 — completely unchanged (all four lessons remain at
  their prior versions; all four families remain at 3 active variants
  each).
- No entity promoted to `CANONICAL` — all Domain 2 content (and all prior
  content) remains `CANDIDATE`.
- D2-U7 and all later Domain 2 units — not started; Phase 9B-4 and 9B-5
  remain future, separately-gated batches.
- Persistence, authentication, analytics, AI-integration — none
  introduced.
- Answer-position (`app/src/content/answerOrder.ts`) and selection-engine
  (`app/src/content/selection.ts`) architecture — untouched.
- `schema/example/` — untouched.
- BUG-001/002/003 — unchanged, still `todo`.
- CI architecture (`.github/workflows/ci.yml`) — untouched.

## Final validation results (this batch)

Legacy 111 pass / 3 expected `todo` · content-production 144/144 · Vitest
112/112 (selection-engine 14/14, answer-order 16/16) · TypeScript clean ·
production build succeeds · Playwright e2e 78/78 (Chromium + Firefox +
accessibility) · visual regression 32/32 · `npm audit --audit-level=moderate`
0 vulnerabilities. Total production-question count: 55 (18 Domain 2 + 34
Domain 1 + 3 Foundation). All remain `CANDIDATE`; 0 `CANONICAL`.
