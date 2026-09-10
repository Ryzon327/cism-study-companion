# Phase 10B-3 Gate Record — Practice

**Status: [CANONICAL record of what happened]**. This is the durable
record of Phase 10B-3 — the second real learning mode built on Phase
10B-1's shared attempt infrastructure, alongside Phase 10B-2's Explore, per
[`LEARNING-MODES-ARCHITECTURE.md`](LEARNING-MODES-ARCHITECTURE.md).

## Product contract

**Practice**: "Test me deliberately on material I've already learned" —
distinct from Daily Study ("teach me what's next") and Explore ("let me
understand or revisit something specific"). A bounded session: choose a
scope and a question count, answer that many questions one at a time,
immediate Feedback/Repair per question, then a calm, truthful summary. No
timer, no streaks, no scores, no persistence. Reinforcement remains
unimplemented — not touched this phase.

## Available-content rule

Identical rule to the one approved for Explore (Phase 10B-2): a domain is
offered the moment it has at least one currently authored, active,
non-empty question family (`family.domain`, never a hardcoded id); "All
available material" is always offered as the broadest scope. With no
persistent per-learner history, Practice does not claim to know what a
specific learner has actually studied — it offers what's authored, exactly
as Explore does. See `app/src/content/practice.ts`'s `listPracticeScopes()`.

## Session model

`app/src/screens/PracticeScreen.tsx` — a single self-contained,
phase-switched component (`landing` → `session` → `summary`), mirroring
`ExploreScreen`'s and `DailyStudySession`'s own local-state-machine
pattern. Registered in `App.tsx`'s `SESSION_SCREENS` (unlike Explore) —
the whole bounded session recedes to a single Exit action, the same
treatment Daily Study's own session already gets, since Practice is a
start-to-finish bounded activity rather than open-ended browsing. This is
a deliberate judgment call, reversible with a one-line change if the
Architect prefers Explore's always-visible-nav treatment instead.

## Selection logic (no PracticeQuestionEngine)

`app/src/content/practice.ts`'s `buildPracticeSession(scopeId, count)`:
round-robins across every eligible family (stable id order) so a short
session draws from varied concepts, using `selection.ts`'s own pure
`selectVariant`/`recordExposure` threaded through a local working history
seeded from the real shared store — no question id can repeat within a
session (each family's remaining-variant pool has the chosen id removed
immediately). If fewer unique questions exist than requested, the session
is truthfully shorter — never padded or fabricated. Reuses
`resolve.ts`'s `familyVariantsFor()`/`resolveQuestion()` verbatim; no
second content system.

## Exposure behavior

The whole constructed session commits real exposure via the same
`exposureStore.ts` singleton Daily Study and Explore already write to —
no `practiceExposureStore`. A second session started immediately
afterward prefers not-yet-seen questions over the first session's own
picks (see `practice.test.ts`).

## QuestionAttemptFlow reuse

Practice passes `productionContentSource.buildFeedback` /
`productionContentSource.getRepairCheck` straight into the shared
`QuestionAttemptFlow`, unmodified — identical Feedback/near-transfer-Repair
experience to Daily Study and Explore.

**One shared-infrastructure change, made deliberately and minimally**:
`QuestionAttemptFlow`'s `onComplete` signature widened from `() => void` to
`(correct: boolean) => void`, so a multi-question caller can tally results
without wrapping `buildFeedback` (which is called twice per attempt inside
`QuestionAttemptFlow` — once for Feedback, once for Repair — making a
call-counting wrapper unsound). Existing callers
(`DailyStudySession`, `ExploreScreen`) needed no changes: a callback
expecting fewer parameters is assignable to one expecting more. **A real
integration defect was caught and fixed during this phase because of
this**: without a `key={question.id}` on the `<QuestionAttemptFlow>`
element, advancing to the next Practice question reused the same
component instance, leaking its internal phase/`selectedKey` state from
the previous question. Fixed by keying the element on the current
question's id — Daily Study and Explore never hit this, since neither
ever re-renders `QuestionAttemptFlow` for a *different* question at the
same tree position without an intervening differently-shaped screen.

## Scaffolding progression (Explore vs. Practice)

No concept/perspective label is ever shown before or during a Practice
question — only the domain label in the progress meta (`Question 2 of 5 ·
Governance`), the same baseline Daily Study's own Apply screen already
shows. The concept a question tested is only surfaced afterward, in the
summary's "Review" list, derived from already-resolved data
(`conceptForQuestion()`) — never inferred or leaked beforehand. This
matches the approved Explore-more-scaffolding / Practice-less-scaffolding
progression toward a future, still-unauthorized Mock Exam.

## Summary semantics

Truthful counts only: "N questions completed / X correct / Y needed
repair" — "needed repair," never "wrong" or "failed." No percentages,
grades, pass/fail labels, or trend claims. Verified directly against a
real 0/5 session in this phase's own rendered evidence (screenshot #6) —
the summary states it plainly, exactly as designed, not softened or hidden.

## Missed-concept derivation and Explore handoff

Truthful and session-only: each incorrect answer's underlying question is
looked up via `conceptForQuestion()` (the question's own `concepts[0]` →
`concept.display_name`), deduplicated, and listed with an "Explore"
button. Clicking it reuses Explore's *existing* concept routing — no new
recommendation engine: `ExploreScreen` gained one small additive prop,
`initialConceptId?: string`, so it can open directly on a specific
concept's review instead of always starting at the domain list.
`App.tsx` threads this through a dedicated handler
(`handlePracticeExploreConcept`) that is cleared by any *normal* product-nav
click, so the real "Explore" nav item never inherits a stale concept from
an earlier Practice session.

## Navigation

Product nav becomes four real destinations: Home, Daily Study, Explore,
Practice (`app/src/App.tsx`, `BottomTabBar.tsx` gained a "practice" icon).
The Phase 5B "Practice Exam" prototype screen is untouched and still
reachable only via the dev-only QA switcher — never deleted, never
exposed as the real Practice destination.

## Accessibility

No new question-rendering UI — the session reuses `Question`/
`AnswerOption`/`FeedbackScreen`/`RepairScreen` exactly as Daily Study and
Explore do, already covered by the existing a11y suite. One focused new
check (`tests/frontend/e2e/practice.spec.ts`) covers what's genuinely new:
the scope/count landing screen and the in-session progress text — zero
axe violations, both Chromium and Firefox.

## Evidence-first UAT

Automated coverage (25 new unit/component tests across `practice.test.ts`
and `practice-screen.test.tsx`, full existing suite green, one focused
a11y check, rendered screenshots below) is the primary evidence. A
temporary Playwright walkthrough (deleted after use, matching the Phase
10B-1/10B-2 pattern) exercised a full real 5-question Domain 1 session —
correct path, incorrect-with-Repair path, later-question progress, and a
full completion to summary — capturing 8 screenshots, composed into one
local contact sheet for ChatGPT's pre-Founder review (not committed, not
published).

## Known limitations / deferred

- Practice's session-mode nav treatment (full recede, like Daily Study)
  vs. Explore's always-visible nav is a judgment call flagged above for
  Architect confirmation, not asserted as final.
- No new permanent visual-regression gate screens were added for Practice
  itself (landing/session/summary), consistent with Phase 10B-2's same
  choice for Explore — ad hoc walkthrough screenshots serve UX review;
  the existing 32-screen matrix only gained the "Practice" nav-tab
  addition on the two screens (`home`, `review-center`) that render the
  top-level nav.
- Confidence remains UI-only, unchanged — not wired into session logic.
- No persistence: an abandoned Practice session discards its progress
  truthfully; this is acceptable MVP behavior, not a defect.

## Tests added

- `tests/frontend/unit/practice.test.ts` — 14 tests: generic scope
  discovery, count-option availability, single-domain scope, bounded
  session construction, within-session uniqueness/variety, graceful
  shortfall handling, shared exposure-store integration, truthful
  concept derivation, and the synthetic-future-domain proof.
- `tests/frontend/unit/practice-screen.test.tsx` — 11 tests: no
  random-question landing, generic scope/count offering, truthful
  count-option disabling, no leaked concept/perspective hint,
  known bounded progress text, correct-path advance, incorrect-path
  Repair-then-advance, full 5-question completion with truthful summary
  counts (and no gamified language), "Practice again" resets to landing,
  the Explore handoff invoking Explore's own routing, and safe exit.
- `tests/frontend/e2e/practice.spec.ts` — 2 tests: focused a11y coverage
  and confirmation the real Practice destination is distinct from the old
  prototype.
- `tests/frontend/unit/App.test.tsx` / `tests/frontend/e2e/smoke.spec.ts`:
  updated for the four-destination nav (same assertions, new count/label).
