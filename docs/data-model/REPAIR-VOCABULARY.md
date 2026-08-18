# Repair-Target Vocabulary

```
RepairTarget:
  id, display_name, description
  related_evidence_dimension   EvidenceDimension id, required
  content_status, verification_status, version, source
```

The ten Phase 2 failure types from
[`docs/learning/REPAIR-MODEL.md`](../learning/REPAIR-MODEL.md#diagnostic-failure-types),
frozen as IDs in `schema/registry/repair-targets.json`:

```
repair.knowledge-gap
repair.role-error
repair.authority-error
repair.qualifier-error
repair.lifecycle-error
repair.sequence-error
repair.decision-error
repair.vocabulary-error
repair.business-context-error
repair.technical-vs-management-error
```

## Diagnosis is per-option, not per-question

Approved during Phase 3 review: different wrong answers on the same
question can represent different failure shapes. See
[`SCHEMA-QUESTION.md`](SCHEMA-QUESTION.md) and
[`RELATIONSHIPS.md`](RELATIONSHIPS.md) for the mechanism
(`Question.options[].repair_target`).
[`schema/example/questions.example.json`](../../schema/example/questions.example.json)'s
`question.d2.0001` and `question.d4.0001` each tag three wrong options with
three *different* repair targets — directly matching the worked example
given during review (lifecycle error / authority error /
technical-vs-management error on options B, C, D).

This means a future repair engine can respond to *which specific wrong
option* the learner chose, not just that they were wrong — the
Repair Model's promise of "small and targeted" repair
([`docs/learning/REPAIR-MODEL.md`](../learning/REPAIR-MODEL.md#repair-mechanics))
depends on this precision; a single repair-target-per-question design would
not have been able to deliver it.

## Where this is enforced

[`tests/data-model/referential-integrity.test.mjs`](../../tests/data-model/referential-integrity.test.mjs)
checks every `options[].repair_target` resolves;
[`tests/data-model/status-governance.test.mjs`](../../tests/data-model/status-governance.test.mjs)
checks a `CANONICAL` question's per-option repair targets don't point at
non-`CANONICAL` repair-target entities (all ten are seeded `CANONICAL`, so
this is currently vacuous, but the check exists for when new repair targets
are proposed as `CANDIDATE` in the future).
