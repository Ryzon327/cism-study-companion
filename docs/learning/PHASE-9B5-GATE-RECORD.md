# Phase 9B-5 Gate Record — D2-U9 (Risk Monitoring, Reassessment & Reporting) and D2-U10 (Embedding Risk Management Into the Business + Domain 2 Synthesis/Capstone)

**Status: [CANONICAL record of what happened; the curriculum content it
describes is CANDIDATE, not canonical]**. This is the durable record of
Phase 9B-5 — the fifth and final Domain 2 production-content
implementation batch, built per the approved Phase 9A architecture
([`DOMAIN-2-BLUEPRINT.md`](DOMAIN-2-BLUEPRINT.md)) and the Phase 9B-4
founder-approved Domain Synthesis / Capstone principle
([`CURRICULUM-BLUEPRINT.md`](CURRICULUM-BLUEPRINT.md#domain-synthesis--capstone-principle))
— following Phase 9B-4's merge
([`PHASE-9B4-GATE-RECORD.md`](PHASE-9B4-GATE-RECORD.md)). It records
outcomes, founder-reported feedback, an investigation and its
disposition, and a scope decision affecting the next phase — not
implementation narrative.

## Scope

D2-U9 (Risk Monitoring, Reassessment & Reporting) and D2-U10 (Embedding
Risk Management Into the Business + Domain 2 Synthesis/Capstone) — the
fifth and final of the five approved Domain 2 implementation batches
(9B-1 through 9B-5). New production content: 2 concepts, 2 lessons, 2
families, 6 questions — all `CANDIDATE`. This batch completes D2-U1
through D2-U10, all ten approved Domain 2 units.

## Founder Human Experience Gate

**Result: PASS for both units.**

D2-U9, founder-reported Aha, verbatim:

> "A risk decision is a point-in-time snapshot and monitoring establishes
> if that risk decision still upholds."

D2-U9 also felt verbose to the founder, alongside being informative.

D2-U10, founder-reported feedback:

- Also felt verbose, but contained valuable knowledge.
- Successfully brought Domain 2 together.
- The recurring payment-system story became a mental reference model the
  founder can use during actual CISM questions to reconstruct the risk
  lifecycle.
- An Aha was experienced throughout the unit.

Recorded as the founder's reported subjective experience — Claude Code did
not and cannot independently verify a human's subjective learning
experience. Both Ahas are confirmed as founder-reported, not independently
verified.

## U9 verbosity correction (approved, final)

One redundant sentence was removed from `lesson.d2.risk-monitoring-reporting`'s
`context` field: an illustrative quote-pair ("'The team performed 50
assessments this quarter' is activity; 'three risks have moved beyond
tolerance and require an executive decision' is decision-useful.") that
restated, without adding reasoning value, the concrete contrast the
immediately preceding sentence had already made. No teaching content, no
exam-relevant distinction, and no reference to the payment-system story
were removed. **This is now the final, approved U9 state — no further
U9 shortening is authorized.** The successful Founder learning outcome
("a risk decision is a point-in-time snapshot...") remains fully intact.

## U10 verbosity — approved as-is

No edits were made to D2-U10. On review, the two longest paragraphs (Big
Picture and the Guided Reference Scenario) were found to be an intentional
abstract-then-concrete pairing — the approved two-stage synthesis flow's
own design — not duplication. D2-U10 is a capstone with two combined
responsibilities (embedding + Domain 2 synthesis) and is explicitly
permitted to run longer than an ordinary lesson; its length is accepted as
justified by synthesis, not to be trimmed to match D2-U1 through D2-U9.

## U10 answer-position investigation — CLOSED, NO DEFECT

Founder observation: D appeared to be the correct answer repeatedly while
reviewing D2-U10.

**Verdict: natural local streak, not a systemic defect.** A realistic
fresh D2-U10 walkthrough does show Recall (`question.d2.0026`) and Apply
(`question.d2.0029`) both displaying the correct answer at position D at
first exposure, and three consecutive fresh re-visits to D2-U10 (typical
of manual QA re-testing without a page reload) show D, A, D. This was
traced precisely: `answerOrder.ts`'s permutation-index algorithm was
replicated directly and run against a 20,000-question synthetic sample,
producing an effectively uniform ~25%-per-position distribution — proving
the algorithm itself carries no systematic bias. The real 67-question
bank's own exposure-0 distribution (A:10, B:13, C:19, D:25) is small-sample
coincidence in which particular authored question IDs happen to hash
where, not an algorithmic or content-authoring defect. No production code
was changed: `answerOrder.ts` and `selection.ts` are untouched, no answer
was rebalanced or moved, and no anti-streak logic was introduced.

## Domain 2 curriculum status — CONTENT-COMPLETE for the current MVP curriculum boundary

D2-U1 through D2-U10 collectively cover the full approved Phase 9A Domain
2 architecture. A bounded Domain 2 source-coverage check (all six source
knowledge-statement areas — 2A1, 2A2, 2A3, 2B1, 2B2, 2B3 — cross-checked
against D2-U1–U10 using the blueprint's own source-coverage map) found no
meaningful uncovered source area; every area is already absorbed into an
existing unit. **This does not promote any content to `CANONICAL`.** All
Domain 2 content, and all prior content, remains `CANDIDATE`.

## Learning-mode completeness audit — findings and disposition

A full investigation of every learner-facing study surface (Learn, Recall,
Apply, Feedback, Repair, Explore, Practice, "Optional 5-minute
reinforcement") was performed this phase, tracing actual code rather than
inferring from labels.

**Functional:** Learn, Recall, Apply, Feedback, Repair — generic,
lesson-aware, tested, identical in mechanism across Foundation, all of
Domain 1, and all of Domain 2.

**Not complete — confirmed current product truth:**

- **Explore**: no distinct implementation exists anywhere in the codebase.
  The nav label "Explore & Practice" and the Home card that references it
  route to a single screen, `PracticeExamScreen`, with no scope-selection
  step, no domain/unit awareness, and no explanation of why any given
  question is shown.
- **Practice**: the same single screen is, in its entirety, the Phase 5B
  Visual Prototype Gate shell for "Practice Exam" — a static fixture
  question, a static "4 / 12" counter, a static "42:18" timer, Next/
  Previous buttons with no `onClick` at all, and a Review Center whose
  review-queue and submit actions do not functionally complete anything.
- **Optional 5-minute reinforcement**: the learner-facing button
  (`CompletionScreen.tsx`'s `<button class="completion-optional">`) has no
  `onClick` handler and performs no action — misleading/dead UI, appearing
  identically after every lesson's completion, in every domain.

**Confirmed: these three gaps predate Domain 2 entirely** — verified
identical across Foundation, all nine Domain 1 units, and all ten Domain 2
units (Explore/Practice/Reinforcement are not lesson-aware at all; the
screens never receive `todaysLessonId` or `contentSource`). They were
**not implemented or modified during Phase 9B-5** — this phase only
performed the investigation and the one approved U9 textual trim.

**Disposition: explicitly deferred to a separately bounded future MVP
Learning Modes phase.** Domain 3 must **not** begin before that phase is
architecturally addressed. The next authorized planning target after this
phase's merge is that MVP Learning Modes phase (Explore + Practice +
Optional Reinforcement) — not Domain 3, and no implementation of it is
authorized yet. Recommended MVP product contracts (Explore: domain → unit/
concept → scenario(s) → explanation → explore-another/return; Practice: a
bounded 5–10 question session with a session-only summary; Reinforcement:
2–4 questions from already-taught material) and the UI-truthfulness
requirement (each of the three surfaces must become functional or be
hidden/relabeled before MVP release) are recorded architecturally for that
future phase's planning, not implemented now.

## Preserved / unchanged this phase

- Domain 1 — completely unchanged.
- D2-U1 through D2-U8 — completely unchanged.
- Foundation production content — unchanged.
- `answerOrder.ts` and `selection.ts` — untouched (confirmed via `git diff`, zero lines changed).
- Explore/Practice/Reinforcement behavior — untouched; investigated only.
- BUG-001/002/003 — unchanged, still `todo`.
- Persistence boundary — unchanged; no localStorage/IndexedDB/backend/authentication introduced.
- `schema/example/` — untouched.
- Prototype fixtures — intact.
- CI architecture (`.github/workflows/ci.yml`) — unchanged.
- No `CANONICAL` promotion occurred anywhere.

## Future curriculum requirements reaffirmed

- Domain 3 must select its own source-grounded recurring reference model
  during its own architecture phase, and must include its own synthesis/
  capstone unit — neither copied from Domain 2's payment-system story or
  D2-U10's specific shape.
- Domain 4 carries the same two requirements, independently designed from
  its own source material.
- Domain 1 remains exempt from a synthesis retrofit merely for symmetry;
  may be reconsidered later only if reinforcement/readiness evidence
  supports it.
- The approved future Foundation "how to read a CISM question" enhancement
  remains recorded and not implemented, per
  [`FOUNDATION-BLUEPRINT.md`](FOUNDATION-BLUEPRINT.md)'s existing section.

## Final validation results (this batch)

Legacy 111 pass / 3 expected `todo` · content-production 195/195 (169
pre-existing + 26 new Phase 9B-5 tests) · Vitest 112/112 (selection-engine
14/14, answer-order 16/16) · TypeScript clean · production build succeeds
· Playwright e2e 78/78 (Chromium + Firefox + accessibility) · visual
regression 32/32 · `npm audit --audit-level=moderate` 0 vulnerabilities.
Total production-question count: 67 (30 Domain 2 + 34 Domain 1 + 3
Foundation). All remain `CANDIDATE`; 0 `CANONICAL`.
