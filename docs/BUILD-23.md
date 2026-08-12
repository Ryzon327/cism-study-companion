# Build 23 — Daily Study question variety

Daily Study served the same application questions every session.

## Cause

Two independent problems.

**The pool was tiny.** `applicationQuestions()` read only
`window.CISMMixedPractice.questions` — the 20 bundled questions. Domain 1 has
five of them. The imported local question set was wired into the exam bank in
Build 18 but never into Daily Study, so the guided path never saw it.

**Selection was deterministic.** Questions were ordered concept-matched first,
then everything else, and taken with `.slice(0, 3)`. With no shuffling and no
recency check, the same three questions came back indefinitely.

| Domain 1 pool | Before | After |
| --- | --- | --- |
| Available questions | 5 | 201 |
| Distinct questions served per session | 3 (always the same 3) | 3 of 201 |

## Fix

The pool is now bundled curriculum-tagged questions plus any locally imported
questions for the current domain.

Selection walks tiers in curriculum order — questions on today's concept first,
then questions on concepts already taught, then same-domain filler — and within
each tier prefers questions not answered in the last 40 daily attempts, then
shuffles. Curriculum alignment is preserved: taught material is always exhausted
before filler is used.

Recency is derived from `daily:`-prefixed attempts already recorded in mixed
practice history, so no new storage key was needed.

## Note on filler

Same-domain filler can include a concept not yet formally taught. This is a
deliberate trade: without it a session cannot be filled at all once
curriculum-tagged questions run out, which is what produced the repetition. The
learner is already inside that domain, and curriculum-aligned questions always
take precedence.
