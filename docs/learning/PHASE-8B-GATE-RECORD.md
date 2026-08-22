# Phase 8B Gate Record — Domain 1 Final Readiness Audit & Distractor-Quality Correction

**Status: [CANONICAL record of what happened; the curriculum content it
describes is CANDIDATE, not canonical]**. This is the durable record of
Phase 8B — a read-only Domain 1 final-readiness audit, followed by a
narrow, approved distractor-quality correction — following the pattern
established in [`PHASE-7C-GATE-RECORD.md`](PHASE-7C-GATE-RECORD.md) and its
predecessors. It records outcomes, not implementation narrative.

## Part 1 — Read-only Domain 1 Final Readiness Audit

Before any content was modified, the complete Domain 1 curriculum (37
production questions, 11 families, Foundation + D1-U1–U9) was audited
against: source-coverage, reasoning-pattern coverage, confusing-concept
coverage, question-family coverage, taught-before-tested validation,
recall-graph validation, the question-variation architecture, the
answer-position (display) architecture, and a dedicated distractor-quality
pass checking for accidental wording clues, answer-length clues,
absolute-language clues, and any dependency on answer-position assumptions.
No files were modified during this pass.

**Finding:** the curriculum was substantively sound. One genuine,
concrete defect was found: across 7 specific questions, spanning exactly 2
of the bank's 11 families, the correct option was the single longest
option in **100% of that family's variants** —
`family.d1.governance-effectiveness` (U7: `question.d1.0022`, `0023`,
`0024` — 3/3) and `family.d1.organizational-culture-governance` (U9:
`question.d1.0028`, `0029`, `0030`, `0035` — 4/4). This is an exploitable
"pick the longest answer" shortcut, independent of and not defended
against by the answer-position randomization architecture (which only
reorders *display* position, not the underlying option text). Every other
family in the bank sat inside an ordinary 0%–66.7% range, consistent with
chance-level variation rather than a systematic tell.

**Overall recommendation returned:** READY WITH MINOR CORRECTIONS.

## Part 2 — Approved corrective fix

The founder reviewed the audit and approved a narrowly-scoped correction:
fix exactly the 7 identified questions' distractor option text, and add
durable regression protection — nothing else. No new lessons, concepts,
families, variants, or qualifiers were authorized or added.

### Implementation

21 distractor `text` fields (3 per question × 7 questions; the correct
option, `key: "a"`, was never touched in any of the 7) were revised in
`content/production/questions.json`. Each revision extends the existing,
unchanged `rationale`'s own wrong reasoning with one additional natural
clause — never introducing new reasoning that could make a distractor
arguably correct, and never touching the question stem, the correct
answer's text, `repair_target`, `family`, or any other invariant field.

| Scope | Pre-fix | Post-fix |
|---|---|---|
| Whole bank (37 questions) | 18/37 = 48.6% | 15/37 = 40.5% |
| `family.d1.governance-effectiveness` (U7) | 3/3 = 100% | 2/3 = 66.7% |
| `family.d1.organizational-culture-governance` (U9) | 4/4 = 100% | 2/4 = 50.0% |

Both corrected families now sit inside the same range every other family
in the bank already occupies (0%–66.7%) — the systematic, family-wide
100% tell is gone, and the fix was not overcorrected into an inverse "never
longest" pattern.

### Regression protection

`tests/content-production/variation-quality.test.mjs` gained a family-level
length-bias check: for any family with 3+ variants, it is blocking to have
the correct option be the strict-longest option in 100% of that family's
variants. It does not fail on any partial rate, and does not force length
parity — ordinary variation (including a family where the correct answer
is sometimes legitimately the longest) remains fully allowed. A second,
permanent test reconstructs the exact pre-fix option-length data for both
affected families as a historical fixture and asserts the same detector
would have flagged both (proof the rule is not a no-op), alongside a
mixed-length sanity case proving the detector isn't trivially always-true.

## Human Experience Gate

**Result, as reported by the founder: PASS.**

- **U7 pacing: PASS.** Founder-reported experience: *"U7 felt the same
  which is good."* Although U7 is quantitatively longer (by character
  count) than most other single-concept Domain 1 lessons, the founder did
  not experience it as noticeably longer or heavier. This is recorded as
  the founder's reported subjective experience — Claude Code did not and
  cannot independently verify a human's subjective pacing experience.
- **U7 Aha/learning experience: PASS.** No learning-content defect
  reported.
- **U7 distractor correction: PASS.** No length-based shortcut or
  artificial-padding concern reported for `question.d1.0022`, `0023`,
  `0024`.
- **U9 sufficiency: PASS.** Founder-reported experience: *"U9 is
  sufficient."* No additional U9 teaching, variants, or revisions
  required.
- **U9 distractor correction: PASS.** No length-based shortcut or
  artificial-padding concern reported for `question.d1.0028`, `0029`,
  `0030`, `0035`.
- **Domain 1 Human Experience Gate: PASS**, overall.

### Architectural decision: U7 length is accepted, not trimmed

**Decision, as directed by the founder: the optional U7 pacing trim is NOT
performed.** The existing U7 content (including the Phase 7C
policy/standard/procedure/guideline addition) is accepted as concise enough
for the intended learning experience, based on the founder's own
lived-through review, not on character count.

**Lesson-length uniformity is not itself a curriculum-quality
requirement.** The governing standard remains **concise but fruitful**: a
lesson may legitimately be longer than its siblings when the additional
length performs necessary instructional work and the learner's actual
experience of it remains concise, clear, and effective. U7 teaches two
concepts (governance effectiveness and the policy/standard/procedure/
guideline hierarchy) where most Domain 1 lessons teach one — its greater
length is proportionate to that, and the founder's direct experience
confirms it does not read as bloated in practice.

## Domain 1 Final Readiness Decision

**DOMAIN 1 FINAL READINESS: PASS.**

This determination is based on the combination of: the source-coverage
audit, the reasoning-pattern audit, confusing-concept coverage, question-
family coverage, taught-before-tested validation, recall-graph validation,
the question-variation architecture, the answer-position architecture, the
distractor-quality audit and its correction, the full automated validation
battery, and the founder Human Experience Gate above.

Domain 1 is **not** claimed to be perfect or immutable. It is recorded as
**sufficiently complete and validated for the current MVP curriculum
boundary**. Future evidence may still justify corrections through the
normal governed change process (audit → founder decision → scoped
implementation → validation → Human Experience Gate, as this phase and its
predecessors demonstrate).

## Explicitly deferred / unchanged by this phase

- Persistence, `localStorage`, `IndexedDB`, backend, authentication,
  analytics, AI integration — none introduced.
- Promotion of any entity to `CANONICAL` — all 37 production questions and
  all associated Domain 1 entities remain `CANDIDATE`. Content-status
  promotion is a separate, future, governed decision — not made by this
  phase, regardless of the readiness PASS above.
- BUG-001/002/003 — unchanged, still open, still `todo`.
- Domain 2 — not started.
- `schema/example/` — untouched, still test-only.
- Lessons, concepts, families, the prerequisite graph, the recall graph,
  the answer-order (display-position) architecture, the selection engine,
  and Home/Journey architecture — all unchanged; only 7 questions'
  distractor option text and one test file were touched.
- U1–U6 and U8 — completely unchanged (verified: prerequisites, variant
  counts, and question/lesson content identical to pre-Phase-8B state).
