# Using your own question set locally

The bundled bank is small by design. If you own a larger question set, you can
load it into this app **on your machine only**.

## The rule that matters

`data/local/` and `tools/input/` are gitignored. Nothing you put there is
committed or pushed. Commercial question material — ISACA's QAE database, a
purchased prep set, anything licensed — must never enter this repository, which
is public. Keeping it local is personal use; committing it is redistribution.

## How it works

If `data/local/question-set.js` exists, `index.html` loads it before
`data/exam-bank.js`, which appends its questions to the exam pool. If the file is
absent the tag fails silently and the app runs exactly as shipped.

The file defines one global:

```js
window.CISMLocalQuestionSet = { questions: [ /* ... */ ] };
```

Each question needs:

```js
{
  id: "LOCAL-D2-0001",
  familyId: "LOCAL-D2-0001",     // keeps exam variety logic working
  domain: 2,                      // 1-4
  concept: "Risk treatment",
  qualifier: "MOST",              // must be one of the decoder chips
  role: "None/implicit",
  lifecycle: "Risk treatment/acceptance",
  decision: "Risk decision",
  stem: "...",
  options: ["...", "...", "...", "..."],
  correctIndex: 1,
  rationale: "...",
  memory: "..."
}
```

Valid values for `qualifier`, `role`, `lifecycle`, and `decision` are the arrays
in `data/mixed-practice.js` under `dimensions`.

## The converter

`tools/import-corpus.mjs` converts extracted text into that format.

```bash
brew install poppler
mkdir -p tools/input
pdftotext -layout "Domain 1.pdf" tools/input/domain-1.txt
# repeat for domains 2, 3, 4 — the filename must contain the domain number
node tools/import-corpus.mjs
```

Against a 1,123-question source set this recovers 1,059 questions (94.3%).
Every emitted record passes a structural gate: exactly four distinct options, a
correct index in range, no bare letter labels, and a stem of at least 25
characters. Records that fail are dropped rather than emitted damaged.

Tagging is heuristic. Qualifiers are read from the stem and are reliable; role,
lifecycle, and decision are inferred from keywords and are best treated as a
starting point rather than ground truth.

## Why this unlocks full-length exams

The Practice Exam offers a 150-question, four-hour format only when the pool can
fill it honestly (see `supplyFor()` in `js/exam.js`). With the bundled 119
questions the option stays hidden. Import enough questions and it appears.

## Verifying nothing leaked

```bash
git status --short          # data/local/ and tools/input/ should not appear
git log --stat -1
```
