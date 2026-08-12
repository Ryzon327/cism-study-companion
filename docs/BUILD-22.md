# Build 22 — Daily Study concept progression

Daily Study could stop advancing and re-serve the same concept every day, even
when the learner answered it correctly.

## Cause

`focusConcept()` returned the lowest-scoring *already taught* concept before it
ever considered new material:

```js
const weak = Object.entries(mastery()).filter(...).sort(byRate);
if (weak[0]) return weak[0][0];        // any taught concept wins
const unseen = concepts.find(c => !introduced.has(c.title));
```

Every taught concept has a mastery record, so `weak[0]` was effectively always
populated once a few sessions had run — including at 100% correct. New material
was unreachable.

This contradicts handoff sec.5 and sec.42: during first-pass learning new material
is sequential, and only genuinely weak taught material returns (micro-adaptation).

## Fix

A taught concept is now re-served only when it is genuinely weak — mastery state
`Needs Refresh`, or at least two attempts with under 70% correct. Otherwise
Daily Study moves to the next untaught concept in curriculum order.

Concept-to-domain matching now uses the domain's own concept list rather than
`conceptDomain()`, which was not matching reliably and suppressed legitimate
weak-concept recall.

Untaught concepts are selected against `studiedConcepts` (what a session actually
covered) before falling back to `introducedConcepts`.

| | Before | After |
| --- | --- | --- |
| Distinct concepts over 8 perfect days | stalls after ~5 | 8 |
| Genuinely weak concept returns | suppressed | yes |
