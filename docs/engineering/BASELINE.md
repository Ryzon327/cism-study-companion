# Engineering Baseline

**Status: approved baseline, 2026-08-18.** This document is the durable,
committed record of the CISM Study Companion's engineering state as of
Build 26 (commit `c716cd8`), immediately before Phase 1 of a controlled
rebuild. It exists so this baseline survives outside any one AI session or
chat transcript. Every claim below is grounded in something observable in
this repository — its source files, its data files, or its git history —
not in the prose of `docs/BUILD-*.md`, which this document explicitly does
not treat as a source of truth for testing claims (see "Testing and CI
before Phase 1" below).

## Current architecture

Static, dependency-free, client-only single-page app. No build step, no
bundler, no framework (before Phase 1, no `package.json` existed at all).
`index.html` loads 14 plain `<script>` tags in a fixed, order-dependent
sequence; each script is an IIFE that attaches one `window.CISM*` global.
State persists only in `localStorage`, across nine independently-versioned
keys (`js/storage.js`). There is no shared data-access layer, no typed
schema, and no server component.

Six largely independent learner-facing modes share one global `mastery`
object: Study/Foundation (`js/study.js`, a single hardcoded lesson, separate
from Daily Study's curriculum), Daily Study (`js/daily-study.js`, the
primary curriculum-driven path), Active Practice (`js/active-learning.js`),
Mixed Practice (`js/mixed-practice.js`), Practice Exam
(`js/exam.js`), and Explore (read-only content browser in `js/app.js`).

Content is spread across four independently-authored vocabularies that are
only loosely reconciled: `data/content.js` (35 concept titles, curriculum
reference), `data/active-learning.js` (43 challenge concepts),
`data/mixed-practice.js` (20 questions), and the merged exam bank in
`data/exam-bank.js` (57 distinct concepts, combining hand-authored
questions and 72 pattern-bank scenario variants). `data/domains/*.json` and
`data/questions/domain-1-questions.json` are present but not loaded by
anything (see BUG-003).

## Testing and CI before Phase 1

**No automated test of any kind existed in this repository, or anywhere in
its git history, before Phase 1.** This was verified directly: a filesystem
search for test/spec/harness-named files returned nothing, and
`git log --all --diff-filter=A --name-only` across all 33 pre-Phase-1
commits shows no such file was ever added and later removed.

This directly contradicts prose claims made in `docs/BUILD-16-VALIDATION.md`
through `docs/BUILD-26.md`, which describe a "headless harness," specific
pass counts ("51 automated checks," "90 automated checks," "114 checks
across three suites"), and multi-day simulated journeys. None of that
tooling, or its claimed output, is reproducible from this repository. Those
documents are retained as historical record of what was *claimed*, not as
evidence of what was *verified*. Per `CLAUDE.md`, no future claim in this
project counts as regression protection unless it is a committed,
reproducible, CI-executed test — this rule exists specifically because of
this finding.

**No CI/CD configuration of any kind existed before Phase 1.** No
`.github/workflows/`, no other CI vendor config, anywhere in the repository
or its history.

## Confirmed known defects

These were reproduced directly against the Build 26 source and data files
(not inferred from documentation), and are now tracked in
`docs/regressions/REGISTRY.md` with corresponding `todo` tests in
`tests/data-integrity/`:

- **BUG-001** — The concept title `"Policy hierarchy"` is used by
  `data/active-learning.js` challenges in both Domain 1 and Domain 3.
  Because `storage.recordActiveResult()` keys the shared `mastery` object by
  bare concept title, evidence from both domains is merged into one record,
  and `conceptDomain()` (duplicated in `js/daily-study.js` and
  `js/app.js`) always resolves it to Domain 1.
- **BUG-002** — 36 of the 57 distinct concepts referenced by the merged exam
  bank have no matching entry in `data/active-learning.js`, so
  `conceptDomain()` returns `null` for them and `renderWeakChooser()` in
  `js/app.js` silently excludes them from "Weak Areas Practice" — most
  Practice-Exam-sourced weakness evidence is invisible to that feature, not
  merely misrouted.
- **BUG-003** — `data/domains/*.json` (4 files) and
  `data/questions/domain-1-questions.json` are dead: not loaded by any
  `<script>` tag, `fetch()`, or JS reference anywhere in the app. They carry
  early-build stub content self-labeled `"sample-only"` /
  `"content-engine-ready"`, superseded by `data/content.js`.

All three share the same underlying root cause: **human-readable concept
titles are used as the identity/join key for mastery evidence, across four
vocabularies that were never designed as one controlled vocabulary.** This
is a data-modeling defect, not three unrelated bugs, and its real fix is
deferred to the canonical concept-identity model (a later, separately
approved phase) rather than patched by renaming production content now.

## Important regression-risk areas

Ranked by how much undocumented, interdependent logic sits behind each, and
how many prior builds already had to re-fix adjacent breakage in the same
area:

1. **Daily Study focus/domain/concept selection** (`js/daily-study.js`) —
   rewritten across Builds 15, 16, 22, 23, 24, 25, 26; the highest-churn,
   most fragile subsystem in the codebase.
2. **Concept-to-domain resolution** (`conceptDomain()`, duplicated in two
   files) — any future content edit that adds or renames a `concept:`
   string can silently create a new collision (BUG-001-shaped) or a new
   orphaned concept (BUG-002-shaped) with zero automated signal outside the
   Phase 1 tests.
3. **Curriculum/storage migrations** (`migrateStudiedConcepts`,
   `getCurriculum`'s legacy-progress seeding) — one-shot, idempotency
   dependent, previously verified only by unreproducible prose claims.
4. **Practice Exam Review Center state machine** (`js/exam.js`) — five
   navigation modes with hand-maintained queue-cleaning logic; took four
   dedicated builds (9, 9.1, 9.2, 9.3) to stabilize originally.
5. **Answer-shuffling / rationale-index alignment**
   (`shuffleAnswers()` in `js/exam.js`) — `optionRationales` must stay
   permuted in lockstep with `options` and `correctIndex`.
6. **Import/Export round-trip** (`exportData`/`importData`/`validateImport`
   in `js/storage.js`) — the last line of defense against total data loss.

## Prototype behaviors worth preserving

Identified by direct code reading, independent of whether they were ever
test-verified — these reflect genuinely deliberate, well-reasoned design
and should inform (not necessarily survive unchanged into) the rebuild:

- The Practice Exam Review Center's explicit state machine and
  self-healing queue-cleaning (`cleanQueue()` in `js/exam.js`).
- Mixed Practice's mindset-gate → answer → feedback flow, including
  per-option rationale shown for both correct and incorrect answers, and
  the original question re-displayed at feedback time.
- `buildPlan()`'s purity discipline in Daily Study — rendering the home
  screen must never write curriculum state (the specific defect this
  discipline was introduced to fix is documented in `docs/BUILD-16.md`).
- The calm-UI, no-guilt product language: no streaks, no overdue backlog,
  an explicit stopping point presented as complete rather than incomplete.
- Corpus-calibrated exam domain weighting, derived from measured ISACA
  job-practice proportions rather than guessed.
- Careful, correct handling of answer-shuffling with rationale
  re-indexing — an easy class of bug that was avoided here.

## Architecture areas intentionally subject to redesign

Per explicit product direction, the current application is a prototype /
reference baseline, not an architecture presumed to survive:

- Bare concept-title strings as mastery-evidence identity, shared across
  four independently-authored vocabularies (root cause of BUG-001/002).
- Two independently-tracked "Foundation complete" states — the legacy
  Foundation quiz's `sessionsCompleted` counter and the curriculum engine's
  `foundationCompleted` flag — reconciled only by a one-shot heuristic
  migration.
- The absence of any shared, typed content schema across
  `data/content.js`, `data/active-learning.js`, `data/mixed-practice.js`,
  and `data/exam-bank.js`.
- `data/domains/*.json` / `data/questions/domain-1-questions.json` as
  dead weight in the active data path (BUG-003) — retained for now per
  explicit instruction not to delete without separate approval.
- The global-object-and-IIFE module architecture with no dependency
  declaration, and `js/study.js`'s single hardcoded Foundation lesson as a
  special, non-data-driven case inconsistent with every other mode.

None of the above should be read as authorization to change them —
curriculum meaning, learning-architecture decisions, and data-model
redesign are explicitly out of scope for implementation-only work. See the
Product Authority Guardrail in `CLAUDE.md`.

## Confirmed defects vs. suspected risks

Everything in "Confirmed known defects" above was reproduced directly
against the actual code and data in this repository. The following were
identified as plausible, code-supported concerns but were **not**
independently reproduced end-to-end (no browser, no live runtime execution
was performed to confirm them), and should be treated as hypotheses to
verify in a later phase, not as established defects:

- Modal overlays (`dailyOverlay`, `mixedOverlay`, `examOverlay`,
  `learningOverlay`, `targetPracticeOverlay`) are plain `<div>`s without
  `role="dialog"`/`aria-modal` or visible focus-trap logic — a plausible
  accessibility gap, unverified with assistive technology.
- `data/local/question-set.js` schema drift risk — this file is gitignored
  and was absent from the audited checkout, so its actual current shape
  could not be inspected.
- No aggregate `localStorage` quota check across all nine storage keys
  combined, only per-collection bounding.
- Browser-compatibility risk from unpolyfilled modern JS/CSS syntax,
  unverified against any specific older browser.

## How this document should be used

This is the reference point for "what was true before the rebuild began."
It should not be edited to reflect new work — new findings belong in
`docs/regressions/REGISTRY.md`, and new architecture decisions belong in
whatever documents later phases establish for that purpose. If something
here is later found to be inaccurate, correct it with a note explaining why,
rather than silently rewriting history.
