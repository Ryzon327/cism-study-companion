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

### Migration performed: Option A — parallel platform-specific baselines

A Linux-specific baseline set was generated and added *alongside* the
existing Darwin set, using the exact official Playwright Docker image
matching this repository's resolved `@playwright/test` version:

- Resolved version (from `package.json`, `package-lock.json`, and the
  installed CLI, all in agreement): **1.62.1**.
- Official image used: **`mcr.microsoft.com/playwright:v1.62.1-noble`**
  (confirmed to exist and pulled successfully; the Playwright CLI inside
  the container reports the identical `1.62.1`).
- The repository was bind-mounted into the container with `node_modules`
  redirected to an isolated Docker-managed volume (never the host's own
  `node_modules`), `npm ci` was run *inside* the container against the
  committed lockfile to get Linux-native dependency builds, and
  `npx playwright test --config playwright.visual.config.ts --update-snapshots`
  was run once to generate the 32 `*-linux.png` files. A second run in the
  same container, *without* `--update-snapshots`, then compared the
  freshly-built application against those new baselines as a genuine
  regression check (32/32 passed) — not merely re-confirming a write.
- **Integrity check, verified via `git status`/`git diff`, not assumed:**
  exactly 32 new `*-linux.png` files added; the 32 existing `*-darwin.png`
  files show zero modifications and zero deletions; no application,
  test, or visual-config source file changed as a side effect of this
  step.
- The local macOS (Darwin) suite was re-run after the migration and still
  passes 32/32 against its original, untouched baselines — confirming
  both platform-specific baseline sets independently correspond to the
  same, unchanged, currently-approved UI. Darwin and Linux screenshot
  bytes are not, and are not intended to be, identical to each other.

### Visual baseline policy (binding going forward)

- Darwin (`*-darwin.png`) baselines are retained for local macOS visual
  validation; Linux (`*-linux.png`) baselines are retained for GitHub
  Actions visual validation. Both represent the same approved product
  state, platform-specifically.
- CI never regenerates baselines automatically — the `visual` job never
  passes `--update-snapshots`, and a screenshot mismatch is a visible,
  blocking CI failure requiring human review, not an auto-corrected diff.
- An intentional visual change requires a deliberate, explicit baseline
  update on **both** platform sets, reviewed like any other approved-design
  change — never a silent overwrite of either set during a routine run.
- Future Linux baseline regeneration should use the official Playwright
  Docker image version-matched to the repository's then-current
  `@playwright/test` resolution, exactly as performed here — not an
  arbitrary or floating image tag.
- Running the suite on a `macos-latest` GitHub Actions runner instead was
  considered and rejected: even matching the `darwin` platform tag would
  not guarantee pixel-identical output against this development machine's
  own macOS version/fonts/rendering path, so it would not actually solve
  the underlying determinism question — it would just make a future
  mismatch less visible until it reappeared.
