# Daily Study: Session Shell, Lesson, Repair, Completion

**Status: [CANONICAL]** for Daily Study being the visual and functional
center of the product, immersive presentation, the calm/no-checklist
requirement, and the natural-stopping-point requirement (all stated
directly during Phase 4 review). **[CANDIDATE]** for the specific layout
and component breakdown below.

> **Gate screens.** "Daily Study — Learn," "Daily Study Completion" are two
> of the seven screens required by the
> [Visual Prototype Gate](TESTING-STRATEGY.md#visual-prototype-gate) — no
> complete application implementation proceeds until these are visually
> validated at desktop/mobile and light/dark.

## Session shell

Immersive mode (see [`SPACING-AND-LAYOUT.md`](SPACING-AND-LAYOUT.md)).
Minimal header: phase label (`RECALL`, `LEARN`, `APPLY`, `REPAIR`,
`COMPLETE`) as a quiet eyebrow, plus a **thin, subtle progress line** — a
single 2px bar filling left-to-right, not a loud stepper with five icons.
Content fills the remaining viewport. Primary action button anchored below
the content column on desktop, fixed to the bottom on mobile where scroll
makes that necessary. A small, quiet close affordance sits in the corner —
never competing with the primary action.

This directly implements the conceptual progression from
[`docs/learning/DAILY-STUDY-MODEL.md`](../learning/DAILY-STUDY-MODEL.md)
(`Recall → concise teaching → application → explanation → targeted repair
if needed → close`) and
[`docs/learning/CURRICULUM-BLUEPRINT.md`](../learning/CURRICULUM-BLUEPRINT.md#daily-study-as-the-visual-and-functional-center)'s
UI framing of the same shape (`Recall → Learn → Apply → Targeted Repair
when needed → Complete`) — the two are the same model at different
granularity, not competing specifications.

Phase transitions use a gentle 200ms fade/slide (see
[`MOTION-STANDARD.md`](MOTION-STANDARD.md)), never blocking input longer
than the transition itself.

## Lesson (Learn phase)

Directly implements
[`docs/learning/LESSON-DESIGN-STANDARD.md`](../learning/LESSON-DESIGN-STANDARD.md)'s
eleven-step sequence as a **single flowing module**, not eleven cards:

```
[Concept title — H2]
[One-line "why it matters" — subhead, text-secondary]

[1–2 paragraphs blending plain-English context + CISM perspective]

┌─ PATTERN callout ──────────────────────┐
│ Authority follows accountability        │
│ Who owns the consequence?               │
└──────────────────────────────────────────┘

  "Scenario" inset (quiet indented/quoted treatment, one short paragraph)

  ↳ MEMORY RULE
    Security expertise does not automatically equal business authority.
```

Four to five visual chunks total: title+subhead, body prose, one Pattern
callout, one Scenario inset, one Memory Rule strip. "Recognition clue" and
"common trap" fold into the body prose or the Pattern callout's supporting
line rather than becoming their own components. Retrieval/application is
the *next phase screen* (Apply — see
[`SCREEN-QUESTION-FEEDBACK.md`](SCREEN-QUESTION-FEEDBACK.md)), not part of
the same scroll.

## Repair phase

A small continuation module, not a remediation center:

```
This pattern could use another pass.

[Pattern callout — same component as Learn phase]
[One short alternate example]

You'll see this again soon, in different wording.
```

No red banners, no "you failed," no forced immediate re-quiz. Full
rationale in [`SCREEN-QUESTION-FEEDBACK.md`](SCREEN-QUESTION-FEEDBACK.md)'s
repair cross-reference and the diagnostic model in
[`docs/learning/REPAIR-MODEL.md`](../learning/REPAIR-MODEL.md).

## Completion phase

```
        ✓
Today's study is complete.

Your next session will continue Domain 2 and bring
lifecycle sequencing back through recall.

[optional, text-button weight]  Optional 5-minute reinforcement

[Done]                 ← primary action, no pressure language anywhere
```

Optional reinforcement is visually a quiet text link, never a button with
equal weight to "Done" — it must *look* skippable, not just *be* skippable.
No streak language, no "come back tomorrow or lose progress" framing, no
backlog counter — matches
[`docs/learning/DAILY-STUDY-MODEL.md`](../learning/DAILY-STUDY-MODEL.md)'s
explicit "no guilt, no backlog, no streak pressure" requirement rendered
visually.
