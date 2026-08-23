# Phase 9B-2 Gate Record — D2-U3 (Risk Analysis Methods) and D2-U4 (Quantitative Risk for Decisions)

**Status: [CANONICAL record of what happened; the curriculum content it
describes is CANDIDATE, not canonical]**. This is the durable record of
Phase 9B-2 — the second Domain 2 production-content implementation batch,
built per the approved Phase 9A architecture
([`DOMAIN-2-BLUEPRINT.md`](DOMAIN-2-BLUEPRINT.md)) and following Phase
9B-1's merge ([`PHASE-9B1-GATE-RECORD.md`](PHASE-9B1-GATE-RECORD.md)). It
records outcomes and founder-reported feedback, not implementation
narrative.

## Scope

D2-U3 (Risk Analysis Methods) and D2-U4 (Quantitative Risk for Decisions)
only, per the approved Phase 9B-2 batch — the second of five implementation
batches (9B-1 through 9B-5) in the approved Domain 2 sequence. No D2-U5 or
later unit was authored. New production content: 2 concepts, 2 lessons, 2
families, 6 questions — all `CANDIDATE`.

## Implementation

- `concept.d2.risk-analysis-methods` / `lesson.d2.risk-analysis-methods` /
  `family.d2.risk-analysis-methods` (3 variants: `question.d2.0008`–`0010`)
  — Qualitative vs. Quantitative, taught via Pattern P10 (Method Fits
  Objective), using one continuous data-breach scenario that illustrates
  both methods within the same story (restoration cost assessed
  quantitatively; customer-trust decline assessed qualitatively).
- `concept.d2.quantitative-risk-decisions` / `lesson.d2.quantitative-risk-decisions`
  / `family.d2.quantitative-risk-decisions` (3 variants: `question.d2.0011`–
  `0013`) — Asset Value, Exposure Factor, Single Loss Expectancy,
  Annualized Rate of Occurrence, and Annualized Loss Expectancy, taught
  only to the depth needed to support a treatment decision, using one
  coherent e-commerce ransomware scenario. The three variants deliberately
  test three distinct sub-skills (calculate SLE; calculate ALE, including
  the ARO-misreading trap; interpret a calculated ALE in a business
  decision) rather than the same calculation with different numbers.
- Prerequisite chain: D2-U1 → D2-U2 → D2-U3 → D2-U4, unchanged from the
  approved Phase 9A blueprint.
- Regression coverage added in `tests/content-production/domain2-u3-u4.test.mjs`
  (19 tests); two stale batch-boundary assertions in the Phase 9B-1 test
  file (`domain2-u1-u2.test.mjs`) were updated, since they had asserted "no
  Domain 2 unit beyond U1/U2 exists" as a Phase-9B-1-specific guard that
  Phase 9B-2 legitimately supersedes.
- QA lesson selector (`App.tsx`) extended so both new lessons are
  reviewable; source registry note updated to reflect U1–U4 coverage.

## Founder Human Experience Gate

**Result: PASS**, no repair required.

Founder-reported result for D2-U3: **PASS** — the Aha/realization moment
occurred, and the qualitative-vs-quantitative teaching, method-fit
reasoning, and overall learning approach were approved.

Founder-reported result for D2-U4: **PASS** — the Aha/realization moment
occurred, and the quantitative-risk (AV/EF/SLE/ARO/ALE) teaching depth,
scenario anchoring, and overall learning approach were approved.

Recorded as the founder's reported subjective experience — Claude Code did
not and cannot independently verify a human's subjective learning
experience.

## Capitalization review (minor editorial item, no defect found)

Before closeout, the founder asked whether the rendered D2-U3/D2-U4 lesson
titles ("Qualitative vs. quantitative risk analysis: method fits
objective" and "Quantitative risk for decisions: AV, EF, SLE, ARO, ALE")
should be normalized to title case, conditional on the project's
established convention actually being title case.

Inspection found the established convention across all 15 existing
`concept.display_name` values (11 pre-existing plus D2-U1/U2) is
**sentence case**, not title case — e.g. "Governance vs. management,"
"Risk assessment lifecycle: Context, Identify, Analyze, Evaluate," "Threat
vs. vulnerability vs. risk." No documented capitalization rule exists in
`docs/data-model/`; the convention is established purely by unbroken
precedent. Both D2-U3's and D2-U4's titles already match that precedent
exactly (sentence case, with proper nouns/stage names/abbreviations
correctly capitalized: Context/Identify/Analyze/Evaluate,
AV/EF/SLE/ARO/ALE). **No defect was found; no change was made.** Converting
either title to title case would have been the change that broke
consistency with the other 13 titles, not a fix — this was reported back
explicitly rather than applying the founder's proposed change reflexively.

## Explicitly deferred / unchanged by this phase

- Domain 1 — completely unchanged (34 Domain 1 questions before and after;
  verified via diff scope containing no `question.d1.*` entries).
- D2-U1 — completely unchanged (`lesson.d2.risk-fundamentals` remains
  version 1).
- D2-U2 — completely unchanged from its Phase 9B-1 repaired state
  (`lesson.d2.risk-assessment-lifecycle` remains version 2, not bumped
  again).
- No entity promoted to `CANONICAL` — all Domain 2 content (and all prior
  content) remains `CANDIDATE`.
- D2-U5 and all later Domain 2 units — not started; Phase 9B-3 through
  9B-5 remain future, separately-gated batches.
- Persistence, authentication, analytics, AI-integration — none
  introduced.
- Answer-position (`app/src/content/answerOrder.ts`) and selection-engine
  (`app/src/content/selection.ts`) architecture — untouched; both new
  families inherit the existing domain-agnostic mechanisms automatically.
- `schema/example/` — untouched.
- BUG-001/002/003 — unchanged, still `todo`.
- CI architecture (`.github/workflows/ci.yml`) — untouched.

## Final validation results (this batch)

Legacy 111 pass / 3 expected `todo` · content-production 121/121 · Vitest
111/111 (selection-engine 14/14, answer-order 13/13) · TypeScript clean ·
production build succeeds · Playwright e2e 78/78 (Chromium + Firefox +
accessibility) · visual regression 32/32 · `npm audit --audit-level=moderate`
0 vulnerabilities. Total production-question count: 49 (12 Domain 2 + 34
Domain 1 + 3 Foundation). All 49 remain `CANDIDATE`; 0 `CANONICAL`.
