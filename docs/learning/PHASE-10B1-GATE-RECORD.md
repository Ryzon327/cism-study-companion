# Phase 10B-1 Gate Record — Repair & Shared Learning Infrastructure

**Status: [CANONICAL record of what happened]**. This is the durable
record of Phase 10B-1 — the first Learning Modes implementation batch,
built per the approved architecture in
[`LEARNING-MODES-ARCHITECTURE.md`](LEARNING-MODES-ARCHITECTURE.md) and
[`PHASE-10A-GATE-RECORD.md`](PHASE-10A-GATE-RECORD.md). This phase builds
shared foundation only: a repair-coverage audit with evidence-supported
improvements, and a shared question→answer→feedback→repair primitive
extracted from Daily Study. **Explore, Practice, and Optional
Reinforcement remain not implemented** — this phase does not build any of
the three learning modes themselves.

## Scope

Two objectives only: (1) audit and, where justified, improve repair
content; (2) extract the smallest reusable question-attempt primitive from
`DailyStudySession` so future modes can consume it without a second
question engine. No Explore, Practice, or Reinforcement implementation. No
Foundation enhancement implementation. No persistence. No Domain 3.

## Part A/B — Repair-target audit and classification

All 10 repair targets actually used across current production content
(Foundation + Domain 1 + Domain 2) were audited directly against their
real usages, not assumed.

| Repair target | Usages | Domains | Reasoning mistake | Classification | Treatment |
|---|---|---|---|---|---|
| `repair.knowledge-gap` | 51 | D1, D2 | Heterogeneous — a direct conceptual/definitional gap specific to whatever the current lesson teaches (governance vs. management, SLE/ALE arithmetic, GRC effectiveness, etc.); no single cross-cutting shape | **B** | Dynamic: repair confirmation is built from the current lesson's own `concept.plain` |
| `repair.authority-error` | 26 | D1, D2 | Assuming whoever identifies/analyzes/recommends also holds decision authority (Pattern P02/P03) | **A** (already dedicated) | Reviewed; existing content already correctly teaches the general distinction; left unchanged |
| `repair.role-error` | 25 | D1, D2 | A specific role (Internal Audit, data owner, control owner, etc.) mistaken for the role that actually decides | **A** (already dedicated) | Reviewed; existing content teaches the general shape via one illustrative pair; left unchanged |
| `repair.vocabulary-error` | 23 | D1 (mainly), D2 | Heterogeneous — spans multiple distinct term-pairs (governance vs. management, policy vs. standard vs. procedure vs. guideline, Domain 2 risk vocabulary); no single pair covers all usages | **B** | Dynamic: same mechanism as `repair.knowledge-gap` — current lesson's `concept.plain` |
| `repair.business-context-error` | 22 | D1, D2 | An answer disconnected from the scenario's actual stated business objective/priority (Pattern P01) | **A** (new dedicated) | New static `REPAIR_CONTENT` entry |
| `repair.decision-error` | 17 | D1, D2 | Deferring indefinitely, passivity, or an unsupported conclusion standing in for an actual evidence-grounded decision | **A** (new dedicated) | New static `REPAIR_CONTENT` entry |
| `repair.lifecycle-error` | 12 | D2 only | A correct action taken at the wrong canonical risk-lifecycle stage (Pattern P04) | **A** (new dedicated) | New static `REPAIR_CONTENT` entry |
| `repair.sequence-error` | 11 | D1, D2 | An otherwise-correct step taken out of its required procedural/organizational order (distinct from the canonical lifecycle) | **A** (new dedicated) | New static `REPAIR_CONTENT` entry |
| `repair.qualifier-error` | 10 | Foundation (mainly), D1 | Matching the wrong qualifier TYPE (ranking/sequencing/prerequisite/fit) to the stem's actual current-state facts | **A** (new dedicated) | New static `REPAIR_CONTENT` entry, explicitly framed as reasoning (not a shortcut) |
| `repair.technical-vs-management-error` | 4 | D1, D2 | A technical/detailed answer offered where a management/governance-level answer is needed (Pattern P07/P11) | **A** (new dedicated) | New static `REPAIR_CONTENT` entry; low volume but conceptually distinct and important, so a small dedicated entry was judged more useful than nothing |

**Not mechanically decided as "8 new entries needed."** Two of the eight
previously-uncovered targets (`repair.knowledge-gap`,
`repair.vocabulary-error`) were deliberately **not** given a fixed static
entry: both are used across dozens of unrelated concepts, so any single
fixed drill would necessarily be generic. Instead, `getRepairCheck()` now
builds their repair content dynamically from the current lesson's own
already-authored `concept.plain` text — reusing existing curriculum
content instead of fabricating a synthetic right/wrong contrast for an
arbitrary concept. This is the explicitly-authorized "shared/pattern-based
treatment" option (classification B), applied where it was the honestly
better fit rather than defaulting every target to a dedicated entry.

`repair.authority-error` and `repair.role-error` (the two targets that
already had dedicated content before this phase) were reviewed against
their real usage and found to already teach the correct general
distinction; left unchanged rather than rewritten for its own sake.

## Part B — Repair content quality

Every new/changed repair entry follows the same shape: a two-option "which
statement is accurate?" micro-check (a plausible-but-wrong generalization
vs. the actual distinction), plus a one-sentence confirmation naming the
principle to carry forward — matching the existing two entries' format
exactly, not a new format. None restate "the same reasoning applies
elsewhere"; each names the specific reasoning shape (business-context fit,
active decision vs. deferral/passivity, lifecycle-stage order, procedural
sequence, qualifier type vs. stem facts, management/governance fit vs.
technical detail, or — for knowledge-gap/vocabulary-error — the lesson's
own concept definition).

Verified live in-browser (D1-U1 → `repair.vocabulary-error` shows the
Governance-vs-Management concept definition; D2-U7 → `repair.lifecycle-error`
shows the new dedicated lifecycle-stage-order micro-check) before being
accepted.

## Part C — Foundation reasoning-model relationship

Not implemented this phase. The `repair.qualifier-error` entry was written
carefully to avoid any qualifier-to-answer shortcut: it states that each
qualifier changes what KIND of answer is being asked for (sequencing,
ranking, or fit) and that the correct answer still depends on the stem's
own stated facts — never "if you see FIRST, choose X." The existing
`repair_target` vocabulary already maps cleanly onto the six-step
Foundation reasoning model's categories (role/perspective, verb, lifecycle
position, qualifier, business/management fit, and general
knowledge/vocabulary gaps), confirming no new diagnostic taxonomy is
needed when that enhancement is eventually built.

## Part D/E — Shared learning sub-loop

`app/src/session/QuestionAttemptFlow.tsx` (new): a small, caller-agnostic
component implementing exactly `QUESTION → LEARNER ANSWER → FEEDBACK → IF
NEEDED: REPAIR → COMPLETE / RETURN CONTROL TO CALLER`, extracted from
`DailyStudySession`'s existing apply/feedback/repair phase logic verbatim
(same screens, same props, same phase transitions) rather than rewritten.
It knows nothing about lessons, domains, families, or "today" — it
consumes only an already-resolved `question` and two caller-supplied
functions (`buildFeedback`, `getRepairCheck`), the same caller-agnostic
shape `DailyStudyContentSource` already proved out for content. This is
what makes it usable, unmodified, by Explore/Practice/Reinforcement once
those phases are separately authorized — no `PracticeQuestionEngine` /
`ExploreQuestionEngine` / `ReinforcementQuestionEngine` was created, and no
architectural conflict requiring one was found.

`DailyStudySession.tsx` was refactored to call this component for its own
apply→feedback→repair sequence (its `"apply"`/`"feedback"`/`"repair"`
phases collapsed into one `"attempt"` phase that renders
`QuestionAttemptFlow`); Recall, Learn, and Completion phases were not
touched.

## Part F — Exposure store

Unchanged. `exposureStore.ts` was not modified. `QuestionAttemptFlow` does
not read or write it directly — exposure recording still happens exactly
where it always did, inside `productionContentSource.ts`'s
`getApplyQuestion()`/`getRecall()`, before `QuestionAttemptFlow` ever
receives the already-resolved question. The Phase 10A approval to share
this one store across future modes remains architecturally intact and
unimplemented-further (no new caller exists yet to share it with).

## Part G — Answer order

`answerOrder.ts` was not modified — zero lines changed (`git diff` confirms
this). No anti-streak state, forced balancing, or manual overrides were
added. `QuestionAttemptFlow` receives already-ordered `QuestionFixture`
objects and never reorders anything itself.

## Part H — Generic domain support

`QuestionAttemptFlow` contains no domain identifier, no `if (domain ===
...)` branch, and no reference to any specific lesson/family/question id
— structurally, by construction, there is no code path in which it could
special-case a domain. Proven directly with a fully synthetic question
(`question.synthetic-future.0001`, `domainLabel: "Synthetic Future
Domain"`) that references no real `content/production/` entity at all
(`tests/frontend/unit/question-attempt-flow.test.tsx`).

## Part I — Question family compatibility

Not bypassed. `productionContentSource.ts`'s `buildFeedback`/
`getRepairCheck` (passed into `QuestionAttemptFlow` unchanged) still route
through the exact same `familyVariantsFor()` → `selectFamilyVariant()` →
`resolveQuestion()` → `orderOptionsForDisplay()` → `resolveFeedback()`
pipeline as before; `QuestionAttemptFlow` itself never selects a question
or a family — it only renders whichever question the caller already
resolved.

## Part J — Daily Study preservation

Confirmed both automatically and live: all 112 pre-existing Vitest tests
(including `App.test.tsx`'s full Recall→Learn→Apply→Feedback→Repair→
Completion coverage) and all 78 pre-existing Playwright e2e tests passed
**unmodified** after the refactor — no test needed to change to
accommodate it, which is itself the strongest evidence Daily Study's
learner-visible behavior is unchanged. Live-verified in the browser for
both a Domain 1 lesson (D1-U1) and a Domain 2 lesson (D2-U7), each
answered incorrectly on purpose to exercise the new Repair content.

## Part K — No learning-mode implementation

Confirmed: Explore has no implementation (unchanged from Phase 10A).
Practice remains the Phase 5B visual-prototype shell (unchanged). Optional
Reinforcement remains the dead Completion-screen button (unchanged) — not
touched this phase, to be replaced in 10B-4.

## Persistence-boundary confirmation

No localStorage, IndexedDB, backend persistence, authentication,
analytics, or AI product integration was introduced. `git diff` confirms
no changes to any persistence-adjacent file.

## Validation results

Legacy 111 pass / 3 expected `todo` · content-production 195/195 ·
Vitest 124/124 (112 pre-existing + 6 new `question-attempt-flow.test.tsx`
+ 6 new `repair-coverage.test.ts`; selection-engine 14/14, answer-order
16/16, all unchanged) · TypeScript clean · production build succeeds ·
Playwright e2e 78/78 (Chromium + Firefox + accessibility) · visual
regression 32/32, no baseline updates · `npm audit --audit-level=moderate`
0 vulnerabilities.

## Founder Human Experience Gate — instructions

Daily Study is the only currently-functioning consumer of this
infrastructure, so this gate reviews Daily Study specifically to confirm
nothing changed for the learner except better-targeted repair content.

Suggested walkthrough (via the Prototype panel's "Today's lesson (QA)"
selector, Production content source):

1. **D1-U1 — Governance vs. Management**: answer Recall, proceed through
   Learn, then on Apply deliberately choose a wrong answer (any option
   other than the Board-approval one). This triggers
   `repair.vocabulary-error` — the Repair screen's confirmation should now
   show the actual Governance-vs-Management concept definition, not a
   generic "the same reasoning applies" line.
2. **D2-U7 — Residual Risk & Acceptability**: same pattern, deliberately
   choosing the "select an additional treatment option" wrong answer. This
   triggers `repair.lifecycle-error` — the Repair screen should show the
   new dedicated lifecycle-stage-order micro-check.
3. Optionally, answer one question **correctly** on either lesson to
   confirm the correct-answer path still skips straight to Completion with
   no Repair step.

Judge:

1. Does Daily Study feel exactly as straightforward as before?
2. Does answering correctly behave exactly as expected?
3. When answering incorrectly, does the Repair explanation now clearly
   tell you what reasoning mistake was made?
4. Does the repair feel concise rather than lecture-like?
5. Does it tell you what to notice next time?
6. Does returning from Repair feel natural?
7. Did Recall/Learn/Apply behavior remain intact?
8. Do answer positions still vary naturally?
9. Did anything suddenly feel more complicated because of the shared
   infrastructure?
10. Is the Aha-focused teaching experience preserved?

Repair targets triggered during the suggested walkthrough:
`repair.vocabulary-error` (D1-U1, dynamic/lesson-grounded) and
`repair.lifecycle-error` (D2-U7, newly dedicated) — so the Founder can
judge whether each explanation actually matches the mistake made.

## Addendum — targeted Human Experience repair fix (same phase, before closeout)

The Founder's first manual review of D1-U1 identified a genuine
pedagogical defect in the dynamic `repair.knowledge-gap`/
`repair.vocabulary-error` treatment above: its two-option mini-check asked
"does this mistake need a second look?" — a meta-question a learner could
answer correctly without understanding Governance vs. Management at all.
The mistake-context explanation itself (the wrong option's own rationale,
shown as a blockquote) was confirmed working well and left unchanged.

**Root cause**: the mini-check's two options were invented generic
meta-statements ("it's fine to move on" / "worth pausing on"), not a
re-application of the actual missed concept.

**Fix (architecture, not a per-question exception)**: `getRepairCheck()`'s
signature was widened to receive the full resolved `FeedbackFixture`
(question + selected key), not just the bare `repairTargetId` string, so
the dynamic path can ground itself in the actual question that triggered
it. `buildAppliedConceptRepair()` (replacing the old
`buildConceptGroundedRepair()`) now re-presents two of the ORIGINAL
question's own options — the correct one, and a wrong one the learner did
**not** select (so it wasn't already explained on the Feedback screen) —
and asks the learner to identify which one actually fits the tested
concept. The prompt is prefixed with `Perspective: <concept.display_name>`
(e.g. "Perspective: Governance vs. management") — an already-existing,
already-authored label, not a new taxonomy. The confirmation is now the
family's own `invariant_reasoning` field (a general, already-authored
"what to notice next time" principle for every variant of that family),
falling back to `concept.plain` only if no family exists. This fix
required no new content authoring and no schema change — every input
(correct option text, an unselected wrong option's text, the family's
`invariant_reasoning`, the concept's `display_name`) was already authored
curriculum data.

Verified safe for **every** actual production usage (74 combined
usages of `repair.knowledge-gap`/`repair.vocabulary-error` across
Foundation + Domain 1 + Domain 2): a new test iterates all of them and
confirms each resolves to a genuine two-option, single-correct-answer
check, never the generic fallback — so no repair target was left with an
unsafe or degraded treatment requiring a later content-authoring pass.

The 6 static `REPAIR_CONTENT` entries added earlier this phase
(business-context-error, decision-error, lifecycle-error, qualifier-error,
sequence-error, technical-vs-management-error) were reviewed against the
same meta-question concern and found NOT to have it — each already asks a
genuine principle-application question (e.g. "a correct action at the
wrong stage is still wrong" vs. "a generally correct action is still
correct regardless of stage"), not a meta "do you need review" choice —
so they were left unchanged.

### Confidence control investigation (Sure / Not sure / Guessing)

Traced end-to-end, not inferred:

- **Current behavior**: the selected value lives only in
  `QuestionApplyScreen`'s own local `useState`, is passed as the second
  argument to `onSubmit(selectedKey, confidence)`, and every caller in the
  current codebase (`QuestionAttemptFlow`, and `DailyStudySession` before
  it) destructures only the first argument — `confidence` is read nowhere
  after that call returns. Its only actual runtime effect is gating the
  "Check answer" button's `disabled` state (`!selected || !confidence`).
  It does not affect correctness, repair routing, question selection,
  recall selection, answer ordering, or completion. It is not stored
  anywhere, not even transiently — it does not survive to the next
  question, let alone navigation, refresh, or a browser restart.
- **Future intended behavior**: `app/src/content/selection.ts`'s
  `classifyConfidenceSignal`/`nextSpacingBand` (pure, tested functions) and
  `docs/data-model/REPETITION-AND-RECALL-MODEL.md`'s "Confidence
  interaction" section define a 4-state model (strong-repair-priority /
  normal-repair / reinforcement-candidate / healthy-calibration) feeding a
  3-band spacing model — explicitly documented there as **not yet wired
  into live selection**, gated on future persistence.
- **Misleading-UI assessment**: the control's own copy ("How confident are
  you?") makes no false claim and is not overtly misleading. But gating a
  required button on an input that currently has zero downstream
  consequence is a real, if narrow, truthfulness gap — a learner
  reasonably infers a required, gating input matters. **No UI change was
  made** — this is a product/architecture decision (wire it up once
  persistence/confidence-adaptation is authorized, or make its
  currently-inert nature clearer), not an obviously tiny copy fix, and is
  explicitly out of Phase 10B-1's two stated objectives. Flagged for
  future architectural review only.

### Foundation documentation clarification

`docs/learning/FOUNDATION-BLUEPRINT.md`'s approved-future-enhancement
reasoning model was updated with one new step — "What perspective/lens is
being tested?" (inserted as step 2, renumbering the rest to 7 steps total)
— since this phase's own repair fix is a concrete, shipped proof that
explicitly naming the reasoning lens (not leaving it implicit in the
"who am I" role-framing step) measurably improves a learner-facing
interaction. This is a documentation-only clarification of an
already-approved, still-unimplemented future enhancement — Foundation
production content was not modified, and the Foundation enhancement itself
remains unimplemented.

### Files changed in this addendum

- `app/src/session/contentSource.ts` (interface: `getRepairCheck` now takes the full feedback)
- `app/src/content/productionContentSource.ts` (`buildAppliedConceptRepair` replacing `buildConceptGroundedRepair`)
- `app/src/data/prototypeContentSource.ts` (signature parity, no behavior change)
- `app/src/session/QuestionAttemptFlow.tsx` (passes full feedback to `getRepairCheck`)
- `tests/frontend/unit/repair-coverage.test.ts` (rewritten around real resolved feedback; added the all-usages safety test)
- `tests/frontend/unit/question-attempt-flow.test.tsx` (mock signature updated)
- `tests/frontend/unit/production-content.test.tsx` (two call sites updated to the new signature)
- `docs/learning/FOUNDATION-BLUEPRINT.md` (documentation clarification)
- `docs/learning/PHASE-10B1-GATE-RECORD.md` (this addendum)

No production curriculum JSON, `answerOrder.ts`, `selection.ts`,
`exposureStore.ts`, Explore/Practice/Reinforcement behavior, or persistence
architecture was touched.

## Second addendum — near-transfer redesign (same phase, before closeout)

A second Founder Human Experience review of the fix above found the
applied-concept check itself "too obvious": since the check reused the
SAME scenario the mistake explanation had just clarified, and named the
perspective explicitly right beforehand, the Board/governance option was
substantially telegraphed. The Founder correctly diagnosed this as
**answer recognition, not reapplication** — the target is near transfer:
apply the corrected reasoning to a related but meaningfully different
situation.

**Root-cause classification: A — shared architecture, resolved without any
new content or schema.** `family.json`'s existing minimum-3-variant floor
(already enforced by `tests/content-production/family-integrity.test.mjs`
for every family in the curriculum) guarantees every question has at least
2 sibling variants in the same family — different scenarios already
authored to test the identical concept. `buildAppliedConceptRepair()` was
changed to draw its two options from a **sibling variant** (via the
existing `familyVariantsFor()`, not the missed question itself), so the
learner must classify a scenario they have not just seen explained.

**Distractor plausibility / anti-giveaway heuristic**: among the available
siblings, one is preferred whose own correct/wrong option text contains
neither the concept's own name-words (`concept.display_name`, e.g.
"governance"/"management") nor any canonical role's display name from
`schema/registry/roles.json` (e.g. "Board," "CISO") — a generic,
reusable check against already-existing registry vocabulary, not a new
taxonomy or per-question exception. For the Governance-vs-Management
family, this deterministically selects `question.d1.0006`'s pair
("Approving the annual objectives and overall budget envelope" vs.
"Assigning specific staff to specific projects") over `question.d1.0007`
(whose correct option literally contains the word "governance") or the
missed question itself (which names "Board" outright). If every sibling
still contains such a term, the lowest-id sibling is used anyway — a
different scenario, even an imperfect one, is still strictly harder than
re-showing the original.

**Disposition of the "always" wording in `family.invariant_reasoning`**:
investigated directly. This phrasing ("the correct answer is always the
option that sets direction, accepts accountability, or exercises ongoing
oversight... never the option that merely executes...") is a **pre-existing,
curriculum-wide convention** — literally all ~19 production families use
the same "always X, never Y" structure to state their family's invariant
reasoning criterion, not something introduced by this phase. **Classified
as safe, not an exam-hack shortcut**: it defines a *functional test*
(does the action set direction/accountability/oversight, or does it
execute within direction already set?) — it never says "the Board is
always correct," "choose the highest-ranking role," or ties correctness to
any role name or keyword. Confirmed structurally: the confirmation text
itself was checked and contains no role name anywhere. Given this is
existing, curriculum-wide, pre-approved production content (`family.json`,
outside Repair's own code) and not something a Repair-layer fix should
unilaterally rewrite, **no production content was changed** — the actual
defect (the check being answerable via lexical giveaway) was fixed at the
Repair-presentation layer (near-transfer + anti-giveaway sibling
selection) instead, which is the correct layer for it and requires no
curriculum-authority decision.

### Confidence control — future integration point (already documented, reaffirmed)

No change from the first addendum's investigation: confidence is
UI-only today (gates the submit button, otherwise discarded), and
`selection.ts`'s `classifyConfidenceSignal`/`nextSpacingBand` plus
`docs/data-model/REPETITION-AND-RECALL-MODEL.md`'s confidence/spacing
model remain the documented future integration point, gated on a
separately authorized persistence phase. Not implemented or expanded this
turn.

### Recall — confirmed unchanged

No file touched in either addendum affects `RecallScreen.tsx`,
`getRecall()`, `recallFamilyIdsFor()`, or any Recall-path code. The
Founder's positive NEXT-qualifier Recall observation required no action
and remains exactly as it was.

### Files changed in this addendum

- `app/src/content/productionContentSource.ts` (`buildAppliedConceptRepair` now performs sibling-based near transfer with the anti-giveaway heuristic; one new import, `familyVariantsFor`)
- `tests/frontend/unit/repair-coverage.test.ts` (rewrote the same-question reuse test into a near-transfer test; added a sibling-source test and an anti-giveaway test)
- `docs/learning/PHASE-10B1-GATE-RECORD.md` (this addendum)

No production curriculum JSON, `answerOrder.ts`, `selection.ts`,
`exposureStore.ts`, BUG-001/002/003, `schema/example/`, Explore/Practice/
Reinforcement behavior, Recall behavior, or persistence architecture was
touched.
