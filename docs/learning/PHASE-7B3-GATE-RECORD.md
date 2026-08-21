# Phase 7B-3 Gate Record — Domain 1 Legal/Regulatory Risk, Organizational Culture, and the Home/Journey Correction

**Status: [CANONICAL record of what happened; the curriculum content it
describes is CANDIDATE, not canonical]**. This is the durable record of
Phase 7B-3's human experience/visual gate, following the same pattern
established in [`PHASE-7B2-GATE-RECORD.md`](PHASE-7B2-GATE-RECORD.md) and
[`PHASE-7B1-GATE-RECORD.md`](PHASE-7B1-GATE-RECORD.md). It records
outcomes, not implementation narrative.

## What was built

Two further Domain 1 learning units, completing the nine-unit curriculum
architecture approved in Phase 7A: **D1-U8** (Legal, Regulatory &
Contractual Requirements as Risk) and **D1-U9** (Organizational Culture
and Governance — the Domain 1 capstone). 6 new question variants across 2
new `QuestionFamily` entities (3 variants each), all `CANDIDATE`. U1–U7's
prior content is unmodified — this phase is purely additive at the
content-data level (0 deleted lines across `concepts.json`,
`families.json`, `lessons.json`, `questions.json`, confirmed by diff).

Full sequence after this phase: Foundation + D1-U1 through D1-U9 — 9
lessons, 9 families, **32 questions, all `content_status: CANDIDATE`**, no
promotions to `CANONICAL`.

U8 teaches structured management reasoning about legal/regulatory/
contractual obligations — applicability and scope assessment before
treatment, correct role-verb matching (Legal/Compliance interprets, the
security manager assesses and coordinates, the accountable authority
decides), and explicitly resists "compliance is an automatic correct
answer" thinking. U9 teaches that governance effectiveness depends on
organizational culture (adoption, behavior, leadership tone/consistency),
not merely on a mandate or published policy existing — extending pattern
P07 (implementation ≠ effectiveness) to the cultural/behavioral layer.

**U8's recall deliberately reaches back to U1** (`lesson.d1.
governance-vs-management`), non-adjacent to U7 — its lesson lists U1 as
its first prerequisite specifically so Recall resurfaces governance/
management reasoning after seven intervening units, the same
"listed-first" mechanism Phase 7B-1 established for U2's recall of U1. U9
recalls U8 normally, with the full U1–U8 chain remaining cumulatively
reachable through the existing architecture — no special-case recall
selector was built for the capstone.

`taught-before-tested`, `concise-but-fruitful`, and the `Aha`/realization-
effect requirements recorded in the Phase 7B-1/7B-2 gates continue to
apply unchanged; this phase did not revisit or redesign any of them.

## Answer-position architecture

U8/U9 questions use the existing Phase 7B-2 `answerOrder.ts` system
unmodified: deterministic per-exposure display order, attempt-stable, no
`Math.random()`, semantic answer identity (correctness, rationale, repair
target) independent of display position. Directly verified against all 6
new questions: each cycles through all four A/B/C/D positions across
repeated exposures, exactly like every other production question.

## Home/Journey content-source defect, discovered during human review

The founder's Human Experience Gate walk-through of D1-U8/U9 surfaced a
real product-state defect, unrelated to curriculum quality: in Production
(candidate) mode, the polished Home/Journey screen still displayed the
old, hard-coded Phase 5B prototype state (Domain 2 current, "Residual risk
and treatment decisions") regardless of which Domain 1 lesson the QA
selector actually had active.

**Root cause:** `HomeScreen.tsx` imported `journeySteps`/`todayFocus`
directly from the Phase 5B prototype fixture file unconditionally — the
one screen that had not been wired through the `DailyStudyContentSource`
abstraction every other screen (Recall, Learn, Apply, Feedback,
Completion) already used.

**Fix:** `getHomeState()` was added to the `DailyStudyContentSource`
interface. The prototype adapter returns the original, unchanged fixture.
The production adapter derives Home/Journey state from the current QA
lesson's domain, using a small, pure, exported function
(`deriveJourneySteps`) that maps a domain id to a **generic ordered-stage
position** over the fixed six-step scaffold (Foundation → D1 → D2 → D3 →
D4 → Adaptive Reinforcement):

```
stage position < current position → "completed"
stage position = current position → "current"
stage position > current position → "upcoming"
```

**A follow-up defect** was found in the first pass of this fix: the
initial implementation marked only the current stage `"current"` and
every other stage `"upcoming"`, which left Foundation shown as upcoming
even while a Domain 1 lesson was current — semantically wrong, since
Foundation precedes Domain 1 in the curriculum sequence. The ordered
comparison above corrects this, with no per-domain conditional anywhere in
the code (proven directly: `deriveJourneySteps("domain.d2")` and
`deriveJourneySteps("domain.d3")` — domains with no authored curriculum at
all yet — both produce the correct completed/current/upcoming shape from
the same function, unmodified).

This is a **temporary QA projection of curriculum position**, not a
persisted learner-progress/mastery model — "completed" here is an ordered-
sequence fact (Domain 1 content is sequenced after Foundation), never a
claim that a real learner has actually mastered anything. No
`localStorage`, `IndexedDB`, backend, authentication, analytics, or AI was
introduced by this fix.

## Human Experience / Visual Gate

**Result: PASSED**, as reported by the founder after two rounds of manual
review (the initial Home/Journey mismatch, and the Foundation-state
follow-up correction). Per the pattern established in the 7B-1/7B-2 gates,
this is recorded as founder-reported manual review, not something this
record treats as independently re-verified by Claude Code:

- D1-U8: Foundation completed (checkmark), Domain 1 current, Domain 2+
  upcoming; Home showed "Legal, regulatory, and contractual requirements
  as risk."
- D1-U9: same Journey shape; Home correctly updated to "Organizational
  culture and governance effectiveness" with no stale U8 state observed.
- Prototype fixtures: Foundation and Domain 1 completed, Domain 2 current,
  Home correctly restored to "Residual risk and treatment decisions."
- U8/U9 curriculum continued to produce the intended Aha/realization
  effect; no curriculum redesign was requested.

## Explicitly deferred, unchanged by this phase

- Persistence, `localStorage`, `IndexedDB`, backend, authentication,
  analytics, AI integration — none introduced. The Home/Journey state is
  still QA/current-curriculum-position representation, not durable learner
  progress.
- Promotion of any entity to `CANONICAL` — all Foundation/D1-U1–U9 content
  remains `CANDIDATE`.
- BUG-001/002/003 — unchanged, still open, still `todo`.
- Domain 2 and any further phase — not started.
- `schema/example/` — untouched, still test-only.
- The Phase 5B prototype fixtures and approved visual design — intact and
  unchanged; only how `HomeScreen` *consumes* them changed (behind the
  same content-source interface every other screen already used).
- The Domain 1 end-to-end completion gate referenced in the Phase 7B-2
  gate record remains a separate, future, explicitly deferred activity —
  this record does not mark Domain 1 "complete."
