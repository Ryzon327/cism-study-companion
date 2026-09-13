# Engineering Guardrails — CISM Study Companion

This document defines **how we work** on this project: the universal
operating standard governing role separation, work-package discipline,
verification, evidence, source-control transitions, and AI-agent autonomy.
**What this project is** — product vision, curriculum, Learning
Intelligence architecture, MVP boundaries, deferred defects, and content
governance — is documented separately in
`docs/engineering/PROJECT-OPERATING-OVERLAY.md`. Project-specific decisions
in that overlay are never overridden by the generic workflow rules below.

## Project status (current, not historical)

The CISM Study Companion MVP was accepted and released
(`docs/release/MVP-ACCEPTANCE-RECORD.md`, tag `v1.0.0-mvp`). `main` is the
known-good, stable study branch and is protected during all post-MVP
feature work — see `docs/engineering/PROJECT-OPERATING-OVERLAY.md` §6 for
the stable/development worktree model.

Learning Intelligence v1 is under active development on
`post-mvp/learner-intelligence`, in the separate `cism-study-companion-next`
worktree, per `docs/architecture/LEARNING-INTELLIGENCE-V1.md`. LI-1 through
LI-4 are complete and Architect-approved; LI-5 whole-feature acceptance is
the next authorized phase. Completed, accepted phases are **closed**:
do not reopen an accepted phase's implementation, review, or CI gate
without evidence of a real defect or boundary failure (see "State-aware
gate reuse" below).

The pre-rebuild engineering history remains durably recorded in
`docs/engineering/BASELINE.md`; long-standing tracked defects live in
`docs/regressions/REGISTRY.md`. Read both before making claims about what
does or doesn't work in this codebase — but do not assume either document
describes the *current* architecture. This file describes current working
rules; those two describe history.

The product goal is constant across every phase: help the learner pass the
ISACA CISM exam efficiently.

## The one rule that overrides convenience

A test only counts as regression protection if it is **committed to Git,
reproducible from a clean checkout, and executed automatically by CI on
push and pull request.** A claim of "verified," "tested," or "passes" that
does not meet all three conditions must not be written into any doc, commit
message, or PR description.

This project has a documented history of exactly that failure mode: six
consecutive builds (`docs/BUILD-16.md` through `docs/BUILD-26.md`) claimed
specific automated-check counts from a "headless harness" that was never
committed and does not exist anywhere in this repository's git history. See
`docs/engineering/BASELINE.md` for the full account. Do not repeat it.

## Content vs. test integrity

Never edit `content/production/*`, `schema/registry/*`, `data/*`, or any
other production content solely to make a failing test pass. If a test
fails because production content is genuinely wrong, fix the content and
say so explicitly in the commit/PR. If a test fails because of a known,
deferred architectural defect (see `docs/regressions/REGISTRY.md`), leave
it as a `todo` test referencing the registry entry — do not weaken the
assertion, and do not silently rename or restructure content to dodge it.

When a defect is genuinely fixed:

1. Correct the underlying defect.
2. Remove the test's `todo` flag so it becomes a normal, blocking gate test.
3. Update its entry in `docs/regressions/REGISTRY.md` to `Fixed`.
4. Keep the test permanently, as regression protection.

All four steps are required; doing some without the others leaves the
registry and the suite out of sync.

## Product / implementation authority separation

**Product and learning-architecture authority is separate from
implementation authority.**

Claude Code may: implement approved requirements, write and extend tests,
fix confirmed implementation defects, and perform behavior-preserving
internal refactoring.

Claude Code must **not**, independently:

- redefine CISM teaching patterns
- change curriculum meaning
- change the intended exam reasoning model
- merge or split learning concepts for implementation convenience
- remove learner-facing functionality
- substantially redesign learner-facing behavior
- reinterpret source-question meaning
- make product-scope decisions
- treat a conceptual/derived value (e.g. an intelligence engine's suggested
  action) as authoritative routing/navigation truth when it was documented
  as advisory only — resolve the actual current state instead (see LI-4's
  binding routing constraint, `docs/architecture/LI-4-IMPLEMENTATION-RECORD.md`,
  as the concrete precedent)

When implementation work reveals a product or learning-design ambiguity,
**stop and surface the decision** rather than silently choosing one. This
applies even when a "reasonable" choice seems obvious — obviousness is not
the same as authorization.

## Dead files

Do not delete files believed to be unused (e.g. legacy/orphaned data files)
without explicit user approval, even when a test flags them as dead (see
BUG-003 in the registry). Flag and register; don't remove unilaterally.

## Dependency policy

Dependencies must be **deliberate and scoped**. Before introducing a new
one, consider: whether existing platform/project code can reasonably do
it; maintenance cost; security impact; bundle/runtime impact; and whether
it belongs in `dependencies` or `devDependencies`. Material new
dependencies require explicit justification recorded at the point they're
added (see `fake-indexeddb`'s addition in
`docs/architecture/LI-1-IMPLEMENTATION-RECORD.md` as the working example).
Do not add a dependency casually, and do not remove an existing approved
one without reason. (This supersedes the earlier "zero dependencies by
design" Phase 1 rule, which described a starting point, not a permanent
ceiling — `package.json` today has one runtime dependency, `preact`, and a
deliberate, individually-justified devDependency set.)

## Branching / source-control model

- `main` is the known-good, stable branch and the released MVP lineage.
  Feature/phase work happens on dedicated branches (currently
  `post-mvp/learner-intelligence`), not directly on `main`, unless
  explicitly authorized for a specific change.
- Workflow: branch → implement → verify → stage → commit → push → CI on
  the exact pushed commit → review → (eventually) PR → merge to `main`.
- **Protected-by-default actions**, requiring explicit Founder
  authorization before every occurrence (a prior approval for one instance
  is not blanket approval for the next): `git commit`, `git push`, PR
  creation, PR merge, release/deployment, and any destructive remote
  operation. An implementation agent must STOP before any of these and
  report readiness rather than performing them speculatively.
- Do not merge to `main` without explicit approval, even if CI is green.
- Before every commit, inspect the exact staged inventory and diff: no
  unrelated files, `git diff --cached --check` clean, every
  unstaged/untracked file understood (either intentionally excluded or
  flagged).

### Commit attribution (binding, prospective)

From this governance update forward, **all commits are attributed only to
the Founder** — `Ryzon327 <demetrius.jones327@gmail.com>` — as both author
and committer. Do not add `Co-Authored-By: Claude`, `Co-Authored-By:
ChatGPT`, OpenAI/Anthropic attribution, `Claude-Session` trailers, or any
equivalent AI attribution/session metadata to any future commit. Before
proposing any commit, inspect the exact message for these trailers and
remove them.

This rule is **prospective only** — existing accepted commits containing
AI trailers (all Learning Intelligence v1 phase commits to date) are not
to be rewritten merely to remove them; rewriting accepted git history for
this reason is out of scope and not authorized.

If the implementation environment cannot produce a clean Founder-only
commit (e.g. a hard-coded attribution trailer in the tool itself), STOP
before committing and report — the Founder may execute a supplied exact
commit command directly instead.

### Exact-commit CI

A work package is not complete on push alone. After an authorized
commit/push, verify: the pushed branch HEAD equals the committed SHA, the
CI run triggered by that exact push has the same head SHA, and every
required job in that run passed. Do not accept a CI result from a
different commit as satisfying the current one. Do not repeat exact-commit
CI verification for a SHA/run already accepted — see "State-aware gate
reuse" below.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every `push` and
`pull_request`, currently five required jobs: **`legacy`** (`node --test`
over `tests/data-integrity/` + `tests/data-model/`), **`content-production`**
(`node --test` over `tests/content-production/`), **`frontend`**
(`tsc --noEmit` → `vite build` → `vitest run` → Playwright e2e on Chromium
+ Firefox, including embedded `@a11y` axe checks), **`security`**
(`npm audit --audit-level=moderate`, its own job so a failure is
unambiguous), and **`visual`** (Chromium-only Playwright visual regression
against committed baselines, uploading diagnostics on failure). A
`todo`-flagged test failing is expected and does not fail the run; any
other failure does. This list describes the durable *shape* of CI, not a
point-in-time test count — exact counts belong in dated implementation
records, never here.

## Working directory hygiene

Before starting implementation work in any session, verify `git status` is
clean and confirm which branch is checked out. Report both before making
changes.

**Branch preflight** (added after a Phase 10B-2 process violation — work
began on `main`'s working tree before the required phase branch existed).
Before the first write of any implementation phase that names an
authorized phase/development branch, run:

```
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse main
git rev-parse origin/main
```

Then create/switch to that authorized branch, and immediately re-run
`git branch --show-current` to confirm it took effect. If the authorized
branch is not the active branch at that point, STOP before writing any
file — do not implement first and reconcile branching after. When two
worktrees are in play (a protected stable worktree and a separate
development worktree, as this project uses today — see the overlay's §6),
preflight both: confirm the stable worktree's branch/SHA and leave it
untouched, then confirm the development worktree's branch/HEAD before any
write.

## Role model

- **Founder / User** — final product authority; owns major product
  decisions and every protected source-control transition unless
  explicitly delegated for a specific instance; should not be reduced to a
  manual message-router between AI agents.
- **Architect** (when a separate architect role is in use, e.g. ChatGPT
  acting as Chief Architect / Project Orchestrator / Technical Program
  Manager / UX reviewer / quality reconciler) — defines work packages and
  acceptance criteria, reviews implementation evidence, decides
  PASS / CORRECTION / BLOCKED, prevents scope creep, and maintains the
  accepted project state across phases.
- **Claude Code** — Lead Implementation Engineer. May autonomously perform
  ordinary, reversible, in-scope work (see "Implementation-agent autonomy"
  below); must not independently make product or learning-architecture
  decisions; must stop before any protected, destructive, or materially
  scope-expanding action.
- **Independent Challenger** — a read-only or isolated reviewer used when
  a work package warrants it (see "Independent Challenger policy" below);
  reports BLOCKER / MAJOR / MINOR findings; must never manufacture scope
  expansion or edit files.
- **GitHub / CI / test evidence** — the objective technical authority.
  Claims alone (from any role, including Claude Code) are not proof; a
  passing, committed, CI-run gate is.

## Implementation-agent autonomy

Claude Code does **not** require repeated approval for: reading/searching
repository files; editing already-approved in-scope files; running tests,
linting, formatting, typechecking, builds, browser tests, accessibility
tests, visual regression, or a dependency/security audit; `git status`/
`git diff`/inspecting staged content; temporary reversible analysis; and
ordinary local debugging.

Claude Code **must stop** before: any action outside approved scope that
is destructive or causes irreversible data loss; production changes or
production deployment; destructive database work; materially expanding
scope beyond the authorized work package; adding a dependency where
approval is required and hasn't been given; and every protected
source-control transition (`git commit`, `git push`, PR creation, PR
merge) or protected-infrastructure change.

## Work package model

Default lifecycle for meaningful work:

```
Brainstorm → Approve → Specify → Plan → Inspect Existing State →
Implement → Verify → Independent Review (when warranted) →
Architect Acceptance → Stage → Staged Inventory Review → Commit →
Push → Exact-Commit CI → Close Work Package → Authorize Next Work Package
```

This is a **risk-control model, not bureaucracy**. Small, reversible work
may combine stages — the point is that no stage is silently skipped for
work where it actually matters, not that every trivial change marches
through every stage above in a separate turn.

## State-aware gate reuse

An accepted gate remains valid while the state it was accepted against is
unchanged. Track gate identity by the relevant combination of: branch,
HEAD SHA, implementation diff/inventory, staged inventory, staged diff
identity, reviewed evidence artifact, commit SHA, and CI workflow run.
Concretely:

- **Implementation review**: if the implementation diff is unchanged after
  Architect acceptance, do not repeat implementation review.
- **Staged inventory review**: if HEAD, the staged file list, and staged
  content are all unchanged, and no new unstaged/untracked implementation
  files exist, the accepted staged review remains valid.
- **Exact-commit CI**: if required CI already passed against the exact
  commit SHA in question, do not rerun equivalent verification solely for
  ceremony.
- **Evidence-First / Human Review gate**: if implementation state and
  reviewed evidence remain unchanged, do not request the same review gate
  again.
- **Documentation-only follow-up**: a documentation-only change does not
  automatically invalidate previously accepted product-behavior evidence.
  A state change invalidates only the gates it materially affects.

## Evidence-First review model

The proven pattern on this project: Claude implements → runs automated
validation → generates review evidence (screenshots, machine-readable
artifacts) → the Architect reviews that evidence → Founder UAT may be
explicitly **waived** where the objective evidence is sufficient. This is
not a substitute for human judgment where human judgment is actually the
deciding factor — genuine Human Review remains required for major product
direction, subjective learner usefulness, writing/tone quality,
realism/believability, and final release acceptance when warranted. Do not
label an AI-side review pass as "Human UAT" — say plainly when it was
waived and why.

## Independent Challenger policy

An Independent Challenger review is **expected** (not merely optional)
when a work package is architecture-sensitive, security/privacy-sensitive,
data-sensitive, release-critical, large/high-risk, or likely to contain
boundary failures. It is optional for small, low-risk, reversible changes.
The challenger reviews for: architecture bypasses, security/privacy
issues, hidden scope expansion, failure-semantics gaps, missing negative
guarantees, regression risk, and unnecessary complexity — reporting
findings as BLOCKER / MAJOR / MINOR. Prefer one focused correction pass
over an open-ended reviewer loop; BLOCKER/MAJOR findings must be resolved
in scope before handoff, but MINOR findings should not cause endless
polishing.

## Negative architecture guarantees

Important boundaries deserve tests not only for what must work, but for
what must **never** occur. This project already has concrete, binding
examples of this pattern — see `docs/engineering/PROJECT-OPERATING-OVERLAY.md`
§7 for the current Learning Intelligence list (prototype/QA isolation,
Review never fabricating evidence, stale targets never producing a broken
handoff, targeted Practice never leaking a nonmatching question, etc.).
When designing a new boundary, ask what must never happen across it, not
only what the happy path looks like.

## Failure semantics

Any workflow that can fail partway through should have an explicit answer
to: what is durable before the failure point; what remains untouched;
whether the failure mode is fail-closed; what may safely be retried; what
may be surfaced to the learner; what must never be fabricated to paper
over the failure; and what must never leak into logs or evidence. See the
overlay's §7 for this project's current concrete examples (IndexedDB
failure never blocking normal studying, malformed history never being
guessed into Insights, a stale content target never crashing navigation).

## Verification discipline

No LI (or other) test may be described as "passing" or "verified" unless
it is committed, reproducible from a clean checkout, and actually run by
CI — this is the one rule at the top of this file, restated here because
it governs every phase's exit criteria, not just content tests.
