# Phase 6B Gate Record — Production Content Infrastructure + First Candidate Vertical Slice

**Status: [CANONICAL record of what happened; the curriculum content it
describes is CANDIDATE, not canonical]**. This is the durable record of
Phase 6B's human experience gate, per the same pattern established in
[`docs/design-system/PHASE-5B-GATE-RECORD.md`](../design-system/PHASE-5B-GATE-RECORD.md).
It records outcomes and forward-looking product requirements, not
implementation narrative.

## What was built

The production-content boundary approved in Phase 6A was established:
`content/production/{concepts,lessons,questions}.json`, a registry-backed
loader/resolver (`app/src/content/`), and a `DailyStudyContentSource`
abstraction so `DailyStudySession` orchestrates a session without ever
naming a specific lesson or question — the same component runs identically
against the Phase 5B prototype fixtures or real production content.

The first candidate vertical slice covers exactly **Foundation → early
Domain 1**: one Foundation lesson (qualifier recognition), one Domain 1
lesson (authority follows accountability, `pattern.p02`/`p03`), and their
retrieval questions, linked by an explicit `prerequisites` chain that makes
taught-before-tested and recall-eligibility structurally enforceable rather
than author-remembered — proven by a dedicated 36-test
[`tests/content-production/`](../../tests/content-production/) suite, kept
separate from `tests/data-model/` (which validates `schema/example/`, still
test-only and untouched).

## Human Experience Gate

**Result: APPROVED.** The founder ran the full production-content path —
Home → dev-only content-source toggle → Start Today's Study → Recall →
Learn → Apply → Feedback → Repair → Completion → Home — using the real
production-content architecture, not fixtures. Feedback: the flow works
correctly, feels great, and preserves the calm/simple experience Phase 5B
established. No blocking learning-experience issue was identified.

## Known limitation — accepted for this phase

The founder encountered the same questions across repeated sessions. This
is an accepted, expected consequence of Phase 6B's intentionally tiny
two-question pool and the explicit decision not to add persistence yet —
not a defect in the architecture built.

## Forward-looking product requirement: concept repetition vs. exact-question repetition

Recorded here as a binding requirement for the appropriate later
question-selection/persistence phase — **not implemented now**:

The finished system must distinguish **concept repetition** (desirable —
important CISM reasoning patterns should keep returning through cumulative
recall and reinforcement) from **exact-question repetition** (should be
controlled). The system should eventually support multiple question
variants/families testing the same underlying concept through different
scenarios, with desired behavior:

```
learn concept → apply with a variant → later recall using another variant
→ struggling concepts return sooner → stronger concepts become increasingly spaced
```

This requirement must not be solved by naive randomization or by generating
arbitrary additional questions — it requires the `QuestionFamily` entity
already named in `docs/data-model/ENTITY-MODEL.md` (seeded with zero rows
in Phase 3, deliberately) plus real exposure-history evidence, which
requires persistence. Both remain explicitly deferred.

## Explicitly deferred, unchanged by this phase

- Persistence, localStorage, IndexedDB, backend, authentication, analytics, AI integration — none introduced.
- Promotion of any Phase 6B entity to `CANONICAL` — all five remain `CANDIDATE`.
- BUG-001/002/003 — unchanged, still open, still `todo`.
- Domain 2/3/4 production content, and any broader Domain 1 migration.
- `schema/example/` — untouched, still test-only.
- The Phase 5B prototype fixtures and old legacy prototype — both intact and fully functional.
