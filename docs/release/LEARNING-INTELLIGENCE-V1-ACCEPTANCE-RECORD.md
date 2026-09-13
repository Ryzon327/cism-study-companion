# Learning Intelligence v1 — Acceptance Record

## Candidate

- **Development branch:** `post-mvp/learner-intelligence`
- **Candidate SHA:** `2b733f4ff8598614fa616c653ad45929898b7763`
- **Stable-main baseline SHA:** `aada8c8dcd309b5cc21084844d7eb6f88e3eff7d` (`v1.0.0-mvp`)
- **Accepted exact-commit CI:** run `34773150451`, head SHA `2b733f4ff8598614fa616c653ad45929898b7763`, result **success**, required jobs: `legacy`, `content-production`, `frontend`, `security`, `visual` — all green.

## Scope

- **LI-1** — Local Learning History (immutable, append-only IndexedDB event log).
- **LI-2** — Deterministic Insight Engine (named states, reason codes, trend, ranked recommendations).
- **LI-3** — Insights Learner Experience (Focus Next, trend, Stronger Areas, Study Data export/reset).
- **LI-4** — Targeted Study Handoffs (Review → exact Explore content; targeted Practice; existing-domain Practice reuse).
- **Product-environment correction** — ordinary/production startup defaults to production content with QA tooling explicitly opt-in only.
- **Governance applicability** — the current `CLAUDE.md` / `docs/engineering/PROJECT-OPERATING-OVERLAY.md` workflow applies to this and all future phases; no governance content is re-litigated here.

## Core learner outcome

The application can, end-to-end, through real production content and the real learner UI: **collect real study evidence → derive explainable insights → identify Focus Next → offer valid targeted study actions → record subsequent practice → recompute current insights.** This full loop was directly exercised and verified (Acceptance Journey D, below) — not merely inferred from the individual phase records.

## Architecture invariants (accepted, unchanged by LI-5)

- `LearningEvent` history is immutable, append-only, IndexedDB-backed, local to the browser/device.
- Only `sourceContext: "production"` evidence reaches learner Insights; prototype/QA attempts are excluded at the eligibility boundary.
- LI-2's classifications (`NOT_ENOUGH_EVIDENCE` / `NEEDS_REVIEW` / `DEVELOPING` / `STRONGER_EVIDENCE`) are deterministic; no opaque score is ever exposed.
- A Repair attempt never mutates the primary miss it followed; a successful Repair is recovery evidence, not proof the miss never happened.
- Recall is secondary evidence; Apply is primary.
- Focus Next shows at most 3 recommendations.
- LI-4 resolves routing from the recommendation's `target.axis`/`target.targetId` plus **current** production content — never from LI-2's `suggestedActionKind` alone.
- A stale/unresolvable target yields zero handoffs, never a broken action.
- Insights refreshes from current evidence on every visit; no stale cache, no manual refresh control.

LI-5 performed no changes to any of the above — see "Regression status" below.

## Whole-feature acceptance journeys

| Journey | Result | Notes |
|---|---|---|
| A — Fresh learner | **PASS** | No QA switcher, 5 real nav destinations, truthful zero-history Insights state, no errors. |
| B — History persistence | **PASS** | A real UI-driven Daily Study Apply attempt recorded with `sourceContext: "production"`, semantic (not display-position) option identity, correct confidence; survives reload and navigate-away/back. |
| C — Insight emergence | **PASS** | A real seeded NEEDS_REVIEW concept surfaces with a learner-friendly label, correct state language, factual confidence-mismatch explanation, no raw IDs, no opaque score. |
| D — Complete remediation loop (most important) | **PASS** | Insights → real "Practice this topic" action → targeted Practice (truthful label/count) → a real question genuinely belonging to the recommended concept → answered through the ordinary `QuestionAttemptFlow` (`learningMode: "practice"`, no fake "completed" flag) → returned to Insights, which recomputed from the new evidence with no manual reload. |
| E — Review loop | **PASS** | Lands directly on the exact Explore concept, not the generic picker; opening Review writes zero `LearningEvent`s (verified by exact IndexedDB count before/after). |
| F — Repair recovery | **PASS** | A miss + successful Repair + two further correct answers on distinct questions produces **zero** Focus Next entries for that concept — the calm "Building your study picture" state — while the original miss (`correct: false`) and the successful Repair event both remain in storage, unmutated. Directly demonstrates a corrected misunderstanding is not held against the learner. |
| G — Export / Reset | **PASS** | A real export (button-triggered, saved to `/Users/demetrius/Downloads/cism-li5-export-example.json`), generated from a genuinely interactive Daily Study + Practice session (real `crypto.randomUUID()` event/session ids, real `Date.now()` timestamps — regenerated after the Independent Challenger correctly flagged the first version as exported from seeded fixture data; see "Independent Challenger" below), is valid, versioned JSON containing only `sourceContext: "production"` events, no prototype/QA events, no unrelated data, no network call. Reset: Cancel preserves data; confirming clears history and returns to the fresh state; curriculum/app state unaffected. No Import control exists anywhere. |
| H — QA contamination guarantee | **PASS** | Seeding 12 additional prototype-sourced events alongside the same 3 real production events produced **byte-identical** rendered Insights output and an unchanged "3 recorded question attempts" count. |
| I — Stale historical target | **PASS** | A concept no longer in current content renders the safe "A previously studied topic" fallback, no raw ID, no broken Review/Practice action, no crash. |
| J — Ordinary Practice after targeted Practice | **PASS** | Leaving a targeted Practice flow and reopening Practice from primary navigation shows the ordinary landing with no sticky scope or leftover label. |

## Cross-cutting acceptance

- **Narrow example (`qualifier.next`, "NEXT questions")**: 7 real, currently-matching questions; truthful count; session draws only matching questions.
- **Broad example (`evidence.knowledge`, "Knowledge")**: 87 real, currently-matching questions across 32 concepts and 4 domains; the targeted-Practice screen truthfully shows the label "Knowledge," the true count (87), and session-length options bounded to `[5, 10, 87]` — never implying a narrower scope than reality, never capped below the true pool.

## Upgrade behavior (stable MVP → Learning Intelligence)

- **No migration required.** The MVP was session-only with zero persistence (confirmed in `MVP-ACCEPTANCE-RECORD.md` §14); the `cism-li` IndexedDB database is new and created lazily on first real write — there is no prior learner-history database to migrate from.
- A learner on a genuinely fresh browser (Journey A) sees the correct, honest zero-history state — the upgrade does not require or assume any pre-existing history.
- No existing unrelated browser state is destructively touched — Learning Intelligence never reads or writes `localStorage`, and Reset clears only the `learningEvents` object store.
- No old prototype-default behavior returns; ordinary startup (dev or production build/preview) shows real production content with QA tooling absent, confirmed live against both a dev server and a real `vite build` + `vite preview`.
- No account/cloud migration is implied anywhere in this feature.
- An existing learner can continue studying immediately — Daily Study, Explore, and Practice's core mechanics are unchanged; only additive recording calls and the fifth "Insights" nav destination were added.

## Privacy / storage

- Local-only, browser/device-scoped IndexedDB. No accounts, no backend, no cloud sync, no telemetry added by Learning Intelligence, no AI/provider network calls, no hidden network persistence — confirmed both by direct source grep (zero `fetch`/`XMLHttpRequest`/`WebSocket`/`sendBeacon` call sites in `app/src/`) and by the real export flow (`Blob` + local download only, no network activity).
- Export is local JSON file generation only; Reset is a local, explicit, confirmation-gated deletion of Learning History alone.

## Negative guarantees (verified this pass)

- **QA exclusion**: prototype/QA-sourced attempts have zero effect on Focus Next, state, trend, ranking, confidence evidence, or the Study Data attempt count (Journey H).
- **No fake Review evidence**: opening a Review handoff writes zero `LearningEvent`s (Journey E).
- **Stale-target safety**: a target no longer in current content never produces a broken Review/Practice action or a crash (Journey I).
- **Matching targeted pools**: every question entering a targeted Practice session genuinely carries the target's real current metadata, for both a narrow (qualifier) and a broad (evidence dimension) example.
- **Unknown-schema safety**: reused from LI-2's accepted diagnostics (`UNSUPPORTED_SCHEMA_VERSION`) — not re-derived live this pass; no schema-version change occurred in LI-1–LI-4.

## Broad-scope usability observation — final LI-5 disposition

**PASS — broad but truthful and useful.** `evidence.knowledge` resolves to 87 current production questions across 32 concepts and 4 domains. Every returned question is a legitimate current match. The learner-facing experience never implies a narrower scope than reality: the focus label ("Knowledge"), the true pool count, and the session-length choices (bounded to `[5, 10, 87]`) are all truthful. Recorded as a future UX-refinement consideration for a later phase, not a defect — no LI-4/LI-2 change was made or is authorized by this observation.

## Focus Next density observation — final LI-5 disposition

**MINOR (deferred, not acted on).** A realistic Focus Next card carrying a full why/evidence explanation plus two real actions (see the acceptance screenshot set, panel 7) remains organized into clearly delineated groups (heading, state badge, why sentences, evidence lines, action buttons) and stays scannable today. This session's own initial read classified it PASS; the Independent Challenger, reviewing the same evidence, classified it MINOR — at roughly 8 text lines plus 2 buttons the card is dense enough that a future added axis or reason code could tip it toward clutter, worth a lightweight information-density pass before a broad release but not a release blocker. That more conservative classification is accepted here. Not redesigned in this package, per instruction.

## Family/synthesis observation — final LI-5 disposition

**Non-blocking curriculum-structure observation, reconfirmed.** No acceptance journey in this pass surfaced a learner-facing problem from multi-concept synthesis families having their family-level recommendation overlap-reduced in favor of a shared synthesis concept. The resolver behavior itself remains correct and directly unit-tested. No curriculum or LI-2 change was made or is authorized by this observation.

## Regression status

Reuses the exact-commit CI run `34773150451` (all 5 required jobs green: `legacy`, `content-production`, `frontend` — including TypeScript, production build, Vitest, and Playwright e2e/accessibility on Chromium+Firefox — `security`, `visual`) for the full unchanged product/test matrix, per the state-aware gate reuse rule (`CLAUDE.md`). LI-5 added zero product or test code changes, so this reuse remains valid. Targeted, additional live checks performed this pass: fresh-learner journey (A), a real Daily Study attempt (B), and a production `vite build` + `vite preview` check (no QA panel, real content, Insights functional, zero console errors).

## Independent Challenger

- **BLOCKER:** 0
- **MAJOR:** 1 (resolved before this record was finalized)
- **MINOR:** 1 (accepted, deferred)
- **Overall verdict:** PASS WITH MINOR NOTES

Performed as a genuinely isolated, fresh, read-only subagent (no shared context with the implementer), independently inspecting the release-candidate diff, the LI-1–LI-4 architecture boundaries, the acceptance evidence (screenshots + structured facts + the real export file), the privacy/network boundary, the QA-contamination guarantee, stale-target behavior, recommendation→handoff correctness, targeted→ordinary Practice restoration, export/reset, both LI-5 usability observations, and migration/upgrade assumptions. No file was edited by the challenger.

**MAJOR finding (resolved):** the first version of the Journey G export evidence file was generated from hand-seeded/fixture IndexedDB writes (fixture event/session ids, fixture timestamps) rather than a genuinely interactive session — even though the Export button click itself was real, the underlying events did not demonstrate the real end-to-end flow the evidence claimed. Given this project's own documented history of evidence-integrity failures (`docs/engineering/BASELINE.md`'s BUILD-16..26 account), this was treated as correctly caught and was fixed immediately: the export was regenerated from an actual real Daily Study attempt and a real Practice attempt (Recall → Apply → Repair where needed), producing an export with genuine `crypto.randomUUID()` ids and genuine `Date.now()` timestamps. See "Whole-feature acceptance journeys," row G, and the machine-readable artifact's `acceptanceJourneys.G_exportReset` for the corrected evidence.

**MINOR finding (accepted, deferred):** Focus Next card information density — see "Focus Next density observation" above.

## Deferred items

- **BUG-001 / BUG-002 / BUG-003** (`docs/regressions/REGISTRY.md`) — legacy-prototype-scoped, accepted-deferred at MVP acceptance, unaffected by and unrelated to Learning Intelligence.
- Broad-cross-cutting-scope usability observation (`evidence.knowledge`) — classified PASS this pass; recorded for optional future UX refinement, not a defect.
- Family/synthesis overlap-reduction observation — non-blocking curriculum-structure note, not a defect.
- Focus Next density observation — classified MINOR by the Independent Challenger this pass (accepted, deferred); revisit only after real learner history accumulates, per the LI-3 Architect note.

## Release blockers

**NONE.**

## Acceptance status

**Architect review: PASS.**
**Founder release approval: APPROVED FOR RELEASE TRANSITION.**

## Recommended release transition

Learning Intelligence v1 passed Architect whole-feature acceptance, and the Founder approved the protected release transition. This candidate (`2b733f4ff8598614fa616c653ad45929898b7763`) is authorized for a pull request against `main`. **PR merge remains a separate protected action and is NOT authorized by this record alone** — it requires its own, later, explicit Founder authorization. Tagging and release publication likewise remain separate and are not yet authorized. Nothing has been merged, released, deployed, or tagged, and `main` remains unmodified.
