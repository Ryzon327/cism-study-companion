# Build 18 — Exam pacing and optional local question set

Two changes. The first is complete. The second is deliberately partial and
documented as such.

## 1. Timed exams and a full-length format

The Practice Exam had no clock and a fixed 40 questions. The real CISM exam is
150 questions in 240 minutes — about 96 seconds each, sustained for four hours.
Pacing and endurance are distinct skills from knowing the material, and neither
could be rehearsed.

| Format | Questions | Minutes | Domain counts |
| --- | --- | --- | --- |
| Quick | 40 | 64 | 7 / 8 / 13 / 12 |
| Full-length | 150 | 240 | 26 / 30 / 49 / 45 |

Both use the ISACA weighting corrected in Build 17 and the same review tools.

- A countdown appears in the exam header when enabled, and auto-submits at zero.
- The timer stops on submit and on close; no interval survives a closed overlay.
- At ten minutes remaining the clock shifts colour once. No flashing, no
  escalating warnings — the calm-UI rule still applies under time pressure.
- The format chooser appears under the Practice Exam card. The countdown is a
  toggle, so a 40-question timed run is available too.

**Full-length is gated on supply.** `supplyFor()` confirms the pool can fill
every domain count before the format is offered. With the bundled 119 questions
it stays hidden rather than silently producing a short exam.

## 2. Optional local question set

`index.html` loads `data/local/question-set.js` if present, before
`data/exam-bank.js` consumes it. Absent, the tag fails silently and nothing
changes. `data/local/` and `tools/input/` are gitignored.

This exists so a learner can practise on a larger question set they own without
that material entering a public repository. See `docs/LOCAL-QUESTION-SET.md`.

### The converter is incomplete

`tools/import-corpus.mjs` recovers roughly 5% of a 1,123-question source set.
The option-list layout varies between PDF exports — one common form renders eight
list entries where every other entry is a bare letter label and the real option
text sits in the entry after it. That variant is handled; others are not yet
characterised.

Output that the converter does produce is structurally validated: exactly four
options, correct index in range, no bare letter labels, no duplicate stems.

Completing the parser is the next piece of work and requires characterising the
format variants across a full source set rather than inferring them from one
sample.

## Validation

`docs/BUILD-18-VALIDATION.md`.
