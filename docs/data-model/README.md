# Canonical Learning Data Model (Phase 3)

This directory is the **Phase 3, design-and-schema-foundation** deliverable
of the CISM Study Companion's controlled rebuild. It specifies the
canonical data model the rebuilt application will eventually implement
against, and its machine-readable counterpart lives in
[`schema/`](../../schema/README.md). **No application code, production
data, or learner evidence was touched to produce this phase** — see the
scope statement below.

Per the Phase 3 objective, this model must support the learning
architecture already committed under
[`docs/learning/`](../learning/README.md) — [`docs/learning/CURRICULUM-BLUEPRINT.md`](../learning/CURRICULUM-BLUEPRINT.md)
remains authoritative for *what* the curriculum teaches and *why*; this
directory specifies *how that content is identified, related, and
validated*.

## Start here

Read in this order:

1. **[`ENTITY-MODEL.md`](ENTITY-MODEL.md)** — the fifteen entity types and how they're grouped.
2. **[`ID-CONVENTIONS.md`](ID-CONVENTIONS.md)** — the naming rules that make display-name-as-identity structurally impossible.
3. **[`RELATIONSHIPS.md`](RELATIONSHIPS.md)** — how entities reference each other.
4. The six schema documents (`SCHEMA-*.md`) for the shape of each content type.
5. **[`EVIDENCE-VOCABULARY.md`](EVIDENCE-VOCABULARY.md)** and **[`REPAIR-VOCABULARY.md`](REPAIR-VOCABULARY.md)** — the measurement and diagnosis vocabularies.
6. **[`PROVENANCE-MODEL.md`](PROVENANCE-MODEL.md)** and **[`VERSIONING-STRATEGY.md`](VERSIONING-STRATEGY.md)** — governance and change-safety.
7. **[`VALIDATION-INVARIANTS.md`](VALIDATION-INVARIANTS.md)** — the rules `tests/data-model/` actually enforces.
8. **[`MIGRATION-STRATEGY.md`](MIGRATION-STRATEGY.md)** — how historical prototype evidence could eventually map onto this model (not executed).

## Content status terminology (inherited from Phase 2, now schema-enforced)

This model uses exactly the three statuses established in
[`docs/learning/README.md`](../learning/README.md#content-status-terminology):
`CANONICAL`, `CANDIDATE`, `PROTOTYPE_REFERENCE`. Phase 2 established these
as a documentation convention; Phase 3 makes them a **required field on
every entity**, checked by [`tests/data-model/status-governance.test.mjs`](../../tests/data-model/status-governance.test.mjs) —
a `CANONICAL` question or lesson can no longer *silently* reference
`CANDIDATE` or `PROTOTYPE_REFERENCE` content in a scoring-relevant field; a
CI-blocking test rejects it.

This model separates that status (governance: *may this drive the
product?*) from a second field, `verification_status` (epistemic: *what
kind of evidence supports this?*) — see
[`PROVENANCE-MODEL.md`](PROVENANCE-MODEL.md) for why these are kept
distinct rather than collapsed into one field.

## What Phase 3 (this step) is and is not

**Phase 3 is:** a complete entity/schema design, a machine-readable
registry seeded with the full canonical vocabulary (all domains, roles,
qualifiers, decision types, evidence dimensions, repair targets, patterns
P01–P15, and the two canonical lifecycles with their stages) plus a small
illustrative example set of concepts/questions/lessons, and a validation
test suite proving the model's invariants hold.

**Phase 3 is not:**
- The CISM curriculum or question bank. `schema/example/` contains a
  handful of illustrative, test-only entities, not production content —
  see [`schema/example/README.md`](../../schema/example/README.md). In
  particular, the `concept.d1.policy-hierarchy` /
  `concept.d3.policy-hierarchy` example is a structural demonstration that
  the ID scheme prevents a display-name collision, **not** a product/content
  decision that the rebuilt curriculum should actually contain two distinct
  "Policy hierarchy" concepts — that taxonomy question belongs to the later
  content migration/reconstruction phase, informed by the supplied CISM
  source material.
- A migration of the prototype's actual learner evidence. See
  [`MIGRATION-STRATEGY.md`](MIGRATION-STRATEGY.md) — strategy only.
- A fix for BUG-001, BUG-002, or BUG-003. Those remain open in
  [`docs/regressions/REGISTRY.md`](../regressions/REGISTRY.md) and `todo`
  in the Phase 1 test suite. This model makes the *class* of defect BUG-001
  and BUG-002 represent structurally impossible for *new* canonical
  content — see [`VALIDATION-INVARIANTS.md`](VALIDATION-INVARIANTS.md) — but
  does not retroactively resolve the existing prototype's data or content.
- Application code, UI, or learner-storage implementation of any kind.

## Relationship to prior phases

- [`docs/engineering/BASELINE.md`](../engineering/BASELINE.md) — the
  Phase 1 engineering baseline, including the original BUG-001/002/003
  findings this model is designed against.
- [`docs/regressions/REGISTRY.md`](../regressions/REGISTRY.md) — the
  defect registry. Unchanged by Phase 3.
- [`docs/learning/`](../learning/README.md) — the Phase 2 learning
  architecture. Authoritative for content meaning; this directory is
  authoritative for content *structure and identity*.
