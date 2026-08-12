# Build 26 — Content rotation and full UI walkthrough audit

This build follows a third audit pass conducted the way a tester plays software:
through the interface. A new harness parses the real HTML into a working tree,
supports `closest()`, event bubbling, `.onclick` handlers, disabled-control
semantics, and flushable timers — so every check below was performed by clicking
the actual buttons the learner clicks.

## Fixed: the "same thing over and over" repetition

The learner reported Daily Study teaching the same material daily. Focus-concept
progression was fixed in Builds 22–25, but three parts of the session content
were still statically sliced:

- **Definitions** — `defs.slice(0,2)`: the same first two terms every day of a
  domain. Domain 2 has nine definitions; seven were unreachable.
- **Lifecycle scenarios** — `life.slice(0,2)`: same two scenarios daily.
- **Recall items** — `buildRecall` walked mastery entries in insertion order and
  took the first eligible matches, so the same recall cards recurred.

All three now rotate deterministically by the number of prior days spent in the
current domain — stable within a day (closing and reopening resumes identical
content), advancing across days, wrapping when the list is exhausted.

Measured over six days in Domain 2: definition sets went from 1 distinct to 6;
lifecycle pairs reach their data ceiling (4 usable stage-format exercises → 2
distinct pairs); apply questions were already rotating from Build 23 (18 of 18
distinct).

## Added: version indicator

Installs have silently no-op'd at least once (an rsync that copied nothing). A
quiet "Version N" line now sits at the bottom of the Settings dialog, read from
`content-manifest.json`, with a matching `console.info`. Build numbers remain
out of the main learner UI per the product rules.

## Verified by clicking (23 checks, suite three)

- Every UI entry point has a wired, observable effect: Daily Study, Mixed
  Practice, Practice Exam chooser, theme toggle, close buttons, Escape.
- A complete Daily Study session played through all seven phases by clicks,
  with phase flags recorded and exactly one concept marked studied.
- Content-variety audit across six days (above).
- A 40-question exam advanced entirely by clicking answer choices.
- Mixed Practice contract: options hidden until all four mindset chips are
  submitted; question re-shown with feedback; per-option reasoning present.
- Rapid double-click on Next cannot skip more than one step or double-count.
- Same-day reopen keeps one studied concept.
- Timed exam: countdown renders, and expiry auto-submits.

## Regression

Suites one and two re-run green: 51 + 40 checks. Total automated coverage is
now 114 checks across three suites.

## Still outside automated reach

Pixel rendering, dark-mode appearance, and touch behaviour. Everything
functional now runs under test.
