# Daily Study Model

**Status: [CANONICAL].** The session shape, timing target, and
calm-UX requirements below were specified directly in the Phase 2
architectural discussion, reaffirming and refining requirements already
present in the committed [Engineering Baseline](../engineering/BASELINE.md).

## Daily Study is the primary learner experience

The learner should not routinely have to decide what to study. This is a
product requirement, not merely a UX preference — it is the mechanism by
which the application avoids becoming "a random question bank" or "a
dashboard-heavy LMS" (explicitly rejected product shapes).

## Typical session shape

**[CANONICAL]**

```
Recall → concise teaching → pattern/role/lifecycle/definition as appropriate
       → application → explanation → targeted repair if needed → close
```

Typical Daily Study duration: **approximately 20–30 minutes.** This is a
hard target for session design, not a suggestion — a rebuilt session that
regularly runs materially longer has failed this requirement regardless of
how good its individual content is.

### Recall
- Cumulative — pulls from already-introduced material, across the whole curriculum so far, not just the current domain.
- Remains present throughout the entire curriculum, including post-curriculum reinforcement.
- This is the mechanism that gives earlier domains ongoing exposure while later domains are being taught — see [Curriculum Blueprint](CURRICULUM-BLUEPRINT.md).

### Concise teaching
Governed by the [Lesson Design Standard](LESSON-DESIGN-STANDARD.md) — one
concept, compact, immediately followed by application.

### Application
A scenario question requiring the learner to actually use the concept just
taught (or a recently-taught, still-being-reinforced concept), following the
[Foundation](FOUNDATION-BLUEPRINT.md) reasoning process where relevant.

### Explanation
Governed by the [Explanation Standard](LESSON-DESIGN-STANDARD.md#explanation-standard) —
present for both correct and incorrect answers when useful; the original
question stays visible; concise.

### Targeted repair if needed
Governed by the [Repair Model](REPAIR-MODEL.md) — small and targeted, not a
re-teach of the whole concept, and never an immediate repeat of the same
question.

### Close
Daily Study ends naturally, with **no guilt, no backlog, no streak
pressure.** A completed session is a complete study day, full stop — this
directly carries forward the current prototype's calm-close behavior
(recorded as a "prototype behavior worth preserving" in the
[Engineering Baseline](../engineering/BASELINE.md#prototype-behaviors-worth-preserving))
as an explicit product requirement for the rebuild, not merely an
observation about the prototype.

## First-pass learning vs. post-curriculum

**[CANONICAL] — this distinction is structural, and violating it
was a confirmed defect class in the current prototype (see
[Engineering Baseline](../engineering/BASELINE.md) and
[Regression Registry](../regressions/REGISTRY.md)).**

### During first-pass learning (Foundation through Domain 4)
- Daily Study follows curriculum sequence.
- Untaught material — anything not yet introduced — must **not** be used as evidence of learner weakness. A concept the learner hasn't been taught yet is not a "weak concept"; it's simply not yet in scope.
- Future-domain performance must not be used to select what to study now.

### Post-curriculum (after all four domains have been taught)
- Adaptive, evidence-driven domain selection is allowed and expected — Daily Study may choose what to reinforce based on real performance evidence across the whole curriculum.
- This is also where [Mixed Practice](REPAIR-MODEL.md#relationship-to-mixed-practice)'s full reasoning-dimension evidence becomes most useful for prioritization.

## Relationship to other documents

- [Curriculum Blueprint](CURRICULUM-BLUEPRINT.md) defines the TEACH → RECALL → APPLY → MEASURE → REINFORCE loop that Daily Study is one expression of.
- [Lesson Design Standard](LESSON-DESIGN-STANDARD.md) governs the shape of the teaching and explanation content used within a session.
- [Repair Model](REPAIR-MODEL.md) governs what happens when application reveals a miss.
- [Foundation Blueprint](FOUNDATION-BLUEPRINT.md) is taught as Daily Study's earliest sessions, before any domain content.
- [Curriculum Blueprint](CURRICULUM-BLUEPRINT.md#product-requirement-user-interface--experience)'s UI/UX product requirement names Daily Study specifically as "the visual and functional center of the product" and gives the calm, guided, non-checklist presentation this session shape must have — a requirement on the *interface*, layered on top of this document's requirement on the *learning shape*.

## What this document does not decide

Specific UI layout, specific screen flow, specific interaction mechanics,
and specific timing per sub-phase are implementation decisions for a later,
separately-approved phase — this document specifies the *learning* shape of
a session, not its interface. See
[Curriculum Blueprint](CURRICULUM-BLUEPRINT.md#product-requirement-user-interface--experience)
for the required interface *principles* (still not an implementation).
