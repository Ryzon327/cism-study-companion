# Build 17 — Validation

Run against the headless harness that loads all fourteen scripts in `index.html`
order with a stubbed DOM and instrumented `localStorage`.

## Static

| Check | Result |
| --- | --- |
| JavaScript syntax, all files | pass |
| JSON validity | pass |
| Duplicate HTML ids | none |
| Module load in `index.html` order | no errors |

## Data integrity

| Check | Result |
| --- | --- |
| Exam weights sum to 100 | pass (17+20+33+30) |
| Session counts sum to 40 | pass (7+8+13+12) |
| Bank supply covers every domain count | pass (28/31/31/29 available) |
| Every question's qualifier is a selectable chip | pass, 0 orphaned |
| Every chip has a why entry and a memory rule | pass, 0 missing |
| Decoder covers qualifier, role, lifecycle, decision | pass |
| MOST-vs-BEST `correctIndex` in range | pass |

## Behaviour

| Check | Result |
| --- | --- |
| Both qualifier lessons reachable across days | pass, 2 distinct |
| No-evidence learner still gets the intro lesson | pass |
| New chips render without `undefined` | pass |

## Build 16 regression

| Check | Result |
| --- | --- |
| Home renders write nothing to curriculum | pass |
| `open()` still records the studied concept | pass |

## Requires manual confirmation in a browser

- Nine qualifier chips fit the Mixed Practice layout without wrapping badly
- MOST-vs-BEST lesson renders correctly in the Daily Study decoder phase
- A full 40-question practice exam draws 7/8/13/12 by domain
