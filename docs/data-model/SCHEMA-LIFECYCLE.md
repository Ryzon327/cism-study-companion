# Lifecycle Schema

```
Lifecycle:
  id, display_name, domain, content_status, version, source

LifecycleStage:
  id                    stage.<lifecycle-slug>.<slug>
  lifecycle             Lifecycle id
  position              integer, 1-based, unique and contiguous within its lifecycle
  display_name, description
  recognition_clues     string[]
  preceding             LifecycleStage id | null — null only at position 1
  following             LifecycleStage id | null — null only at the last position
  content_status, verification_status, version, source
```

## The registry contains exactly two lifecycles — this is enforced, not incidental

```
lifecycle.risk       Domain 2 Risk Lifecycle (8 stages)
lifecycle.incident   Domain 4 Incident Lifecycle (6 stages)
```

Both are seeded `CANONICAL` with their full canonical stage sequences,
matching [`docs/learning/LIFECYCLE-MODEL.md`](../learning/LIFECYCLE-MODEL.md)
exactly.

**Domain 1 and Domain 3 do not have a lifecycle entity of any kind in this
registry — not `CANONICAL`, not `CANDIDATE`, not anything.** An earlier
design draft proposed a `CANDIDATE`-status `lifecycle.governance-program`
entity specifically so the Domain 1/3 conceptual relationships could be
"representable without being canonical," the same pattern used for
prototype-reference qualifiers. **This was explicitly rejected during
Phase 3 review**: Phase 2 deliberately established that Domain 1 and
Domain 3 do not currently have approved canonical lifecycles, and the
lifecycle registry should contain *only* approved lifecycle entities — a
`CANDIDATE` lifecycle would still be a lifecycle-shaped thing sitting in
the lifecycle namespace, which is exactly the outcome the amendment
forbids ("must not occupy the lifecycle namespace merely for symmetry").

The Domain 1/3 conceptual relationships —
`business objectives → governance → strategy` and
`strategy → program → controls → measurement/improvement` — remain exactly
where Phase 2 put them:
[`docs/learning/LIFECYCLE-MODEL.md`](../learning/LIFECYCLE-MODEL.md#domain-1--domain-3--conceptual-model-not-canonical),
as prose only, explicitly not a stage sequence. If a future phase wants
them representable as data, that requires its own separate, explicit
approval — not an assumption carried over from this document.

## Where this is enforced

[`tests/data-model/lifecycle-integrity.test.mjs`](../../tests/data-model/lifecycle-integrity.test.mjs)
directly asserts `lifecycles.json`'s id list equals exactly
`["lifecycle.incident", "lifecycle.risk"]`, that stage positions are
unique/contiguous per lifecycle, that `preceding`/`following` agree with
position order, and — separately — that **no Domain 1 or Domain 3 question
references a lifecycle or stage at all**, closing the loop at the content
layer as well as the registry layer.
