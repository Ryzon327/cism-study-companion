# Phase 10B-2 Gate Record — Explore

**Status: [CANONICAL record of what happened]**. This is the durable
record of Phase 10B-2 — the first real learning-mode built on top of
Phase 10B-1's shared repair/attempt infrastructure, per the approved
architecture in [`LEARNING-MODES-ARCHITECTURE.md`](LEARNING-MODES-ARCHITECTURE.md)
and [`PHASE-10B1-GATE-RECORD.md`](PHASE-10B1-GATE-RECORD.md).

## Product contract

**Explore**: "Let me understand or revisit something specific" — distinct
from Daily Study ("teach me what I should learn next"). The learner
deliberately chooses a domain, then a concept; sees a concise,
concept-focused review before anything else; may optionally attempt one
concept-tied scenario; and can always leave or pick another concept
without being routed through Daily Study. Practice and Optional
Reinforcement remain unimplemented — not touched this phase.

## Implementation architecture

- `app/src/content/explore.ts` (new): the entire Explore data layer.
  Composes `registry`/`production` (the same maps `productionContentSource.ts`
  already loads) into small views — no second content system, no forked
  curriculum data.
- `app/src/screens/ExploreScreen.tsx` + `.css` (new): a single
  self-contained, phase-switched component (`domains` → `concepts` →
  `concept` → `scenario`), mirroring `DailyStudySession`'s own
  local-state-machine pattern. Registered as a normal ("full" mode) screen
  in `App.tsx` — deliberately **not** added to `SESSION_SCREENS`, so
  product navigation stays visible throughout and the learner is never
  trapped.
- `app/src/App.tsx`: added the `"explore"` screen id/route; renamed the
  nav item from "Explore & Practice" to "Explore" and pointed its entry
  screen at the new real experience instead of the Phase 5B "Practice
  Exam" prototype fixture (see "Nav rename" below).
- `app/src/screens/HomeScreen.tsx`: updated the existing secondary-section
  CTA to open the real Explore screen instead of the Practice Exam
  prototype, with matching copy.

No `ExploreQuestionEngine` was created, and none was needed.

## Reused infrastructure (nothing new was built for these)

- **Content model**: `registry`/`production` maps (`app/src/content/registry.ts`).
- **Family/variant selection**: `familyVariantsFor()` / `selectFamilyVariant()`
  / `resolveQuestion()` / `questionMeta()` (`resolve.ts`) — the exact same
  functions Daily Study's `getApplyQuestion()` uses.
- **Shared session exposure store**: `getExposureHistory()` /
  `recordExposure()` (`exposureStore.ts`) — the same Phase 10A-approved
  store Daily Study writes to, so a question seen earlier in Daily Study
  this session is not immediately re-shown by Explore, and vice versa. No
  second Explore-only exposure history was created.
- **Attempt flow**: `QuestionAttemptFlow` (Phase 10B-1) — passed
  `productionContentSource.buildFeedback` / `productionContentSource.getRepairCheck`
  directly, unmodified. Explore's optional scenario is therefore, by
  construction, the identical Feedback/near-transfer-Repair experience
  Daily Study uses; `onComplete` returns to the concept view, not to a
  Daily Study Completion screen.

## Available-content rule — [APPROVED — Architect Decision, Phase 10B-2 review]

**Decision**: Explore may expose all currently authored, active production
concepts. Rule: active authored production domain → active authored
production concept → available in Explore. This is not permission to
expose unauthored/future curriculum — Domain 3/4 remain absent until their
own production content is authored, at which point the existing discovery
architecture surfaces them automatically, with no code change. Future
persistence may add learner-specific affordances (recently learned, weak
concepts, recommended review, historical exposure) on top of this rule;
none of that is in scope for Phase 10B-2.

**Reasoning record** (why this rule, not "already-taught"):
`LEARNING-MODES-ARCHITECTURE.md`'s "Recommended learner flows" section
originally suggested scoping Explore's concept choice to "already-taught"
concepts via a prerequisite/taught-set walk. That same document's later,
higher-tier **[APPROVED, BINDING]** "Domain 3/4 generic-compatibility
strategy" section instead requires Explore's picker to "enumerate whatever
`domains.json` + `content/production/concepts.json` currently contain,"
so Domain 3/4 appear automatically with zero code change.

This phase's own instructions gave explicit authority to choose "available
authored production concepts" as the MVP rule "unless an existing
session/current-curriculum contract provides a better deterministic
boundary." The "already-taught" recommendation would be that boundary —
**except** it depends on a real per-learner completion signal that does
not exist: there is no persistence, and `todaysLessonId` is dev-only
QA-selectable tooling (a fixed pointer, not a real learner's session
history). Implementing "already-taught" literally would scope every real
learner to whichever tiny prerequisite chain the QA pointer's fixed
default happens to reach — Domain 2 would never appear for a real learner
today, regardless of how much curriculum actually exists.

**Chosen rule, implemented**: a domain/concept is available to explore
whenever at least one authored, active production concept exists for it
(`listExploreDomains()`/`listExploreConcepts()` in `explore.ts`). This
matches the BINDING generic-compatibility section exactly, is honest given
the absence of any real progress signal to scope against, and is proven
generic via a synthetic-future-domain test
(`tests/frontend/unit/explore.test.ts`) exactly as that section
anticipates. `LEARNING-MODES-ARCHITECTURE.md`'s Explore section has been
updated in place to record this reconciliation, not silently.

**Status**: Approved as-is. If the Architect/Founder wants Explore scoped
more narrowly once real progression exists, that is a straightforward
follow-up (swap `listExploreDomains()`'s source set), not a redesign.

## Concept review composition (no fabricated fields)

| Section | Source | Always present? |
|---|---|---|
| "What is this" | `concept.plain` | Yes — every concept has one |
| Perspective | teaching lesson's `cism_perspective` | Only if a lesson teaches this concept |
| "Notice this" | teaching lesson's `recognition_clues[0]` | Only if a lesson teaches this concept |
| Common trap | teaching lesson's `traps[0]` | Only if a lesson teaches this concept |
| Memory rule | teaching lesson's `memory_rules[0]` | Only if a lesson teaches this concept |
| Scenario availability | concept → most-specific active family → any active variant | Truthful — hidden when false, never fabricated |

"Teaching lesson" = the first active lesson whose `concepts` includes this
concept id, in authored order (`findTeachingLesson()` in `explore.ts`). A
concept with no teaching lesson yet still renders — shorter, via
`concept.plain` alone — rather than throwing or being excluded.

## Confusing-concept integration

No second taxonomy was created, and `docs/learning/CONFUSING-CONCEPTS.md`
(prose, not machine-readable) was not parsed. The generic, already-existing
signal used instead: a concept whose own `display_name` reads as a
comparison (e.g. "Governance vs. management," "Threat vs. vulnerability vs.
risk") already has `concept.plain` written as the comparison itself — no
extra UI branch was needed or added. Concepts without that shape simply
show their own `plain` explanation, per this phase's explicit "if not, do
not force one" instruction.

## Perspective / reasoning-lens treatment

Reused verbatim, not redesigned: the teaching lesson's own `cism_perspective`
field for the concept-review "Perspective" section, and — unchanged from
Phase 10B-1 — the `Perspective: <concept>` framing inside the optional
scenario's Repair check, when triggered. No answer is ever named in either
place.

## Concept → family → variant resolution

`resolveConceptFamily()` in `explore.ts`: among a concept's active,
matching families, picks whichever lists the **fewest** concepts (most
specific to this one), tie-broken by lowest family id — deterministic,
never "random," never a hardcoded family id. Proven against real data
(`concept.d2.risk-evaluation`, covered by both its own dedicated family and
the five-concept `family.d2.risk-management-synthesis` capstone family,
correctly resolves to the dedicated one).

## Domain-generic proof

`tests/frontend/unit/explore.test.ts`'s synthetic-future-domain suite adds
a `domain.synthetic-future` / concept / family / question combination
directly into the real `registry`/`production` maps at test time (cleaned
up in a `finally` block) and shows `listExploreDomains()`,
`listExploreConcepts()`, `getExploreConceptDetail()`, and
`getExploreScenarioQuestion()` all discover and resolve it correctly —
with zero code path specific to that or any other domain. The same suite
also asserts Domain 3/4 do **not** currently appear (no content authored
yet), proving the boundary is data-driven, not an allowlist.

## Persistence boundary

Unchanged. No localStorage, IndexedDB, backend, or new exposure store was
introduced. Explore reads the same in-memory `exposureStore.ts` singleton
Daily Study already writes to; a full reload resets both identically.

## Accessibility

No new question-rendering UI was built — the optional scenario reuses
`Question`/`AnswerOption`/`FeedbackScreen`/`RepairScreen` exactly as
Daily Study does, already covered by the existing a11y suite. Explore's
own screens (domain list, concept list, concept detail) use semantic
headings (`<h1>` per phase), a `<button>`-per-choice list model (native
focus/keyboard support, no custom widget), and route entirely through the
existing design-token system (`tokens.css`) — light/dark and
responsive/mobile behavior come free, unchanged from the rest of the app.
Manually verified via rendered screenshots at desktop and mobile widths,
both themes exercised in the existing token system (no Explore-specific
theme code was written to verify).

## Nav rename — "Explore & Practice" → "Explore"

The product nav item, Home's secondary CTA, and one Vitest + one
Playwright assertion were updated from "Explore & Practice" to "Explore."
Practice remains fully unimplemented; the destination no longer opens the
Phase 5B "Practice Exam" prototype fixture at all (that screen itself is
untouched and still reachable via the dev-only QA switcher) — keeping "&
Practice" in a label that now opens real Explore only would have been
actively misleading, which this phase's instructions explicitly permitted
correcting.

## Known limitations / deferred

- The available-content rule is flagged above for confirmation, not final.
- The six-step Foundation reasoning-model reference panel
  (`LEARNING-MODES-ARCHITECTURE.md`'s future-relationship item 2) was not
  built — that enhancement remains unimplemented, unchanged.
- Explore's optional scenario always draws from the concept's own family
  only (one concept → one scenario), not a richer multi-question session —
  intentional MVP scope; Practice is where a bounded multi-question session
  belongs, per the approved purpose model.

## Tests added

- `tests/frontend/unit/explore.test.ts` — 12 tests: generic domain/concept
  discovery, concept review composition, concept→family resolution
  (including the multi-family tie-break case), shared exposure-store use,
  invalid-id safety, and the synthetic-future-domain proof.
- `tests/frontend/unit/explore-screen.test.tsx` — 9 tests: no
  random-question landing, concept review before any question, optional
  (not forced) scenario, concept-tied question, correct-path Feedback,
  incorrect-path Repair, return-to-Explore-not-Daily-Study on completion,
  "Explore another concept," a no-family concept remaining explorable with
  the scenario action truthfully hidden, and the Done exit.
- `tests/frontend/unit/App.test.tsx` / `tests/frontend/e2e/smoke.spec.ts`:
  updated for the nav rename (same assertions, new label).

## Founder UAT policy

Automated coverage (21 new unit/component tests, full existing suite
green, rendered screenshots below) is sufficient for structural and
behavioral acceptance. One concise UAT workflow remains genuinely useful
for the subjective question automation cannot answer:

> "Open Explore, choose one concept you actually want to revisit, and tell
> us whether you understand why you're there and whether the experience
> helped you review it without feeling like random trivia."
