# LI-2 — Deterministic Insight Engine — Implementation Record

**Status: Architect review: PASS. Founder UAT: WAIVED.**

Implements LI-2 of `docs/architecture/LEARNING-INTELLIGENCE-V1.md`, on top
of LI-1 (`59728e6`) and the Product Environment Follow-up (`dc5bd19`).
Scope: pure, deterministic derivation of explainable learner evidence from
LI-1's immutable `LearningEvent[]` history. **No learner-facing surface,
no navigation, no charts, no persisted cache** — all explicitly LI-3/LI-4
scope, untouched here.

## 1. Engine architecture

A new, self-contained, pure module: `app/src/learning-intelligence/`.

- `types.ts` — `INSIGHT_ENGINE_VERSION`, `Axis`, `GroupIdentity`,
  `GroupState`, `ReasonCode`, `ConfidenceSignalType`, `RepairOutcome`,
  `TrendState`, `EvidenceSummary`, `EvidenceGroup`, `SuggestedActionKind`,
  `RecommendationCandidate`, `Diagnostic`, `InsightResult`.
- `eligibility.ts` — production-only, known-schema-version filtering (§5/§32).
- `windows.ts` — deterministic sort/recent-window/distinct-count helpers (§9/§29).
- `repairLinkage.ts` — links `RepairAttemptEvent → QuestionAttemptEvent` by
  `parentAttemptId`, orphan-repair diagnostics (§16/§31).
- `grouping.ts` — builds per-axis evidence groups from eligible
  `QuestionAttemptEvent`s (§7/§8).
- `classification.ts` — the state-precedence machine + evidence-summary
  assembly (§9-§14, §19).
- `trend.ts` — the longitudinal trend rule (§18).
- `recommendations.ts` — eligibility, cross-cutting breadth, overlap
  reduction, ranking, cap (§21-§25).
- `deriveInsights.ts` — the one pure top-level entry point (§30).
- `index.ts` — public barrel, plus the **one** impure call site
  (`loadLearningInsights()`, `listLearningEvents()` → `deriveLearningInsights()`)
  — no other file in this module imports LI-1's store.

No IndexedDB call exists anywhere inside `eligibility.ts` through
`deriveInsights.ts` — verified structurally (only `index.ts` imports
`listLearningEvents`) and by test (every pure-module test runs with zero
IndexedDB/fake-indexeddb present at all, since these tests never install it).

## 2. `insightEngineVersion`

`INSIGHT_ENGINE_VERSION = 1`, stamped on every `InsightResult`. Independent
of `eventSchemaVersion` (LI-1), the IndexedDB structural version, and any
future app version — a future rule change bumps this alone; no stored
event is ever touched.

## 3. Eligible-event rules (§5/§32)

- `sourceContext !== "production"` → excluded. `"prototype"` specifically
  is a routine, expected exclusion (no diagnostic). Any other value is
  defensively treated as malformed (`MALFORMED_EVENT` diagnostic) — the
  type system should prevent this, but the check doesn't trust it blindly.
- `eventSchemaVersion !== 1` → excluded with an `UNSUPPORTED_SCHEMA_VERSION`
  diagnostic. Future schema versions get a safe compatibility boundary
  (excluded + flagged), never guessed at.

## 4. Primary vs. secondary evidence (§6)

- **Primary**: `attemptKind === "apply"` — drives every classification,
  trend, and recommendation decision.
- **Secondary**: `attemptKind === "recall"` — counted in
  `recallCorrectCount`/`recallIncorrectCount` only; never read by
  `classification.ts` or `trend.ts` at all.
- **Repair**: a `RepairAttemptEvent` is never a second primary attempt —
  it only ever *annotates* its parent's outcome via `repairLinkage.ts`.

## 5. Axes implemented (§7)

`domain`, `concept`, `family`, `pattern`, `evidence_dimension`,
`qualifier`, `decision_type`, `role`, `lifecycle`, `stage`. A group forms
for an axis-target only when an eligible attempt genuinely carries that
metadata — `null`/empty never contributes, never inferred, never
backfilled (unchanged from LI-1's own rule). Verified directly:
`grouping.test.ts`'s "never forms a group for a null/absent axis field."

## 6. Recent-window rule (§9)

`recentWindow(attempts, 6)` — the most recent 6 primary attempts (fewer if
fewer exist), ascending by `occurredAt`, tie-broken by `eventId`. This is
the window every `recent*` `EvidenceSummary` field and the NEEDS
REVIEW/DEVELOPING decision are evaluated against. `primaryAttemptCount`,
`distinctQuestionCount`, `successfulRepairCount`, `failedRepairCount`,
`recallCorrectCount`, `recallIncorrectCount`, and `lastAttemptAt` are
all-time aggregates instead (§9's "retain full aggregate evidence where
useful") — this split is a documented LI-2 implementation decision, since
the brief did not explicitly assign every summary field to a window.

## 7. Minimum-evidence rule (§10) — binding

`window6.length >= 3 AND distinctQuestionCount(window6) >= 2`. Below this,
`NOT_ENOUGH_EVIDENCE` with `INSUFFICIENT_ATTEMPTS` (< 3) or
`INSUFFICIENT_BREADTH` (≥ 3 but < 2 distinct). An attempt with no durable
`questionId` never counts toward breadth.

## 8. STRONGER EVIDENCE rule (§11) — binding floor

Its own `recentWindow(allPrimary, 5)`, independent of the general window:
`window5.length === 5` (i.e. ≥5 total) AND `distinctQuestionCount(window5)
>= 3` AND `correctCount(window5) >= 4` AND zero Sure+incorrect in
`window5` AND zero `REPAIR_STILL_MISSED` linked to an incorrect attempt in
`window5`. Never labeled "Mastered" — the state constant is
`STRONGER_EVIDENCE`.

## 9. NEEDS REVIEW rules (§12)

Evaluated over `window6`, any one condition suffices:

- **A — REPEATED_MISSES**: ≥2 incorrect attempts spanning ≥2 distinct questions.
- **B — REPEATED_SURE_MISSES**: ≥2 Sure+incorrect attempts spanning ≥2 distinct questions.
- **C — REPAIR_STILL_MISSED**: at least one incorrect attempt in the window has a linked failed Repair, AND the window contains ≥2 incorrect attempts total (never a single isolated failed Repair alone).

## 10. DEVELOPING rule (§13)

The fallback once minimum evidence is met and neither STRONGER_EVIDENCE
nor NEEDS_REVIEW applies. Descriptive (non-triggering) reason codes are
attached when applicable: `SUCCESSFUL_CORRECTION` (a corrected-on-Repair
attempt exists in the window) and `LOW_CONFIDENCE_CORRECT` (a Not-sure/
Guessing-but-correct attempt exists in the window). Never implies failure.

## 11. Classification precedence (§14)

1. Minimum evidence (→ `NOT_ENOUGH_EVIDENCE` if unmet, stop).
2. STRONGER EVIDENCE, evaluated against its own last-5 window.
3. NEEDS REVIEW, evaluated against the general last-6 window.
4. Otherwise DEVELOPING.

**A mathematical note verified during implementation, not a rule
deviation**: because the two windows differ in size by exactly one
attempt (window5 = window6 minus its single oldest member), and NEEDS
REVIEW's conditions all require ≥2 qualifying attempts within window6, it
is structurally impossible for a group to simultaneously satisfy NEEDS
REVIEW-over-window6 and STRONGER EVIDENCE-over-window5 — at most one of
the two "extra" misses NEEDS REVIEW would need could ever fall outside
window5. This does not weaken the precedence rule (it is still implemented
exactly as specified, and still correctly lets a genuine older miss
outside window5 fail to block a clean recent streak — see
`classification.test.ts`'s precedence suite) — it simply means real
head-to-head conflicts are rarer than the brief's phrasing might suggest.
Flagged here for transparency rather than silently ignored.

## 12. Confidence signals (§15)

`sure` + incorrect / `not-sure`|`guessing` + correct / `sure` + correct map
conceptually to `HIGH_CONFIDENCE_INCORRECT` / `LOW_CONFIDENCE_CORRECT` /
`HIGH_CONFIDENCE_CORRECT` (typed in `types.ts` as `ConfidenceSignalType`,
for LI-3's future use); LI-2 itself surfaces the underlying counts
(`sureIncorrectCount`, `lowConfidenceCorrectCount`) and reason codes
(`REPEATED_SURE_MISSES`, `LOW_CONFIDENCE_CORRECT`) rather than rendering
any of the three signal labels directly — no psychological language
("overconfident") appears anywhere in this module.

## 13. Repair signals (§16)

`CORRECTED_ON_REPAIR` / `REPAIR_STILL_MISSED`, resolved per parent
attempt via `repairLinkage.ts`. A successful Repair never changes
`correct` on its parent event (verified: `repairLinkage.test.ts`'s
immutability test) and is never counted as a second primary attempt
(verified: `classification.test.ts`'s evidence-summary suite —
`primaryAttemptCount` never includes Repair events).

## 14. Recall treatment (§17)

Counted (`recallCorrectCount`/`recallIncorrectCount`) but never read by
`classification.ts` or `trend.ts`. Verified directly:
`classification.test.ts`'s "counts Recall correctness separately, never
mixed into primary counts."

## 15. Trend model (§18)

Requires ≥6 total eligible primary attempts (else `null` —
insufficient evidence, never guessed at). Splits the most recent 6 into
previous-3/recent-3; a swing of ≥2 correct answers either direction yields
`IMPROVING`/`NEEDS_REVIEW`, otherwise `MIXED_DEVELOPING`. No decimal
precision, no statistical model.

## 16. Evidence-summary fields (§19)

Exactly the field list the brief proposed — see `types.ts`'s
`EvidenceSummary` and §6 above for the aggregate/recent-window split.

## 17. Reason codes (§20)

A closed typed union (`ReasonCode`), never bare prose:
`INSUFFICIENT_ATTEMPTS`, `INSUFFICIENT_BREADTH`, `REPEATED_MISSES`,
`REPEATED_SURE_MISSES`, `REPAIR_STILL_MISSED`, `RECENT_STRONG_PERFORMANCE`,
`SUCCESSFUL_CORRECTION`, `LOW_CONFIDENCE_CORRECT`, `IMPROVING_RECENTLY`.

## 18. Recommendation candidate model (§21/§25) — Architect-finalized

`{ target, state, reasonCodes, evidenceSummary, suggestedActionKind }`.
**Final rule, per the Architect's LI-2 decision follow-up §1**, replacing
the original single-predicate draft:

- `NEEDS_REVIEW` groups are always eligible and are processed **first, in
  full** (breadth-checked, overlap-reduced, ranked).
- `DEVELOPING` groups are considered **only if fewer than 3 NEEDS_REVIEW
  candidates survive that pass**, and only those satisfying:
  1. `unresolvedRecentIncorrectCount >= 1` (a recent miss that was **not**
     `CORRECTED_ON_REPAIR`), **OR**
  2. `lowConfidenceCorrectCount >= 2` **and**
     `lowConfidenceCorrectDistinctQuestionCount >= 2`.
- **A successful Repair can never, by itself, make a DEVELOPING group
  recommendation-eligible.** `unresolvedRecentIncorrectCount` (new
  `EvidenceSummary` field, §16) is `recentIncorrectCount` minus any recent
  incorrect attempt that was `CORRECTED_ON_REPAIR` — the exact "missed,
  Repair succeeded, then performed correctly on transfer" story this rule
  protects. `SUCCESSFUL_CORRECTION`/`DEVELOPING` classification itself is
  unchanged; only recommendation *eligibility* is affected.
- Qualifying DEVELOPING candidates are overlap-reduced against everything
  the accepted NEEDS_REVIEW candidates already cover, then ranked, then
  fill only the remaining slots (never more than 3 total).
- `NOT_ENOUGH_EVIDENCE` and `STRONGER_EVIDENCE` are never candidates
  (unchanged).

Verified: `recommendations.test.ts`'s "DEVELOPING recommendation
eligibility" suite, and `scenarios.test.ts`'s Scenario D (now asserts the
successfully-corrected concept produces **no** recommendation at all).

## 19. Target-priority model (§22) — Architect-finalized

**Final order**: `concept(0) < family(1) < pattern(2) <
qualifier/decision_type(3) < evidence_dimension(4) <
role/lifecycle/stage(5) < domain(6)`. Domain is now unambiguously the
broadest, final fallback — role/lifecycle/stage moved above it per the
Architect's explicit §2 ruling (previously grouped at the same priority
as domain in the original draft). Verified:
`recommendations.test.ts`'s "target-priority order — final ordering" test.

## 20. Cross-cutting breadth rule (§23) — Architect-finalized

**Final rule**: `pattern`, `qualifier`, `decision_type`, `role`,
`lifecycle`, and `stage` candidates all require
`distinctConceptCount(group.primaryAttempts) >= 2` — a one-concept issue
on any of these axes is a concept issue, not a cross-cutting one.
`decision_type` (Architect §3) and `role`/`lifecycle`/`stage` (Architect
§2) were added to this requirement in this follow-up; `concept`, `family`,
`evidence_dimension`, and `domain` remain unconstrained by it. Verified:
`recommendations.test.ts`'s extended breadth suite (single-concept
decision_type/role/stage excluded; 2-concept lifecycle/decision_type
included).

## 21. Overlap reduction (§22)

Candidates are processed in target-priority order; a lower-priority
candidate is dropped when its underlying primary-attempt `attemptId` set
is **fully contained** within the union of already-accepted
higher-priority candidates' attempt sets (e.g. a family recommendation
whose 2 attempts are the exact same 2 attempts already driving its
concept's own recommendation). Partial overlap is not reduced — only full
containment. Verified: `recommendations.test.ts`'s overlap-reduction suite.

## 22. Ranking comparator (§24)

A deterministic tuple, most-significant first: state severity
(NEEDS_REVIEW before DEVELOPING) → `failedRepairCount` desc →
`sureIncorrectCount` desc → `recentIncorrectCount` desc →
`distinctQuestionCount` desc → `lastAttemptAt` desc → `target.key` asc
(final stable tie-break). No single opaque weighted score anywhere.

## 23. Recommendation cap (§21/§24)

`slice(0, 3)` after ranking — never more than 3.

## 24. QA/prototype exclusion (§5/§27)

Enforced once, at the eligibility boundary (§3 above) — everything
downstream operates only on already-filtered events, so no group,
signal, trend, or recommendation can ever be influenced by a
prototype/QA-sourced event. Verified end-to-end:
`deriveInsights.test.ts`'s and `scenarios.test.ts`'s "QA contamination"
tests assert **exact equality** (`toEqual`) between a production-only
result and the same history with dozens of prototype failures appended.

## 25. Schema-version compatibility (§32)

See §3. An event with any `eventSchemaVersion` other than `1` is excluded
and diagnosed, never interpreted.

## 26. Diagnostics (§31)

`Diagnostic { kind, eventId, detail }`, three kinds:
`ORPHAN_REPAIR` (a Repair whose `parentAttemptId` resolves to no eligible
attempt), `UNSUPPORTED_SCHEMA_VERSION`, `MALFORMED_EVENT` (an unrecognized
`sourceContext`). Never crashes; never surfaced as developer text to a
learner (nothing in this module renders anything).

## 27. Deterministic / immutable guarantees (§28/§29)

- No random numbers, no wall-clock reads, no reliance on input array or
  IndexedDB storage order anywhere in this module.
- Every sort is explicit (`sortByOccurredAt`, tie-broken by `eventId`).
- `groups` in the final `InsightResult` are sorted by `identity.key` for
  stable output ordering.
- No function in this module ever assigns to an event property or array
  index — verified by dedicated `Object.freeze()`-based tests in every
  test file (`eligibility.test.ts`, `grouping.test.ts`,
  `classification.test.ts`, `repairLinkage.test.ts`,
  `deriveInsights.test.ts`).
- Determinism verified directly: `deriveLearningInsights` and
  `buildRecommendations` each have a dedicated "same input → same output"
  (`toEqual`) test.

## 28. Scenario results (§39)

All run through the real `deriveLearningInsights()` — see
`tests/frontend/unit/learning-intelligence/scenarios.test.ts` and the
local review artifact (§30 below) for the full evidence/state/reason-code
output of each.

| Scenario | Result |
|---|---|
| A — one wrong answer | `NOT_ENOUGH_EVIDENCE`, zero recommendations |
| B — repeated concept misses | `NEEDS_REVIEW` / `REPEATED_MISSES` |
| C — high-confidence misconception | `NEEDS_REVIEW` / `REPEATED_SURE_MISSES` |
| D — successful correction | not `NEEDS_REVIEW`; `SUCCESSFUL_CORRECTION` present; **zero recommendations** (Architect follow-up §1 — a successful Repair alone never keeps a group recommendation-eligible) |
| E — failed Repair + repeated miss | `NEEDS_REVIEW` / `REPAIR_STILL_MISSED` |
| F — strong recent performance | `STRONGER_EVIDENCE`, zero recommendations |
| G — cross-concept qualifier issue | qualifier group `NEEDS_REVIEW`, a cross-cutting candidate present; the same qualifier confined to 1 concept produces no candidate |
| H — QA contamination | production-only result exactly equals production+QA result |

## 29. Top-three recommendation example

Three independent `NEEDS_REVIEW` concepts (differing only in failed-Repair
count) rank with the failed-Repair concept first, deterministically —
see `scenarios.test.ts`'s "top-three recommendation ranking example" and
§12 of the regenerated review artifact (§31).

## 30. Test results

All counts below are from this session's final run, after the Architect's
LI-2 decision follow-up, against this worktree's actual state
(`post-mvp/learner-intelligence`, uncommitted, on top of `dc5bd19`). Per
the Architect's explicit instruction (§6 of the follow-up), since this was
a pure-logic-only narrow change and every listed suite below is green,
the broader browser/content/security matrix (already green after the
initial LI-2 pass, unaffected by this refinement) was not needlessly
re-run in full.

| Suite | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | clean, 0 errors |
| LI-2 targeted (`tests/frontend/unit/learning-intelligence/`) | **9 files, 101 tests, 101 pass** |
| LI-1 targeted (`tests/frontend/unit/learning-history/`) | 6 files, 52 tests, 52 pass — unaffected, module untouched |
| Vitest (`tests/frontend/unit/`, full) | **34 files, 359 tests, 359 pass** |

New LI-2 test breakdown (101 tests, 9 files): `eligibility.test.ts` (5),
`windows.test.ts` (8), `repairLinkage.test.ts` (6), `grouping.test.ts` (7),
`classification.test.ts` (25), `trend.test.ts` (6),
`recommendations.test.ts` (26 — grew from 15 to cover the Architect's
follow-up: DEVELOPING eligibility's two conditions, the successful-Repair
exclusion, the two-phase NEEDS_REVIEW-then-DEVELOPING slot-filling
behavior, the final role/lifecycle/stage/decision_type breadth rule, and
the final target-priority order), `deriveInsights.test.ts` (8),
`scenarios.test.ts` (10, with Scenario D's assertion tightened to prove
zero recommendations). Fixtures constructed via direct object literals
(`tests/frontend/unit/learning-intelligence/fixtures.ts`), the same
convention LI-1's own `db.test.ts` established, rather than through LI-1's
production-content-snapshotting event factories — those factories resolve
real questionIds against actual content and cannot produce arbitrary
controlled concept/pattern/domain combinations for a specific synthetic
scenario.

No existing test file outside `learning-intelligence/` was touched. The
following full suites were confirmed green during the initial LI-2 pass
(before this follow-up) and are unaffected by this narrow, pure-logic-only
refinement: `node --test tests/data-integrity/` (22 tests, 19 pass, 3
pre-existing `todo`), `node --test tests/data-model/` (92/92),
`node --test tests/content-production/` (477/477), Playwright e2e (112/112),
accessibility (42/42), visual regression (32/32, 0 pixel diffs),
`npm audit --audit-level=moderate` (0 vulnerabilities), and the production
build (bundle hash unchanged — this module is never imported by UI/App
code).

## 31. Review artifact

`/Users/demetrius/Downloads/cism-li2-insight-review.md` — **regenerated**
after the Architect's LI-2 decision follow-up by a temporary, uncommitted
scratch script (deleted after use) driving `deriveLearningInsights()`
directly against all 14 histories the follow-up's §5 required: isolated
miss, repeated misses, repeated Sure-confidence misses, successful Repair
+ improvement, failed Repair + repeated difficulty, Stronger Evidence,
cross-concept qualifier issue, cross-concept decision-type case,
single-concept decision-type non-recommendation case, a role breadth
example, QA contamination exclusion, the final top-three recommendation
example, a qualifying DEVELOPING candidate, and a DEVELOPING candidate
that does NOT qualify because a successful Repair is its only signal
(sections 13/14 directly demonstrate the new rule: identical evidence
except for the Repair outcome, one becomes a candidate, the other does
not). Each section shows the synthetic evidence, derived state, reason
codes, trend, recommendation disposition, and full evidence summary. Not
committed; not learner-facing.

**Optional live-history verification (§42) was not performed.** It is
explicitly optional in the brief, and the brief itself states synthetic
deterministic tests are the authoritative edge-case evidence — the 101
new tests plus the review artifact already exercise every required
condition precisely and repeatably, which a small ad-hoc real session
could not improve on and would not additionally verify (the engine takes
`LearningEvent[]` as a plain argument; it has no dependency on how those
events were produced).

## 32. Known limitations (carried forward, not solved here)

- No learner-facing Insights screen yet (LI-3).
- No concept-level Practice handoff yet (LI-4).
- Sparse `role`/`lifecycle`/`stage` coverage — usable only where genuinely
  populated (unchanged from LI-1's own finding).
- Local-only history; no import; no cloud sync.
- Current curriculum is `content_status: "CANDIDATE"` — this does not
  block insight computation, and `contentStatusAtAttempt` (LI-1) remains
  evidence metadata only; nothing in this module exposes "CANDIDATE" as a
  learner-facing concept.
- Early in a learner's history, most/all groups will legitimately be
  `NOT_ENOUGH_EVIDENCE` — expected, not a defect.
- The three implementation decisions originally left open (DEVELOPING
  recommendation eligibility, role/lifecycle/stage priority placement,
  `decision_type`'s cross-cutting breadth exclusion) were resolved by the
  Architect's LI-2 decision follow-up — see §18-§20 above. No open
  decisions remain in this phase.
- Section 1 of the review artifact (§31) does not enumerate the two new
  worked examples (a qualifying vs. non-qualifying DEVELOPING candidate)
  by number, since the artifact was regenerated after this document's
  scenario numbering (§28) was written; the artifact itself contains all
  14 sections the Architect's follow-up required, including both.

## 33. LI-4 routing constraint (non-blocking, recorded for the future phase)

**Architect note, LI-2 final review**: `RecommendationCandidate.suggestedActionKind`
is conceptual recommendation metadata only — never a final learner
navigation decision. When LI-4 implements real handoffs:

- Do not blindly map `ROLE`/`LIFECYCLE`/`STAGE` recommendations to an
  arbitrary domain merely because a candidate currently carries
  `PRACTICE_DOMAIN` (the fallback action kind for those axes in this
  module, §19) — LI-4 must decide the actually-correct scope for that
  specific cross-cutting evidence, not assume the domain the mapping
  happens to name today.
- A cross-cutting target (pattern/qualifier/decision_type/role/lifecycle/
  stage, all breadth-gated to ≥2 concepts by this module) may warrant a
  broader or related-concept practice scope than any single existing
  Practice scope option currently offers — LI-4 must validate the actual
  routing against the target, not assume a 1:1 mapping exists already.
- Actual handoff behavior must reuse the existing Explore/Practice
  engines (per the architecture's own no-duplicate-engine rule) — this
  note does not authorize a new engine, only flags that the mapping from
  `suggestedActionKind` to a real navigation call needs its own LI-4-time
  validation, not a mechanical pass-through of this module's output.

This requires **no LI-2 code change** — `suggestedActionKind` values and
the `ACTION_KIND_BY_AXIS` mapping in `recommendations.ts` are unchanged.

## 34. Architect review

**PASS.** Reviewed via the regenerated review artifact at
`/Users/demetrius/Downloads/cism-li2-insight-review.md` plus the automated
evidence in §30. **Founder UAT: WAIVED** for this phase.

Approved: production-only learner evidence; Apply as primary, Recall as
secondary; immutable Repair linkage; the minimum-evidence floor (≥3
primary attempts, ≥2 distinct questions); all four states
(`NOT_ENOUGH_EVIDENCE`/`NEEDS_REVIEW`/`DEVELOPING`/`STRONGER_EVIDENCE`);
bounded recent windows; the transparent Needs Review rules A/B/C; the
Stronger Evidence rule; classification precedence; confidence evidence
signals; successful-Repair recovery treatment and failed-Repair concern
treatment, including `unresolvedRecentIncorrectCount`; the deterministic
trend model; the typed reason codes; the recommendation cap of 3;
NEEDS_REVIEW-first recommendation filling with DEVELOPING only as a
secondary, slot-filling source; cross-concept breadth for pattern,
qualifier, decision_type, role, lifecycle, and stage; the final target
priority (concept → family → pattern → qualifier/decision_type →
evidence_dimension → role/lifecycle/stage → domain); overlap reduction;
deterministic ranking; QA/prototype exclusion; schema-version diagnostics;
and immutable-input/deterministic-output behavior throughout. The LI-4
routing constraint (§33) is recorded as a non-blocking future requirement,
not an LI-2 defect.
