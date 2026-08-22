# Phase 9A Gate Record — Domain 2 Curriculum Architecture and Source-Coverage Analysis

**Status: [CANONICAL record of what happened; the curriculum architecture it
describes is CANDIDATE, not canonical]**. This is the durable record of
Phase 9A — a planning-and-architecture-only phase, following the Domain 1
closeout recorded in [`PHASE-8B-GATE-RECORD.md`](PHASE-8B-GATE-RECORD.md).
No Domain 2 production content (lesson, concept, family, or question) was
authored during this phase, across either of its two turns. It records
outcomes and the founder's architectural decisions as reported by the
founder, not claims independently verified by Claude Code — Claude Code
analyzed the source material and proposed the architecture; the founder
reviewed and decided.

## Scope

Explicitly planning/architecture only, per direct instruction: analyze the
supplied Domain 2 source material (`tools/input/domain-2.txt`), the existing
Domain 1 architecture, and the pre-existing CANONICAL Domain 2 blueprint
stub (fundamental question, risk lifecycle, core concepts, quantitative
risk, patterns, roles — all specified directly in the Phase 2 architectural
discussion), and produce a proposed Domain 2 unit architecture, prerequisite
graph, recall graph, cross-domain recall design, question-family plan,
distractor-quality requirements, and implementation sequence for founder/
architect review. Nothing in this phase modifies Domain 1 production
content, promotes anything to `CANONICAL`, or begins Domain 2 authoring.

## What was found and preserved unchanged

A pre-existing **CANONICAL** Domain 2 blueprint already existed in
[`DOMAIN-2-BLUEPRINT.md`](DOMAIN-2-BLUEPRINT.md) before this phase began —
the fundamental question, the eight-stage risk lifecycle (in
[`LIFECYCLE-MODEL.md`](LIFECYCLE-MODEL.md)), the eleven core concepts, the
quantitative-risk (SLE/ALE) requirement, the applicable Pattern Library
entries (in [`PATTERN-LIBRARY.md`](PATTERN-LIBRARY.md)), and the
characteristic-roles list (in
[`ROLE-AUTHORITY-MATRIX.md`](ROLE-AUTHORITY-MATRIX.md)) — along with six
Domain 2 confusing-concept pairs already documented as `CANDIDATE` in
[`CONFUSING-CONCEPTS.md`](CONFUSING-CONCEPTS.md#domain-2--risk-management-pairs).
This phase's analysis was built as elaboration constrained by that existing
architecture, not a redefinition of it — every proposed unit maps onto an
existing CANONICAL lifecycle stage, core concept, or pattern; no new
lifecycle stage, core concept, or pattern ID was invented.

## What was analyzed

The complete supplied Domain 2 source bank (`tools/input/domain-2.txt`,
~232 question+justification blocks) was analyzed programmatically via its
own embedded ISACA Knowledge-Statement/Task-Statement tags — the same
evidence-based approach used for Domain 1's source material. No source
question text was reproduced into any planning artifact or production
content; the source is evidence for curriculum coverage and reasoning
patterns only. Full findings (subdomain distribution, qualifier frequency,
role/term frequency, source-coverage map, confusing-concept inventory,
reasoning-pattern inventory) are recorded in
[`DOMAIN-2-BLUEPRINT.md`](DOMAIN-2-BLUEPRINT.md#phase-9a--domain-2-curriculum-architecture-planning-only).

## Architectural decisions (founder-approved, this turn)

The founder reviewed the initial Phase 9A architectural report and returned
nine explicit decisions, recorded here as approved architecture — not
independently verified by Claude Code:

1. **Risk Owner vs. Control Owner — approved** as a new Domain 2
   confusing-concept pair, added to
   [`CONFUSING-CONCEPTS.md`](CONFUSING-CONCEPTS.md#risk-owner-vs-control-owner)
   with the founder's exact conceptual framing (risk owner accountable for
   the risk/business decision within authority; control owner accountable
   for a specific control's design/operation/effectiveness; not reducible
   to "risk owner is always more senior"). Home confirmed as D2-U8 against
   the source material — 22 of the source's 232 questions carry the "Risk
   and Control Ownership" Knowledge Statement tag directly.
2. **AI / emerging-risk pocket — no dedicated unit.** Approved treatment:
   AI appears only as scenario variety, not a specialty topic. Re-checking
   the ~6–8 AI-scenario questions against their own Knowledge-Statement
   tags (done this turn, not assumed) found 2 under "Emerging Risk and
   Threat Landscape" (→ D2-U1) and 4 under "Risk and Control Ownership"
   (→ D2-U8) — refining the originally-proposed U1/U9 split, since **zero**
   fall under "Risk Monitoring and Reporting," meaning D2-U9 reinforcement
   is not source-supported and will not be pursued. This refinement is
   reported transparently rather than force-fitting the originally
   suggested homes.
3. **Ten-unit structure — approved**, with the founder's exact titles and
   purposes adopted into `DOMAIN-2-BLUEPRINT.md`.
4. **Prerequisite graph — approved in principle**, non-linear shape
   preserved (fundamentals feed both a lifecycle branch and a parallel
   ownership branch; both converge into a closing integrative unit).
5. **Recall design — approved in principle**, non-adjacent recall
   preserved; the five founder-specified minimum cross-domain (Domain 1 →
   Domain 2) recall edges (D2-U2, U5, U6, U8, U10) were documented with an
   explicit "why recall helps solve the new problem" rationale for each,
   per the explicit instruction not to add cross-domain recall merely to
   prove it exists.
6. **Quantitative-risk depth — bounded.** D2-U4 keeps SLE/ALE/ARO/AV/EF but
   only to the depth a management decision requires; no arithmetic drills,
   no calculator-heavy lessons, no variants differing only by numbers.
7. **Qualifiers — source-driven distribution preserved unchanged.** NEXT
   may be used in Domain 2 (unlike Domain 1) because the source genuinely
   supports it (D2-U7's residual-risk sequencing), but must not be
   manufactured for balance. The canonical five-qualifier vocabulary itself
   is unchanged.
8. **Family/variant floor — approved.** ~10 initial families (one per
   unit), minimum 3 variants each, ~30-question initial floor — explicitly
   a floor, not a quota.
9. **Implementation batches — approved as originally proposed**
   (Phase 9B-1 through 9B-5), each following: implementation → automated
   validation → Founder Human Experience Gate → correction if necessary →
   closeout → merge, before the next batch begins.

Full detail for every decision above is recorded in
[`DOMAIN-2-BLUEPRINT.md`](DOMAIN-2-BLUEPRINT.md#phase-9a--domain-2-curriculum-architecture-approved-architecture-not-yet-implemented).

## Explicitly deferred / unchanged by this phase

- No Domain 1 production content was modified — verified via `git diff`
  against `main` touching only `docs/learning/DOMAIN-2-BLUEPRINT.md`,
  `docs/learning/CONFUSING-CONCEPTS.md`, and this file, across both turns.
- No Domain 2 (or any other domain's) production content was authored.
- No entity was promoted to `CANONICAL`.
- Persistence, authentication, analytics, AI-integration — none introduced
  or discussed as implementation.
- `schema/example/` — untouched.
- BUG-001/002/003 — unchanged.
- CI architecture (`.github/workflows/ci.yml`) — untouched.
