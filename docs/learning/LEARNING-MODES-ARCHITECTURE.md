# Learning Modes Architecture — Explore, Practice, Optional Reinforcement

**Status: [APPROVED ARCHITECTURE — Phase 10A closeout, Founder/Architect
decision recorded 2026-08-24. Implementation NOT yet begun.]** This
document records the Phase 10A investigation and the approved architecture
for the three incomplete learner-facing surfaces identified during the
Phase 9B-5 learning-mode audit — Explore, Practice, and "Optional
5-minute reinforcement" — ahead of a future, separately authorized
implementation phase (Phase 10B, five batches, see below). **Approval of
this architecture is not authorization to implement it** — each 10B batch
requires its own implementation authorization and, where noted, its own
Founder Human Experience Gate. It supersedes, in the areas below only, the
specific behavioral details in
[`docs/design-system/SCREEN-EXPLORE-PRACTICE.md`](../design-system/SCREEN-EXPLORE-PRACTICE.md)
and
[`docs/design-system/SCREEN-PRACTICE-EXAM.md`](../design-system/SCREEN-PRACTICE-EXAM.md)
that Phase 10A's investigation found were never implemented; it does not
delete or contradict those documents' still-valid visual-weight and
calm-UX requirements.

Throughout this document: **[APPROVED]** marks a Founder/Architect
decision now binding on future implementation; **[FUTURE]** marks
something explicitly deferred beyond the current MVP scope (typically
gated on persistence); **[NOT IMPLEMENTED]** marks something described
here for planning purposes only, with zero code behind it as of this
closeout.

## Why this document exists

The Phase 9B-5 audit found that Explore has no implementation, Practice is
a Phase 5B visual-prototype shell (static fixture question, static
counter/timer text, non-functional Next/Previous/Review-queue/Submit), and
"Optional 5-minute reinforcement" is a rendered `<button>` with no
`onClick` at all — identical and unchanged across Foundation, all of
Domain 1, and all of Domain 2. This document defines what each mode should
actually be, why each earns its place (or doesn't), and how to build them
using existing architecture with zero new persistence.

## Current-state findings (fresh Phase 10A verification)

Re-verified directly against the repository, not assumed from the prior
audit:

- `app/src/App.tsx`'s `PRODUCT_ENTRY_SCREEN` maps both the "Explore &
  Practice" nav item and Home's "Browse Explore & Practice →" link to the
  single screen `practice-exam` (`PracticeExamScreen`). There is no
  separate Explore screen, route, or state anywhere in `app/src`.
- `PracticeExamScreen.tsx` renders the Phase 5B fixture `applyQuestion`
  from `app/src/data/fixtures.ts` with `submitted={false}` hardcoded, a
  literal `"4 / 12"` counter string, a literal `"42:18"` timer string, a
  working "Mark for review" toggle, and Previous/Next `<button>`s with no
  `onClick` prop. It does not receive `contentSource` or `todaysLessonId`
  at all — it cannot be lesson- or domain-aware even in principle as
  currently written.
- `ReviewCenterScreen.tsx` renders the static fixture array
  `examQuestions`; its "Review marked/unanswered questions in order →"
  buttons have no `onClick`; "Submit practice exam" only closes a
  confirmation dialog.
- `CompletionScreen.tsx` renders `<button type="button"
  class="completion-optional">{summary.optionalLabel}</button>` — no
  `onClick` prop exists on this element in the source. `optionalLabel` is
  the literal string `"Optional 5-minute reinforcement"`, supplied
  identically by both `app/src/data/fixtures.ts` and
  `productionContentSource.ts`'s `getCompletion()`, which is fully generic
  over `todaysLessonId` — so this exact dead button renders after every
  lesson, every domain, with zero variation.
- `app/src/app-shell/BottomTabBar.tsx` draws a magnifying-glass icon for
  the shared nav item's `id: "explore"` — confirming the "Explore" framing
  exists only as an icon/label choice on top of the same single Practice
  Exam mockup, not as separate functionality.
- **New finding this phase**: `productionContentSource.ts`'s
  `REPAIR_CONTENT` map has dedicated entries for only 2 of the 10 repair
  targets actually used across current production content
  (`repair.authority-error`, `repair.role-error`). The other 8
  (`repair.qualifier-error`, `repair.vocabulary-error`,
  `repair.knowledge-gap`, `repair.sequence-error`,
  `repair.business-context-error`, `repair.decision-error`,
  `repair.technical-vs-management-error`, `repair.lifecycle-error`) all
  fall back to the same generic `FALLBACK_REPAIR` prompt today — a
  pre-existing Daily Study gap, not something Explore/Practice/
  Reinforcement introduce, but directly relevant to reusing repair targets
  for those modes (see "Risks" below).
- `schema/registry/domains.json` already carries a real, source-derived
  `exam_weight` per domain (D1:17, D2:20, D3:33, D4:30; Foundation
  explicitly excluded) — unused by any code today, but present and ready
  for a future real Mock Exam mode.
- `docs/learning/CURRICULUM-BLUEPRINT.md`'s canonical first-pass loop is
  `TEACH → RECALL → APPLY → MEASURE → REINFORCE` — meaning "REINFORCE"
  already names the Feedback/Repair step that happens *inside* Daily Study
  itself (both the targeted repair on a miss and "brief reinforcement of
  the reasoning" on a correct answer). **"Optional 5-minute reinforcement"
  is therefore a different, additional thing** — a short *extra* optional
  session after Daily Study's own REINFORCE step already happened — and
  should be named/framed to avoid colliding with that existing canonical
  term.
- The same document's untaught-material rule is explicit: *"Untaught
  material must NOT be classified as learner weakness... This rule applies
  across Daily Study, Mixed Practice, and any future adaptive-practice
  feature."* Explore, Practice, and Reinforcement are all bound by this.
- The same document's "Post-curriculum: adaptive reinforcement / exam
  readiness" section is explicit that real weakness-driven adaptation is a
  **post-all-four-domains, evidence-driven** capability — i.e., gated on
  persistence, not something to attempt now.

## Purpose model (the core product question) — [APPROVED]

| Mode | Learner intent | Why it earns its place |
|---|---|---|
| **Daily Study** | "Teach me what I should learn next." | The guided, sequential curriculum path. Unchanged by this phase. |
| **Explore** | "Let me understand or revisit a specific concept, on my own terms, right now." | Low-commitment, concept-first, discovery/review-oriented — distinct from Daily Study (no new teaching sequence) and distinct from Practice (not a retrieval test). |
| **Practice** | "Test my CISM reasoning across what I've already learned." | Deliberate, bounded, multi-question retrieval — distinct from Explore (an actual session with a summary) and distinct from Daily Study (not tied to today's specific next lesson). |
| **Optional Reinforcement** | "Give me a very short retrieval boost on what I just learned, right after learning it." | Tiny, contextual, tied to *this session's* just-completed lesson — distinct from Practice by being minutes not a session, and distinct from Recall by occurring after Completion, not before Learn. |

All four are approved to remain in the MVP: each answers a genuinely
different learner intent, at a genuinely different moment, with a
genuinely different scope and length. None is redundant with another once
implemented as specified below — the redundancy that exists **today** is
an artifact of Explore/Practice both routing to one unfinished mockup, not
evidence that the underlying intents overlap.

**Overall Learning Modes Human Experience Gate [APPROVED]:** *"Do I
immediately understand why I would choose Daily Study vs. Explore vs.
Practice?"* Optional Reinforcement is deliberately not part of this
question, since it is contextual rather than a top-level destination a
learner chooses among (see Decision 5 / the navigation section below).

## Recommended learner flows — [APPROVED] conceptual direction, not yet implemented

### Explore

```
Choose a domain → choose a concept (from that domain's taught concepts so far)
  → concise concept explanation (reuses concept.plain / lesson fields)
  → recognition clues / the relevant confusing-concept comparison, if one exists
  → one example scenario (a family variant, via resolveQuestion)
  → optional: answer it, see feedback
  → "Explore another" (return to concept choice) or "Return"
```

Concept choice is scoped to **already-taught** concepts only (via the
existing prerequisite/taught-set walk — see Reuse, below): this is what
prevents Explore from ever exposing untaught material and is what answers
"why am I seeing this" — the learner picked it. `docs/learning/
CONFUSING-CONCEPTS.md`'s existing term-pairs (Threat vs. Vulnerability vs.
Risk, Appetite vs. Tolerance, Risk Owner vs. Control Owner, Qualitative
vs. Quantitative, Governance vs. Management, etc.) are a ready-made,
already-authored candidate list for the concept picker — no new content
required to launch a first version.

### Practice

```
Choose scope: current unit's family | current domain's taught families | all taught material so far
  → a bounded question session (working assumption: approximately 5–10
    questions — an MVP target, not a rigid product requirement; revisit
    if implementation evidence favors a different bounded design), one at
    a time, drawn via the existing family/variant selection (no new
    question data)
  → each question: answer → immediate Feedback → Repair if incorrect
    (identical components to Daily Study)
  → session-only summary: questions completed, correct, needs review,
    concepts encountered
  → Done → return Home
```

No filters beyond the one scope choice. No timer, no exam chrome, no
scoring beyond the plain summary, no streaks, no gamification, no
dashboards, no configuration clutter. This is explicitly **not** an exam
simulator (see the Practice-vs-Mock-Exam boundary below).

### Optional Reinforcement

```
Appears as an action on the Completion screen (contextual, not a nav destination)
  → a short targeted retrieval activity — working assumption: 2–4
    questions, roughly a 2–5 minute EXPERIENCE TARGET, not a fabricated
    countdown or a hardcoded time promise — deterministically drawn from:
    the lesson's own recall pool, the repair target just triggered (if
    any), and/or a related confusing-concept pair
  → immediate Feedback/Repair (same components)
  → Done → back to Completion/Home
```

Session-capable now: sourced entirely from the current lesson's own
already-computed recall pool and repair target — no cross-session history
needed. Explicitly not a second Practice mode, and explicitly not "five
random questions": shorter, scoped to what was just taught or just
missed, no scope-choice step, no summary beyond "Done." Do not display a
misleading numeric time estimate (e.g. a literal countdown or clock)
unless future evidence supports the actual experienced duration — the
"5-minute" framing in the current dead button is exactly the kind of
unearned specific promise to avoid repeating.

## Practice vs. a future Mock Exam — explicit boundary — [APPROVED]

Mock Exam is **not authorized for implementation** during the Phase 10B
Learning Modes sequence below, and must not be silently implemented as a
side effect of building Practice. Existing prototype/mock-exam scaffolding
(`PracticeExamScreen`/`ReviewCenterScreen`) must not be allowed to quietly
redefine what MVP Practice is.

`docs/design-system/SCREEN-PRACTICE-EXAM.md` and `docs/data-model/
REPETITION-AND-RECALL-MODEL.md` both describe a **real, timed, scored,
exam-form-weighted "Practice Exam"** (coaching-chrome-free, sampling by
`domains.json`'s `exam_weight`, immediate feedback withheld until
submission, a five-mode Review Center). That is a **distinct, larger,
not-yet-authorized** future mode — a Mock Exam — and the existing docs
blur it with the MVP "Practice" concept this document defines, because the
Phase 5B prototype screen was named "Practice Exam" for that larger future
vision, not for the smaller MVP retrieval-practice mode recommended here.

**Recommended clean boundary going forward:**

| | Practice (this phase's MVP target) | Mock Exam (future, not authorized) |
|---|---|---|
| Feedback | Immediate, per question | Withheld until submission |
| Length | 5–10 questions | Full exam length |
| Sampling | Learner-chosen scope, taught material only | `exam_weight`-blueprinted, cross-domain |
| Timer | None | Real, calm-tint at 10 min remaining |
| Repair | Yes | No (exam mode strips coaching chrome) |
| Review Center | Not needed | The existing five-mode state machine, finally wired to something real |

The current `PracticeExamScreen`/`ReviewCenterScreen` visual shell is
better understood as **unbuilt scaffolding for the future Mock Exam**, not
for MVP Practice — MVP Practice should be built as a new, smaller
flow (reusing Daily Study's actual screens), and the exam shell's real
wiring should wait for a separately authorized Mock Exam phase.

## Foundation six-step reasoning-model relationship — [APPROVED] relationship, [NOT IMPLEMENTED] enhancement

The six-step model itself (what is happening? who am I in this scenario?
what verb matters? where am I in the lifecycle — what has already
happened? what does the qualifier change? which answer best fits the
management/governance perspective?) remains approved-but-unimplemented,
exactly as recorded in `FOUNDATION-BLUEPRINT.md`. This is structured CISM
reasoning instruction, **never** an exam-hack/qualifier-shortcut system
("if the question says FIRST, always choose X" is explicitly forbidden).
Not implemented this phase or during Phase 10B's five batches below.
Approved relationship for when it is eventually built:

1. The six-step model is ultimately taught **once**, in Foundation
   (already the approved plan — no change).
2. **Explore should expose it as a reusable, always-available reference**
   (e.g., a short static card/panel reachable from Explore), not re-taught
   per concept — this matches "reuse, don't re-teach" and gives the
   learner a place to return to it.
3. **Practice feedback should be able to name a missed-reasoning-step
   diagnosis** (missed role/perspective, missed qualifier, lifecycle jump,
   reversed sequence, activity vs. outcome, authority mismatch, technical-
   vs-management confusion, vulnerability-mistaken-for-risk) when relevant
   — and this maps directly onto the **existing** `repair_target`
   vocabulary (`repair.role-error`, `repair.qualifier-error`,
   `repair.lifecycle-error`, `repair.sequence-error`,
   `repair.business-context-error`, `repair.authority-error`,
   `repair.technical-vs-management-error`,
   `repair.knowledge-gap`/`repair.vocabulary-error`) — **no new
   diagnostic taxonomy is needed.**
4. **Reinforcement can use the repair target just triggered**, when
   relevant, to select a small, targeted follow-up question from the same
   family/pattern — again reusing existing data, no new mechanism.
5. **The existing repair-target architecture already supports this at the
   schema/content level.** It does **not** yet fully support it at the
   presentation level: only 2 of the 10 actually-used repair targets have
   real `REPAIR_CONTENT` today. Per Decision 8, closing this gap is **not**
   a mechanical "author all 8 remaining entries" task — Phase 10B-1 must
   audit each of the 8 and determine, per target, whether it genuinely
   needs (A) dedicated repair content, (B) shared/pattern-based repair
   content, (C) the existing generic fallback is actually fine, or (D)
   another evidence-supported treatment. Content should never be written
   merely to make a coverage number reach 10/10.

**Never** encode qualifier-to-answer shortcuts ("FIRST always means X") —
this applies identically to Explore's reference panel, Practice's
feedback, and Reinforcement's feedback.

## Content/architecture reuse — one curriculum model, multiple experiences — [APPROVED]

**Binding principle: ONE CURRICULUM, MULTIPLE LEARNING EXPERIENCES.** Do
not create a duplicate Explore curriculum, and do not fork separate
question engines per mode.

Confirmed directly (not assumed) that all of the following are already
lesson/domain-agnostic and require zero new data model to power Explore,
Practice, and Reinforcement:

- **Concepts, lessons, families, questions** (`content/production/*.json`) — already keyed generically, no per-mode duplication needed.
- **Prerequisite / recall graph** (`taughtConceptsFor`-style walk in `app/src/content/resolve.ts`) — already the mechanism that defines "taught so far"; reusable as the untaught-material boundary for Explore's concept picker and Practice's scope choice.
- **`familyVariantsFor()` / `selectFamilyVariant()`** (`resolve.ts` / `selection.ts`) — already generic over any `familyId`; this is the exact-repeat, unseen-then-least-recently-seen policy the design docs already specify for Explore & Practice.
- **`orderOptionsForDisplay()`** (`answerOrder.ts`) — already generic over any question id/exposure count.
- **`resolveQuestion()` / `resolveFeedback()`** (`resolve.ts`) — already produce the exact fixtures the existing `Question`/`FeedbackPanel`/`RepairScreen` components consume, unmodified.
- **`REPAIR_CONTENT` / `getRepairCheck()`** — the mechanism is reusable; the *content* is only 20% authored (see Decision 8 / Risks — to be audited per-target in 10B-1, not mechanically filled).
- **`exposureStore.ts`** — a single, already-global, module-scope, in-memory store keyed only by question id, with no session/mode partitioning. **[APPROVED] Share this one store across Daily Study, Explore, Practice, and Reinforcement** rather than inventing a second one — it already gives the desirable "don't immediately re-show something I just saw elsewhere" property for free, and matches the existing architecture's "one store, several readers" shape. This approval covers only the existing session-scoped in-memory architecture; it is not authorization for persistence. Not to be revisited unless later implementation evidence reveals a genuine defect.
- **`CONFUSING-CONCEPTS.md`** — already an authored, ready-made concept list for Explore's picker and for Reinforcement's confusing-concept-pair follow-ups.

**No new metadata is genuinely required** to build the MVP versions of
all three modes. The one genuine content gap is **repair-content
coverage** for 8 of 10 actually-used repair targets — to be resolved by
audit (per Decision 8), not by mechanically authoring 8 new entries.

## Persistence-boundary classification — [APPROVED]

No new localStorage, IndexedDB, backend persistence, authentication,
analytics, or AI product integration during Phase 10B. This boundary is
binding across every batch below.

**SESSION-CAPABLE NOW** (buildable in Phase 10B with zero persistence):

- Explore: concept picker scoped to the taught set; one or a few example scenarios per concept; immediate explanation.
- Practice: scope choice (unit/domain/all-taught-so-far); a bounded question session; immediate feedback/repair; a session-only summary (reset on reload, exactly like `exposureStore` already is).
- Reinforcement: a short targeted retrieval activity sourced from the just-completed lesson's own recall pool and/or the repair target just triggered, immediately after Completion.
- Sharing `exposureStore` across all modes (still in-memory only) — reinforce something just missed; avoid immediate question repetition; summarize the current Practice session; use the just-completed lesson; use the current repair target.

**REQUIRES FUTURE PERSISTENCE** — [FUTURE], explicitly not built or
simulated with fake persistence now:

- Weakest concepts over a time window (e.g. 30 days); long-term mastery history; persistent missed-question history; spaced repetition across days; a long-term confidence model; historical personalized Practice; cross-session adaptive reinforcement.
- Confidence-driven spacing-band prioritization (`selection.ts`'s
  `classifyConfidenceSignal`/`nextSpacingBand` already exist as pure,
  tested, **unwired** functions — reusable once persistence exists, not
  before).
- Real Mock Exam scoring/history.
- Anything described in `CURRICULUM-BLUEPRINT.md`'s "Post-curriculum:
  adaptive reinforcement" section (domain-level evidence-driven
  adaptation) — explicitly gated on all four domains being taught *and*
  persistence existing.

### Future weakness-based Practice — [FUTURE], recorded for later architecture only

**[APPROVED as future direction, NOT current MVP scope.]** Once
persistence is separately approved and exists, Practice may eventually
support "Practice what I'm weak on," using signals such as historical
misses, repeated repair targets, weak concepts, repeated reasoning errors,
or a confidence/mastery history. This must not be implemented, simulated,
or approximated with fake/in-memory-only persistence during Phase 10B —
it is recorded here purely so a future, separately authorized persistence
phase has a clear target to build toward.

## Navigation / information architecture — [APPROVED]

- **Daily Study**: unchanged, primary Home hero action.
- **Explore**: keep as a real, distinct top-level destination (the
  learner-chooses-a-concept intent genuinely differs from Daily Study),
  but visually quiet per the existing `[CANONICAL]` weight rule — a small
  labeled card/link, never hero-styled.
- **Practice**: also a real destination, same quiet visual weight,
  distinct entry point from Explore (two small cards or a single
  "Explore & Practice" secondary section that, once both are real,
  presents two clearly separate, small "start" affordances — matching
  `SCREEN-EXPLORE-PRACTICE.md`'s original "By-Domain / Weak-Areas as
  clearly-optional side quests" framing, generalized to "Explore /
  Practice as clearly-optional side quests").
- **Optional Reinforcement**: **not** a top-level nav destination.
  Recommended as a **contextual action offered only on the Completion
  screen**, immediately after a lesson — it has no meaning as a
  standalone destination a learner would navigate to independently of
  just having finished something. This also resolves the current
  "Optional 5-minute reinforcement" dead button by giving it exactly one
  real place to live and one real trigger, instead of a floating label.
- Mobile: the existing `BottomTabBar` already carries an "explore" icon
  slot; once Explore and Practice are real and distinct, the bottom tab
  bar and desktop `ProductNav` need a second small entry (Practice)
  alongside it — still within the existing three-or-four-item calm nav
  model, not a dashboard.
- Accessibility: reuse `Question`/`AnswerOption`/`FeedbackPanel`/
  `RepairScreen` as-is (already accessible, already covered by the a11y
  suite) rather than building new question-rendering UI for any mode —
  this is the cheapest way to avoid introducing new accessibility gaps.
  The one existing gap worth fixing *when* Practice is actually built
  is the missing page-level heading on the current Practice Exam mockup
  (`Question.tsx` renders only an `<h3>`, with nothing higher on that
  page) — add a real `<h1>`/`<h2>` for whatever screen replaces it.

## Domain 3/4 generic-compatibility strategy — [APPROVED, BINDING]

No mode may ever contain code shaped like `if (domain === "d1")` / per-domain
screen forks. Concretely:

- Explore's domain/concept picker must enumerate whatever `domains.json` +
  `content/production/concepts.json` currently contain — Domain 3/4
  appear automatically the moment their production content exists, with
  zero code change.
- Practice's scope choice ("current domain") must resolve generically from
  whatever `todaysLessonId`'s domain is — same mechanism `getHomeState()`
  already uses.
- Reinforcement's source (recall pool + repair target) is already
  domain-agnostic by construction (`recallPoolFor`/`repair_target` are
  domain-blind).

**Proposed generic future-domain tests** (to write *when* 10B is
implemented, not now): mirror the existing pattern already used in
`app/src/content/productionContentSource.ts`'s own doc-comment reference
to *"future Domain 2/3" coverage* in `tests/frontend/unit/production-
content.test.tsx` — i.e., a synthetic fixture domain/concept/family/
question (not real curriculum content) fed through Explore's concept
picker, Practice's scope resolution, and Reinforcement's source-selection
functions, asserting each surfaces the synthetic domain correctly with no
special-casing. This proves genericity without waiting for real Domain
3/4 content to exist.

## Reference+transfer and domain synthesis — reaffirmed [APPROVED], not implemented here

These are pre-existing binding curriculum principles (`CURRICULUM-
BLUEPRINT.md`'s Domain Synthesis / Capstone principle; the Domain 2
gate records) reaffirmed as part of this closeout, not new decisions:

- **Reference for comprehension + varied scenarios for transfer** remains
  binding. Domain 2's payment-system story is Domain 2's own reference
  model; Domain 3 and Domain 4 must each choose their own source-grounded
  reference model during their own architecture phases. Learning Modes
  (Explore in particular) should reuse whatever reference structure a
  domain already has where it genuinely helps comprehension, but must
  never cause a learner to memorize one story in place of transferable
  reasoning — Explore's "one example scenario" step should draw from
  varied scenarios over repeated visits, not always the domain's one
  reference story.
- **Domain synthesis/capstone remains required** for Domain 3 and Domain
  4 (each its own source-grounded synthesis unit, per D2-U10's proven
  pattern), Domain 1 remains exempt from retrofit unless future readiness
  evidence justifies one, and no synthesis content changes occur during
  this closeout or during the Phase 10B Learning Modes sequence below.

## Recommended implementation sequence — [APPROVED, FINAL]

Founder/Architect simplified the originally-proposed six batches to five:

- **10B-1 — Repair & Shared Learning Infrastructure.** Audit the 8
  currently-used repair targets without dedicated `REPAIR_CONTENT` and
  determine the correct treatment for each (dedicated / shared-pattern-
  based / existing-generic-is-fine / other — per Decision 8, never
  mechanically filled just to reach 10/10); implement only genuinely
  justified repair-content improvements; establish/reuse the shared
  question→answer→feedback→repair sub-loop (extracted from
  `DailyStudySession`'s existing apply→feedback→repair sequence) that
  Explore/Practice/Reinforcement will all sit on top of; explicitly
  preserve shared session exposure-store behavior; prove answer-order
  compatibility, question-family compatibility, and generic domain
  compatibility. Does **not** implement full Explore, Practice, or
  Reinforcement.
- **10B-2 — Explore.** Concept-driven experience per the approved flow
  above. Founder Human Experience Gate required before closeout.
- **10B-3 — Practice.** Deliberate bounded CISM reasoning practice per the
  approved flow above. Founder Human Experience Gate required before
  closeout.
- **10B-4 — Optional Reinforcement.** Replace the dead/misleading
  Completion-screen affordance with a genuine short contextual
  reinforcement experience. Founder Human Experience Gate required before
  closeout.
- **10B-5 — Learning Modes integration / Human Experience closeout.**
  Validate the complete MVP learning experience together (Daily Study,
  Explore, Practice, Optional Reinforcement): calm UX, no redundant modes,
  generic domain behavior, accessibility, mobile behavior, navigation
  clarity, no misleading/dead UI remaining, no persistence-boundary
  violation, no accidental Mock Exam implementation, Foundation/D1/D2
  preservation, and readiness to proceed to Domain 3 architecture.

Each batch stays small enough for an independent Founder Human Experience
Gate where noted.

## Human Experience Gates (plain language, per batch) — [APPROVED]

- **10B-1 (repair & shared infrastructure):** "When I get something wrong
  now, does the correction actually name my specific mistake, not just say
  'the same reasoning applies elsewhere'?"
- **10B-2 (Explore):** "Did I choose what I wanted to understand, and did
  Explore actually help me understand it?"
- **10B-3 (Practice):** "Did this feel like useful CISM reasoning practice
  rather than random trivia? Did the immediate feedback help me understand
  WHY?"
- **10B-4 (Reinforcement):** "Was this short enough that I would
  voluntarily do it? Did it reinforce something relevant to what I just
  learned or struggled with?"
- **10B-5 (integration closeout):** the overall gate — *"Do I immediately
  understand why I would choose Daily Study vs. Explore vs. Practice?"* —
  plus: does nothing in the app still look clickable but do nothing?
  (Reinforcement does not need its own version of the "why would I choose
  this" question, since it is contextual rather than a top-level
  destination the learner chooses among.)

## Risks / architectural concerns

1. **Repair-content coverage gap (8 of 10 actually-used repair targets have
   no dedicated content today)** — a pre-existing Daily Study gap, surfaced
   fresh this phase, that will otherwise silently limit Practice's and
   Reinforcement's feedback quality to generic text for most mistakes.
   Addressed by audit (not mechanical authoring) in 10B-1, before
   Practice/Reinforcement, not after.
2. **Naming collision risk**: "reinforcement" already means four different
   things in this codebase/docs (the canonical REINFORCE loop stage; the
   working `RecallScreen` explanatory text; the dormant
   `ConfidenceSignal`/spacing-band classification; and the dead
   Completion-screen button). Recommend the future implementation phase
   pick a learner-facing label that doesn't read as a synonym for the
   REINFORCE step that already happens during ordinary Feedback/Repair
   (e.g., keep "Optional Reinforcement" as the *feature* name, but avoid
   describing it internally as "the reinforce step" to prevent confusing
   it with the canonical loop stage in future architecture docs).
3. **Scope creep risk on Practice**: the existing `SCREEN-PRACTICE-EXAM.md`
   /`REPETITION-AND-RECALL-MODEL.md` docs describe a full Mock Exam that
   is easy to conflate with MVP Practice. The boundary table above is the
   guardrail; future phases should cite it explicitly rather than
   re-deriving it.
4. **`exposureStore` sharing decision** is a real architectural choice
   (share one store vs. partition per mode) with no wrong answer, but it
   should be made explicitly in 10B-2 rather than defaulted into, since it
   affects rotation behavior across modes.

## Cross-references

- [`CURRICULUM-BLUEPRINT.md`](CURRICULUM-BLUEPRINT.md) — first-pass loop, untaught-material rule, post-curriculum adaptive-reinforcement section.
- [`REPAIR-MODEL.md`](REPAIR-MODEL.md) — repair-target diagnostic vocabulary, Mixed Practice relationship.
- [`FOUNDATION-BLUEPRINT.md`](FOUNDATION-BLUEPRINT.md) — the six-step reasoning model's home and its approved future enhancement.
- [`CONFUSING-CONCEPTS.md`](CONFUSING-CONCEPTS.md) — ready-made Explore concept list.
- [`docs/data-model/REPETITION-AND-RECALL-MODEL.md`](../data-model/REPETITION-AND-RECALL-MODEL.md) — exact-repeat policy, confidence/spacing model, persistence boundary, per-mode selection-behavior table.
- [`docs/design-system/SCREEN-EXPLORE-PRACTICE.md`](../design-system/SCREEN-EXPLORE-PRACTICE.md), [`docs/design-system/SCREEN-PRACTICE-EXAM.md`](../design-system/SCREEN-PRACTICE-EXAM.md) — original visual-weight/gate-screen specs, refined (not replaced) by this document.
- [`docs/learning/PHASE-9B5-GATE-RECORD.md`](PHASE-9B5-GATE-RECORD.md) — the audit that triggered this phase.
