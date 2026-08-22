# Phase 7C Gate Record — Domain 1 Readiness Assessment & Targeted Follow-Up

**Status: [CANONICAL record of what happened; the curriculum content it
describes is CANDIDATE, not canonical]**. This is the durable record of
Phase 7C — a read-only Domain 1 completion assessment followed by a
narrow, targeted remediation pass — following the pattern established in
[`PHASE-7B3-GATE-RECORD.md`](PHASE-7B3-GATE-RECORD.md) and its
predecessors. It records outcomes, not implementation narrative.

## Part 1 — Read-only assessment

Before any content was authored, the full Foundation + D1-U1–U9 curriculum
(then 32 questions, 9 families) was audited against the supplied Domain 1
source/question material (`tools/input/domain-1.txt`, 202 questions),
`docs/learning/` and `docs/data-model/` architecture, and the existing
test suite. No files were modified during this pass.

**Finding:** the curriculum was substantively strong and source-grounded,
with one BLOCKING gap against `docs/learning/DOMAIN-1-BLUEPRINT.md`'s own
"must accomplish before Domain 2" list — the learner's ability to
recognize the policy/standard/procedure/guideline hierarchy — confirmed
untaught anywhere in Domain 1 by direct search. Three further, narrower,
non-blocking gaps were also identified: no NEXT-qualifier practice in
Domain 1; `family.d1.legal-regulatory-risk` not yet testing risk-based
prioritization among competing obligations; `family.d1.organizational-
culture-governance`'s own teaching objective asserting a culture →
risk-appetite link that no variant actually tested.

**Overall recommendation returned:** NEEDS TARGETED DOMAIN 1 FOLLOW-UP
(not "ready," not "not ready").

## Part 2 — Architect decisions and targeted follow-up

The architect reviewed the assessment and made four explicit, separate
decisions, each recorded here as reported by the architect, not
independently re-derived by Claude Code:

- **G1 (policy/standard/procedure/guideline) — fix now, blocking.**
- **G2 (NEXT qualifier) — do not force a fix.** Recorded as a standing
  decision, not a fix: see the readiness note added to
  [`DOMAIN-1-BLUEPRINT.md`](DOMAIN-1-BLUEPRINT.md#domain-1-readiness-note-phase-7c).
- **G3 (U8 legal/regulatory nuance) — fix narrowly**, exactly one new
  variant.
- **G4 (U9 culture → risk-appetite link) — fix narrowly**, exactly one new
  variant.

### G1 implementation

Taught inside `lesson.d1.governance-effectiveness` (U7) — no new learning
unit — as an additive extension (version 1 → 2) of the lesson's existing
`objective`/`context`/`cism_perspective`/`recognition_clues`/`traps`/
`memory_rules` fields. All originally-approved U7 text is preserved
verbatim; new material is appended, not substituted. A new concept
(`concept.d1.policy-artifact-hierarchy`) and a new, separate question
family (`family.d1.policy-artifact-hierarchy`, 3 variants:
`question.d1.0031`–`0033`) were added. This activates the previously-
documented-but-unactivated Policy vs. Standard vs. Procedure vs. Guideline
pair in [`CONFUSING-CONCEPTS.md`](CONFUSING-CONCEPTS.md).

**Architectural note on reachability:** the existing `DailyStudyContentSource`
architecture allows exactly one Apply-anchor family per lesson
(`anchorFamilyIdFor` resolves only `retrieval_refs[0]`). To preserve U7's
already-approved Apply behavior unchanged, `question.d1.0022`
(`family.d1.governance-effectiveness`) remains `retrieval_refs[0]`, and
the new family's anchor (`question.d1.0031`) was added as
`retrieval_refs[1]`. This means the new family is taught in U7's lesson
content immediately, but becomes *recall*-eligible starting at D1-U8
(verified directly: U8's and U9's recall pools both include
`family.d1.policy-artifact-hierarchy`) rather than being U7's own Apply
question. This is a deliberate engineering trade-off to avoid altering
U7's existing, previously human-approved Apply experience — flagged here
explicitly for founder review rather than assumed correct.

**Density note:** U7's `context` field grew from ~450 to ~810 characters
(other single-concept D1 lessons range ~300–540 characters) — proportionate
to now teaching two concepts in one lesson rather than one, and comparable
to roughly twice a typical single-concept lesson's length. This is
reported transparently rather than asserted as unquestionably within
bounds; the founder's manual review should judge whether it still reads
as "concise but fruitful."

### G3 implementation

One new variant, `question.d1.0034`, added to `family.d1.legal-regulatory-risk`
(3 → 4 variants). Tests risk-based prioritization among competing legal/
regulatory obligations (probability × consequence), directly evidenced by
the supplied source material's "recommendations... MOST useful if based
on... probability and consequences" question. Chosen over the alternative
(outsourcing/cross-border retained accountability) because it introduces a
genuinely new reasoning dimension not already touched by `question.d1.0026`'s
existing jurisdictional-conflict territory. `pattern.p08` (Risk-Driven
Prioritization) was added to the family's `patterns` array to reflect this
new reasoning target, matching the precedent already set by
`family.d1.business-justification-roadmap`'s use of the same pattern in
Domain 1.

### G4 implementation

One new variant, `question.d1.0035`, added to `family.d1.organizational-
culture-governance` (3 → 4 variants). Tests that organizational culture is
the most significant factor shaping how a formally-approved risk appetite
is actually expressed in practice — directly evidenced by the supplied
source material's "MOST significant factor in determining risk
appetite... organizational culture" question. Deliberately does not teach
that culture overrides approved risk appetite, nor that training fixes
risk-appetite expression — both are incorrect distractors in the new
variant.

## Human Experience Gate

**Result, as reported by the founder: PASS for the Phase 7C curriculum/
learning-experience changes** (U8's fourth variant, U9's fourth variant,
and the U7 policy/standard/procedure/guideline addition). The founder
reported that the learning experience/content remained good, the Aha/
realization effect remained present, and no learning-content defect was
identified. This is recorded as the founder's reported subjective
experience — Claude Code did not and cannot independently verify a human's
subjective learning experience; the automated suite verifies structure and
regression-safety, not felt learning quality.

During that same review, the founder identified two Home-screen UX
defects through real Production (candidate) use — not learning-content
defects:

1. The main lesson paragraph and the right-side Domain card substantially
   duplicated the same lesson description.
2. The displayed "~25 min session" estimate was not credible for the
   current concise, straight-to-the-point study sessions.

The founder explicitly observed the duplicate-description behavior while
**D1-U9** was selected (not only U7), which is the evidence that ruled out
a U7-or-U9-specific curriculum-content explanation and pointed instead to
a generic Production Home rendering defect.

### Home UX correction (post-curriculum-PASS)

**Root cause:** `HomeScreen.tsx`'s snapshot ("Domain card") aside rendered
the exact same `todayFocus.reason` string already shown in the main
paragraph — for every lesson, in every domain, regardless of which content
source was active. This was a rendering defect in the one shared
`HomeScreen` component, not a property of any specific lesson's authored
content.

**Correction:** `TodayFocusFixture` gained a new `focus` field, distinct
from `reason`, rendered only in the snapshot card. Production derives it
generically via a new `shortConceptLabel()` helper applied to the current
lesson's own concept `display_name` (colon-split where a colon separates a
short label from elaboration, used as-is otherwise) — no lesson, unit, or
domain id ever appears in this logic, proven directly against U7, U8, U9,
and two future-domain-shaped synthetic inputs. The fabricated
`estimatedMinutes` field was removed entirely (not merely hidden) and
replaced with the static, non-numeric label "Quick study session."

**Prototype note:** because `HomeScreen` is a single component shared by
both content sources (correctly, per the existing architecture — building
a second component would be redesign, not correction), this fix
necessarily touched Prototype's rendering too: it gained the same short
"Focus" label and lost the same fabricated "~25 min session" text.
Prototype's core approved content — title, main paragraph, domain label/
position, Journey state — is unchanged; only the card's short label
(now "Residual risk," reusing the fixture's own existing short concept
title rather than repeating its main paragraph) and the session-length
wording changed. The four affected Prototype visual-regression baselines
(`home--{desktop,mobile}--{light,dark}`) were regenerated to reflect this
explained, deliberate change — not silently, and not because of a
regression.

### Home UX follow-up review

**Result, as reported by the founder: PASS.** The founder reviewed the
corrected Home presentation (duplicate-description removal, generic focus
derivation, and the non-numeric session wording) and reported that
everything is fine. As above, this is recorded as the founder's reported
review outcome, not an independently-verified claim by Claude Code.

## Explicitly deferred, unchanged by this phase

- Persistence, `localStorage`, `IndexedDB`, backend, authentication,
  analytics, AI integration — none introduced.
- Promotion of any entity to `CANONICAL` — all Domain 1 content, including
  everything added this phase, remains `CANDIDATE`.
- BUG-001/002/003 — unchanged, still open, still `todo`.
- Domain 2 and any further phase — not started.
- `schema/example/` — untouched, still test-only.
- U1–U6 — completely unchanged (verified: prerequisites and variant counts
  identical to pre-Phase-7C state).
- The Domain 1 end-to-end completion gate — still separate, future,
  explicitly deferred; this follow-up closes specific readiness gaps, it
  does not itself constitute that gate.
- "Concise but fruitful" remains a binding learning-design principle,
  reaffirmed by this gate's PASS.
- Numeric session-duration estimates must not be displayed without a
  defensible source — the removed `estimatedMinutes` field was never
  backed by real timing data in either content source.
- Personalized timing based on actual observed learner behavior is
  explicitly deferred to a future, separately-authorized phase; no timing
  telemetry, analytics, or persistence was introduced here.
