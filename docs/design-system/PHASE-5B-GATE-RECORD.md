# Phase 5B Human Gate Record

**Status: [CANONICAL].** This is the durable record of the two required
human gates defined by [TESTING-STRATEGY.md](TESTING-STRATEGY.md)'s Visual
Prototype Gate (Amendment 2), as actually exercised during Phase 5B
implementation. It records outcomes and approved direction, not
implementation narrative — see the Phase 5B PR for implementation detail.

## Gate 1 — Visual Prototype Gate

**Initial review: REJECTED.** The first implementation used a narrow
left-hand navigation rail (labels wrapped across multiple lines) and left
the majority of the desktop viewport empty. The founder's review concluded
the composition read as "documentation inside a web shell," not a premium
study workspace.

**Redesign performed:** the navigation rail was replaced with a top
app bar carrying three learner-facing destinations; a restrained editorial
type and identity system was introduced (serif headlines, a linked-circles
wordmark glyph shared with `PatternCallout`); Home's composition was
rebuilt as an intentional two-column hero using the full desktop width; a
separate Prototype/QA switcher was introduced so the seven gate screens
(eight, counting Feedback's two variants) are inspectable without being
mistaken for learner navigation.

**Redesign review: APPROVED.** The founder reviewed the redesigned Home
screen in-browser and approved the visual direction.

## Gate 2 — Human Experience Gate

Following visual approval, the controlled Daily Study experience prototype
was built end-to-end (Recall → Learn → Apply → Feedback → Repair when
incorrect → Completion → Home), as in-memory, non-persistent state — no
learner storage, no production engine.

**Review: APPROVED.** The founder personally completed the full flow and
reported: *"This is great."* Specifically approved: the flow feels natural,
the interface is not busy, the material teaches what the learner actually
needs, and the lesson produces the intended "Ahh, now I understand"
realization while progressing through the material.

## Approved direction (binding going forward)

- **Simple navigation.** Home / Daily Study / Explore & Practice is the
  approved top-level set. New capabilities should be contextual, not
  automatic permanent navigation additions.
- **Calm interface.** Focused, clear, premium, spacious, intentional.
  Feature growth in the system must not become UI growth for the learner.
- **The "Ahh" moment is the teaching bar.** Lessons and feedback should
  convey the concept, the CISM management perspective, recurring question
  patterns, role/authority and lifecycle/qualifier implications where
  relevant, common traps, and what to remember — concisely, in service of
  passing the exam, not exhaustive security-management theory.
- **Both outcomes teach.** Correct answers reinforce the reasoning;
  incorrect answers identify the specific mistake, repair it, and restate
  the CISM perspective — without a punitive tone.
- **Progressive disclosure.** Internal system complexity must not leak into
  learner-facing surface area.
- **The Prototype/QA switcher is not product navigation** and must remain
  architecturally separate from it.

These characteristics are product requirements, not implementation notes —
later phases should be held to them the same way they are held to
`docs/regressions/REGISTRY.md` and the engineering baseline.
