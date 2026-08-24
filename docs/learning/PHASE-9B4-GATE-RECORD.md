# Phase 9B-4 Gate Record — D2-U7 (Residual Risk & Acceptability) and D2-U8 (Risk Owner vs. Control Owner)

**Status: [CANONICAL record of what happened; the curriculum content it
describes is CANDIDATE, not canonical]**. This is the durable record of
Phase 9B-4 — the fourth Domain 2 production-content implementation batch,
built per the approved Phase 9A architecture
([`DOMAIN-2-BLUEPRINT.md`](DOMAIN-2-BLUEPRINT.md)) — following Phase
9B-3's merge ([`PHASE-9B3-GATE-RECORD.md`](PHASE-9B3-GATE-RECORD.md)). It
records outcomes, founder-reported feedback, and two architectural
decisions the founder made during this gate — not implementation
narrative.

## Scope

D2-U7 (Residual Risk & Acceptability) and D2-U8 (Risk Owner vs. Control
Owner) only, per the approved Phase 9B-4 batch — the fourth of five
implementation batches (9B-1 through 9B-5) in the approved Domain 2
sequence. No D2-U9 or D2-U10 was authored. New production content: 2
concepts, 2 lessons, 2 families, 6 questions — all `CANDIDATE`.

## Implementation

- `concept.d2.residual-risk-acceptability` / `lesson.d2.residual-risk-acceptability`
  / `family.d2.residual-risk-acceptability` (3 variants:
  `question.d2.0020`–`0022`) — Inherent vs. Residual Risk, sequencing
  residual-risk determination before the acceptability decision, and
  authority for that decision following accountability rather than
  whoever implemented the treatment. Continues the D2-U5/U6
  payment-system scenario into treatment's aftermath.
- `concept.d2.risk-control-ownership` / `lesson.d2.risk-control-ownership`
  / `family.d2.risk-control-ownership` (3 variants: `question.d2.0023`–
  `0025`) — Risk Owner vs. Control Owner via ROLE + VERB + CONTEXT, with
  one AI-system scenario used only as scenario variety (per the approved
  Phase 9A AI/emerging-risk treatment), never as AI-governance content.
- Prerequisite/recall architecture: D2-U8's prerequisite is D2-U1 only (a
  parallel branch, per the approved blueprint). D2-U7's prerequisites are
  `["lesson.d2.risk-control-ownership", "lesson.d2.risk-treatment-response"]`
  — D2-U8 listed first realizes the approved non-adjacent "U7 recalls U8"
  edge using the same mechanism already proven for Domain 1's "U8 recalls
  U1" edge (Phase 7B-3); D2-U6 listed second preserves the full cumulative
  U1–U6 recall chain. This was verified two ways before being accepted:
  a unit test replicating the recall-resolution algorithm exactly, and a
  live Playwright session confirming D2-U7's actual rendered Recall screen
  shows the D2-U8 AI-control-ownership question. No prerequisite cycle and
  no taught-before-tested conflict were found — see the Phase 9B-4
  implementation report for the full reasoning.
- Regression coverage added in `tests/content-production/domain2-u7-u8.test.mjs`
  (26 tests); two stale batch-boundary assertions in the Phase 9B-3 test
  file (`domain2-u5-u6.test.mjs`) were updated, since they had asserted "no
  Domain 2 unit beyond U1-U6 exists" as a Phase-9B-3-specific guard that
  Phase 9B-4 legitimately supersedes.

## Founder Human Experience Gate

**Result: PASS for both units.**

Founder-reported feedback, verbatim:

> "I love the payment system story and now each phase ties into this
> story to provide a full picture. This is what I mean regarding
> referencing something when learning about a topic."

> "This section was the section I was very weak on; but the way that I
> am being taught is very comprehensive and a section combining
> everything together to get a full picture would help."

Regarding D2-U8 specifically:

> "The last question for the lesson reminds me of a CISM exam and
> paying attention to the words and questions."

Overall:

> "Great lessons and I felt the Aha! moment with each lesson."

Recorded as the founder's reported subjective experience — Claude Code did
not and cannot independently verify a human's subjective learning
experience. The Aha moment is confirmed for both D2-U7 and D2-U8 as
founder-reported, not independently verified.

**No modification was made to D2-U7 or D2-U8 production content during
this closeout.** Both units passed and remain stable; the founder's
feedback prompted two forward-looking architectural decisions (recorded
below) rather than any change to the content that just passed.

## Architectural Decision 1 — Domain 2 synthesis (approved, deferred to Phase 9B-5)

The founder's feedback that the recurring payment-system story "provides a
full picture" and that Domain 2 (a personally weak area) benefited
specifically from "a section combining everything together" is approved
as a requirement for **D2-U10 (Embedding Risk Management Into the
Business)** — already the closing/integrative unit in the approved Phase
9A architecture, not a new unit.

**Not implemented this phase.** This requirement is recorded here and in
`DOMAIN-2-BLUEPRINT.md` (see below) for Phase 9B-5 to implement.

Approved shape, exactly as directed:

- The recurring payment-system scenario is the **primary reference model**
  for the synthesis, since the founder specifically identified the
  recurring story as what made the lifecycle understandable.
- The synthesis connects, at minimum: business context → threat/
  vulnerability/business impact → Context → Identify → Analyze → Evaluate
  → qualitative vs. quantitative method selection → appetite/tolerance →
  treatment/response → residual risk → acceptability → Risk Owner vs.
  Control Owner → monitoring/reassessment/reporting → embedding risk
  management into business decision-making.
- **Binding pedagogical rule, recorded verbatim:** *reference story for
  comprehension + varied scenarios for transfer.* The payment-system story
  builds the mental model; it must never become the only scenario used
  throughout the curriculum — other scenarios continue testing whether the
  learner can transfer the reasoning to unfamiliar contexts.
- U10 synthesizes; it does not unnecessarily reteach every prior lesson,
  and it is explicitly not a long recap lecture or a list of definitions.
  The target Aha is: *"Now I can see the entire risk-management picture
  I've been building piece by piece."*

## Architectural Decision 2 — Foundation CISM-question-interpretation enhancement (approved as a future targeted enhancement, not implemented)

Triggered specifically by the D2-U8 experience — the founder reported that
the closing question "reminds me of a CISM exam and paying attention to
the words and questions." This is approved as a **future, separately
bounded** enhancement to Foundation's question-interpretation teaching.

**Not implemented this phase. Foundation production content was not
modified.** Before any future implementation, this enhancement requires
its own bounded implementation/review step — it is recorded here as an
approved direction only.

Exact learner reasoning model approved for that future work:

1. What is the question actually asking me to decide?
2. Who am I in this scenario? (Board, management, information security
   manager, risk owner, control owner, other relevant roles.)
3. What VERB matters? (recommend, approve, implement, validate, monitor,
   assess.)
4. Where am I in the lifecycle? — Ask: "What has already happened?"
5. What does the qualifier change? (FIRST, NEXT, BEST, MOST, PRIMARY.)
6. Which answer fits the CISM management/governance perspective, rather
   than simply being the most technical or immediately actionable answer?

**Critical guardrail, recorded verbatim:** this must **not** become a
collection of exam hacks such as "when you see FIRST, always choose X."
Qualifiers are contextual; the enhancement teaches reasoning, not shortcut
memorization. A future implementation may use tightly controlled paired
scenarios where one important word or lifecycle condition changes so the
learner experiences *why* the correct decision changes — those paired
questions are not implemented now.

## Architectural Decision 3 — Domain synthesis / capstone principle for all remaining domains (approved, addendum to this same gate)

Following on directly from Decision 1, the founder generalized the D2-U10
synthesis requirement into a durable, cross-domain architectural
requirement, in these words:

> "For the next domains, I would like a lesson bringing everything
> together as well. I am not sure how Claude is building this, but it can
> run a little differently from the other lessons; yet straight to the
> point."

**Approved interpretation and scope:** each remaining CISM domain's
curriculum should end with a concise domain synthesis (capstone)
experience connecting that domain's individual lessons into one complete
mental model. This applies at minimum to **Domain 2, Domain 3, and Domain
4**. **Domain 1 does not require a retrofit** during the current build
merely for symmetry — the founder already understands Domain 1 well; a
Domain 1 synthesis may be considered later only if reinforcement/
final-readiness evidence shows it would add real learner value.

**Not implemented this phase.** This is a documentation-only addendum;
see [`CURRICULUM-BLUEPRINT.md`](CURRICULUM-BLUEPRINT.md#domain-synthesis--capstone-principle)
for the full, durable, general principle (purpose, no-major-new-content
guardrail, per-domain reference-model selection, the binding reference-
for-comprehension-plus-varied-scenarios-for-transfer rule, the allowed
different synthesis flow, decision-checkpoint examples, and the
relationship to the future Foundation enhancement), and
[`DOMAIN-2-BLUEPRINT.md`](DOMAIN-2-BLUEPRINT.md#d2-u10-synthesis-requirement-approved--phase-9b-4-founder-decision-strengthened-same-phase-for-phase-9b-5)
for D2-U10's concrete instance — now explicitly confirmed as both its
original Phase 9A purpose (embedding risk management into business
process) and the final Domain 2 synthesis/capstone experience.

**Domain 3 and Domain 4 requirement, recorded for their own future
architecture phases:** each must define, during its own architecture
phase (not retrofitted from Domain 2's specifics): its own reference model
selected from that domain's actual source material and reasoning (not the
payment-system scenario forced in); its own synthesis/capstone unit; the
whole-domain mental model it connects; which concepts must connect;
integrated reasoning checkpoints; and concise-but-fruitful delivery —
without assuming the same unit count, scenario structure, or lesson length
as Domain 2 or each other.

## Reference-based learning principle (recorded, general)

The broader pedagogical lesson from this gate, generalized beyond Domain
2: when a concept is abstract or lifecycle-oriented, a continuous concrete
reference scenario can establish the learner's mental anchor. The
preferred shape is:

```
Concrete reference → explain the concept → reason through it
→ vary the scenario → test transfer
```

rather than:

```
Abstract definition → memorize → test
```

This does **not** mean every lesson requires a recurring story — use a
reference scenario only when it materially improves comprehension, and
lessons must remain concise and straight to the point. This principle was
already applied ad hoc starting at D2-U2 (the Phase 9B-1 scenario-anchor
finding) and is now confirmed by direct founder feedback as a validated,
generalizable design choice, not merely a local fix.

## Explicitly deferred / unchanged by this phase

- Domain 1 — completely unchanged.
- D2-U1 through D2-U6 — completely unchanged.
- No entity promoted to `CANONICAL` — all Domain 2 content (and all prior
  content) remains `CANDIDATE`.
- D2-U9 and D2-U10 — not started; D2-U10's synthesis requirement is
  recorded for Phase 9B-5, but not implemented.
- Foundation production content — not modified; the question-interpretation
  enhancement is recorded as a future, separately-bounded target only.
- Persistence, authentication, analytics, AI-integration — none
  introduced.
- Answer-position (`app/src/content/answerOrder.ts`) and selection-engine
  (`app/src/content/selection.ts`) architecture — untouched.
- `schema/example/` — untouched.
- BUG-001/002/003 — unchanged, still `todo`.
- CI architecture (`.github/workflows/ci.yml`) — untouched.

## Final validation results (this batch)

Legacy 111 pass / 3 expected `todo` · content-production 169/169 · Vitest
112/112 (selection-engine 14/14, answer-order 16/16) · TypeScript clean ·
production build succeeds · Playwright e2e 78/78 (Chromium + Firefox +
accessibility) · visual regression 32/32 · `npm audit --audit-level=moderate`
0 vulnerabilities. Total production-question count: 61 (24 Domain 2 + 34
Domain 1 + 3 Foundation). All remain `CANDIDATE`; 0 `CANONICAL`.
