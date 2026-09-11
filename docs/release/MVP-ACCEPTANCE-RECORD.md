# MVP Acceptance Record — CISM Study Companion

**Architect review:** PASS
**Founder UAT:** WAIVED — EVIDENCE-FIRST REVIEW
**MVP release:** AUTHORIZED FOR SOURCE-CONTROL RELEASE CLOSEOUT

This record is the evidence-first output of the MVP Acceptance / Release
Gate phase (whole-product validation). The Architect reviewed the
whole-product evidence artifact
(`/Users/demetrius/Downloads/cism-mvp-acceptance-review.png`), found no
release blockers, waived manual Founder UAT in favor of this Evidence-First
review, and authorized release-engineering closeout toward the identifier
`v1.0.0-mvp`. No product code was changed to reach this decision — see
§18.

**Architect final disposition, recorded verbatim for this closeout:**

- No release blockers found.
- Whole-product Evidence-First review passed.
- BUG-001 / BUG-002 / BUG-003 — accepted deferred (legacy-prototype-scoped;
  see §8).
- CANDIDATE content status intentionally left unchanged — no bulk
  promotion to CANONICAL (see §9).
- Session-only / no-persistence behavior — accepted as an intentional MVP
  boundary (see §14).
- Confidence UI-only behavior — accepted as an intentional MVP boundary
  (see §14).
- README.md stale CANONICAL terminology — deferred, post-MVP
  documentation cleanup, not release blocking (see §9, §11).
- Production bundle chunk-size advisory — deferred, post-MVP
  optimization, not release blocking (see §11).
- Proposed release identifier: `v1.0.0-mvp`.

---

## 1. Baseline

- **Baseline commit (main / origin/main at phase start):** `4214154bac4770917a7624284be098013391da16`
- **Phase branch:** `phase/mvp-acceptance-release`
- **Curriculum construction status at baseline:** Foundation, Domain 1,
  Domain 2, Domain 3, Domain 4 — all COMPLETE and merged. No curriculum
  authoring occurred during this phase.

## 2. Scope of this phase

This was **not** a feature-development phase. No curriculum, learning
modes, persistence, accounts, analytics, adaptive learning, exam
simulation, deployment, gamification, or cosmetic redesign work was
performed or is proposed here. This phase only: inventoried the product,
exercised the real learner journeys against the live production content
path, ran the full committed validation stack, performed a small
representative content-quality spot check, and classified known defects.
No release-blocking defect was found, so no product code was modified.

## 3. Product inventory (current main-based tree)

Derived directly from `content/production/{concepts,families,lessons,questions}.json`.

| Entity | Foundation | D1 | D2 | D3 | D4 | Total |
|---|---|---|---|---|---|---|
| Concepts | 1 | 10 | 10 | 10 | 10 | **41** |
| Families | 1 | 10 | 10 | 10 | 10 | **41** |
| Lessons | 1 | 9 | 10 | 10 | 10 | **40** |
| Questions | 3 | 34 | 30 | 30 | 30 | **127** |

**Grand total: 249 production content entities.** All 249 are `active:
true` (0 inactive). All 249 are `content_status: "CANDIDATE"`,
`verification_status: "unverified"` — 0 are CANONICAL.

D1 shows 9 lessons against 10 concepts by design, not omission:
`concept.d1.policy-artifact-hierarchy` is taught inside
`lesson.d1.governance-effectiveness` rather than a same-named dedicated
lesson — a pre-existing Phase 7C architecture decision, confirmed
non-defective.

### Registry / schema (structural framework, distinct from production content)

| Registry | Count | Status |
|---|---|---|
| Patterns | 15 | 15 CANONICAL |
| Lifecycles | 2 | 2 CANONICAL |
| Lifecycle stages | 14 | 14 CANONICAL |
| Roles | 12 | 12 CANONICAL |
| Repair targets | 10 | 10 CANONICAL |
| Qualifiers | 8 | 5 CANONICAL, 3 PROTOTYPE_REFERENCE |
| Decision types | 5 | 5 CANONICAL |
| Domains | 5 | 5 CANONICAL |
| Sources | 9 | n/a (reference list) |

The taxonomy/registry layer (patterns, lifecycles, roles, etc.) is
CANONICAL. The production content instances built on top of it
(concepts/families/lessons/questions) are CANDIDATE. These are two
different status axes and should not be conflated.

## 4. Acceptance criteria — categories A–L

| Category | Result |
|---|---|
| A. Product entry/navigation | PASS — Home, Daily Study, Explore, Practice are the four real nav destinations, distinct from the dev-only QA prototype switcher |
| B. Complete curriculum availability | PASS — all 41 concepts across 5 domains reachable via Explore; matches inventory above |
| C. Daily Study | PASS — Recall → Learn → Apply → Feedback → Repair → Completion verified live |
| D. Explore | PASS — domain → concept-list → concept-detail navigation verified for D1/D2/D3 representative concepts, plus full domain discovery list |
| E. Practice | PASS — scope/count selection, bounded session, active question, missed-concept summary/handoff verified live |
| F. Reinforcement | PASS — reachable from Daily Study Completion, in-session state renders correctly |
| G. Feedback/Repair | PASS — shared `QuestionAttemptFlow` pipeline confirmed correct/incorrect/repair paths |
| H. Session-only behavior | PASS — `production-daily-study.spec.ts` and `daily-study-session.spec.ts` assert no localStorage read/write during a full session; confidence UI (`ConfidenceControl`) is in-memory component state only, never persisted |
| I. Mobile/responsive UX | PASS — 390×844 viewport verified for a long scenario Apply screen and Feedback/navigation |
| J. Accessibility | PASS — axe-based `@a11y` checks embedded in the e2e suite (light + dark theme) all pass; 0 automatically-detectable violations |
| K. Production build/security | PASS — `tsc --noEmit`, `vite build`, and `npm audit --audit-level=moderate` all clean |
| L. Regression protection | PASS — full committed suite (legacy, content-production, frontend, e2e, visual) green; see §6 |

## 5. Whole-product journey testing (A–F)

All six journeys were exercised live against the dev server on the
production (candidate) content path, not the legacy prototype fixture
path:

- **A. New learner / Daily Study** — full Recall → Learn → Apply →
  incorrect-answer → Feedback → Repair → Completion loop, using
  D1-U2 "Authority Follows Accountability."
- **B. Explore** — complete 5-domain discovery list, then representative
  concept-detail dives into Domain 1 (Governance), Domain 2 (Risk
  Management), and Domain 3 (Security Program).
- **C. Practice** — scope selection ("All available material"/domain
  radios, question-count radios), a bounded 5-question Governance
  session, active-question rendering, and the summary screen with the
  missed-concept "Review → Explore" handoff (5/5 needed repair in this
  run, correctly listing 5 distinct missed concepts with working
  per-concept Explore links).
- **D. Reinforcement** — reached from Daily Study's Completion screen,
  contextual "Quick reinforcement · Question 1 of 3" state confirmed; no
  fabricated historical-weakness language observed.
- **E. Cross-domain completeness** — representative material captured
  across Foundation-adjacent D1, D2, D3, plus both of Domain 4's final
  units (D4-U9 Post-Incident Review, D4-U10 Incident Management
  Synthesis / Capstone) rendering correctly from the approved,
  already-merged Domain 4 curriculum.
- **F. Mobile** — a long incident-response scenario (D4-U6 Evidence
  Handling / Investigation) on a 390×844 viewport, through Apply →
  answer selection → confidence → Feedback, with in-session navigation
  intact.

## 6. Domain 4 final-unit visual coverage

D4-U9 and D4-U10 were captured as part of this whole-product evidence set
(panels 11–12 of the contact sheet below) without reopening or re-authoring
the approved Domain 4 curriculum. Both render correctly from the live
production content path.

## 7. Content quality spot audit

A small representative sample — 27 questions spread across all 5 domains,
plus a full structural check of all 40 lessons' prerequisite links — found
**zero** malformed options, missing correct answers, answer-leakage,
broken family links, invalid prerequisites, lifecycle mismatches, dead
source references, or rendering failures. This is a spot check, not a
full re-review, and is reported as such. No evidence of a systemic content
or pipeline defect was found; nothing here rose to the level of
investigation-worthy.

## 8. BUG-001 / BUG-002 / BUG-003 disposition

All three registry entries were re-inspected against their exact current
`docs/regressions/REGISTRY.md` descriptions and affected-files lists.

| Bug | Disposition | Reasoning |
|---|---|---|
| BUG-001 (concept-identity collision: "Policy hierarchy" spans D1/D3) | **ACCEPTED DEFERRED DEFECT** | Scoped entirely to `data/active-learning.js`, `js/daily-study.js`, `js/app.js`, `js/storage.js` — the legacy prototype path. Not reachable through the production content pipeline (`content/production/*.json` + `app/src/content/*`) that Daily Study/Explore/Practice actually use. |
| BUG-002 (exam-bank/Mixed Practice concepts unresolvable to a domain) | **ACCEPTED DEFERRED DEFECT** | Same root cause and same legacy-only scope as BUG-001 (`data/exam-bank.js`, `data/pattern-bank.js`, `data/mixed-practice.js`). No MVP learner journey routes through this code. |
| BUG-003 (dead/unreferenced legacy data files) | **ACCEPTED DEFERRED DEFECT** | Hygiene-only, explicitly not to be deleted without separate approval per the registry's own resolution plan and `CLAUDE.md`'s dead-files rule. No learner-facing impact. |

None of the three are release blockers for the MVP as scoped. All three
remain correctly tracked as `todo` gate tests (verified still present and
still non-blocking in the current test run — see §9).

## 9. CANDIDATE / CANONICAL status disposition

All 249 production content entities are `CANDIDATE`. Per this phase's
explicit instruction, status was **not** bulk-promoted. No binding rule
found during this review requires promotion for MVP release — status is
left unchanged.

One documentation tension is flagged for Architect awareness only (not
a blocker): `docs/learning/README.md`'s "Content status terminology"
section (Phase 2 era) states only CANONICAL content may drive learner
assessment/curriculum behavior, while every currently-live production
question is CANDIDATE and does drive the actual MVP experience today.
This is resolved in practice by the later, more specific, actively
CI-enforced "Phase 6B rule" — every content-production test batch
enforces: *"no production concept/lesson/question is CANONICAL yet —
promotion is a separate, explicit later decision."* This is the current,
superseding, deliberately-chosen governance practice, consistent with
this phase's own instruction not to promote. Recommend the Architect
consider updating the Phase 2-era README language for clarity in a future
documentation pass — not release-blocking.

## 10. Automated validation matrix (actual counts, this run)

Local commands mirror `.github/workflows/ci.yml`'s 5 required jobs
exactly (Node 20 in CI; run locally on Node v26.5.1 — see note below).

| Suite | Result |
|---|---|
| `legacy` (data-integrity + data-model) | **114 tests · 111 pass · 0 fail · 3 todo** (BUG-001/002/003, expected) |
| `content-production` | **477 tests · 477 pass · 0 fail** |
| TypeScript (`tsc --noEmit`) | **PASS** |
| Production build (`vite build`) | **PASS** (one non-blocking chunk-size advisory, see §11) |
| Frontend unit (`vitest run`) | **18 files · 200 tests · 200 pass** |
| E2E — Chromium + Firefox (`playwright test`, includes embedded `@a11y` axe checks) | **86 passed** |
| Visual regression (`playwright.visual.config.ts`, Chromium, desktop+mobile × light+dark) | **32 passed** |
| `npm audit --audit-level=moderate` | **0 vulnerabilities** |

Selection-engine and answer-order behavior are exercised inside the
content-production and frontend/e2e suites above (e.g.
`production-daily-study.spec.ts`'s three-consecutive-session Apply
variant-rotation assertion) — no separate suite exists or is needed.

**Local tooling note:** this machine's Node v26.5.1 fails to discover
test files when `node --test` is given a bare directory path (e.g.
`node --test tests/data-integrity/ tests/data-model/`, CI's literal
command) — it reports the directory itself as one failing test. Explicit
glob patterns (`node --test 'tests/data-integrity/**/*.test.mjs'`) were
used locally to work around this and produced the counts above. This is
a known, local-only Node-version quirk, not a CI or product defect — CI
runs Node 20 with the exact bare-directory command and has passed on
every merge this session.

## 11. Non-blocking observations (not release blockers)

- **Bundle chunk-size advisory:** `vite build` emits `dist/assets/index-*.js`
  at 1,054.39 kB (239.98 kB gzip) with Vite's standard >500 kB
  chunk-size warning. This is a warning, not a build failure, and
  code-splitting is a refactor outside this phase's authorized scope.
  Classified **POLISH-DEFERRED**.
- **README.md CANONICAL-language tension** — see §9. Classified
  **IMPORTANT POST-MVP** (documentation clarity only).

## 12. Release-blocker findings

**None found.** No product code was modified during this phase.

## 13. Security / build / accessibility / browser / mobile status

- Security: `npm audit --audit-level=moderate` → 0 vulnerabilities.
- Build: TypeScript + Vite production build clean.
- Accessibility: axe-based automated checks (light + dark theme, multiple
  screens including Recall/Repair/Explore/Practice) → 0 violations.
- Browsers: Chromium and Firefox both fully green across the e2e suite.
- Mobile: 390×844 viewport verified functional for a full long-scenario
  Apply → Feedback flow; visual regression suite separately covers
  mobile light/dark for 8 gate screens.

## 14. No-persistence and confidence-UI boundaries

Confirmed by dedicated, passing assertions in
`production-daily-study.spec.ts` and `daily-study-session.spec.ts`: no
`localStorage` is read or written at any point during a full production
session. The `ConfidenceControl` (Sure/Not sure/Guessing) is in-memory
component state only, consumed once per question and never persisted or
aggregated into any fabricated "history."

## 15. Evidence artifact

- Raw screenshots (local only, not committed): `.tmp-mvp-acceptance-screens/`
  (18 panels)
- Composed whole-product contact sheet (local only, not committed):
  `/Users/demetrius/Downloads/cism-mvp-acceptance-review.png`

## 16. Release notes

No existing release-notes convention was found in this repository (`docs/`
contains historical `BUILD-N.md` engineering logs, not product release
notes). Per this phase's instruction, no `docs/release/MVP-RELEASE-NOTES.md`
was created — this acceptance record is sufficient.

## 17. Release tag

Not created. No git tag or GitHub Release was made during this phase, per
explicit instruction. `v1.0.0-mvp` remains a proposed, not-yet-created,
future identifier.

## 18. Final MVP recommendation

**READY FOR ARCHITECT MVP RELEASE REVIEW.**

No release-blocking defects were identified. All acceptance criteria
(A–L) pass. All six whole-product journeys were verified live against the
real production content path. The complete committed, CI-mirrored
validation stack is green. Known deferred defects (BUG-001/002/003) are
confirmed scoped to a legacy code path outside the MVP product surface.
No CANDIDATE→CANONICAL promotion was performed, consistent with
instruction. Source control remains uncommitted, as required.
