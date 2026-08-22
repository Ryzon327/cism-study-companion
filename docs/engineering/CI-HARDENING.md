# CI Hardening — Phase 8A

Record of the two CI gaps deferred since Phase 7B-2/7B-3 (see the
Phase 7B-3 and Phase 7C gate records' "CI-hardening follow-up" notes) and
how each was closed — including a real environmental gap discovered and
resolved during the visual-regression work, not glossed over.

## 1. npm audit — closed, blocking

Added as a new `security` job in `.github/workflows/ci.yml`, running
`npm ci` (against the committed lockfile) then `npm audit --audit-level=moderate`.

**Severity threshold rationale.** As of this phase, `npm audit` reports
`0` vulnerabilities at every severity level, across `278` total resolved
packages (2 production — `preact` and one transitive dep — 277 dev, 47
optional/platform). `moderate` was chosen, not `low` or `high`, because:

- The project's own engineering guardrails (`CLAUDE.md`) already treat
  dependencies cautiously ("zero runtime/dev dependencies by design...
  do not add a dependency casually") — this argues against the laxer
  `high` threshold, under which a real `moderate` advisory in a direct
  dependency (including `preact`, the one dependency actually shipped to
  learners) would be silently ignored by CI.
- `low` is too strict for a gate meant to stay "durable" and trustworthy:
  `low`/`info`-level advisories are common in large dev-only tool trees
  (277 of 278 resolved packages here are dev/optional, never shipped to
  the built artifact) and are frequently already unfixable upstream or
  irrelevant to how this app actually uses the package. A gate that flaps
  on that noise trains everyone to ignore it, defeating the point.
- `moderate` is npm's own common middle ground and fails the build on
  every advisory that is actually `moderate` or worse, anywhere in the
  full tree (prod, dev, and optional — not scoped with `--omit=dev`,
  since a compromised build/typecheck/test tool is still a real
  supply-chain risk to what eventually ships, even though it never runs
  in the shipped bundle itself).

No dependency was added, removed, or version-pinned differently to reach
this result — the threshold was chosen against the tree as it already
stood.

## 2. Visual regression — closed, blocking

The existing `playwright.visual.config.ts` suite (32 screenshots: 8
screens × 2 viewports × 2 themes, Chromium only) was added as a new
`visual` job in CI, reusing the exact same config, script
(`npm run test:visual`), and existing test specifications — no new
visual-testing system was introduced.

### The platform-baseline gap that had to be closed first

Every one of the 32 originally-committed baseline PNGs under
`tests/frontend/visual/gate-screens.visual.spec.ts-snapshots/` was named
with a `-darwin` suffix (e.g.
`home--desktop--light-chromium-visual-darwin.png`) — Playwright's default,
platform-aware snapshot naming, produced because every baseline had been
captured on a macOS development machine. `.github/workflows/ci.yml` runs
every job, including `visual`, on `ubuntu-latest`, where Playwright
resolves the same test names to `*-linux.png` files — which did not yet
exist. Pushed as originally implemented, the `visual` job would have
failed immediately with "no baseline snapshot found" for all 32
screenshots: a structural platform mismatch, not a rendering regression.

### First migration attempt: local Docker (Option A) — insufficient, disproven

A Linux-specific baseline set was first generated locally using the exact
official Playwright Docker image matching this repository's resolved
`@playwright/test` version (**1.62.1**, confirmed identical across
`package.json`, `package-lock.json`, the installed CLI, and the container
itself): **`mcr.microsoft.com/playwright:v1.62.1-noble`**. `npm ci` was run
inside the container (Linux-native dependency builds, isolated from the
host's own `node_modules`), and `--update-snapshots` generated 32
`*-linux.png` files.

**This attempt was pushed to CI and failed.** All 32 comparisons showed
small, consistent, deterministic pixel differences (ratios of 0.01–0.02 —
22 to ~8,693 pixels per screen) against the genuine GitHub Actions
`ubuntu-latest` runner. Root cause: this development machine is Apple
Silicon (arm64); the unqualified Docker image resolved to `linux/arm64`,
not the `linux/amd64` GitHub Actions actually runs on.

**A second local attempt forced `--platform=linux/amd64`** via Docker's
QEMU-based emulation. `uname -m` inside that container correctly reported
`x86_64`, confirming the flag worked at the OS level. However, comparing
this emulated-amd64 output against both (a) the original arm64-generated
baselines and (b) a fresh un-forced arm64 run showed **no meaningful
difference** — QEMU emulation on this hardware renders visually
equivalent to native arm64, not equivalent to genuine amd64 silicon.
**This local emulation was never authoritative and was not used as a
baseline source** — it was disproven by direct comparison before ever
being pushed, specifically to avoid presenting an unverified fix as a
correction.

### Actual migration performed: genuine GitHub Actions AMD64 output

The authoritative Linux baselines were sourced directly from the **real,
already-failed GitHub Actions `visual` job run** (run `32541299608`,
head SHA `0c3b975...`, confirmed to match the pushed commit exactly) —
not from any local approximation of that environment:

1. The job's `visual-regression-diagnostics` artifact (uploaded by the
   existing `if: failure()` step) was downloaded and inspected outside the
   repository. It contained exactly 32 `test-results/` subdirectories,
   each with one `-actual.png` (the genuine GitHub-rendered screenshot),
   one `-expected.png` (the arm64-derived baseline that had just failed),
   and one `-diff.png`.
2. A deterministic mapping was built from each `-actual.png`'s own
   filename (`{screen}--{viewport}--{theme}-actual.png`) to its
   corresponding committed `*-linux.png` baseline path — never by list
   position. Result: 32 actual screenshots, 32 baseline targets, 32
   one-to-one mappings, 0 missing, 0 duplicates. Image dimensions were
   confirmed to match between each actual/expected pair before proceeding.
3. Only those 32 `*-linux.png` files were overwritten, in place, with the
   genuine GitHub-rendered actuals. **Integrity check, verified via `git
   status`/`git diff`, not assumed:** exactly 32 files modified (all `M`,
   no additions/deletions/renames); the 32 `*-darwin.png` files show zero
   modifications; no application, curriculum, test, or threshold file
   changed.
4. The magnitude of the corrections (22 to ~8,693 pixels, 0.01–0.02 ratio,
   consistent across all 32) matches the original CI failure's own
   reported diffs exactly, confirming these are the same underlying
   rendering difference being resolved, not a new, unrelated change.

### Visual baseline policy (binding going forward)

- Darwin (`*-darwin.png`) baselines are generated and validated on macOS.
  Linux (`*-linux.png`) baselines are validated against genuine
  GitHub-hosted `ubuntu-latest` (AMD64) output. Both represent the same
  approved product state, platform-specifically — their bytes are not,
  and are not intended to be, identical to each other.
- **Apple Silicon Docker/QEMU emulation must never be assumed
  pixel-equivalent to genuine GitHub-hosted AMD64 rendering, even with
  `--platform=linux/amd64` explicitly set.** This phase demonstrated
  directly that it is not: emulated output matched native arm64, not real
  amd64 hardware. Local Docker (of any platform flag) is useful for
  confirming the *config and version* resolve correctly, but is **not** a
  trustworthy source for Linux visual baseline pixels.
- The authoritative source for Linux baseline pixels is a genuine
  GitHub Actions run on the same runner class CI actually uses — either
  the `-actual.png` output from a real (even failing) CI run, as performed
  here, or an explicit, human-reviewed one-time bootstrap run.
- CI never regenerates baselines automatically — the `visual` job never
  passes `--update-snapshots`, and a screenshot mismatch is a visible,
  blocking CI failure requiring human review, not an auto-corrected diff.
- An intentional visual change requires a deliberate, explicit baseline
  update on **both** platform sets, reviewed like any other approved-design
  change — never a silent overwrite of either set during a routine run.
- Running the suite on a `macos-latest` GitHub Actions runner instead of
  generating Linux baselines was considered and rejected: even matching
  the `darwin` platform tag would not guarantee pixel-identical output
  against this development machine's own macOS version/fonts/rendering
  path, so it would not actually solve the underlying determinism
  question — it would just make a future mismatch less visible until it
  reappeared.
