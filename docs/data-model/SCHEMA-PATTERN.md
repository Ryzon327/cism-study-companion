# Pattern Schema

```
id                    pattern.p<nn>
display_name
meaning               string — the one-line statement
recognition_clues     string[]
common_traps          string[]
applicable_domains    Domain id[]
nuance                string, required — the "important exceptions" field (Phase 2 rule: no rigid universal laws)
memory_rule           string, optional
related_roles          Role id[], optional
related_qualifiers     Qualifier id[], optional
related_lifecycles     Lifecycle id[], optional
content_status, verification_status, version, source
```

P01–P15 are frozen, fixed-cardinality entities — `schema/registry/patterns.json`
contains exactly fifteen rows, IDs `pattern.p01` through `pattern.p15`,
matching [`docs/learning/PATTERN-LIBRARY.md`](../learning/PATTERN-LIBRARY.md)
verbatim by ID and one-line statement. The `nuance` field is required
(not optional) specifically because Phase 2 was explicit that these
patterns "should NOT be written as rigid universal laws" — a pattern entity
without a stated exception is treated as incompletely authored.

The full prose elaboration (recognition clues, traps, example scenarios)
for each pattern remains authoritative in
[`docs/learning/PATTERN-LIBRARY.md`](../learning/PATTERN-LIBRARY.md); the
registry entries in `schema/registry/patterns.json` carry the same
information in a more compact, structured, validatable form — the markdown
is the source of truth for *content*, the JSON is the source of truth for
*structure and cross-referencing*.

## Where this is enforced

[`tests/data-model/id-integrity.test.mjs`](../../tests/data-model/id-integrity.test.mjs)
locks the `pattern.p\d{2}` format; every other collection's
`related_patterns`/`patterns` fields are checked against this registry by
[`tests/data-model/referential-integrity.test.mjs`](../../tests/data-model/referential-integrity.test.mjs).
