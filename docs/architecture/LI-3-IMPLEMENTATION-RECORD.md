# LI-3 — Insights Learner Experience — Implementation Record

**Status: Architect review: PASS. Founder UAT: WAIVED.**

Implements LI-3 of `docs/architecture/LEARNING-INTELLIGENCE-V1.md`, on top
of LI-1 (`59728e6`), the Product Environment Follow-up (`dc5bd19`), and
LI-2 (`cab7d81`). Scope: the learner-facing **Insights** screen and its
navigation destination, presenting LI-2's output calmly. **No LI-4
handoffs, no LI-1/LI-2 rule changes, no dashboards/charts/gamification, no
Import** — all explicitly out of scope here, per the directive.

## 1. Navigation integration

`app/src/App.tsx` gains a 5th real product destination: `Insights`.

- `PRODUCT_NAV_ITEMS` gains `{ id: "insights", label: "Insights" }`.
- `PRODUCT_ENTRY_SCREEN` gains `insights: "insights"`.
- `sectionForScreen()` routes `"insights"` to its own nav section.
- `renderScreen()` renders `<InsightsScreen />` for `"insights"`.
- `app/src/app-shell/BottomTabBar.tsx` gains a dedicated compass/star icon
  for Insights — deliberately not bar-chart/analytics iconography, per the
  calm Insights product philosophy.

Product navigation now has exactly five real destinations (Home, Daily
Study, Explore, Practice, Insights), distinct from the dev-only QA
switcher. Verified: `App.test.tsx`, `smoke.spec.ts`, `practice.spec.ts`.

## 2. Data flow

`IndexedDB → listLearningEvents() → deriveLearningInsights() →
presentation → UI`, exactly as required — one IndexedDB read per screen
visit, no duplicate queries.

`InsightsScreen.tsx`'s `refresh()` is the single orchestration boundary:
sets `status: "loading"`, awaits `listLearningEvents()`, then runs the
already-pure, synchronous `deriveLearningInsights()` and
`buildInsightsViewModel()` against the result. Re-invoked on every screen
mount (`useEffect`) and after Export/Reset — so returning to Insights after
studying reflects new evidence without a page reload (verified live and by
`insights.spec.ts`'s "flows into Insights on the very next visit" test).
No other file reads IndexedDB or calls the insight engine.

## 3. Presentation layer

`app/src/insights/insightPresentation.ts` — pure functions translating
LI-2's typed `InsightResult` into learner copy. Nothing here touches
IndexedDB or LI-2's rules; it only formats what LI-2 already decided.

- `resolveDisplayLabel(identity)` — resolves a real display label per axis
  from the production content registry (`domain`, `concept`, `family`,
  `pattern`, `evidence_dimension`, `decision_type`, `role`, `qualifier`
  with a "questions" suffix) plus `lifecycle`/`stage` (imported directly
  from `schema/registry/lifecycles.json` and `lifecycle-stages.json`,
  since the shared registry doesn't load these two files). Falls back to
  the fixed string `"A previously studied topic"` with `isUnknownTarget:
  true` when a target can't be resolved (e.g. a concept later removed from
  the curriculum) — **never a raw ID**, verified for every axis in
  `insightPresentation.test.ts`'s unknown-target suite and live in
  screenshot panel 8 (§9 below).
- `stateLabel(state)` — "Needs review" / "Developing" / "Stronger
  evidence" / "Not enough evidence yet". Verified: never contains
  "Weak"/"Bad"/"Failing"/"Poor"/"Mastered".
- `reasonCodeCopy(code)` — an exhaustive switch over LI-2's closed
  `ReasonCode` union, translating each to factual, non-diagnostic copy
  (e.g. `REPEATED_SURE_MISSES` → "Some of those misses were answered with
  Sure confidence."). Never uses "overconfident" or other psychological
  language — verified directly.
- `evidenceLines(evidence, reasonCodes)` — concise, non-percentage evidence
  strings ("N recent attempts · M missed", a Sure-confidence count line, a
  Repair-outcome line, "X of last Y were correct across Z different
  questions").
- `suggestedActionText(candidate, displayLabel)` — verb text per
  `SuggestedActionKind` ("Review {label}", "Practice questions involving
  {label}", etc.) — text only, no click handler, no navigation (LI-4
  scope).
- `buildFocusNext`, `buildStrongerAreas`, `buildTrendSummaries`,
  `domainSummaryLine`, `buildInsightsViewModel` — presentation-only
  selection/ordering/status logic built strictly on top of LI-2's already
  ranked/capped output; no re-deriving or overriding of LI-2 decisions.
  `buildStrongerAreas` performs presentation-only overlap reduction
  (dropping a `domain`-axis entry when a more specific entry already
  covers the same evidence) — a documented limitation, since
  `EvidenceGroup` doesn't expose attempt IDs for true attempt-level
  overlap reduction at this layer.

`app/src/insights/studyHistoryExport.ts` — pure export shaping:
`EXPORT_FORMAT_VERSION = 1`; `buildStudyHistoryExport(events, exportedAt)`
filters to `sourceContext === "production"` only and stamps
`eventSchemaVersion`; `studyHistoryExportFilename(date)` produces
`cism-study-history-YYYY-MM-DD.json`. The one impure step,
`downloadStudyHistoryExport`, is isolated to a `Blob` +
`URL.createObjectURL` + temporary anchor click, kept out of the pure
module boundary.

## 4. Screen status model

`buildInsightsViewModel` decides exactly one of five statuses:

- `"loading"` — while `listLearningEvents()` is in flight.
- `"error"` — the read/derive step threw (defensive; not expected in
  normal operation).
- `"no-history"` — zero eligible primary attempts anywhere
  (`insights.groups.every(g => g.evidence.primaryAttemptCount === 0)`).
  Copy: "Your study insights will appear as you answer questions in Daily
  Study or Practice."
- `"insufficient-evidence"` — some history exists, but LI-2 produced zero
  Focus Next candidates and zero Stronger Areas (e.g. only Recall so far,
  or a single Apply miss). Copy: "Building your study picture — answer a
  few more questions and this page will start showing what to focus on."
- `"ready"` — at least one Focus Next or Stronger Areas item exists; renders
  the full set of sections.

Both empty states were deliberately distinguished per the directive (zero
history vs. some history but not enough evidence yet) rather than
collapsed into one generic empty state.

## 5. Insights screen sections (`"ready"` status)

`app/src/screens/InsightsScreen.tsx` renders, in order:

1. **Focus Next** — one card per `RecommendationCandidate` (already
   ranked/capped at 3 by LI-2): state badge, "why" line built from
   `evidenceLines`, and a bolded suggested-action line. State is never
   color-only — a text label (`stateLabel`) is always present alongside
   the border-color treatment in `InsightsScreen.css`
   (`.insights-card-needs-review` / `.insights-card-developing`).
2. A subtle single-line domain concern summary (`domainSummaryLine`), only
   when genuinely warranted — no percentages, no fake precision.
3. **How you're doing** — up to 2 trend summaries for groups with a
   non-null LI-2 trend not already surfaced in Focus Next.
4. **Stronger areas** — up to 3 `STRONGER_EVIDENCE` groups.
5. **Study Data** — always rendered regardless of status: a factual
   attempt count, an explanatory "stored only in this browser… not synced
   or backed up online" line, and Export/Reset controls.

No LI-4 affordance exists anywhere on this screen — Focus Next cards are
not clickable, and no Practice-scoping action is wired up.

**Architect note (non-blocking UX observation, LI-3 final review)**: Focus
Next cards intentionally provide enough evidence for the learner to
understand *why* a recommendation exists — this density is approved as-is
for this checkpoint. After real learner history accumulates, revisit
whether the repeated evidence/explanation lines make the cards feel too
dense. This is a future observational note only, not an LI-3 defect, and
must not be acted on during this checkpoint.

## 6. Study Data — Export

"Export study history" calls `buildStudyHistoryExport(rawEvents)` (already
in memory from the same `refresh()` read — no second IndexedDB query) then
`downloadStudyHistoryExport`, saving a versioned JSON file named
`cism-study-history-YYYY-MM-DD.json`. Disabled when there are zero
recorded attempts. No fetch/network call is made (verified:
`InsightsScreen.test.tsx`'s "Export doesn't call fetch" test). **No Import
control exists anywhere on this screen or elsewhere in the app** — verified
directly by test and by inspection.

A real example, generated by actually clicking the button in a running
browser (not hand-constructed), is saved at
`/Users/demetrius/Downloads/cism-study-history-li3-example.json`. Verified:
valid JSON; `exportFormatVersion: 1`; `eventSchemaVersion: 1`; all 3 events
`sourceContext: "production"`; no prototype-sourced events; only expected
`LearningEvent` fields present; no unrelated data.

## 7. Study Data — Reset

"Reset study history" opens the existing `Dialog` component (already
accessible: focus trap, `role="dialog"`, `aria-modal`, Escape-to-close,
focus-return — reused, not reimplemented) with the approved copy exactly:
"Reset study history?" / "This deletes the study history stored in this
browser. It cannot be undone unless you previously exported a copy." /
Cancel / Reset history. Confirming calls the real `resetLearningHistory()`
(LI-1, unmodified) and then `refresh()`, returning the screen to the
zero-history empty state. Disabled when there are zero recorded attempts
(nothing to reset). Verified: `InsightsScreen.test.tsx`'s confirm/cancel/
disabled-when-empty suite, and live in screenshot panels 4/5 (§9).

## 8. QA/prototype exclusion

The screen never queries IndexedDB or the insight engine differently based
on QA mode — exclusion is enforced once, upstream, at LI-2's eligibility
boundary (unchanged). Verified: `InsightsScreen.test.tsx` seeds 10
prototype-sourced events alongside real production evidence and asserts
they create no additional cards and are excluded from the Study Data
attempt count.

## 9. Evidence-First Review

10 full-page screenshots were captured against the real running app (real
IndexedDB writes via real production question metadata for concepts
`concept.d3.program-metrics-reporting`, `concept.d2.risk-monitoring-reporting`,
and `concept.d1.governance-layer-authority` — not hand-typed mock HTML),
assembled into a contact sheet at
`/Users/demetrius/Downloads/cism-li3-review.png`:

1. Zero-history state.
2. Some history, insufficient evidence ("Building your study picture").
3. Focus Next: 3 ranked Needs Review recommendations, including a Sure-
   confidence-mismatch reason, a failed-Repair reason, and an inline
   "Your recent answers are improving." trend line — plus How You're
   Doing, Stronger Areas, and Study Data below it on the same page.
4. Reset confirmation dialog.
5. Post-reset: back to the fresh zero-history state.
6. Mobile viewport with a real recommendation.
7. Dark mode, full page.
8. Unknown/stale target — confirms the safe "A previously studied topic"
   fallback, never the raw `concept.no-longer-exists` ID, with correct
   evidence counts alongside it.

Every panel was visually inspected: no raw IDs anywhere, correct state
labels, factual non-diagnostic reason-code copy, no fake precision
(no percentages), and a properly accessible-looking Reset dialog matching
the approved copy exactly.

## 10. Live product verification

Performed against the ordinary (no `VITE_ENABLE_QA_FIXTURES`) dev server:
no QA/prototype switcher rendered; Home shows real production content;
Insights is reachable from Main navigation and shows the correct fresh
empty-state copy; a real Daily Study attempt (Recall → Learn → Apply →
Feedback/Repair → Completion) followed by returning to Insights shows the
updated attempt count immediately, with no page reload. This overlaps with
`insights.spec.ts`'s automated coverage but was additionally confirmed live
per the directive.

## 11. Accessibility / mobile / dark mode

- `insights.spec.ts` runs axe (`wcag2a`, `wcag2aa`, `wcag22aa`) against the
  empty state, the Study Data + Reset-dialog state, and dark mode — zero
  violations in all three.
- Mobile viewport (390×844): no horizontal scroll
  (`scrollWidth <= clientWidth + 1`), Study Data controls fit.
- Dark mode uses the existing `data-theme` token system; no new hardcoded
  colors were introduced in `InsightsScreen.css`.

## 12. Known limitations (carried forward, not solved here)

- No LI-4 handoffs — Focus Next cards are informational only, not
  actionable, exactly as scoped.
- `buildStrongerAreas`'s overlap reduction is presentation-only
  (domain-vs-more-specific heuristic), not true attempt-level overlap
  reduction, since `EvidenceGroup` doesn't expose attempt IDs at this
  layer — documented in `insightPresentation.ts` and unchanged from what
  LI-2 exposes.
- No Import — by design, per the directive.
- Local-only history; no cloud sync (unchanged from LI-1).

## 13. Test results

All counts below are from this session's final run against this worktree's
actual state (`post-mvp/learner-intelligence`, uncommitted, on top of
`cab7d81`).

| Suite | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | clean, 0 errors |
| Production build (`vite build`) | succeeds |
| Vitest (`npm run test:frontend`, full) | **37 files, 417 tests, 417 pass** (359 pre-LI-3 + 39 new insights/export unit tests + 19 new `InsightsScreen.test.tsx`) |
| Playwright e2e (`npm run test:e2e`) | **122 tests, 122 pass** (112 pre-LI-3 + 10 new in `insights.spec.ts`, across Chromium + Firefox) |
| Playwright visual (`npm run test:visual`) | **32 tests, 32 pass** (8 baselines intentionally updated for the 5th nav item — `home` and `review-center`, the only two Visual Prototype Gate screens rendered with full chrome/nav visible; darwin baselines, matching this platform) |
| `node --test tests/data-integrity/*.test.mjs` | 22 tests, 19 pass, 3 todo (pre-existing BUG-003, unrelated, unchanged) |
| `node --test tests/data-model/*.test.mjs` | 92/92 pass |
| `node --test tests/content-production/*.test.mjs` | 477/477 pass |
| `npm audit --audit-level=moderate` | 0 vulnerabilities |

New LI-3 test files: `tests/frontend/unit/insights/insightPresentation.test.ts`
and `tests/frontend/unit/insights/studyHistoryExport.test.ts` (39 tests
combined), `tests/frontend/unit/InsightsScreen.test.tsx` (19 tests),
`tests/frontend/e2e/insights.spec.ts` (5 tests × 2 browsers = 10). Modified
for the 5th nav destination: `App.test.tsx`, `smoke.spec.ts`,
`practice.spec.ts`, and 16 visual-regression PNG baselines (8 darwin + 8
linux, generated via a version-matched Playwright Docker image for the
Linux platform).

## 14. Scope boundaries confirmed

- LI-2's engine (`app/src/learning-intelligence/`) — **untouched**. LI-3
  only imports its public barrel (`deriveLearningInsights`, types).
- LI-1's storage (`app/src/learning-history/`) — **untouched**. LI-3 only
  calls its existing public functions (`listLearningEvents`,
  `resetLearningHistory`, `isQuestionAttemptEvent`).
- No curriculum/content edits.
- No LI-4 work (no clickable recommendation actions, no Practice scoping,
  not started).
- No backend, auth, or cloud sync work.
- No changes to the stable `main` worktree
  (`/Users/demetrius/Projects/cism-study-companion`) — confirmed clean, on
  `main`, at `aada8c8` throughout this phase.
- No local review artifacts (`.li3-review.mjs`, `.li3-live-verify.mjs`,
  `.li3-render-contact-sheet.mjs`, `.li3-contact-sheet.html`,
  `.tmp-li3-screens/`) are tracked or remain in the working tree — all
  deleted after use.

## 15. Architect review

**PASS.** Reviewed via `/Users/demetrius/Downloads/cism-li3-review.png` and
`/Users/demetrius/Downloads/cism-study-history-li3-example.json`.
**Founder UAT: WAIVED** for this phase.

Approved: the fifth Insights destination; the IndexedDB → LI-2 engine →
presentation → UI data flow with a single refresh/read boundary per visit;
all five screen states; Focus Next capped at 3; the Needs Review/
Developing/Stronger Evidence learner language; the reason-code
translations, confidence-mismatch wording, and successful-Repair recovery
wording; textual trend presentation; the limited Stronger Areas section;
secondary-only domain context; display-label resolution including the
"A previously studied topic" stale-target fallback; non-clickable
next-action text with no LI-4 routing; Study Data (local-device/no-sync
disclosure, versioned production-only export, Reset with accessible
confirmation, no Import); screen-entry refresh; QA/prototype exclusion;
mobile layout; dark-mode presentation; and accessibility behavior
throughout.

**Non-blocking UX observation recorded** (see §5): Focus Next card density
is approved as-is; revisit only after real learner history accumulates,
and only as a future observational check, not as an LI-3 defect.
