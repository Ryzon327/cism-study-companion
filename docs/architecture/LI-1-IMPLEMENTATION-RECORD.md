# LI-1 — Local Learning History Foundation — Implementation Record

**Status: Architect review: PASS. Founder UAT: WAIVED (Evidence-First
review, based on `/Users/demetrius/Downloads/cism-li1-review.png`).**
LI-1 is approved. This document now records both what was built/verified
and the review outcome, ahead of the commit checkpoint.

Implements LI-1 of `docs/architecture/LEARNING-INTELLIGENCE-V1.md` (as
revised after Architect review, commit `36e00026fdfc093027329dce02bacab50707ec8a`
on `post-mvp/learner-intelligence`). Scope: durable local persistence of
learner attempt evidence via IndexedDB, closing the three real UI gaps
identified during architecture (confidence discarded, Repair/Recall
correctness never reported). **No Insights UI, no weakness/recommendation
computation, no concept-level Practice scoping** — all explicitly deferred
to LI-2/LI-3/LI-4.

## 1. Implemented architecture

A new, self-contained module, `app/src/learning-history/`, is the only new
product-code surface:

- `types.ts` — the `LearningEvent` discriminated union
  (`QuestionAttemptEvent | RepairAttemptEvent`), immutable and append-only.
- `ids.ts` — `createId()`: `crypto.randomUUID()` with a manual v4-shaped
  fallback.
- `sessionId.ts` — `getOrCreateSessionId()`: a module-scope singleton
  session identifier, the same pattern `exposureStore.ts` uses for exposure
  history.
- `metadataSnapshot.ts` — `snapshotQuestionMetadata(questionId,
  sourceContext)`: pure, never throws, returns "unavailable" (nulls/empty
  arrays) whenever metadata can't be reliably resolved.
- `eventFactory.ts` — `buildQuestionAttemptEvent` /
  `buildRepairAttemptEvent`: pure construction, every non-deterministic
  input (`eventId`, `occurredAt`, `sessionId`) is injected.
- `db.ts` — the thin, hand-written IndexedDB adapter (`appendEvent`,
  `listEvents`, `getEventById`, `clearEvents`, `ensureMeta`, `readMeta`).
  No ORM.
- `learningHistoryStore.ts` — the public, impure seam
  (`recordQuestionAttempt`, `recordRepairAttempt`, `listLearningEvents`,
  `resetLearningHistory`) every learning-mode call site actually uses.
  Failures are caught and logged here, never thrown into the UI.
- `index.ts` — the public barrel export.

## 2. Files changed (product code)

- `app/src/session/QuestionAttemptFlow.tsx` — the one shared Apply/Repair
  recording seam (new required `learningMode`/`sourceContext` props;
  records on "Check answer" and on Repair's "Continue", each guarded by a
  `useRef` so a duplicate call can never double-record).
- `app/src/session/DailyStudySession.tsx` — records Recall directly (not
  part of `QuestionAttemptFlow`); threads `sourceContext` through to its
  two `QuestionAttemptFlow` instances (`learningMode="daily-study"` for
  Apply, `"reinforcement"` for the Reinforcement loop).
- `app/src/screens/RecallScreen.tsx` — `onContinue` now reports
  `(selectedKey, correct)` instead of nothing (closes the Recall
  correctness gap).
- `app/src/screens/RepairScreen.tsx` — `onContinue` now reports
  `selectedKey` instead of nothing (closes the Repair correctness gap;
  correctness is computed by the caller against `repairCheck.options`).
- `app/src/screens/PracticeScreen.tsx`, `app/src/screens/ExploreScreen.tsx`
  — tag their `QuestionAttemptFlow` instance with
  `learningMode="practice"`/`"explore"`, `sourceContext="production"`
  (both hardcode `productionContentSource` already, so this is always
  accurate).
- `app/src/App.tsx` — threads `contentSourceMode` down to
  `DailyStudySession` as `sourceContext` (the only place that mode is
  otherwise known); `renderScreen()` gained one new parameter for this.
- `package.json` / `package-lock.json` — added `fake-indexeddb@^6.2.5` as
  a **dev-only** dependency (Architect-approved in the review; see §6/§21
  of the architecture doc).

No other product file, no content file, no curriculum, no CI file, no
navigation structure, and no other dependency was touched.

## 3. Event model as built

Exactly the schema in the architecture's §7, implemented verbatim, with
two deliberate, narrow adjustments made during implementation (both
scoped, internal storage-schema decisions, not product-behavior changes):

- **`questionId` is `string | null`**, not always `string`. Reason: the
  Phase 5B prototype fixtures' `RecallCheckFixture` genuinely has no
  question id (`questionId?: string`, undocumented for that source) — per
  the architecture's own "missing metadata means unavailable, never
  invented" rule, recording `questionId: null` for those Recall events is
  more honest than fabricating one or skipping recording. Every other
  metadata field on such an event is correspondingly `null`/`[]`, per
  `metadataSnapshot.ts`.
- **`repairCheckKind`/`siblingQuestionId` are not implemented.** The
  architecture proposed these as a three-way classification
  ("near-transfer"/"static"/"fallback") of `getRepairCheck`'s real
  branching (`productionContentSource.ts:395-403`), but explicitly flagged
  it as a new classification, not a value already exposed by
  `RepairCheckFixture`. This prompt's own required REPAIR_ATTEMPT field
  list (§4/§11) does not ask for it, so it was left out rather than
  extending `RepairCheckFixture`'s public shape for a field nothing in
  LI-1 consumes. Noted as a real, bounded LI-2 enhancement if a future
  Repair-signal model wants to distinguish near-transfer from static
  content.

## 4. IndexedDB design

- Database: **`cism-li`**, version **1**.
- Object store **`learningEvents`** — keyPath `eventId`, append-only.
  Indexes: `by_sessionId`, `by_questionId`, `by_parentAttemptId` (all
  tolerate `null`/missing values on records that don't have that field —
  IndexedDB simply omits such records from that index, per spec, not an
  error).
- Object store **`meta`** — single record, key `"main"`, holding
  `{ eventSchemaVersion, dbVersion, createdAt }`. Established lazily and
  idempotently on the first real recorded event (`learningHistoryStore.ts`'s
  `writeInBackground` calls `db.ensureMeta()` alongside every event
  append) — confirmed via live browser verification (§9 below) that this
  actually happens in real usage, not only when a test calls `ensureMeta()`
  directly.
- Every exported `db.ts` function opens, uses, and closes its own
  connection — no long-lived handle, no `onversionchange` handling needed
  at this schema version.

## 5. Session ID / event ID / timestamp strategy

- **Event ID**: `crypto.randomUUID()`, with a manual RFC4122-v4-shaped
  fallback if unavailable (`ids.ts`) — never derived from a timestamp.
- **Session ID**: a module-scope singleton (`sessionId.ts`), minted once
  per running page, stable across a full study session, legitimately new
  after a reload — not a user/account identity.
- **Timestamp**: `Date.now()` at the moment of resolution, injectable in
  every pure `eventFactory.ts` function for deterministic tests.

## 6. Stable answer identity

Recording uses `AnswerOptionFixture.key` (`"a"|"b"|"c"|"d"`) exclusively —
the option's permanent semantic identity, per
`app/src/content/answerOrder.ts`'s own doc comment ("SEMANTIC option
identity... stable forever" vs. "DISPLAY POSITION"). The shuffled on-screen
letter is never recorded. Verified directly:
`tests/frontend/unit/learning-history/integration.test.tsx`'s Apply/Recall/
Repair tests assert on `selectedOptionKey`/`correctOptionKey`, and
`event-factory.test.ts` exercises this independent of any display-order
concern.

## 7. Apply / Recall / Repair integration, as built

- **Apply**: recorded exactly once, at `QuestionApplyScreen`'s "Check
  answer" click (`QuestionAttemptFlow`'s `onSubmit` handler) — the moment
  the answer is definitively resolved, not later at Feedback/Continue.
  Guarded by a `useRef` boolean so a duplicate invocation can never record
  twice.
- **Recall**: recorded exactly once, at `RecallScreen`'s "Continue" click,
  directly inside `DailyStudySession` (Recall is not part of
  `QuestionAttemptFlow`). `confidence` is always `null` — no new UI was
  added.
- **Repair**: recorded exactly once, at `RepairScreen`'s "Continue" click,
  only when Repair is actually shown (an incorrect Apply). Guarded by its
  own `useRef`. References its parent via `parentAttemptId` — the parent
  `QuestionAttemptEvent` is never reopened or rewritten.
- **No-repair case**: a correct Apply produces zero `RepairAttemptEvent`s —
  confirmed structurally (no code path constructs one) and by test
  (`"a correct Apply records exactly one QUESTION_ATTEMPT ... and zero
  REPAIR_ATTEMPT events"`).

## 8. Failure behavior

`learningHistoryStore.ts` catches every storage failure (IndexedDB
unavailable, a write rejecting) and resolves `written: false` rather than
throwing or rejecting — the calling UI code never awaits `written` at all,
so a storage failure is structurally incapable of blocking the study flow.
Verified by test (`learning-history-store.test.ts`'s "failure behavior"
suite: `recordQuestionAttempt` still returns a usable event synchronously
and `written` resolves `false`, with `console.error` as the only side
effect) and by construction (every UI call site ignores the return value
beyond reading `.event` synchronously).

## 9. Live IndexedDB verification (real browser, not just tests)

Run via a temporary Playwright script against the dev-worktree's Vite dev
server (deleted after use — not part of this commit), driving real Daily
Study (Recall → Apply incorrect → Repair) + Practice flows in production
content mode, then reading IndexedDB directly via `page.evaluate`:

| Field | Value |
|---|---|
| Database name | `cism-li` |
| Database version | `1` |
| Object stores | `learningEvents`, `meta` |
| Total events | 4 |
| QUESTION_ATTEMPT count | 3 (1 recall, 2 apply — Daily Study + Practice) |
| REPAIR_ATTEMPT count | 1 |
| `meta` record | `{ key: "main", eventSchemaVersion: 1, dbVersion: 1, createdAt: <real ms> }` |
| Representative Apply event | `learningMode: "daily-study"`, `questionId: "question.d1.0005"`, `correct: false`, `confidence: "sure"`, real metadata (`familyId`, `domain: "domain.d1"`, `patterns`, `primaryRole`, `evidenceDimensions`, `repairTargetId`) all populated from production content |
| Representative Recall event | `attemptKind: "recall"`, `confidence: null` |
| Repair linkage | the `REPAIR_ATTEMPT`'s `parentAttemptId` matched the preceding Apply event's `attemptId` exactly |
| `localStorage` keys | `[]` — confirmed empty; Learning History never touches `localStorage` |

This confirms the module works end-to-end in a real browser, not only
under `fake-indexeddb`.

## 10. Reset service

`resetLearningHistory()` clears the `learningEvents` store (not `meta`).
No UI wired to it (LI-3 owns that). Tested directly
(`learning-history-store.test.ts`).

## 11. `fake-indexeddb` test coverage

Added as a dev-only dependency (§6/§21 of the architecture, Architect-
approved in the review). `tests/frontend/unit/learning-history/fakeIndexedDb.ts`
installs a fresh `IDBFactory` per test (`beforeEach`), so no state leaks
between tests in the same file. Used by `db.test.ts`,
`learning-history-store.test.ts`, and `integration.test.tsx`.

## 12. Regression results

All counts below are from this session, run locally against this
worktree's actual state (`post-mvp/learner-intelligence`, uncommitted).

| Suite | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | clean, 0 errors |
| Production build (`vite build`) | succeeds |
| `node --test tests/data-integrity/` | 22 tests, 19 pass, 0 fail, 3 `todo` (BUG-001/002/003 — pre-existing, unrelated to LI-1) |
| `node --test tests/data-model/` | 92 tests, 92 pass, 0 fail |
| `node --test tests/content-production/` | 477 tests, 477 pass, 0 fail |
| Vitest (`tests/frontend/unit/`) | **24 files, 252 tests, 252 pass** (200 pre-existing + 52 new LI-1 tests) |
| Playwright e2e (Chromium + Firefox) | 86 tests, 86 pass |
| Playwright accessibility (`@a11y` subset of e2e) | 42 tests, 42 pass |
| Playwright visual regression | 32 tests, 32 pass, 0 pixel diffs |
| `npm audit --audit-level=moderate` | 0 vulnerabilities |

No existing test was weakened, skipped, or deleted. The two existing test
files touched (`daily-study-reinforcement.test.tsx`,
`question-attempt-flow.test.tsx`) were changed only to add the new required
props (`sourceContext`, `learningMode`/`sourceContext`) to their existing
`render()` calls — no assertion was changed.

## 13. New LI-1 test coverage (52 tests, 6 files)

- `event-factory.test.ts` (10) — pure `QuestionAttemptEvent`/
  `RepairAttemptEvent` construction: real metadata snapshot, sparse-field
  nulling, prototype/unresolvable-id degradation, no cross-event ID
  collision.
- `metadata-snapshot.test.ts` (6) — production resolution, sparse-field
  preservation, prototype/null/unresolvable degradation.
- `db.test.ts` (14) — the IndexedDB adapter: empty store, append/retrieve
  both event types, stable chronological ordering (with tie-break), cross-
  call persistence, duplicate-key rejection (append is not upsert), Repair-
  never-mutates-parent, nullable-metadata round-trip, `meta`
  idempotency, `clearEvents` leaving `meta` untouched.
- `session-id.test.ts` (3) — singleton stability, reset, non-timestamp
  uniqueness.
- `learning-history-store.test.ts` (11) — the public seam: synchronous
  event/async `written` contract, session-id propagation, Repair linkage +
  parent immutability, reset, the `meta`-established-as-a-side-effect
  behavior, and the failure-boundary suite (IndexedDB unavailable never
  throws, never claims false success).
- `integration.test.tsx` (8) — real UI flows (Daily Study Recall/Apply/
  Repair, Practice, Explore, Reinforcement) each producing correctly-
  tagged, correctly-linked events; one duplicate-prevention regression
  test; one prototype-sourceContext-tagging test.

## 14. Known limitations / deferred items

- `repairCheckKind`/`siblingQuestionId` not implemented (§3 above) —
  deferred to LI-2 if a future Repair-signal model needs the near-transfer/
  static distinction.
- No Insights UI, no derived-insight computation, no recommendation engine
  — all LI-2/LI-3/LI-4 scope, untouched here.
- No Reset/Export UI — the service exists (`resetLearningHistory`); LI-3
  owns the UI.
- **A pre-existing, out-of-LI-1-scope finding, surfaced but not touched —
  Architect-confirmed disposition: separate follow-up required before
  LI-2, NOT an LI-1 defect, NOT mixed into the LI-1 commit.**
  `App.tsx`'s `contentSourceMode` defaults to `"prototype"`, and the
  dev-only Prototype panel that can switch it to `"production"` is always
  rendered (not gated behind any build flag) — meaning a fresh page load of
  the current MVP shows Phase 5B prototype fixtures for Daily Study by
  default, not real production curriculum, until someone manually opens
  the QA panel and switches it. This is unrelated to and predates LI-1; it
  is not one of the three UI gaps this phase was authorized to fix, and
  changing a default learner experience is a product decision, not an
  implementation one. Flagged here per `CLAUDE.md`'s "stop and surface a
  product ambiguity rather than silently choosing" rule — Practice and
  Explore are unaffected (they hardcode `productionContentSource`
  regardless of this toggle). Tracked as a required product-environment
  follow-up, to be resolved (or explicitly waived) before LI-2 begins.
- Local environment note (not a defect): the shell running this session has
  Node v26.5.1 installed globally, while `.nvmrc`/`package.json` target
  Node 20; `node --test <directory>` fails to resolve a bare directory
  argument under v26 (works fine with an explicit `*.test.mjs` glob, which
  is what was used above). CI pins Node 20 via `actions/setup-node` and is
  unaffected.

## 15. Evidence path

- Automated tests: this repository, uncommitted, on
  `post-mvp/learner-intelligence` — see §12/§13.
- Live verification: a real Chromium session driving real production
  content through Daily Study + Practice, IndexedDB read directly — see
  §9. The driving script was not committed; a representative screenshot
  contact sheet was reviewed by the Architect at
  `/Users/demetrius/Downloads/cism-li1-review.png` (external artifact,
  preserved, not committed to the repository). The same screenshots were
  also kept locally at `.tmp-li1-screens/` inside this worktree
  (untracked, temporary) and removed as part of the post-review cleanup.

## 16. Architect review

**PASS.** Reviewed via the Evidence-First screenshot contact sheet at
`/Users/demetrius/Downloads/cism-li1-review.png` plus the automated
evidence in §12/§13. **Founder UAT: WAIVED** for this phase.

Approved: IndexedDB persistence; the immutable append-only `LearningEvent`
model; `QUESTION_ATTEMPT`/`REPAIR_ATTEMPT`; `parentAttemptId` linkage;
Recall correctness capture with `confidence: null`; existing Apply
confidence persistence; stable semantic option identity; metadata
snapshots and sparse-metadata truthfulness; duplicate-write prevention;
the reset-service foundation; `fake-indexeddb` as a dev-only dependency;
failure-safe persistence behavior; and the generic Daily
Study/Practice/Explore/Reinforcement integration.

Deferred intentionally (not defects): `repairCheckKind`, `siblingQuestionId`,
weakness computation, Insights UI, recommendations, concept-level Practice,
export/import UI, cloud/accounts/backend.

The pre-existing Prototype/Production default-content finding (§14) is
**confirmed NOT an LI-1 defect** and is **not part of the LI-1 commit** —
tracked separately as a required product-environment follow-up before LI-2
begins.
