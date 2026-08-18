# Versioning Strategy

Deliberately minimal — three mechanisms, no more. Enterprise-style
multi-branch content versioning was explicitly out of scope ("avoid
unnecessary enterprise complexity").

## 1. Schema version

One value for the whole dataset, bumped only when an entity *shape*
changes — a new required field, a renamed field, a removed field. Not yet
stamped anywhere in `schema/` (Phase 3 ships schema version `1.0.0`
implicitly, as the first version); a future phase that changes the shape
described in the `SCHEMA-*.md` documents should record the bump here and in
the changed entity's registry file.

This is the direct analog of `js/storage.js`'s per-key version suffixes
(`cism-companion-mixed-practice-v8`, etc.) in the current prototype, done
once, explicitly, for the whole dataset, instead of ad hoc per storage key.

## 2. Entity version

Every entity carries `version: integer`, starting at 1, bumped on
meaningful content edits to that specific entity. This lets future
evidence analysis ask "was this the same question the learner actually
saw" if that ever matters, without requiring it to matter yet — the field
exists now so it isn't a breaking schema addition later.

## 3. Retirement via `active` + `replaced_by`, never deletion or ID reuse

```
active         boolean
replaced_by    id | null — same entity type as the entity itself
```

Retiring content is a state transition: set `active: false`, and if there's
a successor, `replaced_by: <new-id>`. The old ID is never deleted and never
reassigned to different content — see
[`ID-CONVENTIONS.md`](ID-CONVENTIONS.md)'s permanence rule. A replaced
entity stays queryable forever; curriculum-serving logic (a future phase)
filters on `active: true`; evidence-analysis logic deliberately does not,
since historical evidence referencing a retired ID should remain
inspectable.

No seeded entity in this phase is retired (all `version: 1`, `active:
true`, `replaced_by: null`) — this mechanism exists in the schema now so a
future content edit doesn't require a schema change to use it.

## What this deliberately does not do

No branching, no multi-version coexistence, no per-field change history. If
a future phase needs finer-grained audit trail than "current version number
+ retirement pointer," that's a new, separately-justified addition — not
assumed here.
