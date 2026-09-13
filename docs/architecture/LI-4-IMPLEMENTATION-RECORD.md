# LI-4 — Targeted Study Handoffs — Implementation Record

**Status: Architect review: PASS. Founder UAT: WAIVED.**

Implements LI-4 of `docs/architecture/LEARNING-INTELLIGENCE-V1.md`, on top
of LI-1 (`59728e6`), the Product Environment Follow-up (`dc5bd19`), LI-2
(`cab7d81`), and LI-3 (`c709c0d`). Scope: resolving a recommendation's
target into a real, currently-available study destination, and wiring
Focus Next's action buttons and a targeted-Practice landing to it. **No
LI-2 rule changes, no LI-1 schema changes, no LI-5 release work.**

## 1. Navigation architecture

No routing library was added (none exists in this repo; none was
authorized). `App.tsx` gains one new piece of navigation/session state,
mirroring the existing `exploreInitialConceptId` pattern exactly:

```ts
const [practiceHandoff, setPracticeHandoff] = useState<PracticeHandoffRequest | undefined>(undefined);

function handleActivateStudyHandoff(handoff: StudyHandoff, label: string) {
  if (handoff.kind === "review") {
    handleExploreConceptHandoff(handoff.conceptId); // the exact existing mechanism
    return;
  }
  setPracticeHandoff({ scope: handoff.scope, label });
  setActiveId("practice");
}
```

`handleSelectProduct` (primary nav) clears `practiceHandoff` unconditionally,
exactly as it already clears `exploreInitialConceptId` — this is the one
place manual navigation is guaranteed never to inherit a stale target
(§20/§50 below). `InsightsScreen` receives one new prop,
`onActivateHandoff(handoff, label)`, and stays completely ignorant of
App-level routing — the same separation `PracticeScreen.onExploreConcept`
and `ExploreScreen.initialConceptId` already established for the
Practice→Explore handoff.

## 2. `StudyHandoff` model

New module `app/src/study-handoff/` (types + one pure resolver, per the
brief's suggested shape):

```ts
// types.ts
export type PracticeScope = { kind: "domain"; domainId: string } | { kind: "target"; axis: Axis; targetId: string };
export interface PracticeHandoffRequest { scope: PracticeScope; label: string; }
export type StudyHandoff =
  | { kind: "review"; conceptId: string }
  | { kind: "practice"; scope: PracticeScope; eligibleQuestionCount: number };
```

`conceptId`/`targetId`/`axis` are the computational identity threaded
through navigation state — never a display label (§5 of the brief).
`resolveStudyHandoffs(target: GroupIdentity): StudyHandoff[]` is the one
place a recommendation's target becomes zero or more real destinations —
independent of React/App wiring, fully unit-testable
(`tests/frontend/unit/study-handoff/resolveStudyHandoffs.test.ts`).

## 3. Routing authority — binding constraint honored

`RecommendationCandidate.suggestedActionKind` (LI-2) is **never read** by
`resolveStudyHandoffs` or anywhere in this phase. Routing is derived
exclusively from `target.axis` + `target.targetId` + current production
content. This matters concretely: LI-2 can emit `suggestedActionKind:
"REVIEW_PATTERN"` for a pattern-axis recommendation, but no per-pattern
Explore destination exists in this product — `resolveStudyHandoffs`
correctly never offers a Review action for a pattern target regardless of
what `suggestedActionKind` says (verified:
`resolveStudyHandoffs.test.ts`'s cross-cutting-axes suite). LI-3's old
`suggestedActionText`/`ACTION_VERB_BY_KIND` (which *did* read
`suggestedActionKind` as informational-only text) is removed entirely from
`insightPresentation.ts`, replaced by `buildFocusNext`'s real
`actions: RecommendationActionPresentation[]`.

## 4. Current-content resolution strategy

Every handoff decision reads `app/src/content/registry.ts`'s `production`/
`registry` maps directly (the same source Explore/Practice/Daily Study
already load) — never a `LearningEvent`'s snapshotted metadata. A stale
concept ID that no longer exists in `production.concepts` simply fails
`production.concepts.has(...)` and matches zero current questions in
`eligibleQuestionsForTarget` — both checks fall out of ordinary Map/array
lookups with no special-cased "is this stale" branch anywhere. This is why
`resolveStudyHandoffs` never throws on a stale target (§33 of the brief):
there is no code path that assumes a target resolves.

## 5. Concept Review behavior

`target.axis === "concept" && production.concepts.has(target.targetId)` →
`{ kind: "review", conceptId: target.targetId }`. `App.tsx` routes this
through the exact existing `handleExploreConceptHandoff` →
`ExploreScreen`'s `initialConceptId` prop → `getExploreConceptDetail` — the
learner lands directly on the concept's own Explore content, never the
domain/concept picker (verified: `study-handoff.spec.ts`'s Review-handoff
e2e test asserts the generic picker heading has zero count and real
concept content is visible). Opening Review creates **zero**
`LearningEvent`s — verified directly by counting `learningEvents` before
and after in the same e2e test (§31/§49 of the brief).

## 6. Family Review behavior

A family's Review destination is offered **only** when the family maps to
exactly one concept (`family.concepts.length === 1`) — the overwhelming
majority of authored families today. Three real families are intentional
exceptions: `family.d2.risk-management-synthesis` (5 concepts),
`family.d3.program-synthesis` (7), `family.d4.incident-management-synthesis`
(8) — each a domain capstone/synthesis family, and each correctly gets
**Practice only, no Review** (verified:
`resolveStudyHandoffs.test.ts`'s family suite, against
`family.d2.risk-management-synthesis` directly). No concept is ever picked
arbitrarily for these.

## 7. Concept Practice behavior

`eligibleQuestionsForTarget({ axis: "concept", targetId })` matches only
`question.concepts.includes(targetId)` — verified never to leak a
same-domain, different-concept question
(`tests/frontend/unit/practice.test.ts`'s targeted-eligibility suite).

## 8. Family Practice behavior

Same mechanism, `axis: "family"`, matching `question.family === targetId`
— proven against both a single-concept family and the 5-concept synthesis
family (§40/§41 of the brief).

## 9. Pattern Practice behavior

`question.patterns.includes(targetId)`. Real content check: `pattern.p02`
("Authority Follows Accountability") matches 38 current questions across
all 4 domains and 19 distinct concepts (see the machine-readable artifact,
§10 below) — never collapsed to one concept or one domain.

## 10. Qualifier Practice behavior

`question.qualifier === targetId`. `qualifier.next` ("NEXT questions")
matches 7 current questions across 4 domains.

## 11. Decision-type Practice behavior

`question.decision_type === targetId`. `decision.risk` matches 35 current
questions across domains 1-2.

## 12. Evidence-dimension Practice behavior

`question.evidence_dimensions.includes(targetId)`. `evidence.knowledge`
matches 87 current questions across all 4 domains.

**Architect note, LI-4 final review (non-blocking, LI-5 scope)**: this is
the broadest real cross-cutting scope this phase's evidence surfaced —
`evidence.knowledge` legitimately spans 87 questions across 32 concepts and
all 4 domains. This is **not** an LI-4 routing defect: every returned
question genuinely carries that evidence dimension, per current production
metadata, exactly as §10/§11 require. During LI-5 whole-feature
acceptance, evaluate whether a cross-cutting target this broad still reads
to a learner as a meaningful "targeted" focus, or whether a future,
separate refinement (e.g. a size-aware presentation choice) is warranted.
No LI-4 filtering or LI-2 intelligence change is authorized by this note.

## 13. Role Practice behavior

`question.primary_role === targetId` — **never** `roles_mentioned`
(verified directly: a question that only mentions a role without it being
`primary_role` is excluded). `role.security-manager` matches 22 current
questions across domains 1-3.

## 14. Lifecycle Practice behavior

`question.lifecycle === targetId`. `lifecycle.risk` matches 21 current
questions, all in Domain 2 (the only domain with a risk lifecycle model
today — correctly not fabricated elsewhere).

## 15. Stage Practice behavior

`question.stage === targetId`. `stage.risk.analyze` matches 7 current
questions.

## 16. Domain Practice behavior

**Reuses `buildPracticeSession`/`listPracticeScopes` verbatim — no second
domain-filter implementation.** A domain-axis `StudyHandoff` carries
`scope: { kind: "domain", domainId }`; `PracticeScreen` treats this as
nothing more than presetting its existing `scopeId` state to that domain
before rendering the **same, unmodified** ordinary landing — the learner
sees the normal Practice experience with the domain radio already
selected, exactly as the brief requires (§14/§46). Verified:
`practice-screen.targeted.test.tsx`'s domain-handoff test asserts the
ordinary "Choose what to practice" heading renders, never "Targeted
practice."

`eligibleQuestionsForTarget({ axis: "domain", ... })` also exists (matching
`question.domain === targetId` directly) but is used **only** as a
truthful existence check inside `resolveStudyHandoffs` (deciding whether to
offer the Practice action at all) — never to build the actual domain
session, which stays on the pre-existing `buildPracticeSession` path.

## 17. Stale-target behavior

A target that no longer resolves (concept removed, or a cross-cutting
value with zero current matching questions) yields `resolveStudyHandoffs`
→ `[]`. `InsightsScreen` renders zero action buttons for that card — the
evidence/why/state copy remains, exactly as LI-3 already rendered it, with
no broken or disabled button anywhere. Verified at three layers: unit
(`resolveStudyHandoffs.test.ts`, `insightPresentation.test.ts`), component
(`InsightsScreen.handoffs.test.tsx`), and the real IndexedDB-seeded
`08-stale-target-no-broken-action.png` evidence panel.

## 18. Practice target label

`PracticeScreen`'s targeted landing shows `targetHandoff.label` — the
**exact same** string LI-3's `resolveDisplayLabel` already produced for
the Focus Next card, threaded through `App.tsx`'s navigation state
unchanged (never recomputed by a second naming system, per §34 of the
brief). The raw `axis`/`targetId` are never rendered.

## 19. Eligible-count behavior

`PracticeScreen` re-resolves `eligibleQuestionsForTarget(target)` itself,
fresh, at render time — never trusting a count carried over from Insights
(content could theoretically have changed between screens). Shown as "N
question(s) available for this focus," truthfully, never a fabricated
round number.

## 20. Session-length behavior

`getTargetedPracticeCountOptions(target)` offers the existing 5/10
candidates filtered to `<= total`, **plus the pool's own true size** when
it isn't already one of those two numbers — so a 6-question concept offers
`[5, 6]`, not `[]` or a padded `[5, 10]` with 10 disabled. Every offered
option is genuinely startable (`available: true` always, by construction —
nothing is offered that can't truthfully be fulfilled). Never pads with a
duplicate question to reach a configured count (reuses
`buildSessionFromPool`, the same round-robin/no-repeat engine
`buildPracticeSession` already used, refactored out as a shared private
helper — not a second engine).

## 21. Clear-target behavior

"Practice something else" (targeted landing) calls `clearTarget()`
(`setTargetHandoff(undefined); setSelectedCount(null)`), returning to the
exact ordinary scope/count landing. Verified:
`practice-screen.targeted.test.tsx`, `study-handoff.spec.ts`'s clear-target
e2e test (clears, then leaves and re-enters Practice via primary nav with
zero sticky state).

## 22. Manual Practice regression

Opening Practice directly from primary navigation passes no
`initialHandoff` — `PracticeScreen`'s `targetHandoff`/`scopeId` state
initializes exactly as before LI-4 (`ALL_SCOPE_ID`, no target). Verified:
a dedicated regression test in `practice-screen.targeted.test.tsx`, an
App-level test in `app-environment.test.tsx`, and an e2e test in
`study-handoff.spec.ts` (§50). No existing Practice test was rewritten to
accommodate targeted mode.

## 23. Hard-refresh behavior

No persistence was added for `practiceHandoff`/`targetHandoff` (both are
plain in-memory `useState`, exactly like every other piece of `App.tsx`
navigation state, including `activeId` itself). A hard refresh already
resets `activeId` to `"home"` in this app — LI-4 introduces no new
fragility here; it simply never opts out of that pre-existing, uniform
behavior. No routing framework was introduced.

## 24. Focus Next action UI

Each card renders 0-2 real `<Button variant="secondary">` actions (never a
disabled placeholder), each with a distinct `aria-label` combining the
action label and the card's own display label (e.g. `"Review topic:
Program metrics and reporting..."`) — satisfying §37's "duplicate ambiguous
button" requirement across multiple cards that might share the same
visible label. Labels: `"Review topic"` (concept/single-concept family);
`"Practice this topic"` (concept/family); `"Practice this pattern"`
(pattern); `"Practice {qualifier label}"` (qualifier, e.g. "Practice NEXT
questions"); `"Practice this domain"` (domain); `"Practice this reasoning
focus"` (decision_type/evidence_dimension/role/lifecycle/stage). Never
"Go"/"Open"/"Fix weakness."

## 25. Developing action UI

Uses the exact same `resolveStudyHandoffs`/action-rendering path as NEEDS
REVIEW cards — no separate logic, no separate visual urgency added. LI-3's
softer `.insights-card-developing` styling (border color, never
color-only) is untouched.

## 26. Stronger Areas disposition

**No Practice action was added.** `buildStrongerAreas` and its rendering
in `InsightsScreen.tsx` are completely untouched by this phase — verified
directly: `InsightsScreen.handoffs.test.tsx`'s "Stronger Areas never
renders a Practice action" test asserts zero `<button>` elements inside
that section.

## 27. Learning History behavior

**Zero LI-1 changes.** Targeted Practice reuses `QuestionAttemptFlow`
completely unmodified, called with the exact same
`learningMode="practice"` / `sourceContext="production"` it already used
for ordinary Practice — targeting is session/navigation context, never a
new `learningMode` value, exactly per the Architect's stated preference.
`LearningEvent`'s schema, `eventSchemaVersion`, Repair semantics,
confidence semantics, and `sourceContext` semantics are byte-for-byte
unchanged.

## 28. Insights feedback-loop result

Proven end-to-end in `study-handoff.spec.ts`'s history-feedback-loop test:
seed a real NEEDS_REVIEW recommendation → open Insights → click the real
"Practice this topic" action → targeted Practice → answer one real
question → return to Insights via ordinary navigation (no reload) →
Study Data's attempt count increases by exactly one. No manual refresh
button exists or was added; `InsightsScreen`'s existing screen-entry
`refresh()` (LI-3, untouched) is what picks up the new evidence.

## 29. Explore Review event behavior

Verified directly: opening a Review handoff writes **zero**
`LearningEvent`s (event count before/after is identical in the same e2e
test that proves the navigation itself). Nothing in this phase marks a
recommendation "completed" from a Review visit.

## 30. Accessibility

All new controls are real `<button>` elements (native keyboard
activation, native focus visibility — no custom non-semantic control was
introduced). Distinct `aria-label`s per action per card. The targeted
Practice landing reuses LI-3/Phase-10B-3's existing `radiogroup`/`radio`
count-selector pattern verbatim. Verified: `study-handoff.spec.ts`'s axe
scan (`wcag2a`/`wcag2aa`/`wcag22aa`) of both Focus Next actions and the
targeted-Practice landing — zero violations.

**Test-infra finding (not a product defect):** the dark-mode a11y test
initially reported a false-positive `color-contrast` violation on these
same buttons, non-deterministically, on Firefox only. Direct
`getComputedStyle` inspection confirmed the actual settled styles are
`--text-primary` on `--surface` (high contrast) — the failure was axe
sampling a mid-transition frame of the theme toggle's 150ms
`background-color` transition. Fixed by waiting for the transition to
settle before scanning; confirmed stable across three repeated runs on
both browsers after the fix. No product code was touched for this.

## 31. Mobile

Focus Next actions wrap to a single column at ≤639px (new
`.insights-card-actions` rule, mirroring the existing
`.insights-study-data-actions` pattern). The targeted-Practice landing
reuses the existing `.practice-options`/`.practice-actions` responsive
rules verbatim — no new mobile-specific CSS was needed there. Verified: no
horizontal scroll at 390px for both surfaces (`study-handoff.spec.ts`).

## 32. Dark mode

No new hardcoded colors — every new class (`.insights-card-actions`,
`.practice-target-label`, `.practice-target-count`) uses only existing
design tokens or inherits `Button`'s existing themed styles. Verified
(after the transition-timing fix above): zero axe violations in dark mode
for both Focus Next actions and the targeted-Practice landing.

## 33. Test results

All counts below are from this session's final run against this
worktree's actual state (`post-mvp/learner-intelligence`, uncommitted, on
top of `c709c0d`).

| Suite | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | clean, 0 errors |
| Production build (`vite build`) | succeeds |
| LI-4 targeted (practice.test.ts targeted suites + study-handoff/ + InsightsScreen.handoffs.test.tsx + practice-screen.targeted.test.tsx) | 61 tests, 61 pass (includes pre-existing practice.test.ts coverage; net new LI-4 tests: 55) |
| LI-3 targeted (`insights/` + `InsightsScreen.test.tsx` + `InsightsScreen.handoffs.test.tsx`) | 68 tests, 68 pass |
| LI-2 targeted (`learning-intelligence/`) | 101 tests, 101 pass — unaffected, module untouched |
| LI-1 targeted (`learning-history/`) | 52 tests, 52 pass — unaffected, module untouched |
| product-environment targeted (e2e) | 26 tests, 26 pass |
| Vitest (`tests/frontend/unit/`, full) | **40 files, 472 tests, 472 pass** (417 pre-LI-4 + 55 net new) |
| Playwright e2e (Chromium + Firefox) | **140 tests, 140 pass** (122 pre-LI-4 + 18 new in `study-handoff.spec.ts`) |
| Playwright visual regression | 32 tests, 32 pass, **0 baseline changes** — LI-4 touched no Visual Prototype Gate screen |
| `node --test tests/data-integrity/` | 22 tests, 19 pass, 3 pre-existing `todo` (BUG-001/002/003, unrelated) |
| `node --test tests/data-model/` | 92/92 pass |
| `node --test tests/content-production/` | 477/477 pass |
| `npm audit --audit-level=moderate` | 0 vulnerabilities |

New/changed LI-4 test files: `tests/frontend/unit/practice.test.ts`
(extended — targeted eligibility per axis, count options, targeted session
construction), `tests/frontend/unit/study-handoff/resolveStudyHandoffs.test.ts`
(new), `tests/frontend/unit/InsightsScreen.handoffs.test.tsx` (new, 5
tests), `tests/frontend/unit/practice-screen.targeted.test.tsx` (new, 9
tests), `tests/frontend/unit/insights/insightPresentation.test.ts`
(extended — `buildFocusNext`'s real action resolution, replacing the
removed `suggestedActionText` tests), `tests/frontend/unit/app-environment.test.tsx`
(extended — App-level handoff navigation, 3 tests),
`tests/frontend/e2e/study-handoff.spec.ts` (new, 9 tests × 2 browsers = 18).

## 34. Evidence paths

- Visual contact sheet (15 panels): `/Users/demetrius/Downloads/cism-li4-review.png`.
- Machine-readable handoff/filtering artifact (12 cases — concept, two
  family cases (single- and multi-concept), pattern, qualifier,
  decision_type, evidence_dimension, role, lifecycle, stage, domain, and a
  stale concept — driven through the real `resolveStudyHandoffs`/
  `eligibleQuestionsForTarget`/`resolveDisplayLabel` code path):
  `/Users/demetrius/Downloads/cism-li4-handoff-review.json`. Neither file
  is committed; both are external, preserved artifacts.
- Live verification: performed against an ordinary (`npm run dev`, no
  `VITE_ENABLE_QA_FIXTURES`) dev server — the same run that produced the
  screenshots above — confirming Review→exact Explore content,
  Practice→targeted scope→real answer→Insights refresh, ordinary Practice
  unaffected by primary nav, and the cross-cutting pattern example
  spanning 4 domains/19 concepts with no arbitrary domain routing.

## 35. Known limitations (carried forward, not solved here)

- No adaptive recommendation sequencing, no AI-generated practice, no
  spaced repetition, no anti-streak selection — LI-4 is deterministic
  scoping only, per the brief.
- No recommendation dismissal/completion state — a recommendation
  disappears only when LI-2's own rules stop classifying the group as
  NEEDS_REVIEW/DEVELOPING, never because the learner "used" a handoff.
- No persistent targeted-handoff state — a hard refresh returns to Home,
  exactly like the rest of this app's navigation.
- Current Practice availability depends entirely on current production
  metadata; a historically-driven recommendation may legitimately have no
  available handoff today (correct, not a defect).
- **Curriculum-structure observation (Architect-confirmed non-blocking,
  LI-4 final review)**: a real, authored multi-concept family in this
  curriculum (`family.d2.risk-management-synthesis` and its two Domain 3/4
  counterparts) always shares one synthesis concept across every member
  question — meaning LI-2's own overlap reduction will, in practice,
  usually surface that shared concept's own recommendation instead of the
  family's whenever enough family-member questions are missed. The
  family-only-Practice resolver behavior itself is still fully correct and
  directly unit-tested (`resolveStudyHandoffs.test.ts`); it simply may not
  often be the *visible* recommendation in real usage given this
  curriculum's current authoring shape. **Not an LI-4 defect; no
  curriculum or LI-2 change authorized by this note.**
- **LI-5 broad-cross-cutting-scope observation (Architect-confirmed
  non-blocking, recorded for LI-5 whole-feature acceptance)**: see §12
  above — `evidence.knowledge` (87 questions / 32 concepts / 4 domains) is
  the broadest real cross-cutting scope surfaced during this phase's
  evidence review. Every returned question is a legitimate current match,
  so this is not an LI-4 routing defect; LI-5 should evaluate whether a
  scope this broad still reads as a useful "targeted" learner experience.
  No LI-4 filtering or LI-2 intelligence change is authorized by this note.
- `buildStrongerAreas`'s presentation-only overlap-reduction limitation
  (documented in LI-3) is unchanged.

## 36. Architect review

**PASS.** Reviewed via `/Users/demetrius/Downloads/cism-li4-review.png` and
`/Users/demetrius/Downloads/cism-li4-handoff-review.json`. **Founder UAT:
WAIVED** for this phase.

Approved: target-driven `StudyHandoff` resolution with
`recommendation.target` as the sole routing authority (LI-2's
`suggestedActionKind` is explicitly not navigation authority); current
production content as the sole determinant of available study
destinations; concept Review directly to exact Explore content; family
Review only when uniquely resolvable; concept/family/pattern/qualifier/
decision-type/evidence-dimension/role/lifecycle/stage targeted Practice;
existing domain Practice reuse; current-content re-resolution at the
Practice boundary; truthful eligible-question counts with no padding or
duplication; cross-cutting scopes remaining genuinely cross-cutting with
no arbitrary domain routing; safe stale-target behavior (no broken
handoff, safe historical display preserved); transient, non-persisted
targeted Practice scope with clear-target/ordinary-Practice restoration
and no sticky state on manual re-entry; full reuse of the existing
Practice engine and the normal LI-1 write path (`learningMode: "practice"`
unchanged); zero fake `LearningEvent`s from opening Review; the Insights
feedback loop refreshing on return with no manual refresh control;
Stronger Areas remaining non-actionable; the two-action Focus Next cap;
and accessibility/mobile/dark-mode behavior throughout.

**Non-blocking observations recorded** (see §12 and §35): the LI-5
broad-cross-cutting-scope usability observation (`evidence.knowledge`,
87 questions/32 concepts/4 domains — a legitimate, not defective, result)
and the pre-existing multi-concept-family/curriculum-structure observation
(family recommendations are often overlap-reduced in favor of a shared
synthesis concept). Neither authorizes any LI-4/LI-2/curriculum change at
this checkpoint.
