# Build 25 — Session resume and repeat prevention

A second audit pass covering interaction flows the first suite did not reach:
exams played to completion, the Mixed Practice mindset gate, active practice
rendering, same-day resume, preferences, and a 365-session endurance run.

## Fixed

**Reopening Daily Study on the same day started a different concept.**
`buildPlan()` reused the stored daily focus only in the reinforcement phase.
During first-pass learning it recomputed every time, so closing the app and
reopening it — a completely ordinary thing to do — served a new concept and
marked a second concept studied. Curriculum progress advanced at roughly twice
the true rate, and domains completed before the material had been covered.

Today's focus is now reused for the whole day whenever it still belongs to the
current domain. Reopening resumes; it does not restart.

**Consecutive-day repeats could slip through.** Repeat detection read
`getTodayStudy().focusConcept`, which resets at midnight and is therefore null
at the moment the next day's concept is chosen. Both the weak-concept exclusion
and the reinforcement rotation now read the most recent previous day's focus, so
the same concept cannot be served two days running while alternatives exist.

Over 365 simulated sessions the longest identical run dropped from 8 days to 2.

## Verified

90 automated checks across two suites, all passing.

Suite one: 120-session journey, 30 practice exams across both formats, exam bank
integrity, decoder coverage, corrupt-storage resilience, backup round trips,
taught-first invariants.

Suite two: exam rendered and played with no feedback leakage, scoring and
weighting arithmetic, mindset gate withholding options until submitted, active
practice across all four domains, 365-session endurance, same-day resume,
preferences and theme, and imported content sanity.

After a year of daily use: 423 KB of storage, histories correctly bounded at
their caps, no crashes, curriculum reaching reinforcement.

## Not covered by automated testing

Visual rendering, dark mode appearance, and real pointer interaction. These need
a browser and remain unverified.
