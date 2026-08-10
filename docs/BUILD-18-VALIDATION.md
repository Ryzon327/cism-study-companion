# Build 18 — Validation

Headless harness, all scripts loaded in `index.html` order with a stubbed DOM.
14 of 14 automated checks pass.

## Static

| Check | Result |
| --- | --- |
| JavaScript syntax, all files including `tools/import-corpus.mjs` | pass |
| Duplicate HTML ids | none |
| Module load order | no errors |
| Local script tag precedes `data/exam-bank.js` | pass |
| No source question text anywhere in the build | pass |

## Exam formats

| Check | Result |
| --- | --- |
| Quick format always offered | pass |
| Full-length hidden when the pool cannot fill it | pass (119 available, 150 required) |
| Domain counts match ISACA weighting | pass |
| Timer stops on submit | pass |
| Timer stops on close | pass |

## Optional local set

| Check | Result |
| --- | --- |
| Exam bank loads normally with no local file | pass, 119 questions |
| `localQuestions` is an empty array when absent | pass |
| Weights unchanged | pass, 17/20/33/30 |

## Regression — Builds 16 and 17

| Check | Result |
| --- | --- |
| Home renders write nothing to curriculum | pass |
| `open()` still records the studied concept | pass |
| Constraint intro decoder lesson intact | pass |
| Exam modes `reviewCenter` / `flaggedReview` / `unansweredReview` | intact |
| `cleanQueue()` intact | intact |

## Known incomplete

The converter recovers ~5% of a large source set. Tracked in `docs/BUILD-18.md`.

## Requires manual confirmation in a browser

- Format chooser layout and the countdown toggle
- Countdown rendering in the exam header, light and dark
- Ten-minute colour shift
- Auto-submit at zero
- A timed 40-question run end to end, including the Review Center
