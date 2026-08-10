# Build 19 — Validation

## Importer

| Check | Result |
| --- | --- |
| Questions recovered from a 1,123-question source set | 1,059 (94.3%) |
| Structurally invalid records emitted | 0 |
| Duplicate stems | 0 |
| Stem median length | 18 words, matches corpus |
| Answer position spread | 253 / 273 / 277 / 261 |
| Malformed records rejected by the structural gate | 5 |

## Integration

| Check | Result |
| --- | --- |
| App loads with the local set present | no errors |
| App loads with the local set absent | no errors, 119 questions |
| Exam pool with local set | 1,178 |
| Full-length format unlocks | pass |
| Full session builds at 150 questions | pass |
| Quick format still 40 questions | pass |
| Imported qualifiers are selectable chips | pass, 0 orphaned |
| Imported roles are selectable chips | pass |
| Imported lifecycles are selectable chips | pass |
| Imported decisions are selectable chips | pass |

## Requires manual confirmation in a browser

- A full-length timed run, including pacing across four hours
- Review Center behaviour at 150 questions rather than 40
- Countdown rendering in light and dark
