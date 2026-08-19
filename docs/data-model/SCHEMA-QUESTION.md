# Question Schema

```
id                    question.<domain>.<seq4>
domain                Domain id, required
concepts              Concept id[], ≥1 required
patterns              Pattern id[], optional
qualifier             Qualifier id, optional — null means no qualifier signal in the stem (see SCHEMA-QUALIFIER.md)
roles_mentioned        Role id[], optional
primary_role           Role id, optional — must be a member of roles_mentioned if both set
lifecycle              Lifecycle id, optional — only valid where the domain has a canonical lifecycle
stage                  LifecycleStage id, optional — must belong to `lifecycle` if set
decision_type          DecisionType id, optional
difficulty             "introductory" | "standard" | "advanced", optional, default "standard"
prompt                 string — the stem
options                exactly 4 OptionEntry (see below)
explanation            string — why the correct answer is correct
recognition_clue       string, optional
memory_rule            string, optional
evidence_dimensions    EvidenceDimension id[], ≥1 required for CANONICAL questions
family                 QuestionFamily id, optional — see SCHEMA-QUESTION-FAMILY.md; a Question becomes a "variant" the moment this is set
variation_tags          string[], optional — which of the family's variation_strategy dimensions this variant instantiates (Phase 6C)
content_status          CANONICAL | CANDIDATE | PROTOTYPE_REFERENCE
verification_status     see PROVENANCE-MODEL.md
active                  boolean
version / replaced_by    see VERSIONING-STRATEGY.md
source                  Source id, required for CANONICAL

OptionEntry:
  key            "a" | "b" | "c" | "d" — stable, position-independent
  text           string, non-empty, unique among the question's 4 options
  correct        boolean — exactly one true per question
  rationale      string, required
  repair_target  RepairTarget id, optional — which specific reasoning failure this wrong option represents
```

## Why options use a stable `key`, not array position

Options are keyed `a`–`d`, and `correct`/`rationale`/`repair_target` all key
off that letter — **not** array index. Display-order shuffling for
presentation is therefore a pure UI concern that can never desynchronize
data. This directly fixes a fragility class flagged in the engineering
baseline: the current prototype's `shuffleAnswers()`
(`js/exam.js`) has to carefully co-permute three parallel arrays
(`options`, `correctIndex`, `optionRationales`) in lockstep every time a
question is shuffled — an easy place to introduce a silent misalignment.
With a stable per-option key, there is nothing to keep in lockstep; a
future implementation can shuffle the *display order* of the four
`OptionEntry` objects however it likes without touching which one is
`correct` or what its `rationale`/`repair_target` are.

## Nothing is required beyond the minimum

`id`, `domain`, `concepts`, `prompt`, `options`, `explanation` are the only
hard requirements. Every dimension tag (`qualifier`, `roles_mentioned`,
`lifecycle`/`stage`, `decision_type`, `patterns`) is additive — a question
testing only vocabulary knowledge with no lifecycle or role component
simply leaves those fields `null`/`[]`. See
[`schema/example/questions.example.json`](../../schema/example/questions.example.json)'s
`question.d1.0001` for a minimally-tagged example next to `question.d2.0001`'s
fully-tagged one (Domain 2 / residual risk / P04 / qualifier NEXT / role
risk owner / lifecycle risk / stage validate-acceptability / evidence
dimensions lifecycle+authority) — the exact multi-dimension shape named as
a requirement during design.

## Where this is enforced

[`tests/data-model/question-structure.test.mjs`](../../tests/data-model/question-structure.test.mjs)
(4 unique non-empty options, exactly one correct, rationale presence,
`primary_role` ⊆ `roles_mentioned`, no `qualifier.none`) and
[`tests/data-model/referential-integrity.test.mjs`](../../tests/data-model/referential-integrity.test.mjs)
(every referenced id resolves) and
[`tests/data-model/status-governance.test.mjs`](../../tests/data-model/status-governance.test.mjs)
(no `CANONICAL` question scores against `CANDIDATE`/`PROTOTYPE_REFERENCE`
content).
