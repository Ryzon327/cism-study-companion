# Learning Architecture Documentation (Phase 2)

This directory is the **Phase 2, documentation-only** deliverable of the
CISM Study Companion's controlled rebuild. It contains the authoritative
learning/product specification that a future, separately-approved
implementation phase will build against. **No application code, data, or
tests were modified to produce these documents** — see the Phase 2 scope
statement below and `docs/engineering/BASELINE.md` / `docs/regressions/REGISTRY.md`
for the engineering-side companion documents from Phase 1.

## Top-level document

**[`CURRICULUM-BLUEPRINT.md`](CURRICULUM-BLUEPRINT.md) is the top-level
learning specification.** Start there. It defines the overall curriculum
structure, the first-pass learning loop (TEACH → RECALL → APPLY → MEASURE →
REINFORCE), the untaught-material rule, how every other document in this
directory fits into that loop, and — added during Phase 2 review — the
required [UI/UX product quality bar](CURRICULUM-BLUEPRINT.md#product-requirement-user-interface--experience)
for the rebuilt application (a requirement only; no implementation).

## How the documents relate

```
CURRICULUM-BLUEPRINT.md  (top-level — start here)
│
├── FOUNDATION-BLUEPRINT.md         (taught before any domain)
│     └── depends on: PATTERN-LIBRARY, ROLE-AUTHORITY-MATRIX,
│                      QUALIFIER-DECODER, LIFECYCLE-MODEL
│
├── DOMAIN-1-BLUEPRINT.md           ┐
├── DOMAIN-2-BLUEPRINT.md           │ taught in curriculum order,
├── DOMAIN-3-BLUEPRINT.md           │ each depends on the same
├── DOMAIN-4-BLUEPRINT.md           ┘ four reference documents below
│     └── depends on: PATTERN-LIBRARY, ROLE-AUTHORITY-MATRIX,
│                      LIFECYCLE-MODEL, CONFUSING-CONCEPTS
│
├── PATTERN-LIBRARY.md              (reference: reusable reasoning shapes)
├── ROLE-AUTHORITY-MATRIX.md        (reference: canonical role vocabulary)
├── QUALIFIER-DECODER.md            (reference: canonical qualifier vocabulary)
├── LIFECYCLE-MODEL.md              (reference: canonical lifecycle stages)
├── CONFUSING-CONCEPTS.md           (reference: term-pair distinctions)
│
├── LESSON-DESIGN-STANDARD.md       (governs TEACH and MEASURE/explanation content)
├── DAILY-STUDY-MODEL.md            (the session-level expression of the loop)
└── REPAIR-MODEL.md                 (governs REINFORCE and diagnostic vocabulary)
```

The five reference documents (Pattern Library, Role & Authority Matrix,
Qualifier Decoder, Lifecycle Model, Confusing Concepts) exist so that every
other document uses **exactly the same vocabulary** — the same role names,
the same qualifier names, the same pattern IDs, the same lifecycle stage
names — rather than each domain blueprint re-deriving its own version of a
shared concept.

## Two folding decisions, made explicitly

The Phase 2 instruction gave detailed content for an "Explanation Standard"
and a "Mixed Practice" specification, but the required file list did not
include a separate file for either. Rather than silently drop that content,
it was folded into the document it most directly governs:

- **Explanation Standard** → folded into
  [`LESSON-DESIGN-STANDARD.md`](LESSON-DESIGN-STANDARD.md#explanation-standard),
  because both documents govern the shape of a single piece of teaching or
  feedback content — the explanation standard is, structurally, the lesson
  sequence's "decision reasoning" and "common trap" steps applied
  retroactively to an answered question.
- **Mixed Practice specification** → folded into
  [`REPAIR-MODEL.md`](REPAIR-MODEL.md#relationship-to-mixed-practice),
  because Mixed Practice's reasoning-dimension evidence and the Repair
  Model's diagnostic failure types are the same model viewed from two
  angles: evidence gathered, and diagnosis produced.

Nothing from the original Phase 2 instruction was omitted; it was relocated
and cross-referenced. This decision is flagged here, and again at the top of
each affected document, so it is easy to find and easy to reverse if a
future phase wants these as standalone documents instead.

## Content status terminology

Per the Phase 2 documentation rule ("do not make unsupported claims") and an
explicit Phase 2 review decision, every substantive statement in this
directory is tagged with exactly one of three statuses. These three
statuses — and only these three — are the canonical vocabulary for content
status across this entire directory; no other status label should be
introduced without updating this section first.

- **`CANONICAL`** — Approved for use by the rebuilt learning system. In
  practice this means: stated directly, in these terms, by the product
  owner in the Phase 2 (or earlier, approved) architectural discussion.
  This is the highest-confidence tag; it means "this is what was actually
  asked for," **not** "this is independently verified against ISACA source
  material." Only content in this category may drive learner assessment or
  curriculum behavior once implemented.
- **`CANDIDATE`** — Potentially useful content, pattern, or model preserved
  for later validation, but **not yet allowed to drive learner assessment
  or curriculum behavior**. This covers elaboration, examples, synthesized
  detail, and — critically — any structural model (such as a proposed
  lifecycle) that was assembled by inference rather than given directly as
  a requirement. This is the largest category in this directory by volume.
  Promotion from `CANDIDATE` to `CANONICAL` requires an explicit decision,
  not silent accumulation of confidence.
- **`PROTOTYPE REFERENCE`** — Historical behavior/content from the existing
  application prototype. It may inform future decisions but is **not
  authoritative**. Used only as a reference point for what a real (if
  unverified) design decision already looked like once — never as evidence
  that the behavior is correct or should be preserved as-is.

**No statement in this directory should be treated as ISACA-verified unless
it is explicitly marked otherwise**, and none currently are: the supplied
CISM source/question material was not directly re-analyzed line-by-line to
produce these documents. That analysis is separate, future work — this
directory formalizes what was *approved* in this session as the product's
intended learning architecture, so that future work (including that source
analysis) has a stable, written target to validate against, rather than
having to reconstruct the requirements from conversation history.

**A specific, load-bearing application of this terminology:** the Domain 2
risk lifecycle and Domain 4 incident lifecycle are `CANONICAL`. The
Domain 1/Domain 3 governance-and-program relationships are `CANDIDATE`
conceptual models only — see
[`LIFECYCLE-MODEL.md`](LIFECYCLE-MODEL.md#domain-1--domain-3--conceptual-model-not-canonical)
— and must never be presented as a formal, canonical lifecycle merely for
structural symmetry with Domains 2 and 4. Similarly, the five qualifiers in
[`QUALIFIER-DECODER.md`](QUALIFIER-DECODER.md) (FIRST, NEXT, BEST,
MOST/MOST IMPORTANT, PRIMARY) are the only `CANONICAL` qualifier set; the
additional prototype-derived variants there (PRIMARILY, GREATEST, MAIN) are
`PROTOTYPE REFERENCE` and must not be treated as canonical.

## What Phase 2 is and is not

**Phase 2 is:** a documentation-only specification of the intended learning
architecture — curriculum structure, reasoning patterns, role/authority
model, qualifier model, lifecycle model, lesson and explanation design
standard, Daily Study session model, repair/diagnosis model, and (added
during Phase 2 review) the required UI/UX quality bar and design principles
— stated as a product requirement, not designed or implemented.

**Phase 2 is not:**
- A source-material validation pass against the supplied CISM question/source content (explicitly deferred; see the status-tag legend above).
- A data model or schema design (deferred to Phase 3 — canonical data model).
- A UI design, design system, or application code change of any kind. The UI/UX section in [`CURRICULUM-BLUEPRINT.md`](CURRICULUM-BLUEPRINT.md#product-requirement-user-interface--experience) states principles and a quality bar only; `index.html`, `css/`, `js/`, `data/`, `tests/`, `package.json`, and CI configuration were not touched in this phase, and no UI framework was installed. A dedicated UI/UX Design System phase, separately approved, will do that work.
- A fix for BUG-001, BUG-002, or BUG-003 (tracked, unchanged, in `docs/regressions/REGISTRY.md`).

## Relationship to the Phase 1 engineering documents

- [`docs/engineering/BASELINE.md`](../engineering/BASELINE.md) — the
  committed record of the application's pre-rebuild engineering state.
  Referenced here where current prototype behavior is used as a reference
  point (always tagged `PROTOTYPE REFERENCE` when it is).
- [`docs/regressions/REGISTRY.md`](../regressions/REGISTRY.md) — the
  defect registry. Phase 2 does not modify or resolve any entry in it.
