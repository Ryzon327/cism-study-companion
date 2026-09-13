# CISM Study Companion — Project Operating Overlay

## 1. Purpose

This document is the CISM-specific project truth layered on top of the
universal operating workflow defined in `CLAUDE.md`. `CLAUDE.md` governs
*how we work* (role separation, work-package discipline, verification,
evidence, source-control transitions, agent autonomy); this overlay
governs *what this project is* (product vision, curriculum, learner
experience, Learning Intelligence architecture, MVP boundaries, deferred
defects, content governance, UI direction, deferred/NOT-NOW items, release
sequencing). Where the two appear to conflict, this overlay is
authoritative for product/curriculum/architecture matters, and `CLAUDE.md`
is authoritative for process/workflow matters — the generic workflow layer
never overrides a project-specific decision recorded here.

## 2. Product mission

Help the learner pass the ISACA CISM exam efficiently, using concise,
high-quality reasoning instruction and varied scenario practice.

## 3. Product principles

- **Reference for comprehension** — Explore gives a concise, concept-level
  review a learner can return to on demand.
- **Varied scenarios for transfer** — question families provide multiple
  surface variations of the same underlying reasoning, not rote repetition
  of one phrasing.
- **Domain synthesis for integration** — capstone/synthesis material ties
  a domain's concepts together rather than leaving them as isolated facts.
- **Role + verb + context + what already happened + qualifier** — the
  authored reasoning shape behind CISM-style scenario questions; patterns,
  qualifiers, roles, and decision types are real curriculum vocabulary
  (`schema/registry/`), not incidental metadata.
- **Governance/business perspective** — CISM reasoning is evaluated from a
  governance and business-risk standpoint, not a purely technical one.
- **Deterministic validator owns truth** — content correctness and
  learner-evidence classification are governed by explicit, inspectable
  rules (schema validation; the LI-2 insight engine), never an opaque
  score or model output.
- **AI, if added later, must explain rather than replace truth** unless a
  future phase explicitly redesigns this boundary with Architect/Founder
  authorization — no phase to date has done so.

## 4. UX principles

Calm, modern, non-gamified. Light and dark theme parity. Mobile-friendly
down to 390px. No streak pressure, no giant analytics dashboards, no
fabricated precision (no percentages presented as mastery). Guidance is
useful and concise — named states and short evidence lines, not numeric
scores or charts.

## 5. Current product boundary

**Stable release: v1.1.0 — Learning Intelligence** (tag `v1.1.0`,
`docs/release/LEARNING-INTELLIGENCE-V1-ACCEPTANCE-RECORD.md`). The stable
current product includes:

- Foundation + Domains 1–4 curriculum, Daily Study, Explore, Practice,
  optional Reinforcement, and a shared Feedback/Repair pipeline (original
  MVP, tag `v1.0.0-mvp`, `docs/release/MVP-ACCEPTANCE-RECORD.md`).
- Local, persistent Learning History (IndexedDB).
- Deterministic, explainable Learning Intelligence (named states, reason
  codes, trend, ranked recommendations — no opaque score).
- Insights / Focus Next, presented to the learner.
- Targeted Review/Practice handoffs (concept/family/pattern/qualifier/
  decision-type/evidence-dimension/role/lifecycle/stage, plus
  existing-domain Practice reuse).
- Study Data export/reset.
- Production-first application behavior (QA/prototype fixtures explicitly
  opt-in only).

Phase status:

- **LI-1** — CLOSED.
- **LI-2** — CLOSED.
- **LI-3** — CLOSED.
- **LI-4** — CLOSED.
- **LI-5** — CLOSED.

All five are complete, Architect-approved, merged to `main` via PR #38,
and released as v1.1.0 (see §11/§12/§13 below). **No LI-1 through LI-5
gate — implementation review, Evidence-First review, staged-inventory
review, targeted tests, or CI — should be repeated merely because a future
phase begins;** see §13.

## 6. Stable vs. development model

| | Stable study version | Development worktree |
|---|---|---|
| Worktree | `/Users/demetrius/Projects/cism-study-companion` | `/Users/demetrius/Projects/cism-study-companion-next` |
| Branch | `main` | *(no active feature branch — see below)* |
| Current release | `v1.1.0` | — |
| Current SHA | `efdfa7b3153b00d43a38c612e1d34d85e281337a` | — |

`main` remains the stable, protected study version the Founder studies
from day to day. **There is currently no active product-feature branch.**
`post-mvp/learner-intelligence` (final head
`4fbf24d27301ae4cc2599c52c91cebb7263126a6`) is a **completed, merged,
historical** feature branch — it delivered Learning Intelligence v1 and is
preserved as history, not as an active working branch; deleting it is a
separate, later, explicitly authorized decision, not implied by this
refresh. `cism-study-companion-next` itself remains a reusable development
worktree for future work. **Each future meaningful work package must use
its own dedicated branch created from the current accepted base** (verify
`origin/main`'s SHA before branching) — an old merged feature branch must
never silently become the base for unrelated future work.

## 7. Learning Intelligence invariants

Now that Learning Intelligence v1 is released in v1.1.0, these are **stable
product guarantees**, not merely development-phase rules — releasing the
feature does not loosen them. Binding rules the engine and its surfaces
must never violate, carried forward from
`docs/architecture/LEARNING-INTELLIGENCE-V1.md` and the LI-1..4
implementation records:

- `LearningEvent` history is immutable and append-only, stored in
  IndexedDB, local to the device/browser.
- Only `sourceContext: "production"` evidence ever reaches learner
  Insights — prototype/QA attempts are excluded at the eligibility
  boundary and must never influence a classification, trend, or
  recommendation.
- LI-2's classifications (`NOT_ENOUGH_EVIDENCE` / `NEEDS_REVIEW` /
  `DEVELOPING` / `STRONGER_EVIDENCE`) are deterministic and reproducible —
  no opaque weakness score is ever exposed to the learner.
- A Repair attempt never erases or overwrites the primary miss it followed
  — both remain, immutably, as separate events. A successful Repair is
  recovery evidence, not proof the original miss never happened.
- Recall is secondary evidence; Apply is primary. Recall alone never
  drives a NEEDS_REVIEW classification.
- Focus Next shows at most 3 recommendations at once.
- For LI-4, **current production content is the routing authority** — a
  recommendation's own conceptual `suggestedActionKind` is never treated
  as navigation truth on its own; the actual destination is resolved
  against current content every time.
- A stale or unresolvable recommendation target yields **no broken
  handoff** — the evidence/explanation stays visible; the action is simply
  omitted, never rendered disabled or broken.
- Insights refreshes from current evidence on every screen visit — no
  stale cache, no manual "refresh" control exists or is needed.

## 8. Content governance

- All current production content (`content/production/*.json`) remains
  `content_status: "CANDIDATE"` / `verification_status: "unverified"`
  unless a separate, explicit governance decision promotes it — no
  Learning Intelligence phase has promoted, or is authorized to promote,
  content status.
- Implementation acceptance (an LI phase passing Architect review) does
  **not** equal content canonicalization. These are independent axes.
- Curriculum meaning — what a concept, pattern, qualifier, or scenario
  actually teaches — remains outside Claude Code's unilateral authority,
  per `CLAUDE.md`'s authority-separation rule.

## 9. Deferred / NOT NOW

Explicitly out of scope until a future phase separately authorizes it:
accounts, backend/cloud sync, Learning History import, an AI Study Coach,
adaptive recommendation sequencing, gamification (streaks/badges/XP),
a notification system, a persistent derived-insight cache, and
recommendation dismissal/completion state.

## 10. Known accepted deferred items

- **BUG-001 / BUG-002 / BUG-003** (`docs/regressions/REGISTRY.md`) —
  still accepted deferred; legacy-prototype-scoped, unaffected by, and
  unrelated to, Learning Intelligence.
- **Broad cross-cutting-scope observation** (`evidence.knowledge`, ~87
  production questions across ~32 concepts and 4 domains). **Final LI-5
  disposition: PASS — broad but truthful/useful.** Every returned question
  is a legitimate current match; the learner sees the real label and real
  count, never a narrower-than-reality impression. Recorded as a future
  UX-refinement consideration only, not a defect
  (`docs/release/LEARNING-INTELLIGENCE-V1-ACCEPTANCE-RECORD.md`).
- **Family/synthesis overlap-reduction observation.** **Final LI-5
  disposition: non-blocking curriculum-structure observation.** The real
  multi-concept synthesis families (`family.d2.risk-management-synthesis`
  and its Domain 3/4 counterparts) each share one synthesis concept across
  every member question, so LI-2's overlap reduction typically surfaces
  that concept's own recommendation rather than the family's. The
  family-only-Practice resolver behavior itself is correct and directly
  tested — this is a curriculum-authoring-shape observation, not a defect.
- **Focus Next density observation.** **Final LI-5 disposition: MINOR,
  accepted and deferred** (the Independent Challenger's classification,
  accepted over this session's own initial PASS read at LI-5 review).
  Revisit only with evidence from real learner usage, or via a
  specifically authorized future UX package — not automatically.

None of the above is pending further LI-5 evaluation — these are final
dispositions. Do not convert any of them into an active defect and act on
it unilaterally — each requires its own new evidence and an
Architect/Founder decision before any code change.

## 11. Release / merge boundary

**Historical result (this boundary has been exercised once, successfully):**
Learning Intelligence v1 passed LI-5 whole-feature acceptance, was merged
to `main` via PR #38 (merge commit
`efdfa7b3153b00d43a38c612e1d34d85e281337a`), and was published as release
`v1.1.0`. Post-merge CI on the exact merge commit (run `34779120088`)
passed all required jobs. See §12/§13 below and
`docs/release/LEARNING-INTELLIGENCE-V1-ACCEPTANCE-RECORD.md` for full
detail.

**Durable future rule (unchanged by this release):** any future major
feature package still requires, in order: accepted implementation →
whole-feature acceptance → explicit PR authorization → exact-PR review/CI
→ explicit merge authorization → post-merge exact-`main` verification →
a separate release/tag authorization when applicable. Merging is never an
automatic consequence of acceptance passing, and release/tag publication
is never an automatic consequence of merging — each is its own protected,
explicitly Founder-authorized step.

## 12. Current workflow state (point-in-time — update at the next phase boundary)

- **Stable `main`:** `efdfa7b3153b00d43a38c612e1d34d85e281337a`.
- **Stable tag:** `v1.1.0`.
- **Release:** "CISM Study Companion v1.1.0 — Learning Intelligence" (published, not draft, not prerelease).
- **Merged PR:** #38 ("release: Learning Intelligence v1").
- **Post-merge CI:** run `34779120088` — PASS (all 5 required jobs green, exact merge-commit SHA).
- **Learning Intelligence v1 status:** CLOSED — see §13 below.
- **Active feature branch:** NONE.
- **Historical merged LI branch:** `post-mvp/learner-intelligence`, final head `4fbf24d27301ae4cc2599c52c91cebb7263126a6` — preserved, not active.
- **Next planned product capability:** Exam Readiness v1 — **NOT YET AUTHORIZED FOR IMPLEMENTATION.** No design or implementation work may begin on it without its own approved work package.

This section is a checkpoint record, not a live-updating status — it will
go stale the moment a new commit lands, and should be refreshed at the
next accepted phase boundary rather than trusted blindly after that point.

## 13. State-aware adoption: LEARNING INTELLIGENCE v1 IS CLOSED

LI-1 through LI-5 — implementation, Evidence-First/whole-feature
acceptance review, Independent Challenger review, staged inventory, tests,
push CI, PR review/CI, merge, and post-merge CI — are all accepted
completed state against the exact commits and CI runs recorded in §12 and
in `docs/release/LEARNING-INTELLIGENCE-V1-ACCEPTANCE-RECORD.md`. Per
`CLAUDE.md`'s state-aware gate reuse rule, **do not repeat any of those
gates merely because a future phase begins.** Reopen a specific gate only
if: a real regression or defect is discovered in the affected behavior; a
shared architecture change materially affects it; a security, privacy, or
data-integrity issue is found; or an explicitly authorized future package
intentionally and knowingly revisits that exact boundary.

No product phase is currently authorized. Exam Readiness v1 (or any other
future capability) begins only once it receives its own approved work
package, following the same discipline every prior LI phase went through.
