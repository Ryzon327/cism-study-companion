# Build 16 — Validation

Automated checks were run against a headless harness that loads all fourteen
scripts in `index.html` order with a stubbed DOM and an instrumented
`localStorage`. Rendering, CSS, and layout were not exercised and require manual
confirmation in a browser.

## Static

| Check | Result |
| --- | --- |
| JavaScript syntax, all 14 files | pass |
| JSON validity (`content-manifest`, `domains/*`, `questions/*`) | pass |
| Duplicate HTML ids | none |
| Local asset references resolve | pass |
| Module load, `index.html` order | no errors |
| Orphaned identifiers after refactor | none |

## Behavioural

| Check | Result |
| --- | --- |
| 60 home-screen renders write nothing to curriculum | pass (was 8/8 concepts, 120 writes) |
| `getSummary()` performs zero writes | pass |
| Domain cannot complete from renders | pass |
| `open()` still records the studied concept | pass |
| `open()` still persists today's focus | pass |
| `cism-curriculum-updated` reaches `document` | pass, 2/2 (was 0/2) |
| D1–D4 lifecycle answers are real stages | pass |
| Malformed lifecycle exercises filtered out | pass |
| Decoder lesson exists for all four tracked dimensions | pass |
| No-evidence learner receives the constraint lesson | pass |

## Storage compatibility

| Check | Result |
| --- | --- |
| Partial mixed blob (no `mindset`) | survives (was `TypeError`) |
| Partial active blob (no `challengeHistory`) | survives (was `TypeError`) |
| Partial exam blob | survives |
| `introducedConcepts` preserved untouched by migration | pass |
| `studiedConcepts` seeded only from completed learn phases | pass |
| Completed domains carried across whole | pass |
| In-progress domain not falsely credited | pass |
| Fresh install writes nothing on load | pass |
| Migration idempotent | pass |
| `studiedConcepts` survives export / import | pass |
| Legacy backup without `studiedConcepts` imports cleanly | pass |

## Regression — protected behaviour

| Area | Result |
| --- | --- |
| Confidence delegation on stable `studyContent` | intact |
| `quiz.js` per-render binding warning | intact |
| Confidence recorded on attempts | intact |
| Exam modes `reviewCenter` / `flaggedReview` / `unansweredReview` | intact |
| `cleanQueue()`, `resetFooterHandlers()` | intact |
| Unmark removes from flagged queue | intact |
| Return to Review Center | intact |
| Mixed Practice re-shows question with explanation | intact |
| Mindset gate precedes options | intact |
| Domain hidden until feedback | intact |
| Exam withholds all feedback until submit | intact |
| Repair convergence: mixed / exam / daily feed mastery | intact |
| Journey derives from `getCurriculum` | intact |
| Journey / Big Picture separation | intact |
| No streak or guilt language | intact |
| No build number in learner UI | intact |

## Performance

| Measure | Build 15 | Build 16 |
| --- | --- | --- |
| Adaptive selection logic (1500-entry history) | 0.344 ms | 0.063 ms |
| 10 home-screen renders | ~190 reads / 20 writes | 130 reads / 0 writes |
| Retention snapshots per UI refresh | 1 | only on change |

## Requires manual confirmation in a browser

- Light and dark mode rendering
- Explore / Practice navigation and scroll-into-view
- Overlay open/close and Escape handling
- Practice Exam review queue click-through end to end
- Daily Study seven-phase walkthrough, Domains 3 and 4 especially
- Journey step states after completing Foundation
