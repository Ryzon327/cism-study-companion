# Role Schema

```
id                     role.<slug>
display_name
typical_verbs          string[]
typical_authority       string — plain description, not a boolean flag
common_traps           string[]
nuance                 string, required
characteristic_domains  Domain id[], optional, weighting only
related_patterns       Pattern id[], optional
content_status, verification_status, version, source
```

The 12 canonical roles from
[`docs/learning/ROLE-AUTHORITY-MATRIX.md`](../learning/ROLE-AUTHORITY-MATRIX.md)
are seeded in `schema/registry/roles.json`.

## No field can express an absolute claim like "this role never owns risk"

This is a structural property of the schema, not a content-authoring
promise. `characteristic_domains` is explicitly documented as **weighting,
not exclusivity** — a list of domains where a role is *typically* relevant,
never a constraint on where it's *allowed* to appear. Risk ownership, or
any other authority claim, is a **per-instance** field on a specific
`Question` (`primary_role`) or a specific risk-bearing entity, never a
role-level constant. There is no boolean anywhere in this schema shaped
like `can_own_risk: false` — the only place nuance about contextual
authority can live is the required `nuance` string field, which is prose,
not a machine-enforced restriction. This mirrors exactly the explicit
Phase 2 instruction: *"Do NOT encode 'CISO never owns risk.' Risk ownership
is contextual and depends on relevance and authority."*

## Where this is enforced

`nuance` presence is a required field (checked implicitly — any role entity
missing it fails to match the expected shape); `characteristic_domains`
and `related_patterns` resolve via
[`tests/data-model/referential-integrity.test.mjs`](../../tests/data-model/referential-integrity.test.mjs).
There is no test asserting "no absolute authority claims exist" beyond the
schema's own inability to express one — this is a case where the
*structure itself* is the enforcement mechanism, not a runtime check.
