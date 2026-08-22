# Phase 9B-1 Gate Record — D2-U1 (Risk Fundamentals & Emerging Risk) and D2-U2 (Risk Assessment Lifecycle)

**Status: [CANONICAL record of what happened; the curriculum content it
describes is CANDIDATE, not canonical]**. This is the durable record of
Phase 9B-1 — the first Domain 2 production-content implementation batch,
built per the approved Phase 9A architecture
([`DOMAIN-2-BLUEPRINT.md`](DOMAIN-2-BLUEPRINT.md),
[`PHASE-9A-GATE-RECORD.md`](PHASE-9A-GATE-RECORD.md)) — following the
established pattern of every prior gate record. It records outcomes and
founder-reported feedback, not implementation narrative.

## Scope

D2-U1 (Risk Fundamentals & Emerging Risk) and D2-U2 (Risk Assessment
Lifecycle) only, per the approved Phase 9B-1 batch — the first of five
implementation batches (9B-1 through 9B-5) in the approved Domain 2
sequence. No D2-U3 or later unit was authored. New production content:
2 concepts, 2 lessons, 2 families, 6 questions — all `CANDIDATE`.

## Implementation

- `concept.d2.risk-fundamentals` / `lesson.d2.risk-fundamentals` /
  `family.d2.risk-fundamentals` (3 variants: `question.d2.0002`–`0004`) —
  Threat vs. Vulnerability vs. Risk, with one variant illustrating emerging
  risk via an AI scenario (per the approved Phase 9A decision: AI as one
  example, never a dedicated topic).
- `concept.d2.risk-assessment-lifecycle` / `lesson.d2.risk-assessment-lifecycle`
  / `family.d2.risk-assessment-lifecycle` (3 variants: `question.d2.0005`–
  `0007`) — locating Context/Identify/Analyze/Evaluate from stated facts;
  stops before Treat, per explicit batch scope.
- Prerequisite chain: Domain 1 complete (`lesson.d1.organizational-culture-governance`,
  D1-U9) → D2-U1 → D2-U2. Cross-domain recall (Foundation's STAGE step,
  Domain 1's roadmap-sequencing precedent) is carried in D2-U2's own lesson
  narrative rather than as a separate mechanical prerequisite edge, since
  non-adjacent recall (per the approved Phase 9A design) only becomes
  mechanically expressible once later Domain 2 units exist.
- A new source registry entry, `source.learner-supplied.domain-2-question-bank`,
  documents the ~232-question, 6-knowledge-statement-area evidence base
  (`tools/input/domain-2.txt`).
- Regression coverage added in `tests/content-production/domain2-u1-u2.test.mjs`
  and extensions to `family-integrity.test.mjs` (expected-variant-count
  table) and `referential-integrity.test.mjs` (lifecycle/stage resolution —
  closing a previously-latent gap now that real lifecycle-bearing questions
  exist).

## Founder Human Experience Gate

**Result: PASS**, after one targeted repair to D2-U2.

### D2-U1 — PASS (first review, no repair needed)

Founder-reported feedback, verbatim: *"The recall for d2 u1 recalled a
question that I got wrong in the previous domain. That is what I like and
love! U1 was straightforward and I learned the difference. I loved how to
the point it was."*

Recorded as the founder's reported subjective experience — Claude Code did
not and cannot independently verify a human's subjective learning
experience. D2-U1 was not modified as a result of this review; confirmed
unchanged by dedicated regression test through the subsequent D2-U2 repair
turn.

**Positive learning behavior preserved and worth carrying forward:**
- Concise, straight-to-the-point teaching lands well for this kind of
  foundational vocabulary distinction.
- The Threat vs. Vulnerability vs. Risk distinction was clearly learned as
  taught.
- Cross-domain recall surfacing a question the learner had previously
  gotten wrong (in Domain 1) was **explicitly and specifically valued** —
  not merely tolerated. This is a strong, concrete data point in favor of
  the recall architecture's design intent (retrieval of previously-missed
  material, not just previously-seen material).

### D2-U2 — initial review: repair required

Founder-reported feedback, verbatim: *"u2 was not clear to me for some
reason. i think it is because i am trying to reference it in a scenario to
know where to actually apply it. i need reference."*

Diagnosis: the lesson explained the four lifecycle stages abstractly and
gave only one example scenario (illustrating just the Analyze/Evaluate
transition) — there was no single concrete story connecting all four
stages that the learner could hold onto as a mental reference when facing
a new, unfamiliar scenario.

**Targeted repair performed** (`lesson.d2.risk-assessment-lifecycle`,
version 1 → 2): `context`, `scenario`, and `cism_perspective` rewritten
around one continuous story — an enterprise launching a new online payment
capability — walking Context → Identify → Analyze → Evaluate as four
plain-language recognition questions (what are we assessing?/what could
create risk?/how likely and how bad?/is this acceptable or does it require
action?). A third memory rule states the founder's own requested reasoning
question directly: *"Ask: what has already happened, and therefore where
am I in the lifecycle?"* All three existing question variants were
reviewed against this new framing and found to already provide sufficient
stated-fact evidence for stage-location reasoning; none were rewritten, per
the explicit instruction not to modify variants that already work.
Treatment-stage teaching remained excluded; FIRST/NEXT usage (1 each,
source-evidenced) was unchanged.

### D2-U2 — re-review: PASS

Founder-reported feedback, verbatim: *"that was better, much better."*

Recorded as the founder's reported subjective experience, not independently
verified by Claude Code.

### Overall: PHASE 9B-1 HUMAN EXPERIENCE GATE — PASS

## Learning-design finding (recorded for future batches)

**For abstract lifecycle/sequencing concepts, concise definitions alone may
not be sufficient.** When appropriate, provide one concrete scenario
reference that lets the learner reason: *"What has already happened, and
therefore where am I in the lifecycle?"* The scenario functions as a
**mental anchor**, not additional lecture content.

This principle is explicitly **subordinate to the existing concise-but-
fruitful requirement**, not a new default:

- Do not automatically add a scenario anchor to every lesson.
- Use this technique specifically when an abstract sequence or process is
  difficult to apply without a concrete reference — not as a mechanical
  template applied regardless of whether the lesson needs it.
- Preserve the Aha/realization effect — the anchor should make the
  reasoning obvious, not turn the lesson into a lecture.
- Prefer application and recognition over rote memorization; the anchor
  exists to support recognizing facts-as-evidence-of-stage, not to give the
  learner a story to memorize instead of the stage order.

This finding is evidenced directly by this gate: D2-U1 (a vocabulary
distinction, not a sequence) needed no scenario anchor and passed
immediately as "to the point"; D2-U2 (a four-stage sequence) needed one and
passed only after it was added. The two units' different needs, both
reviewed in the same gate, are the direct evidence for this being a
conditional technique, not a universal lesson requirement.

## Explicitly deferred / unchanged by this phase

- Domain 1 — completely unchanged (verified by dedicated regression test
  comparing D1 content before/after).
- D2-U1 — completely unchanged after its initial authoring (verified by
  dedicated regression test: `lesson.d2.risk-fundamentals` remains version
  1, objective byte-identical, all 3 variants unchanged).
- No entity promoted to `CANONICAL` — all Domain 2 content (and all prior
  content) remains `CANDIDATE`.
- D2-U3 and all later Domain 2 units — not started; Phase 9B-2 through
  9B-5 remain future, separately-gated batches.
- Persistence, authentication, analytics, AI-integration — none introduced.
- `schema/example/` — untouched except for the already-approved
  `source.learner-supplied.domain-2-question-bank` registry addition in
  `schema/registry/sources.json` (a registry file, not a
  `schema/example/` fixture).
- BUG-001/002/003 — unchanged, still `todo`.
- CI architecture (`.github/workflows/ci.yml`) — untouched.
