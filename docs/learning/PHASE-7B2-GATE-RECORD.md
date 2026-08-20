# Phase 7B-2 Gate Record — Domain 1 Strategy, Justification & Effectiveness Curriculum

**Status: [CANONICAL record of what happened; the curriculum content it
describes is CANDIDATE, not canonical]**. This is the durable record of
Phase 7B-2's human experience gate, following the same pattern established
in [`PHASE-7B1-GATE-RECORD.md`](PHASE-7B1-GATE-RECORD.md),
[`../data-model/PHASE-6C-GATE-RECORD.md`](../data-model/PHASE-6C-GATE-RECORD.md),
and [`../design-system/PHASE-5B-GATE-RECORD.md`](../design-system/PHASE-5B-GATE-RECORD.md).
It records outcomes, not implementation narrative.

## What was built

Three further Domain 1 learning units, continuing the U1–U4 sequence
approved in Phase 7B-1: **D1-U5** (Security Strategy & Business Alignment),
**D1-U6** (Business Justification & Roadmaps), and **D1-U7** (Governance
Frameworks, GRC & Effectiveness — kept as one combined family, not split
into U7A/U7B). 9 new question variants across 3 new `QuestionFamily`
entities (3 variants each), all `CANDIDATE`. U1–U4's prior content (7
lessons, 3 families, 17 questions at the last committed HEAD) is
unmodified — this phase is purely additive at the content-data level (see
Verification, below).

Full sequence after this phase: Foundation + D1-U1 through D1-U7 — 8
lessons, 8 families, **26 questions, all `content_status: CANDIDATE`**, no
promotions to `CANONICAL`.

## Answer-position defect: discovery and correction

Direct inspection of the last committed content
(`git show HEAD:content/production/questions.json`) confirms: **all 17
previously-committed questions, and (before this phase's fix) all 26 after
this phase's content additions, had their `correct: true` option authored
at array index 0** — i.e., every question displayed its correct answer at
position A. This was not caught by any prior automated test; nothing in
the existing suite asserted anything about answer position, because
correctness was always checked by iterating `options` for `correct: true`,
never by comparing against a fixed display slot. The user, acting in the
founder role, identified this during manual review of the running app.

**Root cause:** authored content order and display order were the same
thing — there was no separate concept of "display position" independent of
the order options happened to be written in the JSON.

**Fix:** a new module, `app/src/content/answerOrder.ts`, separates
*semantic* option identity (`key` — stable forever) from *display
position* (which on-screen slot an option occupies for one exposure).
Verified properties of the implementation (read directly, and exercised by
`tests/frontend/unit/answer-order.test.ts`, 17 tests):

- Deterministic: a seeded `mulberry32` PRNG plus a Lehmer-code permutation
  index — **no `Math.random()` anywhere in the module**.
- Attempt-stable: the order is computed once per exposure (keyed by
  `questionId` + prior-exposure count) and carried forward for the rest of
  that attempt, including into Feedback/Repair — re-renders cannot change
  an in-progress attempt's order.
- Varies across later exposures: different `exposureCount` values for the
  same question can (and, cycling through all `n!` permutations, eventually
  will) produce a different display order.
- Independent of question-family/variant rotation: `answerOrder.ts` never
  looks at families or variants; `selection.ts` never looks at option
  order.
- Correctness, rationale, and repair-target mapping all travel with the
  semantic option object through reordering — never with a fixed position.
- No persistence boundary was crossed: the answer-order seed is derived
  from data already in memory (question id, in-memory exposure count); no
  new `localStorage`/`IndexedDB`/backend read or write was introduced.

Production content itself (`content/production/questions.json`) was **not
rewritten** to fix this — the authored option order is unchanged (still
index-0-correct for all 26, confirmed by direct inspection); the fix is
applied entirely at the display layer, matching the project's existing
principle of not editing production content to satisfy an implementation
concern.

## Human Experience Gate

**Result: PASSED.** The user, in the founder role, manually reviewed the
running application, including the corrected answer-position behavior, and
reported:

> "from what I can see, everything is in working order"

This covers D1-U5, D1-U6, D1-U7, the question-family rotation, the new
answer-position variation behavior, feedback behavior after answer
reordering, and the overall learner experience. Per the pattern
established in the 7B-1 gate, this is treated as substantive product
sign-off from the one person with product/curriculum authority on this
project — not an automated-test claim, and not something this record
treats as independently re-verifiable by Claude Code. It is recorded here
as reported, consistent with why a Human Experience Gate exists
independently of a green automated suite (see 7B-1's gate and
`CLAUDE.md`'s test-integrity rule): automated tests are green whether or
not a learner would actually notice the same answer sitting at "A" every
single time.

## Verification performed this session (see accompanying closeout report for full detail)

- Content diff is purely additive: 0 deleted lines across
  `concepts.json`/`families.json`/`lessons.json`/`questions.json`.
- BUG-001/002/003 unchanged, still `Open`/`todo`, unaffected by this diff's
  files.
- `schema/example/` untouched.
- No `localStorage`/`IndexedDB`/backend/auth/analytics/AI-integration
  keywords introduced (checked by diff).
- Legacy, content-production, Vitest, TypeScript, production build,
  Playwright (Chromium + Firefox, including `@a11y`), and visual-regression
  suites all run clean locally this session. `npm audit`: 0 vulnerabilities.
  Full counts and the CI-vs-local-only distinction are in the closeout
  report, not duplicated here.

## Explicitly deferred, unchanged by this phase

- Persistence, `localStorage`, `IndexedDB`, backend, authentication,
  analytics, AI integration — none introduced.
- Promotion of any Phase 7B-1 or 7B-2 entity to `CANONICAL` — all remain
  `CANDIDATE`.
- BUG-001/002/003 — unchanged, still open, still `todo`.
- D1-U8, D1-U9, and any further phase — not implemented this phase.
- `schema/example/` — untouched, still test-only.
- The Phase 5B prototype fixtures and approved visual design — intact and
  unchanged.
