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

- MVP released (`docs/release/MVP-ACCEPTANCE-RECORD.md`, tag
  `v1.0.0-mvp`): Foundation + Domains 1–4 curriculum, Daily Study, Explore,
  Practice, optional Reinforcement, and a shared Feedback/Repair pipeline.
- Learning Intelligence v1, developed on `post-mvp/learner-intelligence`:
  - **LI-1** — local-first, immutable Learning History (IndexedDB).
  - **LI-2** — deterministic Insight engine (named states, reason codes,
    trend, ranked recommendations — no opaque score).
  - **LI-3** — the Insights learner experience (Focus Next, trend,
    Stronger Areas, Study Data export/reset).
  - **LI-4** — targeted study handoffs (Review → exact Explore content;
    targeted Practice scoped to a concept/family/pattern/qualifier/
    decision-type/evidence-dimension/role/lifecycle/stage; existing-domain
    Practice reuse).
  - **LI-5** — whole-feature acceptance — **pending, next authorized
    phase**.
- All of LI-1 through LI-4 are complete, Architect-approved, and committed
  on the development branch — **not yet merged to `main`** (see §11).

## 6. Stable vs. development model

| | Stable study version | Development version |
|---|---|---|
| Worktree | `/Users/demetrius/Projects/cism-study-companion` | `/Users/demetrius/Projects/cism-study-companion-next` |
| Branch | `main` | `post-mvp/learner-intelligence` |

`main` remains the stable, protected study version — the one the Founder
studies from day to day — until the complete Learning Intelligence package
is accepted at LI-5 and an explicit, separate release/merge decision is
made. This model may be revisited once LI-5 changes the release state; any
such change is itself a governance decision, not an incidental side effect
of a later phase.

## 7. Learning Intelligence invariants

Binding rules the engine and its surfaces must never violate, carried
forward from `docs/architecture/LEARNING-INTELLIGENCE-V1.md` and the
LI-1..4 implementation records:

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
  legacy-prototype-scoped, accepted-deferred at MVP acceptance; unaffected
  by, and unrelated to, Learning Intelligence work.
- **LI-5 broad-cross-cutting-scope usability observation**
  (`docs/architecture/LI-4-IMPLEMENTATION-RECORD.md` §12/§35,
  Architect-confirmed non-blocking at LI-4 review): some legitimate
  cross-cutting Practice scopes are broad (e.g. `evidence.knowledge`
  currently resolves to 87 production questions across 32 concepts and 4
  domains). Every returned question is a legitimate current match — this
  is not an LI-4 routing defect. LI-5 should evaluate whether a scope this
  broad still reads as a useful "targeted" learner experience.
- **Family/synthesis overlap-reduction observation**
  (`docs/architecture/LI-4-IMPLEMENTATION-RECORD.md` §35,
  Architect-confirmed non-blocking): the real multi-concept synthesis
  families (`family.d2.risk-management-synthesis` and its Domain 3/4
  counterparts) each share one synthesis concept across every member
  question, so LI-2's overlap reduction will typically surface that
  concept's own recommendation rather than the family's. The
  family-only-Practice resolver behavior itself is correct and directly
  tested; this is a curriculum-authoring-shape observation, not a defect.
- **Focus Next density observation**
  (`docs/architecture/LI-3-IMPLEMENTATION-RECORD.md` §5, Architect-approved
  as-is at LI-3 review): Focus Next cards intentionally carry enough
  evidence/explanation to answer "why am I seeing this" — approved for
  this checkpoint. Revisit only after real learner history accumulates,
  as a future observational check, not a defect to fix now.

Do not convert any of the above into a defect and act on it unilaterally —
each requires its own evidence and Architect/Founder decision before any
code change.

## 11. Release / merge boundary

Learning Intelligence v1 is **not** merged to `main` until LI-5
whole-feature acceptance explicitly authorizes it, and merging itself is a
separate, later, explicitly Founder/Architect-approved decision — never an
automatic consequence of LI-5 passing.

## 12. Current workflow state (point-in-time — update at the next phase boundary)

- **Stable `main`:** `aada8c8dcd309b5cc21084844d7eb6f88e3eff7d` (`v1.0.0-mvp`).
- **Development `post-mvp/learner-intelligence`:** `951003ab5a8f1b7feb5b8afe64fb23fe82fbf98a`.
- **LI-4 exact-commit CI:** run `34769389590` — PASS (all 5 required jobs green).
- **LI-4 status:** CLOSED — see §13 below.
- **Next authorized phase:** LI-5 whole-feature acceptance.

This section is a checkpoint record, not a live-updating status — it will
go stale the moment a new commit lands, and should be refreshed at the
next accepted phase boundary rather than trusted blindly after that point.

## 13. State-aware adoption: LI-4 is CLOSED

LI-4's implementation, Evidence-First review, staged inventory, tests, and
CI are all accepted against the exact commit and CI run recorded in §12.
Per `CLAUDE.md`'s state-aware gate reuse rule, do not repeat LI-4
implementation review, Evidence-First review, staging review, targeted
tests, or CI solely for ceremony — only if LI-4's implementation state
actually changes (a new commit touching its files) does any of that gate
set need to be revisited, and then only for what actually changed.

LI-5 is the next authorized product phase, to begin only after this
governance package itself closes.
