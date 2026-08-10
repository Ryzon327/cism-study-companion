# Build 20 — Importer stem cleanup

The source prints a "Question" header line above each stem. Paragraph joining in
the importer merged that label into the stem text, so 435 of 1,059 imported
questions (41%) began with a stray "Question" or a leading number.

`cleanStem()` now strips leading question labels and numbering, and collapses
runs of whitespace in both stems and options.

| | Before | After |
| --- | --- | --- |
| Stems with a leading label | 435 | 0 |
| Structurally invalid | 0 | 0 |
| Stem median | 18 words | 18 words |

Re-run `node tools/import-corpus.mjs` after installing this build to regenerate
`data/local/question-set.js` with clean stems.
