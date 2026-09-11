# Phase Gate Record — Domain 3, D3-U9 & D3-U10 (Final Domain 3 Batch)

**Status: [CANONICAL record of what happened]**. This is the durable record
of the fifth and final Domain 3 production authoring batch: D3-U9 (Program
Metrics & Reporting) and D3-U10 (Program Synthesis / Capstone), built per
the approved
[`DOMAIN-3-CURRICULUM-ARCHITECTURE.md`](DOMAIN-3-CURRICULUM-ARCHITECTURE.md)
and the Architect's D3-U9/U10 authoring directive. All new content remains
`CANDIDATE`. This record does not rewrite any historical Domain 1/2/D3-U1-U8
gate record.

## Architect review decision

Following Evidence-First review of the 14-panel review artifact
(`/Users/demetrius/Downloads/cism-domain3-u9-u10-review.png`, described
below under Evidence-first review), the Architect recorded:

- D3-U9 (Program Metrics & Reporting): **APPROVED**.
- D3-U10 (Program Synthesis / Capstone): **APPROVED**.
- Founder UAT: **WAIVED** under the Evidence-First UAT model.
- No curriculum rewrite or UX redesign was requested.
- D3-U9 confirmed to successfully teach: measurable activity is not
  automatically meaningful performance evidence; metrics should connect
  to program objectives; activity/output ≠ effectiveness/outcome;
  trend/context may matter more than an isolated count; reporting should
  fit the audience and decision; KPI/KRI/KCI/OKR should be understood by
  the management question each helps answer, not acronym-only
  memorization.
- D3-U10 confirmed to successfully synthesize Domain 3: the rendered
  Meridian capstone genuinely requires multiple concepts at once (the
  Aldergate dual-approval scenario combines implementation/integration,
  demonstrated effectiveness, metrics, reporting, and management
  judgment) and is not merely a recap.
- The final Domain 3 Aha is approved and must be preserved as a genuine
  reading/reasoning skill, not converted into a keyword/exam-hack
  shortcut: a real management situation rarely announces which
  security-program topic it belongs to; the learner must read the
  scenario, determine what has happened, identify the management
  problem, and apply the relevant reasoning.
- The Meridian/Aldergate progression across all ten units is approved as
  Domain 3's reference-for-comprehension story. This progression remains a
  conceptual learning relationship, never an official/canonical Domain 3
  lifecycle - no lifecycle/stage IDs were introduced at closeout.
- D3-U10's slightly greater density, relative to ordinary Domain 3 units,
  is explicitly accepted because it is the domain capstone; it was not
  shortened or rewritten for symmetry with ordinary units.
- Domain 3 curriculum is approved for closeout, pending successful
  CI/merge of this batch - see "Domain 3 completion status" below.

## Source coverage

- **D3-U9** grounded in 3A5 (Information Security Program Metrics, 23
  questions) and 3B6 (Information Security Program Communications and
  Reporting, 20 questions), combined per the approved architecture as two
  halves of one reasoning arc: metrics should be developed from security
  objectives, not residual risk/incident statistics alone; trends in
  incident frequency carry strategic value where isolated operational
  figures do not; the single most significant attribute of a good metric
  is that it is meaningful to its recipient; a quarterly executive report
  is best served by an overall trend, not a raw percentage or count; the
  percentage of control objectives accomplished is one of the best metrics
  for evaluating program results; a specific operational metric is most
  useful to the role that can act on it, not the board; the primary reason
  for metrics is to enable continuous improvement. One directly on-point
  source item explicitly distinguishes all four required measurement
  types together (KCIs = control performance only; KRIs = early warning of
  materializing risk, not overall effectiveness; OKRs = goal-setting, not
  performance insight; KPIs = comparison of expected vs. achieved
  performance, best for overall program effectiveness) — this is the item
  the unit's KPI/KRI/KCI/OKR reasoning is built on.
- **D3-U10** is a synthesis/capstone unit per
  `DOMAIN-3-CURRICULUM-ARCHITECTURE.md` §10 and does not introduce new
  source-grounded facts of its own; it recombines D3-U1 through D3-U9
  reasoning already source-grounded in their own gate records, mirroring
  the precedent set by D2-U10.

## Source-grounding transparency: KPI/KRI/KCI/OKR

Per the approved architecture's own gap note, `KPI`/`KRI`/`KCI`/`OKR` are a
CANONICAL, blueprint-mandated requirement that appear only a handful of
times in the raw Domain 3 source material (3/5/2/2 occurrences), not a
source-frequency-heavy area — reported here transparently, exactly as the
architecture instructed, rather than claimed as strongly source-supported.
The concept's phrasing follows `docs/learning/CONFUSING-CONCEPTS.md`'s own
existing `[CANDIDATE]` KPI-vs-KRI-vs-KCI-vs-OKR entry rather than inventing
new definitions. These four terms are taught as concise, decision-relevant
distinctions (which question they each answer) rather than a vocabulary
memorization drill — enforced by an automated test requiring the correct
answer's rationale to reason about what the measurement type actually
shows, not merely name it.

## Unit learning outcomes

- **D3-U9**: a metric is useful when it connects to the program's own
  objectives and is reported as a trend, not merely because it is easy to
  count; different audiences need different information (the board needs
  decision-relevant business/risk information, not raw operational
  detail); KPI/KRI/KCI/OKR answer different questions and are not
  interchangeable.
- **D3-U10**: an information security program is not any single artifact
  it produces (policy, control catalog, technology stack, training
  course, vendor contract, metrics dashboard) — it is the coordinated
  management capability connecting all of them to a measured,
  business-aligned outcome. Recognizing which combination of prior
  reasoning targets a real, unlabeled management situation is actually
  raising matters more than knowing any one piece in isolation.

## Meridian Manufacturing story progression

D3-U9 continues directly from D3-U8: Meridian's steering committee asks
for the program's first full-cycle report, and the information security
manager chooses the trend in control-objective attainment over easier-to
produce activity counts (controls deployed, training completion, patches
applied). D3-U10 revisits the Aldergate dual-approval payment control one
final time: full apparent compliance (100% of payments logged with two
approvals) sits alongside an unimproved near-miss trend, requiring the
learner to connect the control's original integration, its effectiveness
test, and this quarter's metric into one answer — the domain's central
Aha, revisited at capstone scale. This is the story's strongest payoff:
every fact in the capstone scenario traces back to a decision made in an
earlier unit.

## D3-U9 family / question

| Concept | Family | Variants |
|---|---|---|
| `concept.d3.program-metrics-reporting` | `family.d3.program-metrics-reporting` | `question.d3.0026` (Meridian anchor — trend vs. activity counts), `question.d3.0027` (hospital transfer — KPI vs. KRI/gap-analysis/incident-stats), `question.d3.0028` (regional-bank transfer — routing operational vs. strategic reports to the right audience) |

## D3-U10 family / question (capstone)

| Concept | Family | Variants |
|---|---|---|
| `concept.d3.program-synthesis` (+ 2-3 integrated prior D3 concepts per variant) | `family.d3.program-synthesis` | `question.d3.0032` (Meridian anchor — integrates control-implementation-integration, control-testing-evaluation, program-metrics-reporting), `question.d3.0033` (hospital transfer — integrates external-services-accountability, asset-classification, program-metrics-reporting), `question.d3.0034` (university transfer — integrates awareness-training-effectiveness, program-metrics-reporting) |

**Capstone architecture decision**: one synthesis family with three
meaningfully different integrated scenarios (approach A from the
Architect's brief), mirroring `family.d2.risk-management-synthesis`
exactly — not nine separate one-per-unit checkpoints. Each variant's own
`concepts` array lists `concept.d3.program-synthesis` plus every other
Domain 3 concept it genuinely integrates (2-3 per variant, verified by an
automated test requiring at least two beyond the synthesis concept
itself), and each variant's own `patterns` array tags only that variant's
single most-salient pattern (P07, P02, or P11 respectively) rather than
every pattern in play — exactly mirroring the D2-U10 precedent. 6 new
questions total (3 + 3), 2 new concepts, 2 new families, 2 new lessons —
all `CANDIDATE`, `unverified`. Domain 3 now totals 10 units (U1–U10), 34
new questions, 10 concepts, 10 families, 10 lessons since Domain 3 began.

## Capstone integration depth

Every D3-U10 variant integrates at least 3 concepts total (the synthesis
concept plus 2 others): the Meridian variant connects control integration,
control-testing effectiveness, and metrics reporting; the hospital variant
connects external-services accountability, asset classification, and
reporting; the university variant connects awareness/training
effectiveness and reporting. No variant is answerable from only one prior
unit's lens — each correct rationale explicitly addresses more than one
integrated fact, and each wrong option represents answering from only one
lens (integration alone, accountability alone, activity alone) when the
scenario's combined facts require more.

## Capstone transfer design

Exactly one variant (`question.d3.0032`) continues Meridian Manufacturing;
the other two transfer to a hospital (`question.d3.0033`) and a university
(`question.d3.0034`), per the binding reference-for-comprehension-plus-
varied-scenarios-for-transfer rule. A same-session, no-reload revisit to
D3-U10's Apply screen was verified live to rotate from the Meridian anchor
to the hospital sibling variant, confirming genuine transfer beyond the
recurring story (captured as evidence item 11).

## Cross-domain reinforcement

- D3-U9 reuses Pattern P07 (Implementation ≠ Effectiveness, Domain 3's own
  load-bearing pattern since D3-U6) applied to metric selection, and
  Pattern P11 (Audience-Appropriate Communication) — Domain 3's first use
  of a pattern established in Domain 2's `concept.d2.risk-monitoring-reporting`.
- D3-U10 reuses P07, P02 (Authority Follows Accountability, from Domain 1
  via D3-U8), and P11 across its three variants — no new pattern invented
  for the capstone, confirmed by an automated test restricting
  `concept.d3.program-synthesis.related_patterns` to these three.
- D3-U10's single prerequisite edge (D3-U9) transitively reaches all eight
  prior D3 families (U1–U8), confirmed programmatically via the same
  `ancestorFamilies` traversal the test suite uses — D3-U4's own two
  prerequisite branches (D3-U2, D3-U3) already merge back into one chain
  by D3-U5, so Domain 3's dependency graph is fully connected by the time
  D3-U9/U10 are reached.

## Invented-lifecycle audit

No canonical Domain 3 lifecycle is introduced. Both new families and all 6
new questions declare `lifecycle: null` and `stage: null`/`stage_target:
null`. The capstone's Learn narrative uses only
`docs/learning/LIFECYCLE-MODEL.md`'s approved, non-canonical Domain 3
conceptual relationship ("strategy → program → controls →
measurement/improvement") as its connective thread — the more granular
nine-part narrative sequence named in the Architect's own directive was
used only as informal scenario-planning shorthand during authoring, never
elevated into the learner-facing content as a second conceptual model or
tested as a stage-location question. All qualifiers in this batch are
BEST/MOST only; no NEXT was introduced (automated test), consistent with
D3-U9/U10 raising no genuine source-grounded sequencing need comparable to
D3-U8's.

**Correction made during authoring**: the capstone lesson's `context`
field initially cited explicit unit labels ("(D3-U5)", "(D3-U6)", etc.)
narrating which unit each fact came from. Per the Architect's explicit
capstone-design instruction to avoid unit labels in the capstone's own
learning/assessment experience (so it reads as one integrated story, not a
labeled recap), this was rewritten to remove the labels while preserving
the same integrated meaning. This does not apply to ordinary D3 lessons
(D3-U6/U7/U9 legitimately cross-reference prior unit labels as connective
tissue, an established, already-approved pattern) — only to the capstone,
per its own distinct instruction. An automated test now enforces this
specifically for `lesson.d3.program-synthesis`.

## Distractor-quality / qualifier / role-authority review

- D3-U9 distractors avoid the explicitly-flagged strawmen (no "executives
  always want dashboards," no acronym-only recall, no length tells):
  activity/output counts, an isolated figure without trend, a
  plausible-but-wrong measurement type (KRI/gap-analysis offered where a
  KPI question is being asked), and a reversed-audience routing trap.
- D3-U10 distractors represent answering from only one integrated lens:
  citing a compliance figure as effectiveness (ignores the still-open
  effectiveness question), blaming only the vendor (ignores the
  enterprise's own accountability), focusing only on the classification
  gap (ignores the vendor failure), and misclassifying an awareness metric
  as a security incident.
- No repair-target misuse: all incorrect options across both families
  route through generic, domain-agnostic repair categories
  (`repair.knowledge-gap`, `repair.business-context-error`,
  `repair.decision-error`, `repair.vocabulary-error`,
  `repair.technical-vs-management-error`) — confirmed both by inspection
  and by rendering the actual Repair screens during evidence capture.
- `role_target` is `null` on both new families because the tempting
  wrong-basis distractor shape varies by variant; no question in this
  batch sets `primary_role`.

## Answer-length bias (self-caught and fixed during authoring)

The project's own `variation-quality.test.mjs` length-bias detector
correctly flagged that the correct option was the longest option in all 3
variants of both new families — a systematic answer-length tell. This was
caught before evidence capture: one distractor's wording was lengthened
(without changing its meaning) in one variant of each family
(`question.d3.0027` and `question.d3.0032`) so the correct option is no
longer the longest in every variant of either family.

## CANDIDATE status confirmation

All 2 concepts, 2 families, 2 lessons, and 6 questions are `content_status:
"CANDIDATE"`, `verification_status: "unverified"`. No entity in this
batch, or in Domain 3 so far, is `CANONICAL`.

## Production integration

Domain 3 U9/U10 content integrates through the exact same structures every
prior domain/unit uses. **Zero learning-mode code was modified**:
`explore.ts`, `practice.ts`, `reinforcement.ts`, `QuestionAttemptFlow.tsx`,
`selection.ts`, and `answerOrder.ts` are byte-for-byte unchanged.
`app/src/App.tsx`'s dev-only QA review-lesson list gained two entries
(D3-U9, D3-U10 labels). Two pre-existing content-production tests were
narrowed rather than removed, mirroring the exact precedent from every
prior batch transition: `domain3-u7-u8.test.mjs`'s own "no unit beyond
U1-U8" batch-boundary guard is superseded now that D3-U9/U10 legitimately
exist; `family-integrity.test.mjs`'s expected-active-variant-count map
gained the two new families. Neither change is a net-new test, and no
existing assertion was weakened.

## Daily Study / Explore / Practice / Reinforcement discovery

Verified directly in a real rendered browser session (not inference); see
`/Users/demetrius/Downloads/cism-domain3-u9-u10-review.png` for the
composed evidence contact sheet (14 screenshots).

- **Daily Study**: selecting D3-U9 or D3-U10 via the QA review-lesson
  panel renders a full, correct Recall → Learn → Apply → Feedback → Repair
  flow. A same-session revisit to D3-U10 correctly rotates to the hospital
  transfer sibling.
- **Explore**: "Security Program" now lists all ten Domain 3 concepts,
  including both new ones, with zero code changes to `explore.ts`.
- **Practice**: "Security Program" continues to appear as a complete-Domain-3
  scope option, with zero code changes to `practice.ts`.
- **Reinforcement**: unchanged, generic architecture; not separately
  exercised (structurally unaffected, domain-agnostic).

## Evidence-first review

One continuous, real-browser walkthrough (D3-U9 Recall → Learn → Apply →
incorrect Feedback → Repair, then D3-U10 Recall → Learn → Apply →
incorrect Feedback → Repair, then a same-session revisit confirming
sibling/transfer rotation, then Explore, then Practice, then a mobile Apply
screen) was captured as 14 screenshots and composed into one local contact
sheet for Architect review — not committed, not published:
`/Users/demetrius/Downloads/cism-domain3-u9-u10-review.png`

One benign, pre-existing dev-tool rendering note observed during capture:
on the mobile viewport, the floating dev-only "Prototype" switcher-trigger
badge visually overlaps the bottom of an unusually long capstone question
(4 lengthy options). This badge is QA-only tooling (the trigger for
`PrototypeSwitcher`), not part of the real learner experience, and its
fixed positioning is pre-existing, shared dev-tool behavior unrelated to
this batch's content — not a defect requiring a fix, and out of scope
(modifying shared dev-tool UI is not this batch's authorization).

## Deferred / not touched

Domain 4; D3-U11+ (no further Domain 3 units are planned for the current
MVP boundary); learning-mode architecture; `selection.ts`/`answerOrder.ts`;
persistence; confidence adaptation; Adaptive Reinforcement; BUG-001/002/003
(all still correctly `Open`, untouched); Foundation/Domain 1/Domain 2
production curriculum (byte-for-byte unchanged); D3-U1 through D3-U8
(byte-for-byte unchanged aside from the single superseded batch-boundary
assertion in `domain3-u7-u8.test.mjs`, itself not a content change).

## Domain 3 completion status

Architect review of D3-U9/U10 is complete and both units are **APPROVED**
(see "Architect review decision" above). **Domain 3 is approved for
closeout pending successful CI and merge of this batch.** Once merged with
green CI on the actual `main` merge commit, Domain 3 is complete for the
current MVP curriculum boundary (D3-U1 through D3-U10), and D3-U1 through
D3-U8 should not be reopened for polish absent a defect that teaches
incorrect reasoning, breaks functionality, exposes a shared architectural
failure, or violates source/schema integrity, per the Architect's binding
instruction.

## Validation

Content-production 319/319 (previously 294, minus the one superseded
batch-boundary assertion, plus 26 new tests in `domain3-u9-u10.test.mjs`,
and `family-integrity.test.mjs`'s variant-count map gaining two entries);
legacy `tests/data-integrity`+`tests/data-model` 111/0/3-todo, unchanged
(BUG-001/002/003, unchanged); Vitest 200/200 (unchanged); TypeScript
clean; production build succeeds; Chromium 43/43 and Firefox 43/43
e2e/accessibility (unchanged — no new e2e specs); visual regression 32/32
unchanged (no CSS/markup changed, no baseline updated); `npm audit
--audit-level=moderate` 0 vulnerabilities. The ad hoc, non-canonical `node
--test tests/` (whole-directory-argument) invocation was not re-tested
this batch; it is a known, previously-confirmed local Node v26.5.1 quirk
unrelated to content, not reproduced under CI's actual Node 20 +
per-directory invocation.
