# Question Family Schema

**Status: [CANONICAL schema/mechanism; every seeded family is currently
`CANDIDATE` content]**, approved during Phase 6C architecture review. See
[`REPETITION-AND-RECALL-MODEL.md`](REPETITION-AND-RECALL-MODEL.md) for why
this entity exists and how it's used at runtime.

```
QuestionFamily:
  id                     family.<domain>.<slug>   (namespace already reserved in ID-CONVENTIONS.md)
  display_name           string
  domain                 Domain id
  concepts                Concept id[], ≥1 required     — the reasoning target
  patterns                Pattern id[], optional
  evidence_dimensions     EvidenceDimension id[], ≥1 required — what this family is capable of measuring
  role_target              Role id, optional — see "role_target is not the correct answer" below
  qualifier_target         Qualifier id, optional — null means variants may each use a different qualifier
  lifecycle                Lifecycle id, optional — domain-gated exactly like Question.lifecycle
  stage_target              LifecycleStage id, optional
  decision_type             DecisionType id, optional
  teaching_objective         string — one sentence: what every variant must require the learner to demonstrate
  invariant_reasoning        string — prose: what must NOT change across variants (see MEANINGFUL-VARIATION below)
  variation_strategy          string[] — which of the fixed variation dimensions this family uses (see below)
  difficulty_band              "introductory" | "standard" | "advanced" (reuses Question's existing enum)
  minimum_variant_count        integer — authoring-completeness marker, not a hard block (see below)
  content_status, verification_status, active, version, replaced_by, source
```

## No `variants` back-reference field, deliberately

A family's variants are discovered by querying `Question.family === this.id`
— the same one-directional pattern every other relationship in this model
already uses (a `Lesson` doesn't list which `Question`s cite it via
`retrieval_refs`'s inverse; a `Concept` doesn't list which `Question`s
reference it). Storing both directions would require keeping two
representations in sync for no benefit — see
[`RELATIONSHIPS.md`](RELATIONSHIPS.md).

## `role_target` is not "the correct answer" — it may name the recurring distractor instead

A family's correct role can legitimately vary scenario to scenario — see
[`ROLE-AUTHORITY-MATRIX.md`](../learning/ROLE-AUTHORITY-MATRIX.md)'s explicit
instruction not to encode a fixed "X always decides" rule. When a family's
correct role is intentionally scenario-dependent,
`role_target` should instead name the role most commonly offered as the
*tempting wrong answer* across the family (e.g. the security manager, who
identified/recommended but doesn't decide) — the field's meaning is
"the role this family is built to test reasoning about," not "the answer
key." `family.d1.authority-accountability-decision` is the worked example.

## "Variant" is a role a `Question` plays, not a new entity type

No separate `QuestionVariant` entity exists. A `Question` becomes a variant
the moment its `family` field is set. Everything a variant needs
(`concepts`, `patterns`, `qualifier`, `roles_mentioned`, `lifecycle`/`stage`,
`decision_type`, per-option `repair_target`, `difficulty`, provenance,
status, version) is already the `Question` schema from Phase 3. One new,
additive field:

```
Question.variation_tags   string[], optional
```

Structured record of which `variation_strategy` dimensions this specific
variant instantiates (e.g. `["qualifier:first", "business-setting:incident-response-readiness"]`)
— supports the automated diversity checks in
[`VALIDATION-INVARIANTS.md`](VALIDATION-INVARIANTS.md) and gives authors a
structured place to justify *why* a variant counts as meaningfully
different, instead of leaving it to prose alone.

## Fixed variation-strategy vocabulary

`variation_strategy` (on the family) and `variation_tags` (on each variant)
draw from exactly this set — enumerated, not free text, so diversity is
structurally checkable:

`qualifier` · `business-setting` · `role-mix` · `asset-or-process-context` ·
`distractor-temptation` · `lifecycle-framing` · `wording-structure` ·
`decision-consequence`

## Meaningful variation vs. trivial paraphrase

**Automated checks are a warning signal, not authoritative proof** — per
explicit Phase 6C architect decision. A text-similarity check catching
"Who should approve the policy?" vs. "Who is responsible for approving the
policy?" is useful, but it cannot confirm that `invariant_reasoning` is
actually preserved, that distractors stay plausible, or that a scenario is
substantively different to a human reader. Structural duplicates — an
identical stem, or an identical four-option text set — remain hard,
blocking errors; genuine-diversity judgment remains a human-review
requirement. See [`VALIDATION-INVARIANTS.md`](VALIDATION-INVARIANTS.md) for
exactly which checks are which.

## `minimum_variant_count` is a floor, not a target

Three variants is the *initial minimum* for a family to be considered
reinforcement-ready — not a long-term maximum and not a hard block on
`CANDIDATE` families still under construction. A `CANDIDATE` family below
its floor is reported, not rejected; only a `CANONICAL` family is required
to meet it, mirroring this project's existing `todo`-test convention for
known-incomplete states rather than inventing a new one.

## Where this is enforced

See [`VALIDATION-INVARIANTS.md`](VALIDATION-INVARIANTS.md) and
`tests/content-production/family-integrity.test.mjs` /
`variation-quality.test.mjs`.
