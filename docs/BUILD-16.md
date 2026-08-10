# Build 16 — Taught-first integrity

Correctness build. No new learning modes, no new features, no content added for
volume. Build 15 introduced taught-first curriculum progression; this build
repairs the defects that were silently reversing it.

## 1. Rendering the home screen no longer teaches concepts

`daily-study.js` exposed `getSummary()`, which called `buildPlan()`. `buildPlan()`
wrote to storage:

```js
storage.markConceptIntroduced(d, c);
storage.setTodayStudy({ focusDomain: d, focusConcept: c });
```

`app.js` calls `getSummary()` on page load and on four separate events, so simply
looking at the home screen marked concepts as taught. Measured on a clean install,
ten renders marked all eight Domain 1 concepts introduced, `domainCoverage()`
reported complete, and the next finished session advanced the learner to Domain 2
regardless of what they had studied.

`buildPlan()` is now pure. The session writes moved into `open()`, which only runs
when the learner actually starts Daily Study.

## 2. Curriculum completion now measures real sessions

Two separate records:

- `introducedConcepts` — surfaced to the learner; drives recall and practice eligibility.
- `studiedConcepts` — written only by `open()`; the sole input to `domainCoverage()`.

A domain can no longer complete itself from page views.

### Migration (non-destructive)

`introducedConcepts` cannot be trusted retroactively, so `studiedConcepts` is
seeded once from the only trustworthy evidence available: daily records whose
`learn` phase was completed, which is written exclusively by a learner clicking
through Daily Study. Any already-completed domain is carried across whole so no
finished material is repeated.

Nothing is deleted. `introducedConcepts` is left exactly as it was. The migration
is idempotent, is skipped on fresh installs, and legacy backups without
`studiedConcepts` import cleanly.

## 3. Journey updates live again

`storage.js` dispatched `cism-curriculum-updated` on `window`; `app.js` listens on
`document`. Events fired at `window` do not reach `document`, so zero of two
arrived and the Journey only refreshed on reload. Both dispatches moved to
`document`, matching every other `cism-*` event in the app.

## 4. Two unanswerable lifecycle questions

In Daily Study the answer buttons are the domain's stages from `content.js`. Two
exercises answered with values from the coarse Mixed Practice lifecycle taxonomy
instead, so no button could ever match:

| Domain | Was | Now |
| --- | --- | --- |
| 3 | `Security program` | `Select / implement controls` |
| 4 | `Continuity/recovery` | `Recover` |

Stems, rationales, and traps were tightened so exactly one stage is defensible.
`buildPlan()` additionally filters `lifecycleExercises` to the renderable
`{stem, answer, why, trap}` shape, and `renderLifecycle()` skips the phase rather
than rendering a blank card if a domain has no usable exercise.

## 5. Question decoder covers every tracked dimension

`weakestMindset()` returns `qualifier | role | lifecycle | decision`, but
`decoderLessons` covered `role, qualifier, lifecycle, constraint`. "Decision"
silently fell back to lesson 0 and the constraint lesson was unreachable.

- Added a `decision` lesson (residual exposure and tolerability as a risk decision).
- The `constraint` lesson is now the opening lesson for a learner with no decoder
  evidence yet, where there is no weakest dimension to repair.

## 6. Reliability

- `getActiveLearning`, `getMixedPractice`, `getExamReadiness`, `getDailyStudy`, and
  `getRetentionState` now validate each sub-key. A partially-shaped blob previously
  threw `TypeError` in `recordActiveResult()` and mixed completion.
- Exam scoring no longer aborts on a question with an unexpected domain, and a
  domain with no questions shows `—` instead of `NaN%`.
- Active and Mixed Practice guard empty sessions instead of crashing.
- Mixed repair falls back to generic guidance rather than printing `undefined`.

## 7. Corrected score display

Both engines showed `${score} / ${index}`, so a correct first answer read `1 / 0`.
The denominator now counts questions actually answered.

## 8. Performance

- Retention snapshots were written on every render of the readiness card, so ~60 UI
  refreshes churned the entire bounded 60-entry history. Snapshots are now recorded
  only when the readiness picture changes.
- `buildAdaptiveSession()` and `buildSession()` indexed history with `filter()` /
  `some()` per candidate — O(candidates x history). Both now build a lookup once;
  selection logic is ~5.5x faster with a 1500-entry history.
- The Daily Study apply-phase question list is resolved once per session. It was
  recomputed every render and depends on `introducedConcepts`, so it could reorder
  underneath the learner mid-question.
- Ten home-screen renders: 190 reads / 20 writes → 130 reads / 0 writes.

## Validation

`docs/BUILD-16-VALIDATION.md`.

## Protected behaviour confirmed unchanged

Confidence delegation (13.1/13.2), the Practice Exam Review Center state machine
(9.1–9.3), the Mixed Practice mindset gate and question re-display, exam feedback
withholding, repair convergence through the shared mastery engine, Journey / Big
Picture separation, calm language, and no build numbers in the learner UI.
