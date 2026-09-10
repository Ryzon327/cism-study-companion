# Phase Gate Record — Domain 3, D3-U1 & D3-U2

**Status: [CANONICAL record of what happened]**. This is the durable record
of the first Domain 3 production authoring batch: D3-U1 (Program
Foundations: Strategy to Program) and D3-U2 (Asset Identification &
Classification), built per the approved
[`DOMAIN-3-CURRICULUM-ARCHITECTURE.md`](DOMAIN-3-CURRICULUM-ARCHITECTURE.md)
and the Architect's D3-U1/U2 authoring directive. All new content remains
`CANDIDATE`. This record does not rewrite any historical Domain 1/2 gate
record.

## Source coverage

- **D3-U1** grounded in the supplied `tools/input/domain-3.txt`'s
  Knowledge-Statement 3A1 (Information Security Program Resources) —
  specifically its genuinely program/strategy-level questions (program
  development beginning from management's desired outcomes; the BEST
  business-value justification for program investment; the BEST response
  to reduced program funding). The majority of 3A1-tagged questions in the
  raw source are deeply technical and mistagged (PKI, biometrics, WLAN,
  vulnerability scanning, etc.) — these were reviewed and deliberately
  excluded, per the explicit instruction not to reduce U1 to resource
  budgeting or technical architecture.
- **D3-U2** grounded in 3A2 (Information Asset Identification and
  Classification), a cleanly-tagged area: classification based on
  criticality/sensitivity, not cost; the information owner (not the
  custodian) determines classification; an incomplete asset catalog is the
  GREATEST challenge to risk-prioritization.

## Unit learning goals

- **D3-U1**: distinguish an information security program (coordinated
  execution of approved strategy) from strategy itself and from any single
  technical implementation; program resources/priorities trace back to
  approved business/security objectives.
- **D3-U2**: identification and classification (by business criticality/
  sensitivity) are prerequisites to informed protection decisions;
  classification accountability rests with the business owner, not the
  technical custodian; acquired/new assets are not exempt.

## Meridian Manufacturing story progression

Meridian Manufacturing's acquisition of Aldergate Fabrication is the
approved recurring reference story. D3-U1 anchors on the integration
team's premature "deploy our standard tool suite" instinct, resolved by
tracing the decision back to the integration's own approved business
objectives. D3-U2 continues directly: Aldergate's unclassified assets (a
quality-control database, an inventory system, shop-floor equipment) and a
long-tenured technician's offer to self-assign classification, resolved by
separating technical familiarity from business accountability. The story
remains business-centered throughout — no OT/ICS, network-engineering, or
technical-configuration content anywhere in either unit (verified by an
automated forbidden-term test).

## Families / questions authored

| Unit | Concept | Family | Variants |
|---|---|---|---|
| D3-U1 | `concept.d3.program-foundations` | `family.d3.program-foundations` | `question.d3.0002` (Meridian anchor), `question.d3.0003` (financial-services board-funding transfer), `question.d3.0004` (logistics-company budget-cut transfer) |
| D3-U2 | `concept.d3.asset-classification` | `family.d3.asset-classification` | `question.d3.0005` (Meridian anchor), `question.d3.0006` (hospital-network transfer), `question.d3.0007` (financial-services transfer) |

6 new questions total, 2 new concepts, 2 new families, 2 new lessons — all
`CANDIDATE`, `unverified`.

## Cross-domain reinforcement

- D3-U1 lightly recalls Domain 1's business-alignment pattern (P01) —
  program priorities trace to approved objectives, the same "don't act
  before the justification exists" reasoning D1's roadmap sequencing
  already teaches.
- D3-U2 recalls `concept.d1.data-ownership` (asserted present and
  unmodified by an automated test) through the lesson's own
  prerequisite/recall chain — never by sharing or reusing its concept id.
  `concept.d3.asset-classification` is its own, distinctly-scoped Domain 3
  identity (`home_domain: "domain.d3"`), per the BUG-001 cross-domain
  identity safety note below.

## BUG-001 cross-domain identity safety

`concept.d1.policy-artifact-hierarchy` already exists in Domain 1
production content — the exact concept BUG-001's historical legacy-
architecture defect describes ("Policy hierarchy" spanning two domains
under one shared identity). Neither D3-U1 nor D3-U2 touches policy-
hierarchy content (that is D3-U3's future scope, explicitly not authored
here). `concept.d3.asset-classification` was deliberately authored under
its own id, distinct from `concept.d1.data-ownership`, with the connection
to Domain 1 expressed only through the recall graph. An automated test
(`domain3-u1-u2.test.mjs`) asserts no Domain 3 entity in this batch reuses
a Domain 1 concept id.

## Invented-lifecycle audit

Domain 3 has no canonical lifecycle — `LIFECYCLE-MODEL.md` explicitly
withdrew an earlier Domain 1/3 staged-lifecycle draft at Phase 2 review.
Both new families and all 6 new questions declare `lifecycle: null` and
`stage: null` (or `stage_target: null`), verified by an automated test. The
`strategy → program → controls → measurement/improvement` conceptual
relationship is used only as loose narrative sequencing in D3-U1's
Learn content — never as a taught/tested stage-location exercise, never
numbered, and no `NEXT`-qualifier machinery was introduced (Domain 3's
source shows NEXT as essentially absent, matching the approved
architecture's finding).

## Distractor-quality / qualifier / role-authority review

- Distractors avoid "buy a tool" strawmen, "board is always right"
  shortcuts, longest-answer giveaways, and vocabulary matching — each
  wrong option represents a genuine, source-evidenced CISM reasoning trap
  (technology-first deployment, passive deferral, informal continuation,
  single-benefit justification, uniform-cut/risk-acceptance-as-default,
  technical-proximity-as-authority, cost-as-classification-basis,
  tool-first-fix). An automated length-bias check confirms no family has
  the correct option as the strict-longest option in 100% of its variants
  (D3-U1: 2/3; D3-U2: 2/3).
- Qualifiers used: FIRST (1), BEST (4), GREATEST (1) — all source-supported
  per the approved architecture's qualifier-frequency finding; `NEXT` is
  not used anywhere in this batch (automated test).
- Roles: `role.security-manager`, `role.board-senior-management`,
  `role.data-owner`, `role.custodian-it-operations`,
  `role.business-process-owner` — all drawn from the existing CANONICAL
  role vocabulary; `primary_role` set only where a specific role is the
  correct answer's accountable party (D3-U2's `question.d3.0005`:
  `role.data-owner`), left `null` where the reasoning target is basis-based
  rather than role-based (`question.d3.0006`, `question.d3.0007`).

## Real defect found and fixed during evidence-first review

`question.d3.0005`'s technician/custodian wrong option originally used
`repair_target: "repair.role-error"`. That repair target's static content
in `productionContentSource.ts` is hardcoded to a specific, unrelated
Domain 1 scenario ("Internal Audit can decide whether to accept a business
risk..."), not a generic role-confusion template — reusing it here produced
a jarring, disconnected Repair screen with no continuity to the actual
mistake (a technician assuming classification authority). Caught by
rendering the actual Repair screen during evidence capture, not by
inspection alone. **Fixed** by changing the option's `repair_target` to
`repair.knowledge-gap`, which routes through the shared, domain-agnostic
near-transfer repair builder (`buildAppliedConceptRepair`) — confirmed by
re-rendering: the Repair screen now correctly draws a sibling variant from
`family.d3.asset-classification` itself (the hospital-network classification
question), properly contextualized to the actual mistake. No other
`repair.role-error` usage exists in this batch.

## CANDIDATE status confirmation

All 2 concepts, 2 families, 2 lessons, and 6 questions are `content_status:
"CANDIDATE"`, `verification_status: "unverified"`, carrying a `note` field
documenting CANDIDATE/authorship status — enforced by the existing,
domain-agnostic `status-governance.test.mjs` and `provenance.test.mjs`
suites. No entity in this batch is `CANONICAL`.

## Production integration

Domain 3 content integrates through the exact same structures every prior
domain uses — `content/production/{concepts,families,lessons,questions}.json`
loaded by `app/src/content/registry.ts`, resolved by `resolve.ts`, served by
`productionContentSource.ts`. **Zero learning-mode code was modified** to
support Domain 3: `explore.ts`, `practice.ts`, `reinforcement.ts`,
`QuestionAttemptFlow.tsx`, `selection.ts`, and `answerOrder.ts` are
byte-for-byte unchanged. `app/src/App.tsx`'s dev-only QA "today's lesson"
review-lesson list gained two entries (D3-U1, D3-U2 labels) — the same
one-line-per-lesson data addition every prior domain's authoring batch made
to that list; not learning-mode logic.

Two pre-existing Vitest snapshot assertions (`explore.test.ts`,
`practice.test.ts`) explicitly asserted Domain 3 was *not yet* discoverable
— now that it legitimately exists, both were updated to assert Domain 3 *is*
discoverable while Domain 4 still is not, with an explanatory comment. This
is the intended, healthy proof that both modes are genuinely data-driven,
not a defect. Similarly, `domain2-u9-u10.test.mjs`'s "no Domain 3+ leakage"
guard was narrowed to "no Domain 4+ leakage," mirroring the exact precedent
`domain2-u1-u2.test.mjs` itself documents for its own superseded Domain-2
batch-boundary guard.

## Daily Study / Explore / Practice / Reinforcement discovery

Verified directly in a real rendered browser session (not inference):

- **Daily Study**: selecting either D3 lesson via the QA review-lesson
  panel renders a full, correct Recall → Learn → Apply → Feedback → Repair
  flow with Meridian Manufacturing content, exactly like every prior
  domain.
- **Explore**: "Security Program" appears as a real domain with both new
  concepts listed, with zero code changes to `explore.ts`.
- **Practice**: "Security Program" appears as a real scope option
  alongside Foundation/Governance/Risk Management, with zero code changes
  to `practice.ts`.
- **Reinforcement**: unchanged, generic architecture — not exercised by
  this batch's evidence capture (no Daily Study "missed" completion path
  was walked), but structurally unaffected since it operates purely on
  exposure history and family/variant resolution, both domain-agnostic.

## Evidence-first review

One continuous, real-browser walkthrough (D3-U1 Recall → Learn → Apply →
incorrect Feedback → Repair, then D3-U2 Recall → Learn → Apply → incorrect
Feedback → Repair, then Explore, then Practice, then a mobile Apply screen)
was captured as 13 screenshots and composed into one local contact sheet
for Architect review — not committed, not published:
`/Users/demetrius/Downloads/cism-domain3-u1-u2-review.png`

## Deferred / not touched

D3-U3 through D3-U10 (not authored this batch); Domain 4; learning-mode
architecture (Explore/Practice/Reinforcement/shared Repair — all closed per
Phase 10B-5); `selection.ts`/`answerOrder.ts`; persistence; confidence
adaptation; Adaptive Reinforcement; BUG-001/002/003 (all still correctly
`Open`, untouched); Foundation/Domain 1/Domain 2 production curriculum
(byte-for-byte unchanged, confirmed via diff and via full historical Domain
1/2 test suites still passing unmodified).

## Validation

Legacy 111 pass / 3 expected-todo (BUG-001/002/003, unchanged);
content-production 216/216 (195 pre-existing + 21 new tests in
`domain3-u1-u2.test.mjs`; one pre-existing `domain2-u9-u10.test.mjs` test
was narrowed from a "no Domain 3+" to a "no Domain 4+" leakage guard, and
`family-integrity.test.mjs`'s expected-variant-count map gained the two new
families — neither is a net-new test); Vitest 200/200 (198 pre-existing + 2
updated Domain-3-discoverability assertions in `explore.test.ts`/
`practice.test.ts`); TypeScript clean; build succeeds; Chromium + Firefox
e2e/accessibility 86/86; visual regression 32/32 unchanged (no CSS/markup
changed); `npm audit --audit-level=moderate` 0 vulnerabilities.
