# UI/UX Design System (Phase 4)

This directory is the **Phase 4, documentation-only** deliverable of the
CISM Study Companion's controlled rebuild. It specifies the visual and
interaction design the rebuilt application must express — grounded in, and
never contradicting, the approved requirements in
[`docs/learning/`](../learning/README.md) (what the product teaches and how)
and [`docs/data-model/`](../data-model/README.md) (how content is
identified and related). **No application code, dependency, or visual
prototype was created to produce this phase** — see the scope statement
below.

## Status terminology

This directory uses the same three-tier vocabulary established in
[`docs/learning/README.md`](../learning/README.md#content-status-terminology):
`CANONICAL` (approved design requirement — stated directly by the product
owner during Phase 4 review), `CANDIDATE` (a specific proposed value or
elaboration — token values, pixel measurements, exact wording — offered to
satisfy an approved requirement's shape, subject to revision once real
implementation and the Visual Prototype Gate below produce evidence), and
`PROTOTYPE_REFERENCE` (a behavior or pattern drawn from the current
application, offered only as a reference point). Each document states its
status at the top; specific numbers throughout (spacing scale values,
breakpoint widths, component names) are `CANDIDATE` unless stated otherwise
— they are a coherent, defensible starting point, not a final locked
specification.

## Start here

1. **[`DESIGN-PRINCIPLES.md`](DESIGN-PRINCIPLES.md)** — the rules everything else answers to, including the explicit "beauty is a product requirement" principle.
2. **[`VISUAL-LANGUAGE.md`](VISUAL-LANGUAGE.md)**, **[`DESIGN-TOKENS.md`](DESIGN-TOKENS.md)**, **[`TYPOGRAPHY.md`](TYPOGRAPHY.md)**, **[`SPACING-AND-LAYOUT.md`](SPACING-AND-LAYOUT.md)** — the visual system's foundation.
3. The seven `SCREEN-*.md` documents — how the foundation applies to each part of the product.
4. **[`SEMANTIC-VISUAL-LANGUAGE.md`](SEMANTIC-VISUAL-LANGUAGE.md)** — the pattern/role/qualifier/lifecycle visual family.
5. **[`ACCESSIBILITY-STANDARD.md`](ACCESSIBILITY-STANDARD.md)** and **[`MOTION-STANDARD.md`](MOTION-STANDARD.md)** — cross-cutting requirements.
6. **[`COMPONENT-INVENTORY.md`](COMPONENT-INVENTORY.md)** — the reusable component set (named, not built).
7. **[`TECHNOLOGY-ASSESSMENT.md`](TECHNOLOGY-ASSESSMENT.md)** — deliberately left undecided; see amendment below.
8. **[`TESTING-STRATEGY.md`](TESTING-STRATEGY.md)** — including the **Visual Prototype Gate**, a required checkpoint before implementation.

## The three Phase 4 review amendments, and where each lives

1. **Technology remains explicitly open.** The prior draft of this plan
   recommended staying dependency-free. That recommendation was withdrawn
   during review — being dependency-free is the current prototype's
   *history*, not a product requirement for the rebuild. See
   [`TECHNOLOGY-ASSESSMENT.md`](TECHNOLOGY-ASSESSMENT.md), fully rewritten
   around nine evidence-based priorities (reliability, maintainability,
   automated testability, accessibility, clear state management, security,
   long-term maintainability with Claude Code, learner experience,
   reasonable implementation complexity) with no architecture preferred in
   this document. Phase 5 begins with an explicit, evidence-based decision.
2. **A required Visual Prototype Gate** sits between this documentation and
   full learner-facing implementation. See
   [`TESTING-STRATEGY.md`](TESTING-STRATEGY.md#visual-prototype-gate)
   for the full requirement — seven representative screens, evaluated at
   desktop and mobile, light and dark, before any complete application
   implementation proceeds.
3. **Visual quality is an explicit product requirement, not cosmetic
   polish.** See [`DESIGN-PRINCIPLES.md`](DESIGN-PRINCIPLES.md)'s Principle
   0 — a functionally complete but visually mediocre implementation is not
   considered a complete Phase 5 deliverable. This is balanced, not
   overridden, by the standing rule that polish never costs clarity,
   accessibility, learning effectiveness, performance, or calm — beauty
   does not mean busy.

## A fourth decision, made during Phase 4 closeout: Mixed Practice is dimension-aware

`qualifier: null` on a canonical question means there is no meaningful
qualifier signal to classify — it is **not** a request to introduce
`qualifier.none` as a canonical learner choice, which the Phase 3 data
model explicitly forbids. Generalized beyond qualifier: **Mixed Practice
must never force a reasoning dimension a question does not contain.** It
renders and scores only the dimensions a given question actually tags
(qualifier, role, lifecycle, decision, or any subset of them), never a
fixed four-control layout. See
[`SCREEN-MIXED-PRACTICE.md`](SCREEN-MIXED-PRACTICE.md) for the full design
— this replaces that document's earlier "always four groups" mockup, which
is now known to have been wrong given real example content
(`schema/example/questions.example.json`'s `question.d4.0001` has
`qualifier: null` today, which the earlier version of this design gave the
learner no correct way to classify).

## What Phase 4 (this step) is and is not

**Phase 4 is:** a complete visual/interaction design specification —
principles, tokens, typography, layout, per-screen design, semantic visual
language, accessibility and motion standards, a named component inventory,
an open technology assessment, and a testing strategy including the
mandatory pre-implementation visual gate.

**Phase 4 is not:**
- A visual prototype. No screen has been rendered; the Visual Prototype Gate is explicitly the next checkpoint, not something this documentation satisfies by itself.
- A technology decision. See `TECHNOLOGY-ASSESSMENT.md` — deliberately undecided.
- A component implementation. `COMPONENT-INVENTORY.md` names components; none exist as code.
- A fix for BUG-001, BUG-002, or BUG-003, or any application/data/schema/test change. `index.html`, `css/`, `js/`, `data/`, `schema/`, `tests/`, `package.json`, and `.github/` were not touched.

## Relationship to prior phases

- [`docs/engineering/BASELINE.md`](../engineering/BASELINE.md) — flagged accessibility gaps in the current prototype (missing dialog semantics, no focus trapping) that `ACCESSIBILITY-STANDARD.md` treats as requirements to fix, not preserve.
- [`docs/learning/`](../learning/README.md) — authoritative for curriculum meaning and the Daily Study/lesson/explanation/repair models this design system visually expresses.
- [`docs/data-model/`](../data-model/README.md) — authoritative for entity identity and relationships; this directory's semantic visual language (§ `SEMANTIC-VISUAL-LANGUAGE.md`) renders that model without altering it.
- [`docs/regressions/REGISTRY.md`](../regressions/REGISTRY.md) — unchanged by Phase 4.
