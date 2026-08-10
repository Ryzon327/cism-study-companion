# Build 19 — Working corpus importer

Build 18 shipped `tools/import-corpus.mjs` recovering about 5% of a large source
set. This build fixes it. Against a 1,123-question set it now recovers 1,059
questions — 94.3% — with zero structurally invalid records.

## The bug

Two regexes used `\s` for leading whitespace:

```js
const ANSWER_RE = /^\s*([A-D])\s+is the correct answer\./m;
text.split(/(?=^\s*[A-D]\s+is the correct answer\.)/m)
```

Under the `m` flag `^` matches at every line start, and `\s` matches newlines.
So the lookahead matched at each blank line preceding a marker, not just at the
marker itself. One question produced several split points in a row, and the
text carried forward between chunks — which holds the stem and options — was
reduced to a single newline.

Measured on Domain 1: 399 chunks, of which only 4 carried usable content.
Restricting the class to `[ \t]` gives 198 chunks and 197 usable carries.

The same fix was applied to `OPTION_RE`.

| | Before | After |
| --- | --- | --- |
| Domain 1 | 4 | 196 |
| Domain 2 | 9 | 223 |
| Domain 3 | 26 | 395 |
| Domain 4 | 19 | 245 |
| **Total** | **58** | **1,059** |

## Structural gate

Records are now rejected rather than emitted damaged. A question must have a
stem of at least 25 characters, exactly four distinct options each at least 3
characters, a correct index in range, and no leaked justification text. Five
records were dropped under this rule.

## Extraction quality

| Measure | Imported | Corpus reference |
| --- | --- | --- |
| Stem median | 18 words | 18 words |
| Answer position spread | 253 / 273 / 277 / 261 | near-uniform |
| Structurally invalid | 0 of 1,059 | — |
| Duplicate stems | 0 | — |
| Role tagged `None/implicit` | 81% | 79.7% |

Stem length and role distribution both reproduce the corpus measurements
independently, which is a reasonable signal that extraction is faithful.

Tagging is heuristic. Qualifiers are read directly from the stem and are
reliable. Role, lifecycle, and decision are keyword-inferred and should be
treated as a starting point.

## What this unlocks

With a local set imported, the exam pool becomes 1,178 questions and the
full-length 150-question format offered in Build 18 becomes available. Verified
end to end: `supplyFor()` passes for all four domains, and a full session builds
at 1 / 150. The quick 40-question format is unchanged.

All imported tag values were checked against the decoder's dimension arrays —
zero orphaned values, so no imported question can present an unselectable chip.

## Reminder

`data/local/` and `tools/input/` are gitignored. Imported question material must
never be committed. See `docs/LOCAL-QUESTION-SET.md`.
