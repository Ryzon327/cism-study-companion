# Phase 10B-4 Gate Record — Optional Reinforcement

**Status: [CANONICAL record of what happened]**. This is the durable
record of Phase 10B-4 — the fourth and final Phase 10B-series learning
mode built on Phase 10B-1's shared attempt infrastructure, alongside
Phase 10B-2's Explore and Phase 10B-3's Practice, per
[`LEARNING-MODES-ARCHITECTURE.md`](LEARNING-MODES-ARCHITECTURE.md).

## Product contract

**Optional Reinforcement**: "Give me a very short retrieval boost on what
I just learned" — distinct from Daily Study, Explore, and Practice. A
contextual, optional, 2–4-question extension offered only on the Daily
Study Completion screen, using only that exact session's own Apply/Recall
evidence. No timer, no streaks, no scores, no persistence, no historical
weakness claim.

## Contextual-entry rule

Reinforcement is **not** a top-level nav destination and has no route of
its own — it lives entirely inside `DailyStudySession`'s own phase
machine (`recall → learn → attempt → completion → reinforcement →
reinforcement-complete`), exactly as the primary-objective instructions
specified ("an optional extension of the learning session, not a
fourth/fifth dashboard mode"). The Completion screen's "A quick
reinforcement" action (replacing the previous dead, always-rendered
`completion-optional` button) is shown **only** when
`reinforcementEligibleCount()` is genuinely positive — computed
side-effect-free, without committing any exposure, so merely rendering
Completion never consumes reinforcement material a learner might not use.

## Selection logic (no ReinforcementQuestionEngine)

`app/src/content/reinforcement.ts`'s `buildReinforcementSession(context, count)`:
round-robins across at most two candidate families — the just-answered
Apply question's family (always first: the concept the lesson just taught,
most relevant regardless of correctness) and the just-answered Recall
question's family (when it resolves to a real, different family) — using
`selection.ts`'s own pure `selectVariant`/`recordExposure`, exactly the
same pattern `practice.ts` already established in Phase 10B-3. The exact
Apply and Recall question ids just seen are always excluded, even if that
leaves a family with nothing else to contribute; the set is truthfully
shorter (or empty) rather than ever repeating or fabricating a question.
Default requested count is 3, capped to whatever is truthfully available.

## Current-session-only evidence

`ReinforcementContext` carries exactly three fields — `primaryQuestionId`,
`primaryCorrect`, `secondaryQuestionId?` — populated once, in
`DailyStudySession`'s own Apply `onComplete` handler, from data the
session already resolved this run. Nothing is read from a prior browser
session, nothing is persisted. `RecallCheckFixture` gained one additive
optional field, `questionId?: string`, populated by
`productionContentSource.getRecall()` (the Phase 5B prototype fixture
omits it, backward-compatible) so Reinforcement can identify the Recall
question's own family without Daily Study needing any other new plumbing.

## Shared exposure

Commits to the exact same `exposureStore.ts` singleton Daily Study,
Explore, and Practice already write to — no `reinforcementExposureStore`.

## QuestionAttemptFlow reuse

Reinforcement's `"reinforcement"` phase renders the shared
`QuestionAttemptFlow` directly, passing `contentSource.buildFeedback`/
`getRepairCheck` unmodified — identical Feedback/near-transfer-Repair
experience to every other mode. No shorter or weaker Repair: a learner who
needs Repair during Reinforcement gets the full existing near-transfer
check, not an abbreviated one, per this phase's explicit "truthful
learning > fake duration target" instruction.

## Scaffolding level

No concept/perspective label appears before or during a Reinforcement
question — only the progress meta (`Quick reinforcement · Question 2 of
3 · <domain>`), the same domain-only baseline every other mode already
uses. The concept a question tested is only surfaced afterward, in the
completion state's "Review" list, from already-resolved data
(`conceptForQuestion()`, reused from `practice.ts` — no new taxonomy).

## No-fake-timer policy

The prior "Optional 5-minute reinforcement" copy (in both
`productionContentSource.ts` and the Phase 5B prototype fixture,
`app/src/data/fixtures.ts`) promised a specific, unverified duration. The
production copy is now **"A quick reinforcement"** — no promised duration,
no countdown, no elapsed timer anywhere in the flow. The Phase 5B
prototype fixture's own copy was left untouched (its dead button context
never renders in a state where the text is reachable either way; changing
authored fixture copy that no test or reviewer path currently surfaces
was judged out of this phase's necessary scope).

## Summary semantics

"N questions completed," plus an optional "Review" list (only when a miss
during Reinforcement actually ties to a concept) with a per-concept
"Explore" link. No percentage, grade, pass/fail label, mastery/readiness
score, or badge — verified directly in this phase's own rendered evidence.

## Explore handoff

Reuses Explore's existing concept routing exactly as Practice's summary
already does: `DailyStudySession` takes an optional `onExploreConcept`
prop, and `App.tsx`'s single shared handler (renamed
`handleExploreConceptHandoff`, now used by both Practice and Daily
Study/Reinforcement) sets `ExploreScreen`'s `initialConceptId` and
navigates there. No new recommendation engine.

## Persistence boundary

Unchanged. No localStorage/IndexedDB/backend introduced.

## Accessibility

No new question-rendering UI — reuses `Question`/`AnswerOption`/
`FeedbackScreen`/`RepairScreen` exactly as every other mode does, already
covered by the existing a11y suite. One focused new check
(`tests/frontend/e2e/reinforcement.spec.ts`) covers what's genuinely new:
the Completion screen's real entry action, in-session progress, and the
Reinforcement Complete state — zero axe violations, both Chromium and
Firefox.

## A real integration defect found and fixed during implementation

The Phase 5B prototype content source's fixture question uses a
non-production id (`"proto.q1"`). The first full-suite run after wiring
Reinforcement into `DailyStudySession` threw
`Unresolvable production question: proto.q1` from inside
`reinforcementEligibleCount()`, breaking the entire prototype-mode Daily
Study flow. Fixed by resolving context question ids through a
non-throwing lookup (`production.questions.get(id)`) instead of the
throwing `requireProductionQuestion()` — any id that doesn't resolve in
production data is now correctly treated as "no reinforcement content
available" (item 20's "invalid context fails safely" requirement),
verified directly by a dedicated test using the real prototype content
source.

## Known limitations / deferred

- Reinforcement draws from at most two families (Apply's and Recall's) —
  a small, deterministic, evidence-driven scope by design, not a
  recommendation engine; a session where both happen to share one family
  degrades to a single-family reinforcement set, which is still correct
  and truthful, just less varied.
- The Phase 5B prototype fixture's own "5-minute" copy string was left
  unchanged (see No-fake-timer policy above) since it is not currently
  reachable through any real interaction path.

## Tests added

- `tests/frontend/unit/reinforcement.test.ts` — 10 tests: eligibility,
  duplicate-avoidance, dual-family sourcing, single-family fallback,
  truthful degradation under scarcity, shared exposure-store integration,
  safe handling of an unresolvable/invalid question id, a family with no
  alternate variant, and the synthetic-future-domain proof.
- `tests/frontend/unit/daily-study-reinforcement.test.tsx` — 8 tests:
  optionality (Done works without ever starting Reinforcement), contextual
  entry only when eligible, bounded 3-question progress, family
  prioritization from the just-completed lesson, no leaked
  concept/perspective hint, a full miss-then-Repair-then-completion
  walkthrough with truthful counts and no gamified language, the Explore
  handoff, and the Phase 5B prototype's safe invalid-context degradation.
- `tests/frontend/e2e/reinforcement.spec.ts` — 1 focused a11y/browser test.
- Existing Daily Study/Explore/Practice suites (unit + e2e) all re-verified
  green, unmodified.

## Evidence-first UAT

8 rendered screenshots (desktop Completion-with-entry, first question,
incorrect Feedback, Repair, later-question progress, completion, plus
mobile question and mobile completion) composed into one local contact
sheet for ChatGPT's pre-Founder review — not committed, not published.
