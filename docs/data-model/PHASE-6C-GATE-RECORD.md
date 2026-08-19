# Phase 6C Gate Record — Question Families, Recall, and Repetition Architecture

**Status: [CANONICAL record of what happened; the curriculum content it
describes is CANDIDATE, not canonical]**. This is the durable record of
Phase 6C's human experience gate, per the same pattern established in
[`PHASE-6B-GATE-RECORD.md`](./PHASE-6B-GATE-RECORD.md) and
[`../design-system/PHASE-5B-GATE-RECORD.md`](../design-system/PHASE-5B-GATE-RECORD.md).
It records outcomes and forward-looking product requirements, not
implementation narrative — see
[`SCHEMA-QUESTION-FAMILY.md`](./SCHEMA-QUESTION-FAMILY.md) and
[`REPETITION-AND-RECALL-MODEL.md`](./REPETITION-AND-RECALL-MODEL.md) for
that.

## What was built

Directly answers the forward-looking requirement Phase 6B recorded: the
`QuestionFamily` entity (seeded with zero rows in Phase 3) is now populated
with two `CANDIDATE` families — `family.foundation.qualifier-recognition`
and `family.d1.authority-accountability-decision` — each carrying exactly
three question variants that test the same invariant reasoning through
meaningfully different scenarios. A pure, deterministic selection engine
(`app/src/content/selection.ts`) plus an in-memory exposure-history
singleton (`app/src/content/exposureStore.ts`) implement the
unseen-before-seen policy with least-recently-seen fallback and
deterministic tie-break. `DailyStudySession` remains fully generic — it
still never names a lesson, question, family, or selection mechanic.

## Human Experience Gate

**Result: PASSED.** The founder ran repeated production Daily Study
sessions in one browser session, without reloading. Observed behavior
matched the approved architecture exactly:

- Session 1 → Variant A
- Session 2 → Variant B
- Session 3 → Variant C
- Session 4 → returned to an earlier variant, correctly, once the
  three-variant family was exhausted

No functional issues were reported. The fourth-session repeat was
understood and accepted as the intended deterministic fallback, not a
defect.

## Approved learning-design principle: concise but fruitful

The founder's feedback on lesson style, recorded here as a binding
curriculum-design principle for all future phases:

**Lesson length is not a quality metric.** A short lesson is desirable
when it teaches the important CISM concept, explains the CISM management
perspective, exposes the relevant reasoning pattern, provides sufficient
context, identifies the important trap, allows immediate application, and
produces the desired "Ahh, now I understand" realization. Lessons must
not be lengthened merely to appear more substantial. The target
characteristic is **concise but fruitful** — protect this as the
curriculum expands.

## Explicitly deferred, unchanged by this phase

- Persistence, `localStorage`, `IndexedDB`, backend, authentication, analytics, AI integration — none introduced. Exposure history is in-memory only and resets on browser reload — an accepted, disclosed limitation of this phase, not a defect.
- Promotion of either family, or any of the six questions, to `CANONICAL` — all remain `CANDIDATE`.
- BUG-001/002/003 — unchanged, still open, still `todo`.
- Spacing bands (`SOON`/`LATER`/`STABLE`) and confidence-signal classification exist as pure, tested types/functions but are not wired into live selection — the two-family slice never has more than one eligible target to prioritize among.
- Domain 2/3/4 production content, broader Domain 1 migration, and expansion beyond these two families.
- `schema/example/` — untouched, still test-only.
- The Phase 5B prototype fixtures — intact and fully functional, confirmed by E2E.
