# Phase 7B-1 Gate Record — Domain 1 Governance & Authority Curriculum

**Status: [CANONICAL record of what happened; the curriculum content it
describes is CANDIDATE, not canonical]**. This is the durable record of
Phase 7B-1's human experience gate, per the same pattern established in
[`../data-model/PHASE-6C-GATE-RECORD.md`](../data-model/PHASE-6C-GATE-RECORD.md)
and [`../design-system/PHASE-5B-GATE-RECORD.md`](../design-system/PHASE-5B-GATE-RECORD.md).
It records outcomes and forward-looking curriculum-quality requirements,
not implementation narrative — see [`DOMAIN-1-BLUEPRINT.md`](DOMAIN-1-BLUEPRINT.md)
and the Phase 7A architecture report for that.

## What was built

The first four learning units of Domain 1's governance/authority slice,
approved in the Phase 7A architecture report: D1-U1 (Governance vs.
Management), D1-U2 (Authority Follows Accountability — Phase 6B/6C,
integrated into this sequence), D1-U3 (The Governance Layer: Board,
Steering Committee, CISO), and D1-U4 (Data Ownership & Information Asset
Accountability). Three new `QuestionFamily` entities (11 new question
variants) plus U2's existing family, all `CANDIDATE`, all evidenced by the
supplied Domain 1 source material.

## Human Experience Gate

**Result: PASSED.** The founder completed the full U1 → U2 → U3 → U4
sequence — Recall → Learn → Apply → Feedback → Repair (where triggered) →
Completion, four times, using the dev-only "Today's lesson (QA)" review
control. Exact founder feedback:

> "That was a perfect run with all 4 phases. I felt the Aaahaa multiple
> times and it clicked."

This is treated as substantive curriculum validation, not merely a
functional smoke test: the experience produced the intended realization
effect described below, not just correct information delivery.

## Learning product requirements recorded from this gate

### 1. The Aha / realization effect

A successful lesson should create a moment where something previously
ambiguous becomes understandable — the learner's internal reaction of
"Ahh — now I understand what CISM is actually asking," not just having
read a correct explanation. This does **not** mean every lesson needs a
gimmick, a reveal, an animation, or an explicit "aha" UI element. It means
lesson design should expose the underlying reasoning clearly enough that
the realization happens on its own. This is now a curriculum-quality
criterion, alongside — not instead of — correctness and conciseness.

### 2. Concise but fruitful (reaffirmed)

The principle recorded in
[`../data-model/PHASE-6C-GATE-RECORD.md`](../data-model/PHASE-6C-GATE-RECORD.md)
is reaffirmed by this gate's success. Lesson length is not a quality
metric. Do not lengthen a lesson merely because more source material
exists to draw from — conciseness is a feature precisely when the learner
receives enough explanation to understand and apply the reasoning, no
more.

### 3. Reasoning over memorization

Continue teaching patterns, roles, verbs, authority, context, decision
logic, and common traps — the transferable reasoning machinery — rather
than encouraging memorization of individual questions. Question variants
exist to reinforce one reasoning target through meaningfully different
scenarios, never to expand a memorizable question bank.

### 4. The teaching loop is validated

Recall → Learn → Apply → Feedback → Repair (when necessary) → Completion
passed human testing across four consecutive units. Preserve this
interaction model unless later evidence specifically justifies a change —
this gate is not license to redesign it.

### 5. Domain 1 quality benchmark

U1–U4 now establish the human-experience quality benchmark — clarity,
brevity, calmness, reasoning depth, and the realization effect above — for
the remaining Domain 1 curriculum (U5–U9). This is a *quality* bar, not a
*structural* one: later units are not required to have identical lesson
length, structure, or variant count merely to match U1–U4.

## Explicitly deferred, unchanged by this phase

- Persistence, `localStorage`, `IndexedDB`, backend, authentication, analytics, AI integration — none introduced. The dev-only "Today's lesson (QA)" pointer is in-memory module state only, same kind as exposure history.
- Promotion of any Phase 7B-1 entity to `CANONICAL` — all remain `CANDIDATE`.
- BUG-001/002/003 — unchanged, still open, still `todo`.
- D1-U5 through D1-U9 — not implemented this phase.
- `schema/example/` — untouched, still test-only.
- The Phase 5B prototype fixtures and approved visual design — intact and unchanged.
