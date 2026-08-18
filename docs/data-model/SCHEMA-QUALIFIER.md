# Qualifier Schema

```
id                  qualifier.<slug>
display_name
reasoning_intent    string
lifecycle_effect    string — may state "not primarily a lifecycle signal"
common_traps        string[]
examples            string[]
content_status, verification_status, version, source
```

## Canonical set — exactly five, unchanged from Phase 2

```
qualifier.first     FIRST
qualifier.next       NEXT
qualifier.best       BEST
qualifier.most        MOST / MOST IMPORTANT
qualifier.primary    PRIMARY
```

## Prototype-reference variants — representable, never canonical

`qualifier.primarily`, `qualifier.greatest`, `qualifier.main` exist in the
registry with `content_status: PROTOTYPE_REFERENCE`, carried forward from
the current prototype's decoder model for continuity. A `CANONICAL`
question must never use one — enforced by
[`tests/data-model/status-governance.test.mjs`](../../tests/data-model/status-governance.test.mjs),
with a worked negative-path demonstration in that same file using
`tests/fixtures/data-model/invalid-prototype-qualifier-reference.json`.

## Amendment: no `qualifier.none`

**`qualifier.none` does not exist anywhere in this registry**, by explicit
Phase 3 review decision. The absence of a qualifier signal in a stem is
represented as `Question.qualifier: null`, never as a reference to a
"none" qualifier entity — the absence of a qualifier is not itself another
qualifier. If the current prototype's literal `NONE` chip classification
is ever needed for migration/audit purposes, it may be represented later as
a `PROTOTYPE_REFERENCE`-status entity — but it is deliberately **not**
created now, since Phase 3 does not migrate historical evidence and
nothing in this phase needs it yet.
[`schema/example/questions.example.json`](../../schema/example/questions.example.json)'s
`question.d4.0001` demonstrates the `qualifier: null` path directly.

## Where this is enforced

[`tests/data-model/question-structure.test.mjs`](../../tests/data-model/question-structure.test.mjs)
asserts `qualifier.none` is absent from the registry, that at least one
example question demonstrates `qualifier: null`, and that no question uses
the literal string `"qualifier.none"`.
