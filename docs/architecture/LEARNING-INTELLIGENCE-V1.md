# Learning Intelligence v1 — Architecture

**Status: Architect-approved in direction (this revision incorporates the
binding decisions from that review). Implementation not yet started — LI-1
begins only after this document is committed and the branch checkpoint is
confirmed.**

This document is the architecture deliverable for POST-MVP PHASE 1 (Learning
Intelligence v1). It was produced by inspecting the actual state of this
repository at baseline commit `aada8c8dcd309b5cc21084844d7eb6f88e3eff7d` (tag
`v1.0.0-mvp`) inside the isolated development worktree
`cism-study-companion-next` on branch `post-mvp/learner-intelligence`. Every
schema field, type, file path, and behavior cited below was read directly
from source; nothing is assumed or invented. Proposals not yet reduced to a
concrete rule (mainly exact numeric weakness-model tuning) are labeled as
such and deferred to LI-2 implementation planning, per the Architect's own
instruction — that is a scoped implementation refinement, not an unresolved
product-authority question.

**Revision note:** this is a revision of the original draft, incorporating
binding Architect decisions on the event model (immutable, discriminated,
append-only), the weakness-model vocabulary (named states, not a numeric
score), several previously-open decisions (now resolved — see §26), and the
finalized LI-1..LI-5 phase scope. Nothing in this revision changes any
verified fact about the repository; it changes proposals and resolves
decisions.

---

## 1. Problem statement

The released MVP (`v1.0.0-mvp`) teaches CISM material through four
learner-facing modes — Daily Study, Explore, Practice, and a
Daily-Study-contextual Reinforcement step — but retains **no memory of any
attempt across a page reload**. The only state that outlives a single
in-memory session is a module-scope exposure counter
(`app/src/content/exposureStore.ts`), and that resets on refresh. There is
no way for the app, or the learner, to answer "what have I gotten wrong,"
"am I improving," or "what should I study next" from real historical
evidence — only from what a human remembers.

Learning Intelligence v1 exists to close that gap: durably record what
actually happens in an attempt, and derive explainable, evidence-backed
answers to those four questions, without turning percentage scores into the
primary product surface.

## 2. Goals

- Durable, local-first, per-device history of every question attempt
  (Apply, Repair, and Recall), rich enough to recompute future insights as
  the derivation logic improves — not just aggregate scores.
- A deterministic, explainable weakness model expressed in named learner
  states, a confidence-calibration model, and a Repair-signal model, all
  built strictly from metadata that already exists and is populated in
  production content today.
- A small, calm "Insights" surface answering "what are the 2–3 things to
  focus on next," handing off into the *existing* Daily Study / Explore /
  Practice / Reinforcement engines rather than duplicating them.
- Zero interference with the released MVP: `main` stays exactly at
  `v1.0.0-mvp` until an explicit later release gate.

## 3. Non-goals (this phase)

- No authentication, accounts, cloud backend, or cross-device sync.
- No AI tutor, no opaque/ML scoring, and no learner-facing numeric weakness
  score — the weakness/recommendation models are inspectable arithmetic
  over recorded evidence, surfaced as named states, not numbers.
- No new learning-mode engine — Insights only directs learners into modes
  that already exist.
- No gamification (streaks, badges, XP, leaderboards).
- No implementation in this phase — this document is architecture only.
- No mutation of historical learner evidence as a routine part of the study
  flow (see §5 of the review, incorporated in §7/§9 below).
- No product/curriculum redefinition — every classification used below
  (domain, concept, family, pattern, qualifier, role, lifecycle, stage,
  decision type, evidence dimension, repair target) already exists in
  `schema/registry/` or `content/production/`; none is newly invented here.

## 4. Current MVP constraints (as found)

- **Runtime**: Preact 10 + Vite, TypeScript, no routing library — screen
  selection is local `useState` in `app/src/App.tsx`. `package.json`
  currently declares one runtime dependency (`preact`) and devDependencies
  for Vite/Vitest/Playwright/@testing-library/preact/jsdom/typescript. (The
  literal "zero runtime/dev dependencies... as of Phase 1" statement in
  `CLAUDE.md` is scoped to Phase 1 and predates these later, presumably
  deliberate, additions — noted here only so this document isn't read as
  contradicting that file.) `package.json` has no top-level `version` field.
- **Two, unrelated codebases coexist in this repository:**
  1. The legacy static prototype: root `index.html` loads 14 fixed
     `<script>` tags (`js/storage.js`, `js/study.js`, `js/daily-study.js`,
     `js/active-learning.js`, `js/mixed-practice.js`, `js/exam.js`,
     `js/app.js`, etc.), persists via **`localStorage`** across nine
     independently-versioned keys, and is the subject of
     `docs/engineering/BASELINE.md` and the open defects in
     `docs/regressions/REGISTRY.md` (BUG-001/002/003). It is **not**
     wired to the Preact app in any way (confirmed: no reference to
     `js/*.js` anywhere under `app/src/`).
  2. The real, current product: the Preact app under `app/src/`, backed by
     `content/production/*.json` + `schema/registry/*.json`. **This is the
     only place Learning Intelligence v1 should build.** Nothing in this
     architecture touches `js/*.js`, `data/*.js`, or the legacy
     `localStorage` keys — they are a separate, deprecated system, and
     `CLAUDE.md`'s dead-files rule means they must not be deleted
     unilaterally even though they're irrelevant here.
- **Confirmed via repo-wide grep**: `app/src/` contains no `localStorage`,
  `indexedDB`, or `sessionStorage` usage at all. The MVP's "no persistence"
  claim is accurate for the real app.
- **No session-ID concept exists anywhere in `app/src/`** (grep for
  `sessionId`, `session_id`, `crypto.randomUUID`, `uuid` returns nothing).
  LI-1 must introduce one.
- **Answer-option identity is already stable and durable, independent of
  display order.** `AnswerOptionFixture.key` (`"a"|"b"|"c"|"d"`,
  `app/src/types/content.ts:56-61`) is the option's permanent semantic
  identity, authored once in `content/production/questions.json` and never
  re-derived — `app/src/content/answerOrder.ts`'s own doc comment states
  this explicitly: *"Separates SEMANTIC option identity (an authored
  option's `key` — stable forever...) from DISPLAY POSITION."*
  `orderOptionsForDisplay()` only permutes array position for on-screen
  presentation; `displayPositionOf()`/`displayLetterForPosition()` convert
  back to a visual A/B/C/D letter for rendering only. **Learning
  Intelligence must record `option.key`, never the displayed letter or
  array index** — the display order is a deterministic, per-exposure
  shuffle (seeded by `questionId` + `exposureCount`) and is not durable
  identity. `option.key` is stable within one question but is not globally
  unique across questions — the durable compound identity for an answer
  choice is `(questionId, key)`.
- **Confidence is captured but silently discarded today.** `ConfidenceControl`
  (`app/src/components/ConfidenceControl/ConfidenceControl.tsx:4`) defines
  `type Confidence = "sure" | "not-sure" | "guessing"`, and
  `QuestionApplyScreen` collects it and calls
  `onSubmit(selectedKey, confidence)` (`QuestionApplyScreen.tsx:14,44-46`).
  But `QuestionAttemptFlow`'s handler only takes the key —
  `onSubmit={(key) => { setSelectedKey(key); setPhase("feedback"); }}`
  (`QuestionAttemptFlow.tsx:61-65`) — so confidence never reaches
  `buildFeedback` or anywhere else. **This is a real, bounded gap LI-1 must
  close** (thread confidence through), not a design decision to make fresh.
- **Repair outcome is captured nowhere.** `RepairScreen`
  (`app/src/screens/RepairScreen.tsx`) renders `repairCheck.options`, each
  of which already carries a `correct` boolean (same `AnswerOptionFixture`
  shape used everywhere), but the component never compares the learner's
  selection against it — `repairCheck.confirmation` is shown unconditionally
  once anything is selected (`RepairScreen.tsx:53`), and `onContinue()` takes
  no arguments (`RepairScreen.tsx:23,56`). The data needed to know whether
  the repair itself was answered correctly already exists on
  `RepairCheckFixture.options[].correct`; the UI simply doesn't read it yet.
  LI-1 must add that comparison and thread the result upward.
- **Recall outcome is captured nowhere either**, for the same reason:
  `RecallScreen` computes `selectedOption?.correct` locally to render
  "Actually: …" copy (`RecallScreen.tsx:25-26,53`) but `onContinue()` takes
  no arguments (`RecallScreen.tsx:12,61`), so the result never leaves the
  component.
- **Real repair-content branching, confirmed by reading
  `getRepairCheck`** (`app/src/content/productionContentSource.ts:395-403`):
  1. No `repairTargetId` on the feedback → generic `FALLBACK_REPAIR`.
  2. `repairTargetId` is `"repair.knowledge-gap"` or
     `"repair.vocabulary-error"` → attempt `buildAppliedConceptRepair()`
     (`productionContentSource.ts:209-248`), which builds a near-transfer
     micro-question from a **sibling variant in the same family**
     (`familyVariantsFor`), preferring a sibling whose option text doesn't
     leak the answer via keyword-matching, else the first sibling; if no
     sibling exists, this returns `undefined`.
  3. Otherwise (or if step 2 returned `undefined`) → static, per-target
     authored content, `REPAIR_CONTENT[repairTargetId]`, else
     `FALLBACK_REPAIR`.
  This is a real, three-way distinguishable branch — "near-transfer" (sibling
  question), "static" (authored per-target content), "fallback" (generic) —
  even though those three words are not literal type names in the source
  today; LI-1 introduces `repairCheckKind` as its own new classification of
  this existing behavior, not a value already stored anywhere.
- **Testing**: two independent runners. `node --test` covers
  `tests/data-integrity/`, `tests/data-model/`, `tests/content-production/`
  (pure content/schema validation, zero framework deps). Vitest
  (`vitest.config.ts`, environment `jsdom`) covers
  `tests/frontend/unit/**/*.test.{ts,tsx}` with `@testing-library/preact`.
  Playwright covers `tests/frontend/e2e/`, `tests/frontend/visual/`
  (Chromium + Firefox in CI). `jsdom` does not implement IndexedDB — see §6
  for the Architect-approved resolution.
- **CI** (`.github/workflows/ci.yml`) runs five jobs on every push/PR:
  `legacy` (node --test on data-integrity + data-model), `content-production`,
  `frontend` (typecheck → build → vitest → playwright e2e), `security`
  (`npm audit --audit-level=moderate`), `visual` (Playwright visual
  regression, Chromium only). Any LI-1 test suite must slot into this
  existing structure, not replace it.

## 5. Stable-main / worktree development model

Confirmed and executed as of this document:

| | Stable study version | Development version |
|---|---|---|
| Folder | `/Users/demetrius/Projects/cism-study-companion` | `/Users/demetrius/Projects/cism-study-companion-next` |
| Branch | `main` | `post-mvp/learner-intelligence` |
| Baseline | `aada8c8` / `v1.0.0-mvp` | branched from `main` at `aada8c8` |
| Recommended runtime | production build + `vite preview` | `vite` dev server |
| Preferred port | 4173 | 5174 |

No package script changes were made or are needed merely to force these
ports. The stable folder was not modified in any way during this phase or
this revision (verified: its `git status` is clean and its branch is `main`,
checked before and after each execution).

## 6. Persistence approach (Architect-approved)

**IndexedDB**, accessed through a thin, project-owned adapter — no ORM
library (Dexie, idb, etc.), no remote database, no Supabase/Firebase, no
authentication or account system, no cloud sync.

- **Database**: one IndexedDB database (e.g. `cism-li`), with an integer
  `version` used for `onupgradeneeded` migrations.
- **Object store `events`**: keyPath `eventId`; append-only, immutable event
  log (§7). Indexes on `sessionId`, `questionId`, `familyId`, `domain`,
  `occurredAt`, `learningMode`, and `parentAttemptId` (for `REPAIR_ATTEMPT`
  lookups) — every insight query in §9–§14 is a scan or index-range query
  over this one store.
- **Object store `meta`**: a single well-known key holding
  `{ eventSchemaVersion, insightEngineVersion, dbVersion, createdAt }` —
  the versioning anchor for §19.
- **No persistent derived-insight cache in LI-1 or LI-2** (Architect
  decision, §15 of the review — see §15 below). Insights are computed by
  pure, deterministic derivation directly over the `events` store at read
  time. If a future measured performance need justifies a cache, it is
  introduced later as an explicit, versioned, safely-rebuildable addition —
  not built speculatively now.
- All writes/reads go through a narrow `LearningHistoryStore` interface
  (append/get/query), the same "pure logic vs. one impure store" separation
  `exposureStore.ts` and `selection.ts` already establish for exposure
  history — `exposureStore.ts`'s own doc comment (lines 10–15) explicitly
  anticipates this: *"Shaped as a get/record pair specifically so a future
  real persistence layer (IndexedDB...) can implement the same interface
  without any change to selection.ts or productionContentSource.ts."*
  LI-1 should honor that seam rather than route IndexedDB calls through UI
  components directly. The interface only ever **appends** events; it
  exposes no update/delete operation for routine study-flow use (see §7).

**Testing dependency — Architect-approved, not added in this
architecture-only execution:** `fake-indexeddb` is approved as a **dev-only**
dependency, to be introduced during LI-1 implementation (when the adapter is
actually written), not now. Reason: persistence behavior deserves
deterministic unit/integration coverage in the existing Vitest/jsdom
environment rather than relying exclusively on slower, real-browser
Playwright coverage. Per `CLAUDE.md`'s dependency-discipline rule, LI-1's
implementation PR must record this addition explicitly (what it is, why it
was needed, scoped to test-only use).

## 7. Event model (revised — Architect-approved)

**The previously-proposed "one Apply/Recall row with an embedded Repair
sub-object" is superseded.** Learning Intelligence v1 uses an **immutable,
append-only, discriminated `LearningEvent` log**. Once written, an event is
never mutated by routine study flow — a Repair result is a **new event**
that references its originating attempt, not an edit to that attempt's
record. This is a firm architectural rule (§9 of the review): insight
recomputation, later Repair, or later question-metadata edits must never
rewrite historical events. Only an explicit, versioned **schema migration**
(§19) may transform stored events, and only for schema-shape evolution —
never as part of normal recording.

```ts
type LearningEvent = QuestionAttemptEvent | RepairAttemptEvent;

interface BaseEvent {
  eventId: string;              // uuid v4, primary key
  eventSchemaVersion: 1;
  occurredAt: number;           // Date.now() at submission
  sessionId: string;            // uuid v4, minted once per learning-mode session instance (NEW)
  learningMode: "daily-study" | "explore" | "practice" | "reinforcement";
  sourceContext: "production" | "prototype"; // App.tsx's contentSourceMode at record time;
                                              // "prototype"/QA attempts must never enter real insight computation (§25 risk)
}

interface QuestionAttemptEvent extends BaseEvent {
  type: "QUESTION_ATTEMPT";
  attemptId: string;             // == eventId; named separately so RepairAttemptEvent.parentAttemptId reads naturally
  attemptKind: "apply" | "recall";

  // Content identity — snapshotted from ProductionQuestion at attempt time.
  questionId: string;               // e.g. "question.d2.0005"
  familyId: string | null;          // ProductionQuestion.family — 100% populated today, schema allows null
  conceptIds: string[];             // ProductionQuestion.concepts — 100% populated
  domain: string;                   // ProductionQuestion.domain
  patterns: string[];               // ProductionQuestion.patterns — 96% populated
  qualifier: string | null;         // ProductionQuestion.qualifier — 73% populated
  primaryRole: string | null;       // ProductionQuestion.primary_role — 37% populated
  lifecycle: string | null;         // ProductionQuestion.lifecycle — 28% populated
  stage: string | null;             // ProductionQuestion.stage — 25% populated
  decisionType: string | null;      // ProductionQuestion.decision_type — 79% populated
  evidenceDimensions: string[];     // ProductionQuestion.evidence_dimensions — 100% populated
  contentStatusAtAttempt: string;   // ProductionQuestion.content_status snapshot, e.g. "CANDIDATE" —
                                     // internal governance state; NEVER surfaced verbatim in learner-facing UI (§23)

  // The attempt itself.
  selectedOptionKey: "a" | "b" | "c" | "d"; // AnswerOptionFixture.key — stable per-question identity, NOT display letter (§4)
  correctOptionKey: "a" | "b" | "c" | "d";  // derived at record time from raw.options.find(o => o.correct).key
  correct: boolean;
  confidence: "sure" | "not-sure" | "guessing" | null;
    // populated for "apply" once the §4 threading gap is closed;
    // null for "recall" in LI-1 (no new confidence interaction added — §8 of the review)
  repairTargetId: string | null;    // the *selected option's* repair_target — only meaningful when correct === false
}

interface RepairAttemptEvent extends BaseEvent {
  type: "REPAIR_ATTEMPT";
  repairAttemptId: string;       // == eventId
  parentAttemptId: string;       // -> the QuestionAttemptEvent.attemptId this repair was triggered by (never mutates it)
  repairTargetId: string | null; // the target that produced this repair check
  repairCheckKind: "near-transfer" | "static" | "fallback"; // derived from getRepairCheck's real branching (§4); a new classification, not a pre-existing stored value
  siblingQuestionId: string | null; // populated only for "near-transfer" (buildAppliedConceptRepair's chosen sibling)
  selectedOptionKey: "a" | "b" | "c" | "d";
  correct: boolean;
}
```

Notes on fields deliberately **not** included, and why:

- **Role target / lifecycle-stage "target"** (as opposed to the question's
  own `primary_role`/`lifecycle`/`stage`) exists on `ProductionFamily`
  (`role_target`, `lifecycle`, `stage_target`) but is a *family-level*
  authoring intent, not a per-attempt fact — it's derivable by joining
  `familyId` at read time, so storing it per-event would duplicate data.
- **The full sibling set** is not stored — only the one sibling actually
  consulted (`siblingQuestionId` on a near-transfer `RepairAttemptEvent`);
  the full set is always derivable later via `familyId`.
- **"Whether Feedback occurred"** is not stored — Feedback is unconditional
  in the current product (`QuestionAttemptFlow.tsx` always renders
  `FeedbackScreen` between Apply and completion/Repair), so it is not a
  variable worth recording as evidence.
- No `appVersion` field is required on every event — see §19 for why this
  was deliberately not made a hard per-event dependency.

Why a `QuestionAttemptEvent`/`RepairAttemptEvent` split rather than one row
with an embedded `repair` object: it directly satisfies the immutability
rule above — a Repair event is written only once Repair actually happens,
strictly *after* its parent attempt event is already durably stored, and
never requires reopening or rewriting that parent record. `attemptKind`
distinguishes Apply from Recall within `QuestionAttemptEvent` rather than
introducing a third top-level event type, since both are "one question,
one decision" facts with an identical field shape; only Repair is
structurally a second, dependent decision.

## 8. Current metadata available for insight derivation

From `content/production/questions.json` (127 questions, all `CANDIDATE`
content status today — none `CANONICAL` yet; see §23 for how this is
handled without blocking Learning Intelligence):

| Field | Populated | Reliable enough for insights now? |
|---|---|---|
| `family` | 127/127 (100%) | Yes — primary grouping key |
| `concepts` | 127/127 (100%) | Yes |
| `evidence_dimensions` | 127/127 (100%) | Yes |
| `patterns` | 122/127 (96%) | Yes |
| `decision_type` | 100/127 (79%) | Yes, with "not applicable" handled as a real state |
| `qualifier` | 93/127 (73%) | Yes, with "not applicable" handled as a real state |
| `primary_role` | 47/127 (37%) | Usable, but too sparse to be a *primary* insight axis yet |
| `lifecycle` / `stage` | 36/127 (28%) / 32/127 (25%) | Usable only where present — never treated as a gap to penalize (§21 of the review, §14 below) |

Controlled vocabularies confirmed in `schema/registry/`:

- **Domains** (`domains.json`): `domain.d1..d4` + `domain.foundation`, each
  with `exam_weight` (17/20/33/30; foundation explicitly excluded from
  exam-domain weighting/analytics per its own `note`).
- **Qualifiers** (`qualifiers.json`): 5 `CANONICAL` (`first`, `next`,
  `best`, `most`, `primary`) + 3 explicitly `PROTOTYPE_REFERENCE`
  (`primarily`, `greatest`, `main`) marked *"must not be used on a
  CANONICAL question."* Since all current questions are `CANDIDATE`, both
  sets can appear today; insight code must not silently conflate them with
  the canonical five.
- **Roles** (`roles.json`): 11 entries, each with `typical_authority`,
  `common_traps`, `nuance` — rich enough to name a role-confusion weakness
  in the learner's own vocabulary, not just an ID.
- **Lifecycles/stages** (`lifecycles.json`, `lifecycle-stages.json`): only
  two lifecycles exist — `lifecycle.risk` (8 stages, Domain 2) and
  `lifecycle.incident` (6 stages, Domain 4). Domains 1 and 3 have no
  lifecycle model at all.
- **Decision types** (`decision-types.json`): 5 (`business`, `risk`,
  `program-control`, `incident`, `recovery`).
- **Repair targets** (`repair-targets.json`): 10 entries, fields
  `id`, `display_name`, `description`, `related_evidence_dimension`,
  `content_status`, `verification_status`, `source`, `version`. Each
  declares exactly one `related_evidence_dimension` — this mapping is
  already the intended Evidence↔Repair reconciliation
  (`docs/data-model/EVIDENCE-VOCABULARY.md`,
  `docs/data-model/REPAIR-VOCABULARY.md`) and should be reused verbatim,
  not re-derived.
- **Evidence dimensions** (`evidence-dimensions.json`): 12, of which 11
  declare `contributes_to_mastery: true`; `evidence.confidence` is the one
  explicit exception, by deliberate architectural decision recorded in the
  registry entry itself: *"self-reported confidence must NOT directly
  increase knowledge mastery merely because confidence is high."* LI-1's
  weakness model **must** honor this — confidence can inform *which*
  weakness to surface or how urgently, but must never itself count as
  mastery evidence.
- **Patterns** (`patterns.json`): 15 (`pattern.p01`–`p15`), each with its
  own `common_traps` and `memory_rule` — directly reusable as
  recommendation copy (§14) rather than inventing new language.

## 9. Weakness model — named states, not a numeric score (Architect-approved)

**No opaque numeric "weakness score" is ever exposed to the learner.**
Internal ranking values (e.g. for sorting recommendations, §14) may exist
in derivation code, but every learner-facing classification is one of four
approved states:

- **NOT ENOUGH EVIDENCE** — below the minimum-evidence floor (§10).
- **NEEDS REVIEW** — minimum evidence met, and a real repeated-problem
  condition is present (§13).
- **DEVELOPING** — minimum evidence met, mixed or improving signal, not yet
  meeting either the Needs Review or Stronger Evidence bar.
- **STRONGER EVIDENCE** — meets the higher bar in §12. Never described as
  "mastered" or permanent.

Computed per evidence axis (concept, family, pattern, evidence dimension —
and, only where genuinely populated, role/lifecycle/stage within Domain
2/4, per §8's sparsity finding), over that axis's recorded
`QuestionAttemptEvent`s where `attemptKind === "apply"` (Recall is
secondary evidence, §11):

```
n              = count of apply attempts on this axis
distinctQuestions = count of distinct questionId values among them
misses         = count where correct === false
missRate       = misses / n
repairFailures = count of linked RepairAttemptEvents where correct === false
highConfidenceMisses = count where correct === false && confidence === "sure"
recentWindow   = the bounded recent-history window (§11)
```

Every flagged axis carries an explainable **reason string** built from the
data that triggered it (e.g. "3 recent misses, 2 with high confidence,
concept.d2.risk-treatment-selection"), never a bare score — this is what
answers "why am I seeing this?" (§14).

**The exact deterministic trigger formula for NEEDS REVIEW (§13) and the
precise DEVELOPING/STRONGER EVIDENCE boundary are finalized during LI-2
implementation planning**, per the Architect's explicit instruction — the
floors and bars below are binding; the fine-grained combination logic is a
scoped LI-2 design task, not an open product-authority question.

## 10. Minimum-evidence safeguards (binding)

Before any axis may be classified as anything other than NOT ENOUGH
EVIDENCE:

- **n ≥ 3** apply attempts on that axis (mirrors
  `ProductionFamily.minimum_variant_count`, already ≥3 for every family in
  production content today).
- At least **2 distinct `questionId`s** contributing (never one repeated
  question inflating `n`).
- Below this floor: **NOT ENOUGH EVIDENCE** — a real, displayed state,
  never silently omitted and never guessed at. One isolated miss must never
  produce "you are weak at X."

## 11. Recency / trend model

- A bounded rolling window (proposed default: last 10 apply attempts per
  axis, or last 30 days, whichever is smaller) distinguishes "recent" from
  "historical" evidence. No statistical model is fit to this small,
  per-learner dataset — the window is a simple recency bound, not a
  regression.
- Trend is surfaced only as directional language, one of:
  **Improving**, **Mixed / Developing**, **Needs Review** — never a
  fabricated precise percentage delta ("fake decimal precision" is
  explicitly prohibited).
- Stale old misses are not weighted equally forever: the recent window
  dominates the classification in §9; older evidence still counts toward
  the minimum-evidence floor (§10) but not toward "recent" signals like
  `highConfidenceMisses`.
- Recall attempts (`attemptKind === "recall"`) are recorded and available,
  but are treated as **secondary** evidence relative to Apply transfer
  performance in every model in this document — they inform trend
  observations but do not by themselves drive a NEEDS REVIEW classification.

## 12. Stronger-evidence bar (higher than the weakness floor)

To classify an axis as **STRONGER EVIDENCE**, all of the following must
hold (initial architecture requirement; exact tuning refined in LI-2):

- At least **5** relevant apply attempts.
- At least **3** distinct questions/variants.
- Consistently correct performance within the recent window (§11).
- No meaningful recent Repair-failure pattern (§13) on this axis.

Never described to the learner as "mastered" or permanent — the approved
language is **"Stronger evidence."**

## 13. Confidence-calibration model

`app/src/content/selection.ts` already contains a conceptual mapping LI-1
should reuse rather than reinvent:

```ts
type ConfidenceSignal =
  | "strong-repair-priority"   // incorrect + high confidence
  | "normal-repair"            // incorrect + low confidence
  | "reinforcement-candidate"  // correct + low confidence
  | "healthy-calibration";     // correct + high confidence

function classifyConfidenceSignal(correct: boolean, highConfidence: boolean): ConfidenceSignal
```

(`selection.ts:82-93`, explicitly documented as "classification only — not
wired into live selection yet.") LI-1's confidence-calibration insight is
the first real consumer of this existing function — called with
`highConfidence = confidence === "sure"`, collapsing `"not-sure"`/
`"guessing"` into "not high confidence." The adjacent `SpacingBand`/
`nextSpacingBand` machinery is **not** proposed for LI-1 — it targets
future *selection* behavior, out of scope until a later phase explicitly
revisits spaced repetition.

Approved evidence signals (not psychological diagnoses — cautious,
pattern-level language only, per `evidence-dimensions.json`'s own
`evidence.confidence` guardrail: confidence never itself counts as mastery
evidence):

- **SURE + INCORRECT** → contributes to `highConfidenceMisses` (§9); framed
  to the learner as "you tend to feel sure on X and be wrong," never
  "misconception" stated as settled fact.
- **NOT-SURE/GUESSING + CORRECT** → framed as "may be fragile" — knowledge
  present but not yet confidently held.
- **Repeated SURE + CORRECT** on an axis → supportive evidence toward
  STRONGER EVIDENCE (§12), never sufficient on its own.

## 14. Repair signal model

Three distinguishable states, all directly representable via a
`RepairAttemptEvent.parentAttemptId` join back to its `QuestionAttemptEvent`
(§7) — never by mutating the original attempt:

1. **Incorrect Apply + correct Repair** (`RepairAttemptEvent.correct ===
   true`): the learner successfully applied the correction during
   immediate near-transfer. This does **not** convert the original miss
   into a correct answer — both events remain, unmodified, exactly as they
   occurred.
2. **Incorrect Apply + incorrect Repair** (`RepairAttemptEvent.correct ===
   false`): stronger evidence that the misconception may remain — this is
   the single strongest per-axis signal toward NEEDS REVIEW (§9/§13).
3. **Correct Apply** (Repair never shown): no `RepairAttemptEvent` exists
   for this attempt — a real, structural absence, not a null/placeholder
   value.

This requires the RepairScreen gap in §4 to be closed in LI-1 (comparing
the selection against `repairCheck.options[].correct` and reporting it
upward as a new `RepairAttemptEvent`) — the model above assumes that fix
exists; it does not exist in the MVP today.

## 15. Recommendation model

Deterministic, ranked, from axes classified NEEDS REVIEW (§9), capped at
**3 primary recommendations** shown at once (Architect-approved cap — never
overwhelm the learner with a long weak-area list). Lower-evidence or
lower-severity flagged axes are deferred, not all surfaced simultaneously.

1. Rank NEEDS REVIEW axes by: Repair failures first, then recent
   high-confidence misses, then plain miss rate, then recency — surfacing
   the most concerning, best-evidenced item first. (Exact tie-breaking
   refined in LI-2, per §9.)
2. For each, generate a recommendation using **existing curriculum
   language**, never invented copy:
   - Concept/family weak → `"Review {concept.display_name}"`,
     `"Practice questions involving {family.teaching_objective}"`.
   - A specific `repair_target` recurs → surface its
     `repair-targets.json` `display_name`/`description` verbatim.
   - A `pattern` recurs across misses → use that pattern's own
     `common_traps`/`memory_rule` from `patterns.json`.
3. Every recommendation must answer, in its own copy: **why am I seeing
   this?** (a one-line reason built from real recorded evidence, e.g. "3
   recent misses across multiple scenarios, 2 answered Sure") and **what
   should I do next?** (a single primary handoff action, §16).
4. At most **one** STRONGER EVIDENCE line may also be shown ("you're
   consistently strong here — spend time elsewhere"), so it never competes
   for attention with the weak-axis list.

**The exact ranking/tie-break formula is a starting proposal, refined
during LI-2 implementation, not an approved final algorithm.**

## 16. Study-targeting handoffs

Insights hands off into the **existing** engines only — no new
learning-mode logic:

- **"Review this concept"** → Explore, via the exact mechanism Practice's
  summary and Reinforcement's completion screen already use:
  `onExploreConcept(conceptId)` (`App.tsx:224-227`,
  `handleExploreConceptHandoff`). Insights becomes a third caller of an
  interface two modes already use — no new plumbing.
- **"Practice this domain"** → Practice's existing `listPracticeScopes()` /
  `buildPracticeSession()` (`app/src/content/practice.ts`), scoped by
  `domain` (`PracticeScopeOption.id` is already a domain id or `"all"` —
  `practice.ts:26,69-85`).
- **"Practice this concept" — Architect-approved as a Learning Intelligence
  capability, explicitly deferred to LI-4**, not LI-1. It must extend
  `listPracticeScopes`/`buildPracticeSession` to accept a concept-id scope
  (a small, additive, behavior-preserving change to that existing module —
  implementation authority, not a new engine) rather than building a
  separate targeted-practice system.
- **"Continue Daily Study"** → unchanged; Daily Study's own curriculum
  sequencing is untouched by this phase.

## 17. Insights UX information architecture (LI-3, not LI-1)

A fifth top-level destination, added the same way the existing four are
wired in `App.tsx`:

- `PRODUCT_NAV_ITEMS` gains `{ id: "insights", label: "Insights" }`
  (`App.tsx:40-45`).
- `PRODUCT_ENTRY_SCREEN` gains `insights: "insights"` (`App.tsx:47-52`).
- `sectionForScreen()` gains an `insights` branch (`App.tsx:153-158`).
- `BottomTabBar`'s `ICONS` map (`BottomTabBar.tsx:5-30`) needs one new
  icon, matching the existing calm, single-stroke SVG style.
- `renderScreen()` gains an `"insights"` case rendering a new
  `InsightsScreen`.

**Approved primary information hierarchy, in order:**

1. What should I study next? (top 2–3 recommendations, §15)
2. Why? (the reason line for each)
3. What recurring reasoning issue is causing misses? (the pattern/
   repair-target framing, §15)
4. Am I improving? (directional trend language, §11)
5. What am I consistently doing well? (at most one STRONGER EVIDENCE line)

Domain-level performance may appear, but only **secondarily and
de-emphasized** — never the page's focal point, and never rendered as the
first thing the learner sees. An explicit **"not enough evidence yet"**
empty state is required for a learner with too little history (§10) — never
a fabricated recommendation to fill the space. No charts, streaks, badges,
or red/anxiety-coded UI.

## 18. Privacy / local-data model

- All Learning Intelligence data lives in this browser's IndexedDB, on
  this device, and nowhere else. No network calls are introduced.
- Copy must state plainly: history is stored on this device/browser only,
  is not backed up, and is lost if browser data is cleared. No implication
  of remote backup or sync anywhere in copy.

## 19. Study data controls (placement — Architect-approved)

Placed unobtrusively **within the future Insights experience**, under a
section such as **"Study data"** — no separate Settings product area is
built merely for LI-1.

- **Reset**: a single, explicit action clearing the `events` store
  entirely, gated behind **required confirmation**.
- **Export**: a schema-versioned JSON dump of the raw `events` store — the
  natural, low-effort implementation, requiring no new serialization format
  beyond the event schema itself.
- **Import**: **deferred**, not part of LI-1/LI-2/LI-3. No current
  requirement justifies it, and the legacy prototype's own
  `importData`/`validateImport` machinery (`js/storage.js`, flagged in
  `BASELINE.md` as a historically fragile area) is a cautionary example,
  not a pattern to port forward.

## 20. Versioning / migration strategy

- `eventSchemaVersion` (starts at `1`) is a **required** field on every
  stored event — this is the compatibility anchor for future schema
  evolution and must exist from LI-1's first write.
- `insightEngineVersion` (stored in the `meta` object store, §6) versions
  the **derivation logic** independently of event shape — a future change
  to the weakness formula does not require touching or migrating a single
  stored event.
- IndexedDB's own integer `version` on the database handles object-store
  and index structural changes (`onupgradeneeded`) — separate from and
  coarser than `eventSchemaVersion`.
- **`appVersion` is explicitly NOT a hard architectural dependency for
  LI-1** (Architect decision, §22 of the review). `package.json` has no
  `version` field today, and introducing a per-event dependency on a
  convention that doesn't exist yet risks a field that goes stale
  immediately. If useful later, an app/release version may be recorded as
  **optional** build metadata (e.g. on the `meta` record, not on every
  event) once package-version discipline is separately established.
- Migration functions must be pure (`(oldEvent) => newEvent`), covered by
  the same "reproducible from a clean checkout" test discipline as
  everything else in this repo (§21). Because events are immutable and
  append-only (§7), a migration only ever needs to reshape stored records
  on schema-version bump — it never needs to reconcile concurrent writes
  or partial updates.

## 21. Testing strategy

- **Pure logic** (weakness/recommendation/confidence/trend derivation,
  event-shape validation, migration functions): plain functions over
  in-memory arrays of `LearningEvent`, testable under `node --test` or
  Vitest with zero IndexedDB involvement — mirroring how `selection.ts` is
  tested today (pure functions, explicit inputs, no I/O).
- **The IndexedDB adapter itself** (`LearningHistoryStore`): covered via
  `fake-indexeddb`, added as a new, narrowly-scoped dev dependency during
  LI-1 implementation (§6) — enabling fast Vitest coverage of
  append/get/query/migrate without relying solely on real-browser
  Playwright coverage.
- **UI gap fixes** (confidence threading, Repair/Recall outcome reporting,
  §4): covered the same way existing screen/flow tests already are —
  `tests/frontend/unit/question-attempt-flow.test.tsx`,
  `repair-coverage.test.ts` are the existing files whose coverage these
  changes extend, not replace.
- **No regression to existing modes**: the existing
  `learning-modes-integration.test.ts`,
  `daily-study-reinforcement.test.tsx`, `practice.test.ts`,
  `explore.test.ts` suites must continue passing — LI-1 adds new call
  sites (recording an event) alongside existing behavior; it does not
  change existing return values or component contracts except the three
  additive signature changes in §4 (implementation-authority bug fixes,
  not redesigns).
- Per `CLAUDE.md`'s one rule: no LI test may be described as "passing" or
  "verified" unless it is committed, reproducible from a clean checkout,
  and run by CI — this document does not describe any test as already
  passing, since none has been written yet.

## 22. CI implications

- New Vitest files under `tests/frontend/unit/` are picked up automatically
  by the existing `frontend` CI job's test step — no workflow change
  needed.
- Adding `fake-indexeddb` (dev-only) means the existing `security` job's
  `npm audit --audit-level=moderate` gate applies to it automatically — no
  new job needed, but a vulnerable transitive dependency could legitimately
  fail CI, which is expected and correct behavior, not a bug to work
  around.
- No new CI job is proposed for LI-1; existing jobs are believed
  sufficient.

## 23. Performance considerations

- IndexedDB writes are async and off the main thread's synchronous path;
  recording one event per Apply/Repair/Recall submission is a single small
  write at human-interaction speed, not a perf-sensitive hot path.
- Insight computation (§9–§15) runs as a bounded scan over one learner's
  own history — realistically hundreds to low thousands of rows for an
  individual studying for one exam. Per §6, no persistent cache is built in
  LI-1/LI-2; this is revisited only if a measured performance need
  emerges, not spec'd against speculative future scale now.

## 24. Future backend migration path

The `LearningHistoryStore` interface (§6) is the seam: a future backend
migration means writing a second implementation of the same interface
(e.g. backed by `fetch` calls to a real API) and swapping it in, exactly
as `exposureStore.ts`'s own doc comment already anticipates for exposure
history. `LearningEvent`'s immutable, append-only, self-describing shape
(explicit `eventSchemaVersion`, no client-only/DOM state) is specifically
designed so it could be uploaded verbatim to a future server-side event
store without redesign — a property to preserve, not new work to do now.

## 25. Candidate-content disposition (Architect-approved)

All current production curriculum remains `content_status: "CANDIDATE"`
under project governance (127/127 questions, §8). This does **not** block
Learning Intelligence — LI operates against the currently accepted active
production curriculum as-is.

- **Learner-facing Insights copy must never expose internal governance
  language** such as "CANDIDATE content" unless a separate product
  requirement calls for it.
- `contentStatusAtAttempt` is still snapshotted on every
  `QuestionAttemptEvent` (§7) specifically so that a later curriculum
  status change (e.g. promotion to `CANONICAL`, or a content correction)
  cannot silently reinterpret what a historical attempt actually measured —
  the event records the content's state *at the time of the attempt*, not
  a live join to today's content.

## 26. Implementation phases (finalized)

- **LI-1 — Local learning history foundation.**
  - IndexedDB adapter (`LearningHistoryStore`), immutable event model (§7).
  - `QUESTION_ATTEMPT` recording (Apply and Recall).
  - `REPAIR_ATTEMPT` recording, linked via `parentAttemptId`.
  - Capture existing Apply confidence (close the §4 threading gap).
  - Capture Recall correctness (close the §4 gap) — no new confidence
    interaction added to Recall.
  - Close the Repair-outcome reporting gap (§4/§14).
  - `eventSchemaVersion` + IndexedDB structural versioning (§20).
  - Reset-service foundation (clearing the `events` store; UI wiring can
    follow in LI-3).
  - `fake-indexeddb` added as a scoped dev dependency, with adapter tests.
  - **No Insights navigation/UI yet.**
- **LI-2 — Deterministic insight engine.**
  - Evidence grouping by axis (concept/family/pattern/evidence dimension,
    plus role/lifecycle/stage where populated).
  - Minimum-evidence enforcement (§10) and the Stronger-Evidence bar (§12).
  - NOT ENOUGH EVIDENCE / NEEDS REVIEW / DEVELOPING / STRONGER EVIDENCE
    state derivation, with the exact trigger formula finalized here (§9).
  - Confidence calibration (§13), Repair signals (§14).
  - Recent-window / trend logic (§11).
  - Recommendation candidate generation and ranking (§15).
  - Fully pure, deterministic, unit-testable — no UI.
- **LI-3 — Insights learner experience.**
  - `InsightsScreen` + nav wiring (§17), reading from LI-2's computed
    insights.
  - Top 2–3 focus areas, why-this-is-recommended explanations.
  - Evidence-aware "not enough history yet" empty state.
  - Stronger-areas line, trend language.
  - "Study data" section: export, reset (with confirmation) — §19.
- **LI-4 — Targeted study handoffs.**
  - "Review Concept" → Explore handoff (already-existing mechanism, §16).
  - "Practice Domain" → existing Practice scope (§16).
  - "Practice Concept" → extend `listPracticeScopes`/`buildPracticeSession`
    with a concept-id scope (additive change to an existing module, §16) —
    no duplicate practice engine.
- **LI-5 — Learning Intelligence acceptance / release.**
  - Whole-feature evidence across all four learning modes.
  - Regression validation (no change in behavior for Daily Study / Explore
    / Practice / Reinforcement outside the additive recording/handoff call
    sites).
  - Founder/Architect review.
  - Only then: PR to `main`, and a separate release/version decision.

Each phase lands as its own reviewable unit on
`post-mvp/learner-intelligence`, independently testable.

## 27. Risks

- **All production content is `content_status: "CANDIDATE"`**, none
  `CANONICAL` yet — mitigated per §25 (snapshotted, never exposed verbatim
  to learners).
- **Sparse fields** (`primary_role` 37%, `lifecycle`/`stage` 28%/25%) make
  role- and lifecycle-based insights available only for a subset of
  content. §10's minimum-evidence floor is the primary defense; missing
  metadata is treated as **unavailable metadata**, never as negative
  learner evidence (§25 of the review) — Domains 1 and 3 must never be
  penalized for having no lifecycle model at all.
- **Three real UI gaps must be fixed in LI-1** (§4/§14) before any
  Repair/Recall/confidence evidence is trustworthy — if skipped, LI-2's
  Repair signal model has nothing real to compute over.
- **`fake-indexeddb` is a new dependency** — narrowly scoped to dev/test
  use, must be explicitly recorded per `CLAUDE.md`'s dependency-discipline
  rule when added in LI-1, not silently introduced.
- **Prototype-sourced attempts must never contaminate real evidence** —
  `App.tsx`'s `contentSourceMode` ("prototype" vs "production") already
  distinguishes QA/demo content from real production content;
  `LearningEvent.sourceContext` exists specifically to make this
  filterable, but every LI-1 recording call site (including the dev-only
  `PrototypeSwitcher` review-lesson panel) must actually set it correctly.

## 28. Open Architect decisions

Most of the original open decisions are now resolved by the Architect
review (see the revision note at the top of this document, and §6/§16/§19/
§20/§25 above). What remains genuinely open:

1. **Exact NEEDS REVIEW / DEVELOPING / STRONGER EVIDENCE trigger formula**
   (§9/§12): the floors and bars are binding; the precise combination
   logic and threshold constants are finalized during LI-2 implementation
   planning, which should itself be a short, reviewable design note before
   LI-2 code lands (not a silent implementation detail).
2. **Exact recommendation ranking tie-break rule** (§15): the ordering
   (repair-failures > high-confidence-recent-misses > plain miss rate >
   recency) is a starting proposal, refined in LI-2/LI-4.
3. **Where the "Study data" section's Reset confirmation UI pattern comes
   from** (a modal, an inline confirm-then-confirm, etc.) — a small LI-3
   UX detail, not a product-authority question, but worth a quick design
   pass before LI-3 implementation.

## 29. Explicit main-merge / release boundary

`main` remains at `v1.0.0-mvp` (`aada8c8dcd309b5cc21084844d7eb6f88e3eff7d`)
and must not be advanced by any commit related to this phase. All Learning
Intelligence v1 work — this document included — happens exclusively on
`post-mvp/learner-intelligence` in the `cism-study-companion-next`
worktree. **Merging `post-mvp/learner-intelligence` into `main` requires an
explicit, separate, later Architect- and Founder-approved release gate
(LI-5, §26) and is not authorized by this document, by CI passing, or by
any individual LI-1..LI-4 phase completing.**
