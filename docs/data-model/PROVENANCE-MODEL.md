# Provenance Model

Two separate axes on every content/vocabulary entity, deliberately not
collapsed into one field — this was **strongly approved** during Phase 3
review specifically because they answer different questions:

- **`content_status`** — *may this material participate in the product?*
  `CANONICAL | CANDIDATE | PROTOTYPE_REFERENCE`, exactly the Phase 2
  vocabulary (see
  [`docs/learning/README.md`](../learning/README.md#content-status-terminology)).
- **`verification_status`** — *what level/type of evidence supports this
  material?* `architecturally_approved | supplemental_teaching |
  prototype_derived | source_verified | unverified`.

## Why these can't be the same field

A Phase 2 architectural requirement (e.g. the Foundation eight-step
reasoning process) is `content_status: CANONICAL` — the product owner
approved it, so it's allowed to drive assessment — but its
`verification_status` is `architecturally_approved`, **not**
`source_verified`: it has not been checked against the supplied ISACA
source material, and this project has an explicit documented history of
conflating "approved" with "verified" and getting burned by it (see
[`docs/engineering/BASELINE.md`](../engineering/BASELINE.md)'s account of
build documentation claiming test coverage that didn't exist — a different
instance of the same underlying mistake: treating an assertion as if it
were independently checked). A future source-analysis pass can upgrade a
specific entity's `verification_status` to `source_verified` without
touching `content_status` at all — the two are free to move independently.

## Source registry

```
Source:
  id            source.<type>.<slug>
  type          learner_supplied_source | approved_requirement | supplemental_teaching | prototype_reference | externally_verified
  reference     string — free-text pointer (doc name, session date, file name)
  note          string, optional
  verification_status   a default that entities inherit unless they override it
```

Every content entity's `source` field points at one `Source` row. The five
`type` values are exactly the five distinctions the Phase 3 objective
required this project be able to make: learner-supplied question/source
material, approved architectural/product requirement, supplemental
foundational teaching (e.g. the AV/EF/SLE/ARO/ALE formulas, which are
supplemental to whatever quantitative content the learner's own material
contains — see
[`docs/learning/DOMAIN-2-BLUEPRINT.md`](../learning/DOMAIN-2-BLUEPRINT.md#quantitative-risk)),
prototype reference, and externally verified material (not yet used by any
seeded entity, but available for when it applies).

`schema/registry/sources.json` currently seeds four sources: the Phase 2
and Phase 3 architectural review sessions, the prototype Build 26
reference, and the quantitative-risk supplemental-teaching source.

## Where this is enforced

[`tests/data-model/status-governance.test.mjs`](../../tests/data-model/status-governance.test.mjs)
requires every `CANONICAL` entity to have a non-null `source`, and checks
`content_status` is always one of the three approved values.
[`tests/data-model/referential-integrity.test.mjs`](../../tests/data-model/referential-integrity.test.mjs)
checks every entity's `source` resolves to a real `Source` row.
