# Build 24 — Curriculum progression audit

A full-journey test harness was built for this audit. Earlier harnesses stubbed
the DOM so heavily that rendering never executed, and every test ran against
fresh state on a single calendar day. Both bugs reported by the learner only
appear after several days of accumulated history, so neither could have been
caught. The new harness renders real markup, resolves class and attribute
selectors, and advances a mutable clock so date rollovers actually occur.

Simulated: 120 consecutive sessions at 75% accuracy across all four domains.

## Fixed

**Sticky weak-concept pinning.** `recordActiveResult()` sets mastery state to
`Needs Refresh` on a single miss. `focusConcept()` treated that state as
sufficient evidence of weakness, so a learner answering ~80% correct re-flagged
the current concept most days and never advanced. Weakness now requires
sustained evidence — at least four attempts below 60% — and yesterday's focus is
excluded while untaught material remains in the domain.

**Domain advancement depended on reaching the close screen.**
`advanceDomainIfReady()` was called only from `renderClose()`. A learner who
left a session early kept a fully-taught domain current, and `focusConcept()`
fell back to the first concept in the list — re-serving mastered material
indefinitely. Advancement now also runs at session start.

**Reinforcement phase pinned to one concept.** The post-curriculum branch
returned the single lowest-scoring concept every day, and one day of practice
rarely changes which concept ranks last. It now rotates across the weakest few
plus any concept with no evidence yet, excluding yesterday's focus.

| 60-day journey | Before | After |
| --- | --- | --- |
| Domains reached | 1 | 1, 2, 3, 4 |
| Distinct concepts | 8 | 35 |
| Longest identical run | 52 days | 3 days |

## Verified

51 automated checks pass. Coverage: 120-session journey with no crashes and
correct progression to reinforcement; 30 practice exams across both formats;
20 mixed sessions; active practice on all four domains; exam bank integrity
(1,178 questions, no duplicate ids, all `correctIndex` in range, rationale
arrays aligned to the correct option); every question tag resolving to a
selectable decoder chip; six corrupt-storage shapes including malformed JSON and
wrong types; backup round trip including legacy backups; taught-first invariants
under 50 home renders; and a complete plan for every domain in both phases.

Storage after 120 sessions: 197 KB, well inside browser limits.
