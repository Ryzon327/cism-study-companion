# ID Conventions

The single rule everything else in this model exists to serve:

> **A slug is chosen once, at authoring time, from a short stable English
> phrase, and is never auto-derived from `display_name` or re-derived when
> `display_name` changes.**

Every other convention below follows from that rule. This is what makes
`display_name` genuinely, structurally renameable without corrupting
learner evidence — not a policy someone has to remember to follow, but a
property the ID format doesn't allow violating by accident.

## Format

`<namespace>.<scope-segments>.<slug>` — lowercase, `.` between
namespace/scope segments, `-` between words within a segment.

| Namespace | Pattern | Examples |
|---|---|---|
| `domain` | `domain.<code>` | `domain.d1`, `domain.d4`, `domain.foundation` |
| `concept` | `concept.<home-domain>.<slug>` | `concept.d1.policy-hierarchy`, `concept.d3.policy-hierarchy` |
| `pattern` | `pattern.p<nn>` | `pattern.p01` … `pattern.p15` |
| `role` | `role.<slug>` | `role.security-manager`, `role.risk-owner` |
| `qualifier` | `qualifier.<slug>` | `qualifier.first`, `qualifier.most` |
| `decision` | `decision.<slug>` | `decision.risk`, `decision.incident` |
| `lifecycle` | `lifecycle.<slug>` | `lifecycle.risk`, `lifecycle.incident` |
| `stage` | `stage.<lifecycle-slug>.<slug>` | `stage.risk.evaluate`, `stage.incident.contain` |
| `question` | `question.<domain>.<seq4>` | `question.d2.0042`, `question.foundation.0007` |
| `family` | `family.<domain>.<slug>` | `family.d1.policy-tech-change` |
| `lesson` | `lesson.<domain>.<slug>` | `lesson.d2.quantitative-risk` |
| `evidence` | `evidence.<slug>` | `evidence.lifecycle`, `evidence.authority` |
| `repair` | `repair.<slug>` | `repair.authority-error` |
| `source` | `source.<type>.<slug>` | `source.architecture.phase2-review-2026-08-18` |
| `mode` | `mode.<slug>` | `mode.daily-study` |

Exact regexes are in
[`tests/data-model/helpers/load-registry.mjs`](../../tests/data-model/helpers/load-registry.mjs)
(`COLLECTIONS[*].pattern`) and enforced by
[`tests/data-model/id-integrity.test.mjs`](../../tests/data-model/id-integrity.test.mjs).

## Permanence

IDs are **never reassigned and never deleted**. Retiring content sets
`active: false` and, if replaced, `replaced_by: <new-id>` — see
[`VERSIONING-STRATEGY.md`](VERSIONING-STRATEGY.md). A question's domain
segment reflects its canonical assignment **at the time the ID was
minted**. Per explicit Phase 3 review clarification:

> The ID is never regenerated merely because display text changes,
> metadata changes, taxonomy changes, or a later content review changes
> classification. If a future correction is significant enough to require
> replacement, use the versioning/`replaced_by` mechanism rather than
> silently changing the ID.

This matters specifically because a domain-scoped ID like
`question.d2.0042` looks like it encodes a live classification — it
doesn't. It encodes a one-time decision, snapshotted forever. If a content
review later decides a question actually belongs to Domain 3, the fix is:
mint `question.d3.0043` as a new entity, mark `question.d2.0042` `active:
false` with `replaced_by: "question.d3.0043"`, and preserve both IDs
permanently. Learner evidence referencing the old ID stays meaningful and
inspectable; nothing is silently renumbered underneath it.

## Uniqueness

Enforced per-namespace (all `concept.*` unique, all `role.*` unique, etc.),
which trivially makes the full dotted ID globally unique too, since the
namespace prefix disambiguates. Sequence numbers in question IDs are a
per-domain monotonic counter, zero-padded to 4 digits.

## Concepts specifically: one home domain, reusable elsewhere

A `Concept` has exactly one `home_domain` — the domain that "owns" it and
where it is first taught. That does **not** prevent another domain's
question or lesson from *referencing* that same concept ID to reinforce or
recall it (this is exactly how cumulative recall, per
[`docs/learning/CURRICULUM-BLUEPRINT.md`](../learning/CURRICULUM-BLUEPRINT.md),
is supposed to work). What it prevents is **minting a second concept with
the same meaning just because it shows up in another domain's content** —
that duplication, done with human-readable titles instead of IDs, is
exactly how BUG-001 happened. See
[`concept.d1.policy-hierarchy`](../../schema/example/concepts.example.json)
and
[`concept.d3.policy-hierarchy`](../../schema/example/concepts.example.json)
for a worked example of two *genuinely distinct* concepts that happen to
share a display name — the correct outcome when they really are different
ideas — versus the reuse pattern, which is the correct outcome when they're
the same idea reinforced in a new context.
