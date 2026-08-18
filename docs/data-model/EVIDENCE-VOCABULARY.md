# Evidence Vocabulary

```
EvidenceDimension:
  id, display_name, description
  contributes_to_mastery   boolean, required
  content_status, verification_status, version, source
```

Twelve dimensions, seeded in `schema/registry/evidence-dimensions.json`:

```
evidence.knowledge
evidence.role
evidence.authority
evidence.qualifier
evidence.lifecycle
evidence.sequence
evidence.decision
evidence.vocabulary
evidence.business-context
evidence.technical-vs-management
evidence.pattern-recognition      (Phase 3 addition, approved)
evidence.confidence                (Phase 3 addition, approved — see below)
```

The first ten come directly from
[`docs/learning/REPAIR-MODEL.md`](../learning/REPAIR-MODEL.md#relationship-to-mixed-practice)'s
Mixed Practice evidence dimensions. `evidence.pattern-recognition` and
`evidence.confidence` were proposed during Phase 3 design as a superset
beyond that list and approved during review.

## `contributes_to_mastery` — the field that encodes the confidence clarification

Every dimension declares `contributes_to_mastery` explicitly. Ten of the
twelve are `true`. **`evidence.confidence` is `false`, and this is not
incidental — it is the direct, checked encoding of an explicit Phase 3
review instruction:**

> Confidence is a calibration signal, not mastery itself... self-reported
> confidence must NOT directly increase knowledge mastery merely because
> confidence is high.

Confidence produces states such as *correct + high confidence*, *correct +
low confidence*, *incorrect + high confidence*, *incorrect + low
confidence* (see the `AttemptEvidence.confidence` field in
[`RELATIONSHIPS.md`](RELATIONSHIPS.md)). These states **may** eventually
inform explanation depth, repair selection, review priority, and
calibration analytics — but they are a second, independent axis from
whether the learner actually knew the material, and this schema keeps them
structurally separate: `evidence.confidence` cannot be summed into a
`MasteryRecord` the way `evidence.knowledge` or `evidence.lifecycle` can,
because its own registry entry says it doesn't contribute to mastery.

`PracticeMode` (`schema/registry/practice-modes.json`) carries the same
flag for the same reason, at the review's explicit request: it is
operational/context metadata about *where* evidence was generated, not
curriculum knowledge, and must not itself contribute to mastery either.

## Relationship to the Repair Vocabulary

This is the *measurement* vocabulary — what a question is capable of
producing a signal about. [`REPAIR-VOCABULARY.md`](REPAIR-VOCABULARY.md) is
the *diagnosis* vocabulary — what specific remediation content to serve
when a signal comes back negative. They are related but not identical:
every `RepairTarget` names exactly one `EvidenceDimension` it diagnoses
(`related_evidence_dimension`), but `evidence.confidence` and
`evidence.pattern-recognition` have no corresponding repair target, because
low confidence or a missed pattern isn't a "wrong answer" to repair the
same way a role or lifecycle error is.

## Where this is enforced

[`tests/data-model/evidence-confidence.test.mjs`](../../tests/data-model/evidence-confidence.test.mjs)
checks `evidence.confidence.contributes_to_mastery === false`, that every
`PracticeMode` also declares `false`, and that every dimension with a
mapped `RepairTarget` declares `true` — locking the Evidence/Repair
reconciliation as a checked invariant, not just prose.
