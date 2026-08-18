# Migration Strategy (design only — not executed in Phase 3)

Per explicit instruction, no learner evidence — real or historical — was
touched to produce this document or this phase. This is a strategy for a
future, separately-approved migration step.

## Governing principle

> Do not fabricate precision.

Ambiguous historical evidence must be preserved as legacy evidence rather
than incorrectly assigned to a canonical entity. A migration that guesses
confidently and is wrong is worse than a migration that honestly declines
to map something.

## Four buckets, ranked by confidence

### 1. Safely mappable
A prototype concept title that exists in exactly one domain's content
today — verified in the engineering baseline audit: `data/content.js`'s 35
titles, zero collisions — maps 1:1 to a new canonical `concept.<domain>.<slug>`
with high confidence. Auto-mappable.

### 2. Ambiguous
A title that isn't a literal collision but is a near-duplicate of another
domain's concept, or whose intended domain isn't clear from the string
alone. Requires human review before mapping. **Not** auto-mapped.

### 3. Colliding — the BUG-001 case, "Policy hierarchy"
The prototype's `challengeHistory` log (`js/storage.js`,
`recordActiveResult`) stores each attempt's `domain` and `challengeId`
alongside the concept title — e.g. `D1-POLICY-HIERARCHY-1` versus
`D3-POLICY-TECH-1`. **The raw per-attempt log is not actually ambiguous;
only the derived `mastery[concept]` aggregate is.** A migration that
re-aggregates mastery from `challengeHistory`, using the `challengeId`'s
domain prefix as the disambiguator, rather than trusting the already-
blended `mastery` summary, can correctly split this specific case's
evidence into `concept.d1.policy-hierarchy` and `concept.d3.policy-hierarchy`
`MasteryRecord`s. This is the intended resolution path for BUG-001's
*evidence* — BUG-001's *content* is resolved structurally, by construction,
per the ID scheme (see below).

### 4. Cannot be mapped confidently — the BUG-002 case, 36 orphaned concepts
These concept-title strings were never in any registry, so there is no
canonical concept ID to map them to. Inventing one retroactively during
migration would be exactly the fabricated precision this principle
forbids. Evidence for these stays in `LegacyEvidenceRecord` (shape defined
in [`RELATIONSHIPS.md`](RELATIONSHIPS.md)), excluded from canonical
`MasteryRecord` calculations, until a content owner makes an explicit
per-concept decision — new canonical concept, or merge into an existing
one. That decision is Phase 4+ content work, not an automatic migration
step. `concept.d1.business-objectives` in
[`schema/example/concepts.example.json`](../../schema/example/concepts.example.json)
is a real, seeded example of exactly this bucket: `content_status:
CANDIDATE`, deliberately left unpromoted, illustrating the shape a Phase 4
review would need to resolve.

## Rule: only buckets 1 and 3 auto-populate canonical evidence

Buckets 2 and 4 populate `LegacyEvidenceRecord` only — inert for scoring —
until a human resolves them. No automatic promotion path exists from
"ambiguous" or "unmappable" to canonical; that always requires an explicit
decision.

## How this relates to BUG-001/002/003 staying open

This document is a *plan*. None of it has been executed. BUG-001 and
BUG-002 remain `todo` in the Phase 1 suite and open in
[`docs/regressions/REGISTRY.md`](../regressions/REGISTRY.md) until an
actual migration (a future, separately-approved phase) runs against real
prototype data using this strategy. BUG-003 (the five dead data files) has
no migration path at all in this model — see
[`ENTITY-MODEL.md`](ENTITY-MODEL.md) — because there is nothing in them
worth migrating; its resolution is a separate deletion decision, not
authorized here.
