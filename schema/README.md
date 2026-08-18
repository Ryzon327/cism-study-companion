# Canonical Data Model — Machine-Readable Foundation

This directory is the machine-readable counterpart to the human-readable
specification in [`docs/data-model/`](../docs/data-model/README.md), which
is authoritative for *why* this shape exists. Read that first.

## Layout

- `registry/` — the small, mostly-fixed controlled vocabularies: domains,
  roles, qualifiers, decision types, evidence dimensions, repair targets,
  patterns (P01–P15), lifecycles, lifecycle stages, sources, and practice
  modes. These are the entities everything else references by ID.
- `example/` — a small set of illustrative content entities (concepts,
  questions, lessons) that exercise every part of the schema, including the
  two distinct `concept.d1.policy-hierarchy` / `concept.d3.policy-hierarchy`
  entities that demonstrate the BUG-001 fix. **This is not the CISM
  curriculum or question bank, and it is not approved production content**
  — it exists to prove the model, per the explicit Phase 3 scope (schema
  foundation, not content migration). **Read
  [`example/README.md`](example/README.md) before treating anything in
  that directory as a content decision** — in particular, the two
  "Policy hierarchy" concepts are a structural demonstration that distinct
  IDs prevent a display-name collision, not a decision that the rebuilt
  curriculum should actually contain two such concepts. That taxonomy
  question belongs to the later content migration/reconstruction phase.

## Format

Plain JSON, one array of entity objects per file (never an object keyed by
ID — see [`docs/data-model/VALIDATION-INVARIANTS.md`](../docs/data-model/VALIDATION-INVARIANTS.md)
for why a keyed-object representation would silently hide duplicate-ID
bugs that an array representation lets the test suite catch explicitly).

No dependency is required to read or validate these files: `JSON.parse` and
the `node:test`/`node:assert` suite already used by the Phase 1 test suite
are sufficient. See [`tests/data-model/`](../tests/data-model/).
