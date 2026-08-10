# Build 21 — Real explanations

Imported questions previously carried a placeholder rationale. The source prints
a per-option justification for every question — exactly the "why is this right,
why are the tempting alternatives weaker" structure the product calls for — and
the importer was discarding it.

## Extraction

`parseJustification()` reads the four per-option explanations that follow each
answer marker. A block is rejected outright if it does not yield exactly four
entries, if any entry is under 10 characters, or if it has swallowed a marker or
the following question.

| | Result |
| --- | --- |
| Questions with all four explanations | 1,008 of 1,059 (95.2%) |
| Explanation median length | 20 words |
| Rationale matching the correct option slot | 100% |
| Leaked marker text | 0 |

The 51 questions without a clean block keep the placeholder rather than showing
a partial or mismatched explanation.

A zero-width joiner sits between each option letter and its text in the source.
It is now stripped once at the top of `parseFile()`; previously it defeated
every label regex and extraction returned zero.

## Alignment under shuffling

`shuffleAnswers()` reorders options and recomputes `correctIndex`. Per-option
explanations are indexed to the original order, so they are now permuted with
the options. Without this every explanation would attach to the wrong answer
once positions changed.

Verified across 12,096 option/rationale pairs through repeated shuffling: zero
misalignments, and the correct option tracks correctly every time.

## Where explanations appear

**Practice Exam results** — each missed question now shows the answer chosen,
why that specific choice was wrong, the best answer with its reasoning, and a
collapsed section covering the remaining options.

**Mixed Practice** — the same, and the collapsed section appears on correct
answers too. Getting one right does not prove the reasoning was right, so the
alternatives stay available without cluttering the default view.

Both keep the existing memory rule. Nothing is shown during an exam; feedback
still appears only after submission.

## After installing

Re-run `node tools/import-corpus.mjs` to regenerate `data/local/question-set.js`
with explanations included.
