# Implementation Technology Assessment

**Status: [CANONICAL] that this decision is explicitly open** — this is
Amendment 1 from Phase 4 review, and it overrides an earlier draft of this
document that recommended staying dependency-free by default. That
recommendation is withdrawn. **No architecture is preferred in this
document.** Phase 5 begins with an explicit, evidence-based decision, not a
default inherited from the prototype's history.

## Why the earlier recommendation was withdrawn

The current application being dependency-free is **historical context, not
a product requirement.** A prior draft of this assessment reasoned from
"the project has been dependency-free through Phases 1–3, so stay
dependency-free" — that reasoning mistakes continuity for justification.
The rebuilt application's architecture should be chosen because it best
serves the product's actual priorities, not because it preserves what the
prototype happened to do.

## The nine evaluation priorities, in the order given during review

1. **Reliability**
2. **Maintainability**
3. **Automated testability**
4. **Accessibility**
5. **Clear state management**
6. **Security**
7. **Long-term maintainability with Claude Code** (or an equivalent AI-assisted engineering workflow)
8. **Excellent learner experience**
9. **Reasonable implementation complexity**

A build step or carefully selected dependencies are explicitly acceptable
if they materially improve against these priorities — the bar is evidence
of improvement, not avoidance of dependencies for its own sake.

## Candidate architectures, evaluated on the same axes — none selected

| Approach | Reliability / state mgmt | Testability | Accessibility ergonomics | Security / dependency surface | Build complexity | Claude Code maintainability |
|---|---|---|---|---|---|---|
| **Disciplined vanilla HTML/CSS/JS** | Requires manual discipline (explicit state objects, no ad hoc DOM mutation); the current prototype's known state-machine fragility (Daily Study phase flow, Review Center) is a vanilla-JS-shaped risk, not an inherent one — mitigated by, not eliminated by, staying vanilla | Fully testable via the existing Playwright/`node:test` approach; no additional testability gained from the language choice itself | No framework-provided a11y scaffolding; every pattern (focus trap, live regions) hand-built and hand-verified | Zero new dependencies; zero build-time supply chain | None — open `index.html`, exactly as today | Large single files with implicit conventions are harder for an AI agent to safely modify in isolation than well-typed, componentized code |
| **TypeScript (no framework)** | Same runtime behavior as vanilla, but compile-time type checking catches a real class of the bugs the baseline found (e.g., shape mismatches across the storage layer) | Same testability as vanilla, plus type-level guarantees the test suite doesn't have to re-verify by hand | No inherent change versus vanilla | One dev-time dependency (the compiler), zero runtime dependency; small, well-understood security surface | A build/type-check step is introduced; can remain a thin one (`tsc` alone, no bundler) | Types make an AI agent's edits meaningfully safer to reason about and verify without running the app |
| **Preact** | Declarative state-to-DOM binding directly addresses the state-machine fragility class in the baseline (Daily Study, Review Center, Mixed Practice gate) | Strong component-level testability; pairs well with Testing-Library-style patterns | Requires the same manual a11y care as vanilla, but component boundaries make consistent patterns (e.g., a single `Dialog` implementation reused everywhere) easier to guarantee | Small runtime dependency footprint; requires dependency/security scanning (see below) | Requires a bundler; more moving parts than vanilla or bare TypeScript | Component boundaries are legible units an AI agent can modify with a clear blast radius |
| **Svelte** | Same declarative benefit as Preact, plus compiles away most runtime, keeping shipped code close to vanilla in weight | Strong; component-level testability similar to Preact | Same characteristics as Preact | Small dependency footprint; requires dependency/security scanning | Requires a build step (Svelte's compiler); comparable complexity to Preact's bundler requirement | Similar legibility benefit to Preact; syntax is less widely represented in training data than React-family syntax, a minor practical consideration for AI-assisted maintenance |
| **React** | Same declarative benefit as Preact/Svelte, at a larger runtime and ecosystem weight than this project's scale needs | Strong, extremely well-tooled | Strong ecosystem a11y tooling and prior art available | Largest dependency surface of the options considered; most third-party packages tend to accumulate around it over time, which cuts against the "reasonable implementation complexity" priority unless deliberately resisted | Requires a bundler; heaviest build tooling of the options considered | Extremely well-represented in training data, which cuts both ways: easy for an AI agent to write plausible-looking React, but also easy to accumulate unnecessary complexity/dependencies unless actively constrained |

This table is evidence to inform the Phase 5 decision, not a ranking with a
declared winner. No option is recommended over another in this document.

## Requirements that apply regardless of which architecture is chosen

- **Any dependency introduced must have a clear, stated purpose** — no dependency is added "because it's popular" or "because it's the default."
- **Any dependency introduced must be covered by dependency/security scanning in CI** from the moment it's added — extending the Phase 1 engineering foundation's CI discipline to whatever the Phase 5 architecture turns out to be. This is a hard requirement carried into Phase 5 regardless of outcome.
- **Whatever is chosen must be validated by the Visual Prototype Gate** ([`TESTING-STRATEGY.md`](TESTING-STRATEGY.md#visual-prototype-gate)) before full learner-facing implementation proceeds — the gate is deliberately architecture-agnostic, since it evaluates rendered screens, not source code.
- **The component boundaries in [`COMPONENT-INVENTORY.md`](COMPONENT-INVENTORY.md)** are designed to translate reasonably cleanly to any of the candidates above — this was a deliberate constraint when naming them, specifically so this technology decision doesn't force a redesign of the component system regardless of outcome.

## How the Phase 5 decision should actually get made

Not decided here. A reasonable process (itself not mandated by this
document, offered only as a starting suggestion for whoever runs that
decision): build the Visual Prototype Gate's seven screens
(§ below) in more than one candidate approach if time allows, or in one
approach with explicit attention to how much manual discipline the
vanilla-JS state machines actually require once real Daily Study/Review
Center logic is rebuilt against the canonical data model — and let that
concrete evidence, weighed against the nine priorities above, drive the
decision, rather than defaulting to either "stay vanilla because that's
what we know" or "adopt a framework because it's expected for a rebuild."
