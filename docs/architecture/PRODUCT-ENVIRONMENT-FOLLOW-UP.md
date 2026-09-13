# Product Environment Follow-up — Production Default + Explicit QA Gating

**Status: Architect review: PASS. Founder UAT: WAIVED.**

Fixes a pre-existing, out-of-LI-1-scope product-environment defect
surfaced during LI-1's architecture review and Architect-confirmed as a
required follow-up before LI-2 begins (see
`docs/architecture/LI-1-IMPLEMENTATION-RECORD.md` §14/§16). This is a
small, isolated fix: production default + explicit QA gating only. No
LI-2 work, no curriculum change, no persistence-architecture change.

## 1. Original defect

The released MVP, as built:

- `App.tsx` initialized `contentSourceMode` to `"prototype"` — every fresh
  page load of Daily Study showed the Phase 5B prototype fixture content
  (a fixed Domain 2 "Residual risk and treatment decisions" lesson), not
  real production curriculum, until a person manually opened a QA panel
  and switched it.
- `AppShell.tsx` unconditionally rendered `PrototypeSwitcher` — the
  Prototype/Production content-source toggle and the "Visual Prototype
  Gate states" jump-list were present in every build, including an
  ordinary `npm run dev` and an ordinary production build, with no
  environment gating at all.

## 2. Root cause

Both defaults were literal, hardcoded values with no distinction between
"developer/QA tooling" and "ordinary application behavior":
`useState<ContentSourceMode>("prototype")` in `App.tsx`, and an
unconditional `<PrototypeSwitcher ... />` in `AppShell.tsx`. There was no
environment or build-mode signal anywhere in the codebase distinguishing
"this is a QA/developer review session" from "this is the app, running
normally." Practice and Explore were unaffected — both hardcode
`productionContentSource` directly, never reading `contentSourceMode` at
all.

## 3. Chosen explicit QA mechanism

A single compile-time Vite environment flag: **`VITE_ENABLE_QA_FIXTURES`**.
Read via a small dedicated module, `app/src/config/qaMode.ts`:

```ts
export function qaFixturesEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_QA_FIXTURES === "true";
}
```

A function, not a frozen constant — Vite/Vitest env vars are always
strings, and reading `import.meta.env` inside a function call (rather than
once at module-evaluation time) is what lets `vi.stubEnv()` change the
result within a test file. In a real browser build, Vite still resolves
this the same way it resolves every other `VITE_`-prefixed variable — no
custom bundler configuration was needed.

Rejected alternatives, per the Architect's explicit direction: hostname
heuristics, port-number heuristics, `import.meta.env.DEV` alone, a
`localStorage` flag, or a permanent user-facing toggle. None of those
distinguish "intentional QA session" from "an ordinary developer happened
to be on a particular machine/port," and a `localStorage`-backed toggle
would be a persistent, accidentally-stumbled-into backdoor rather than a
deliberate, one-time startup choice.

`App.tsx` reads the flag once per mount (`useState(qaFixturesEnabled)`,
not re-evaluated reactively) and uses it for two independent decisions:

```ts
const [qaEnabled] = useState(qaFixturesEnabled);
const [contentSourceMode, setContentSourceMode] =
  useState<ContentSourceMode>(qaEnabled ? "prototype" : "production");
...
<AppShell showQaTools={qaEnabled} ... >
```

`AppShell.tsx` gained a required `showQaTools: boolean` prop; it renders
`<PrototypeSwitcher>` only when true. There is no runtime way to enable QA
mode after the app has loaded — it is fixed for the lifetime of that page
load, decided entirely by what the server was started with.

## 4. Normal dev behavior

`npm run dev` (unchanged command) now:

- Boots with `VITE_ENABLE_QA_FIXTURES` unset.
- `contentSourceMode` defaults to `"production"`.
- No `PrototypeSwitcher` is rendered — no content-source toggle, no visual
  prototype gate list, no "Today's lesson (QA)" panel.
- Daily Study, Explore, and Practice all show real production curriculum
  from the first render.

## 5. Explicit QA behavior

Two supported paths, matching the Architect's suggested examples:

- `VITE_ENABLE_QA_FIXTURES=true npm run dev`
- `npm run dev:qa` (new, narrowly-scoped script: `"VITE_ENABLE_QA_FIXTURES=true vite"`)

Either way: `contentSourceMode` defaults to `"prototype"` (preserving
exactly the prior default for this path, so existing QA/reviewer workflows
and every existing automated test that depends on it continue to work
unchanged), and `PrototypeSwitcher` renders — the content-source toggle,
the visual prototype gate states, and the "Today's lesson (QA)" review
picker are all available exactly as before.

## 6. Production build behavior

`npm run build` (unchanged command) performs no special handling — it
simply never has `VITE_ENABLE_QA_FIXTURES` set unless a build pipeline
deliberately exports it (nothing in this repository does). A new
`"preview": "vite preview"` script was added, matching the project's own
already-documented recommended stable-worktree runtime model
("production build + Vite preview"). Verified directly (§9 below): a real
`npm run build && npm run preview` shows production content with no QA
panel, identical to ordinary `npm run dev`.

## 7. Test-environment changes

Every **existing** e2e/visual spec reaches the Prototype/Production
switcher or a visual-prototype-gate screen directly via `page.goto("/")`,
with no per-test opt-in step — they all implicitly depended on
prototype-as-default. Rather than restoring that default globally (which
the Architect's instructions explicitly rule out), their **shared
webServer** now explicitly opts into QA fixtures:

- `playwright.config.ts`'s existing webServer command gained
  `VITE_ENABLE_QA_FIXTURES=true`.
- `playwright.visual.config.ts`'s existing webServer command gained the
  same.

This makes the requirement explicit at the server-startup level (where it
actually belongs — there is no per-test runtime toggle) rather than
leaving it an implicit, undocumented assumption. No existing spec file's
test code or assertions were changed.

**`playwright.config.ts` now starts three independent webServers** (added
capability, not a breaking change — existing single-server behavior is
preserved for every existing spec):

1. `TEST_PORT` (5183) — QA fixtures enabled, as above. Used by every
   pre-existing spec (unchanged `baseURL`).
2. `PRODUCTION_DEFAULT_TEST_PORT` (5184) — no flag, ordinary `npm run dev`.
   Used by the new `product-environment.spec.ts`'s "ordinary" test group.
3. `PRODUCTION_BUILD_TEST_PORT` (5185) — a real `npm run build && npm run
   preview`. Used by the new spec's "production build" test group.

`tests/frontend/global-setup.ts` was refactored from a single hardcoded
default export into a `createGlobalSetup(baseUrls: string[])` factory (the
same server-identity-check logic, generalized); two thin per-config
wrapper files (`global-setup.e2e.ts`, `global-setup.visual.ts`) supply
each config's actual URL list. `test-server.ts` gained the two new
port/URL constants.

**Vitest**: only `tests/frontend/unit/App.test.tsx` renders `<App />`
directly and depends on the (former) prototype default — it is the one
file whose *subject* is that QA-enabled experience. It now explicitly
opts in via a file-level `beforeEach(() => vi.stubEnv("VITE_ENABLE_QA_FIXTURES", "true"))`
/ `afterEach(() => vi.unstubAllEnvs())`, rather than depending on a default
that no longer exists. Every other existing Vitest file renders individual
screens/components directly (never `<App />`) and was completely
unaffected.

## 8. LI-1 preservation

Learning Intelligence's recording seam (`app/src/learning-history/`) is
untouched. Its `sourceContext` field already reflected whichever content
source was actually active — it now simply reflects `"production"` more
often, by default, which is the correct behavior, not a change to the
recording logic itself. Verified directly: the new
`product-environment.spec.ts`'s dedicated LI-1 test drives a real Apply
attempt against the ordinary (no-QA-flag) server and confirms via direct
IndexedDB inspection that the recorded event carries
`sourceContext: "production"` with no explicit opt-in required.

## 9. Validation

All counts below are from this session, run locally against this
worktree's actual state (`post-mvp/learner-intelligence`, uncommitted, on
top of the LI-1 commit `59728e6`).

| Suite | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | clean, 0 errors |
| Production build (`vite build`) | succeeds |
| `node --test tests/data-integrity/` | 22 tests, 19 pass, 3 `todo` (pre-existing BUG-001/002/003, unrelated) |
| `node --test tests/data-model/` | 92 tests, 92 pass |
| `node --test tests/content-production/` | 477 tests, 477 pass |
| Vitest (`tests/frontend/unit/`) | **25 files, 258 tests, 258 pass** (252 pre-LI-1-follow-up + 6 new in `app-environment.test.tsx`) |
| Playwright e2e (Chromium + Firefox) | **112 tests, 112 pass** (86 pre-existing, unchanged assertions + 26 new in `product-environment.spec.ts`) |
| Playwright accessibility (`@a11y` subset) | 42 tests, 42 pass, unchanged |
| Playwright visual regression | 32 tests, 32 pass, 0 pixel diffs |
| `npm audit --audit-level=moderate` | 0 vulnerabilities |

No existing test's assertions were weakened, skipped, or deleted.

### Live verification (real browsers, not just automated tests)

Three servers run locally and screenshotted (Chromium):

1. Ordinary `npm run dev` (no flag) — Home shows "Authority follows
   accountability" (real production content), no QA panel anywhere.
2. `npm run dev:qa` — the QA panel renders; the Prototype Exam gate state
   ("4 / 12") remains reachable through it.
3. `npm run build && npm run preview` — identical to (1): production
   content, no QA panel.
4. Mobile viewport, ordinary startup — same result, no QA panel.

Contact sheet: `/Users/demetrius/Downloads/cism-product-environment-review.png`.
Local screenshots were kept at `.tmp-product-env-screens/` (untracked,
temporary) during review.

## 10. Files changed

- `app/src/config/qaMode.ts` (new) — the flag reader.
- `app/src/App.tsx` — default `contentSourceMode`, `showQaTools` prop.
- `app/src/app-shell/AppShell.tsx` — `showQaTools` prop, conditional
  `PrototypeSwitcher` render.
- `package.json` — `dev:qa` and `preview` scripts (no new dependency).
- `tests/frontend/test-server.ts` — two new port/URL constants.
- `tests/frontend/global-setup.ts` — refactored into a reusable factory.
- `tests/frontend/global-setup.e2e.ts`, `tests/frontend/global-setup.visual.ts` (new) — per-config wrappers.
- `playwright.config.ts` — three webServers, QA flag added to the existing one.
- `playwright.visual.config.ts` — QA flag added to its existing webServer.
- `tests/frontend/e2e/product-environment.spec.ts` (new) — the regression suite proving the fix.
- `tests/frontend/unit/App.test.tsx` — explicit `vi.stubEnv` opt-in (no assertion changes).
- `tests/frontend/unit/app-environment.test.tsx` (new) — unit-level default/opt-in coverage.

No content file, no curriculum, no CI workflow file, no persistence file,
and no other dependency was touched.

## 11. Evidence path

- Automated tests: this repository, uncommitted, on
  `post-mvp/learner-intelligence` — see §9.
- Live verification: §9's three local servers, screenshotted; contact
  sheet at `/Users/demetrius/Downloads/cism-product-environment-review.png`
  (external artifact, not committed).

## 12. Architect review

**PASS.** Reviewed via the screenshot contact sheet at
`/Users/demetrius/Downloads/cism-product-environment-review.png` plus the
automated evidence in §9. **Founder UAT: WAIVED** for this phase.

Approved: ordinary dev startup and production build/preview both default
to production content with no QA/prototype panel rendered;
`VITE_ENABLE_QA_FIXTURES` as the explicit QA opt-in mechanism; `npm run
dev:qa` as an acceptable convenience command; prototype fixtures remaining
fully available in explicit QA mode; automated QA-dependent tests
explicitly enabling QA mode at their shared webServer rather than relying
on a removed default; LI-1 persistence behavior confirmed intact under the
new default.
