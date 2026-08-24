# Phase 10A Gate Record — MVP Learning Modes Architecture

**Status: [CANONICAL record of what happened; the architecture it
describes is the approved plan for a not-yet-implemented future phase]**.
This is the durable record of Phase 10A — an architecture/investigation-only
phase, no production implementation — following Phase 9B-5's merge
([`PHASE-9B5-GATE-RECORD.md`](PHASE-9B5-GATE-RECORD.md)). It records the
investigation result, the Founder/Architect decisions that closed it out,
and the approved implementation sequence for the future Phase 10B — not
implementation narrative, since none occurred.

## Scope

Investigation and architecture only, for the three learner-facing surfaces
the Phase 9B-5 audit found incomplete: Explore, Practice, and "Optional
5-minute reinforcement." No Explore/Practice/Reinforcement implementation,
no Foundation enhancement implementation, no persistence, and no Domain 3
work occurred during Phase 10A. New artifacts: one architecture document
(`docs/learning/LEARNING-MODES-ARCHITECTURE.md`) and this gate record.

## Investigation result

A fresh, independent re-verification (not a re-statement of the Phase
9B-5 audit) confirmed:

- **Explore**: no distinct implementation exists anywhere in the
  repository — the "Explore & Practice" nav item and Home's linked card
  route to a single screen, the Phase 5B Practice Exam visual-prototype
  shell.
- **Practice**: that same single screen is, in its entirety, static
  Phase 5B scaffolding — a hardcoded fixture question, a literal "4 / 12"
  counter, a literal "42:18" timer, and Previous/Next/review-queue/submit
  controls with no attached behavior.
- **Optional Reinforcement**: the Completion screen's
  `<button class="completion-optional">` has no `onClick` handler at all —
  confirmed dead UI, identical and unchanged across Foundation, all of
  Domain 1, and all of Domain 2.
- **New finding this phase**: of the 10 repair targets actually used across
  current production content, only 2
  (`repair.authority-error`, `repair.role-error`) have dedicated
  `REPAIR_CONTENT`; the other 8 fall back to the same generic prompt today
  — a pre-existing Daily Study gap, not something Explore/Practice/
  Reinforcement introduce, but directly relevant to reusing repair targets
  for those future modes.
- **New finding this phase**: `docs/learning/CURRICULUM-BLUEPRINT.md`'s
  canonical first-pass loop already names a `REINFORCE` step (the
  Feedback/Repair reasoning-reinforcement that happens inside ordinary
  Daily Study) — meaning "reinforcement" now names four distinct things in
  this codebase/docs, and the future "Optional Reinforcement" feature name
  should be chosen carefully to avoid colliding with that existing
  canonical term.

Full findings, evidence, and the proposed architecture are recorded in
[`LEARNING-MODES-ARCHITECTURE.md`](LEARNING-MODES-ARCHITECTURE.md).

## Founder/Architect decisions (approved, binding on future implementation)

1. Daily Study remains the guided learning path, unchanged.
2. Explore is concept-driven (domain → taught concept → explanation →
   recognition clues/example → optional question → feedback/repair →
   explore another/exit) — conceptual architecture only, not implemented.
3. Practice is deliberate, bounded CISM reasoning practice (scope choice →
   bounded question session, working assumption ~5–10 questions, not a
   rigid requirement → immediate feedback/repair → session-only summary),
   calm and free of filters/gamification/dashboards.
4. Practice and Mock Exam are explicitly separate; Mock Exam is not
   authorized for the upcoming Learning Modes implementation phase.
5. Optional Reinforcement is contextual (a Completion-screen action), not
   a top-level nav destination; roughly a 2–5 minute experience target,
   not a fabricated countdown; must reinforce something relevant to the
   just-completed lesson, never "five random questions."
6. The reinforcement audit result (never implemented, across Foundation/
   D1/D2, dead Completion-screen button) is accepted as accurate and
   recorded; not fixed during this closeout.
7. The Foundation six-step reasoning model remains approved but
   unimplemented; its relationship to Explore (reusable reference),
   Practice feedback, and Reinforcement feedback is recorded conceptually
   only — never as an exam-hack/qualifier-shortcut system.
8. Reuse the existing repair-target/pattern/lifecycle/family architecture;
   do not build a second diagnostic taxonomy. The 8-of-10 missing
   repair-content finding must be resolved by audit and per-target
   evidence-supported treatment during 10B-1 — not by mechanically
   authoring all 8 to reach a coverage number.
9. Explore, Practice, Reinforcement, and Daily Study reuse the same
   production curriculum/question infrastructure — one curriculum,
   multiple learning experiences; no forked question engines per mode.
10. The existing session-scoped `exposureStore` is approved to be shared
    across Daily Study, Explore, Practice, and Reinforcement. This applies
    only to the existing in-memory architecture and is not authorization
    for persistence.
11. The persistence boundary remains fully in force: no new localStorage,
    IndexedDB, backend persistence, authentication, analytics, or AI
    product integration during the Learning Modes work.
12. Future weakness-based Practice ("practice what I'm weak on") is
    recorded as future architecture only, gated on a separately authorized
    persistence phase — not implemented or simulated with fake persistence
    now.
13. Domain 3/4 genericity is binding: no per-domain branching anywhere in
    Learning Modes architecture; Domain 3/4 content becomes available to
    every mode automatically once authored.
14. The reference-for-comprehension + varied-scenarios-for-transfer
    principle remains binding; Domain 3/4 choose their own reference models
    independently during their own architecture phases.
15. The domain synthesis/capstone requirement remains binding for Domain 3
    and Domain 4; Domain 1 remains exempt from retrofit unless future
    readiness evidence justifies one. No synthesis implementation occurred
    this phase.

## Approved implementation sequence (Phase 10B, five batches)

Founder/Architect simplified the originally-proposed six-batch sequence to
five:

1. **10B-1 — Repair & Shared Learning Infrastructure**: audit + evidence-
   supported repair-content treatment for the 8 uncovered repair targets;
   establish the shared question→answer→feedback→repair sub-loop; preserve
   shared exposure-store behavior; prove answer-order, question-family,
   and generic-domain compatibility. Does not implement Explore, Practice,
   or Reinforcement.
2. **10B-2 — Explore.** Founder Human Experience Gate required.
3. **10B-3 — Practice.** Founder Human Experience Gate required.
4. **10B-4 — Optional Reinforcement.** Founder Human Experience Gate
   required.
5. **10B-5 — Learning Modes integration / Human Experience closeout.**
   Validates all three new modes together with Daily Study; confirms
   readiness to proceed to Domain 3 architecture.

Full per-batch Human Experience Gate language is recorded in
[`LEARNING-MODES-ARCHITECTURE.md`](LEARNING-MODES-ARCHITECTURE.md#human-experience-gates-plain-language-per-batch--approved).

## Preserved / unchanged this phase

- All production curriculum JSON (concepts, lessons, families, questions) — untouched.
- Foundation, Domain 1, and Domain 2 production content — untouched.
- `answerOrder.ts`, `selection.ts`, `exposureStore.ts` — untouched.
- Daily Study, Explore, Practice, and Reinforcement runtime behavior — untouched (Explore/Practice/Reinforcement remain exactly as incomplete as the investigation found them; nothing was fixed or implemented).
- Home/Journey behavior — unchanged.
- Persistence boundary — unchanged.
- BUG-001/002/003 — unchanged, still `todo`.
- `schema/example/` — untouched.
- CI architecture (`.github/workflows/ci.yml`) — unchanged.
- Visual baselines — unchanged, not regenerated.
- No `CANDIDATE` → `CANONICAL` promotion occurred.

## Final validation results (this phase)

Legacy 111 pass / 3 expected `todo` · content-production 195/195 · Vitest
112/112 (selection-engine 14/14, answer-order 16/16) · TypeScript clean ·
production build succeeds · Playwright e2e 78/78 (Chromium + Firefox +
accessibility) · visual regression 32/32 (no baseline updates) · `npm audit
--audit-level=moderate` 0 vulnerabilities. All results identical to the
pre-Phase-10A baseline, since this phase changed documentation only.

## Final Phase 10A status

Architecture approved. No Learning Modes implementation began. No
Foundation enhancement implementation began. No Domain 3 work began. Ready
for Phase 10B-1 to be separately authorized.
