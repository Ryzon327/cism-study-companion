# Engineering Guardrails — CISM Study Companion

## Project status

This application is a **prototype / reference baseline** undergoing a
controlled rebuild. Do not assume the current architecture, curriculum
structure, content vocabulary, or data model should survive unchanged. The
committed, durable record of the pre-rebuild engineering state is
`docs/engineering/BASELINE.md`; known, tracked defects live in
`docs/regressions/REGISTRY.md`. Read both before making claims about what
does or doesn't work in this codebase.

The ultimate product goal does not change across any phase: help the
learner pass the ISACA CISM exam efficiently.

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

Never edit `data/*` or other production content solely to make a failing
test pass. If a test fails because production content is genuinely wrong,
fix the content and say so explicitly in the commit/PR. If a test fails
because of a known, deferred architectural defect (see
`docs/regressions/REGISTRY.md`), leave it as a `todo` test referencing the
registry entry — do not weaken the assertion, and do not silently
rename or restructure content to dodge it.

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

When implementation work reveals a product or learning-design ambiguity,
**stop and surface the decision** rather than silently choosing one. This
applies even when a "reasonable" choice seems obvious — obviousness is not
the same as authorization.

## Dead files

Do not delete files believed to be unused (e.g. legacy/orphaned data files)
without explicit user approval, even when a test flags them as dead (see
BUG-003 in the registry). Flag and register; don't remove unilaterally.

## Dependencies

This project has zero runtime/dev dependencies by design as of Phase 1. Do
not add a dependency casually. If a later phase genuinely requires one
(e.g. a browser-automation library for end-to-end testing), add it
deliberately, scoped to that specific need, and update this file to record
why.

## Branching / PR model

- `main` is the known-good branch.
- Implementation work happens on `phase/*` or `feature/*` branches, not
  directly on `main`, unless explicitly authorized for a specific change.
- Workflow: branch → CI runs automatically → review → pull request → merge
  to `main`.
- Do not merge to `main` without explicit approval, even if CI is green.
- GitHub branch protection will be added/enforced once the initial CI
  foundation is established; until then, this rule is enforced by process,
  not by the platform.

## CI

GitHub Actions runs on every `push` and `pull_request`
(`.github/workflows/ci.yml`), executing `node --test tests/`. A `todo`-flagged
test failing is expected and does not fail the run; any other failure does.
CI existing and running is not optional at any point in the rebuild — it
was established in Phase 1 and must keep running as the codebase grows.

## Working directory hygiene

Before starting implementation work in any session, verify `git status` is
clean and confirm which branch is checked out. Report both before making
changes.
