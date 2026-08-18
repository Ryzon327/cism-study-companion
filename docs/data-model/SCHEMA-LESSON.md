# Lesson Schema

```
id                 lesson.<domain>.<slug>
domain             Domain id (domain.d1..d4, or domain.foundation)
concepts           Concept id[]
patterns           Pattern id[], optional
prerequisites      (Lesson | Concept) id[], optional
objective          string — one sentence, the "why it matters"
context            string — plain-English context
cism_perspective    string
recognition_clues  string[]
scenario           string — one short scenario
traps              string[]
memory_rules       string[]
retrieval_refs     Question id[] — the immediate-application question(s)
content_status, verification_status, active, version, replaced_by, source
```

Maps field-for-field onto
[`docs/learning/LESSON-DESIGN-STANDARD.md`](../learning/LESSON-DESIGN-STANDARD.md)'s
eleven-step sequence, with two steps folded into adjacent fields: "why it
matters" lives inside `objective`, and "decision reasoning" lives in the
prose accompanying `scenario` plus what the linked `retrieval_refs`
question's own `explanation` supplies — this schema does not duplicate the
Question schema's explanation content.

## Compactness is structural, not just a style guideline

Per the Lesson Design Standard: *"prefer one important concept, one useful
explanation, one scenario, one memorable rule, and immediate application."*
This schema doesn't have a mechanism to *enforce* brevity (that's a content
authoring discipline, not a data constraint), but its shape actively
discourages sprawl: there is no field for a second scenario, no field for
a list of unrelated concepts beyond what `concepts` legitimately needs for
cross-referencing, and `retrieval_refs` is meant to point at one or two
questions, not a whole practice set.

See [`schema/example/lessons.example.json`](../../schema/example/lessons.example.json)'s
`lesson.d2.quantitative-risk` for a complete worked example.

## Where this is enforced

[`tests/data-model/referential-integrity.test.mjs`](../../tests/data-model/referential-integrity.test.mjs)
checks `domain`, `concepts`, `patterns`, `prerequisites` (against both
Lessons and Concepts), and `retrieval_refs` (against Questions) all
resolve; [`tests/data-model/status-governance.test.mjs`](../../tests/data-model/status-governance.test.mjs)'s
provenance check applies identically to Lessons.
