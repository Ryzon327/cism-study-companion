# Curriculum Blueprint

**This is the top-level learning specification for the CISM Study
Companion rebuild.** Every other document in `docs/learning/` is either a
supporting reference this document depends on, or a more detailed
elaboration of one part of it. See [`docs/learning/README.md`](README.md)
for the full map of how these documents relate.

**Status: [CANONICAL].** The overall structure, the
TEACH→RECALL→APPLY→MEASURE→REINFORCE loop, and the untaught-material rule
below were specified directly in the Phase 2 architectural discussion.

## Product goal

> Help the learner pass the ISACA CISM exam efficiently.

This is the **sole** learning objective. Per the explicit product
requirement, the application must not become:

- a giant CISM textbook
- an exhaustive cybersecurity course
- a random question bank
- a dashboard-heavy LMS
- a streak/gamification product
- a guilt-driven study tool

## Overall curriculum structure

```
FOUNDATION — How to Read CISM
   ↓
DOMAIN 1 — Governance
   ↓
DOMAIN 2 — Risk Management
   ↓
DOMAIN 3 — Security Program
   ↓
DOMAIN 4 — Incident Management
   ↓
POST-CURRICULUM — Adaptive Reinforcement / Exam Readiness
```

This sequence is fixed during first-pass learning. It is not reordered by
learner performance, learner preference, or content availability — see
"Untaught material" below.

## The first-pass learning loop

**[CANONICAL]** — this loop governs Foundation and every domain
during first-pass learning:

```
TEACH → RECALL → APPLY → MEASURE → REINFORCE
```

- **TEACH** — new concept introduced, per the [Lesson Design Standard](LESSON-DESIGN-STANDARD.md).
- **RECALL** — retrieval of already-introduced material, cumulative across the whole curriculum so far (see [Daily Study Model](DAILY-STUDY-MODEL.md#recall)).
- **APPLY** — scenario application of the newly taught (or recently taught) concept, per [Foundation](FOUNDATION-BLUEPRINT.md)'s reasoning process where relevant.
- **MEASURE** — the learner's response is evaluated and, per the [Explanation Standard](LESSON-DESIGN-STANDARD.md#explanation-standard), explained.
- **REINFORCE** — a diagnosed miss receives small, targeted repair per the [Repair Model](REPAIR-MODEL.md); a correct response may still receive brief reinforcement of the reasoning, not just the answer.

## Domain synthesis / capstone principle

**[CANDIDATE — approved Phase 9B-4 founder architectural decision, not
part of the original Phase 2 CANONICAL specification above.]** Following
strong founder feedback on Domain 2's recurring payment-system scenario
(see [`docs/learning/PHASE-9B4-GATE-RECORD.md`](../learning/PHASE-9B4-GATE-RECORD.md)),
each remaining CISM domain's curriculum should end with a concise
**domain synthesis (capstone) experience** that connects the domain's
individual lessons into one complete mental model — not merely another
ordinary TEACH→APPLY lesson.

**Applies at minimum to:** Domain 2, Domain 3, and Domain 4. **Domain 1
does not require a retrofit** during the current build merely for
symmetry — the founder already understands Domain 1 well; a Domain 1
synthesis may be considered later only if reinforcement/final-readiness
evidence shows it would add real learner value, per the same
evidence-based standard this project applies everywhere else.

**Purpose, not cosmetic:** a synthesis unit moves the learner from
individual concepts, through the relationships *between* those concepts,
to one coherent scenario/mental model, to integrated CISM reasoning, to
transfer onto unfamiliar questions. The target realization is: *"I
understand the individual pieces, and now I can see how the whole domain
works together"* — understanding the domain as a system, not recalling a
list of definitions.

**No major new content.** A synthesis unit primarily integrates material
already taught in that domain. It is explicitly not a dumping ground for
missing curriculum — any new concept discovered while designing a
synthesis unit must go through the normal curriculum coverage/change
process, not be quietly inserted into the wrap-up. Connective explanation
tying prior lessons together is fine; a new large teaching unit is not.

**Reference model, chosen per domain.** Use a coherent, domain-appropriate
recurring scenario when it materially helps the learner integrate the
domain — for Domain 2, the payment-system story already used across
D2-U2/U5/U6/U7 is the approved primary reference model. For Domain 3 and
Domain 4, an appropriate recurring scenario must be selected from that
domain's own source material and reasoning during that domain's own
architecture phase — the payment-system scenario must not be force-fit
into domains it doesn't naturally suit.

**Binding: reference for comprehension + varied scenarios for transfer.**
The recurring reference story builds the mental model; it must never
become the only scenario a domain uses, and must never be overused to the
point learners simply memorize the story instead of the underlying
reasoning. Varied scenarios elsewhere in the domain continue to prove
genuine transfer.

**Synthesis experiences may use a different flow than ordinary lessons**,
while remaining calm and concise — the standard Recall → Learn → Apply →
Feedback shape is not assumed to apply unchanged. A conceptual (not yet
implemented) shape for planning purposes: Big Picture → Guided Reference
Scenario → Decision Checkpoints → Why CISM Cares → Integrated Practice →
Domain Wrap-Up. Before implementing any different synthesis flow, inspect
the existing frontend architecture and propose the smallest reusable
design — this project does not fork into a separate learning system for
one unit type.

**Decision checkpoints** inside a synthesis unit periodically ask the
learner to reason through the reference story — e.g., "what has already
happened?", "what stage are we in?", "who is accountable here?", "what
decision is actually being made?", "which qualifier changes the
question?", "what information should drive the next decision?", "what
would CISM expect management to do?" — reinforcing reasoning, not
becoming a long quiz.

**Relationship to the approved future Foundation enhancement.** The
separately-approved future Foundation "how to read a CISM question"
enhancement ([`FOUNDATION-BLUEPRINT.md`](FOUNDATION-BLUEPRINT.md#foundation-readiness-note-phase-9b-4))
teaches question-interpretation habits (what's being asked, role, verb,
lifecycle position, qualifier, management/governance perspective) from
scratch. Domain synthesis units should **reuse** those reasoning habits
once Foundation actually teaches them, not re-teach them independently.

**Each future domain's architecture phase must define its own synthesis
experience** — Domain 3 and Domain 4 must each identify: their own
reference model, their own synthesis/capstone unit, the whole-domain
mental model it connects, which concepts must connect, integrated
reasoning checkpoints, and concise-but-fruitful delivery — without
assuming the same unit count, scenario structure, or lesson length as
Domain 2 or each other. See
[`DOMAIN-2-BLUEPRINT.md`](DOMAIN-2-BLUEPRINT.md#d2-u10-synthesis-requirement-approved--phase-9b-4-founder-decision-for-phase-9b-5)
for Domain 2's concrete instance of this principle, which future domains
should follow as a pattern, not copy verbatim.

## The untaught-material rule

**[CANONICAL] — this is a structural constraint, not a
preference, and violating it was a confirmed defect class in the current
prototype** (see [Engineering Baseline §BUG-002-adjacent findings](../engineering/BASELINE.md)
and the "taught-first integrity" history in the prototype's own build
record, referenced there as historical context only, not as proof of
correct behavior).

> Untaught material must NOT be classified as learner weakness.

During first-pass learning, a concept the learner has not yet encountered is
not evidence of anything — it is simply not yet in scope. Any adaptive
selection, "weak areas" surfacing, or repair-queue logic must exclude
material outside what has actually been taught so far. This rule applies
across Daily Study, Mixed Practice, and any future adaptive-practice
feature.

## Post-curriculum: adaptive reinforcement / exam readiness

**[CANONICAL].** After all four domains have been taught:

- Domain-level adaptation may become fully evidence-driven — real performance data across the whole curriculum now legitimately indicates strength and weakness, because everything has actually been taught.
- [Mixed Practice](REPAIR-MODEL.md#relationship-to-mixed-practice)'s full reasoning-dimension evidence becomes most useful here.
- [Daily Study](DAILY-STUDY-MODEL.md) continues in its same session shape — recall, teaching/reinforcement, application, explanation, repair, close — but domain/concept selection is now allowed to be adaptive rather than sequential.
- The 20–30 minute session target and the calm-close, no-guilt, no-backlog requirements ([Daily Study Model](DAILY-STUDY-MODEL.md)) apply identically in this phase — post-curriculum reinforcement is not a different product.

## How the supporting documents fit into this loop

| Document | Role in the curriculum |
|---|---|
| [Foundation Blueprint](FOUNDATION-BLUEPRINT.md) | The reasoning process taught before any domain, and referenced by every domain's APPLY step. |
| [Domain 1](DOMAIN-1-BLUEPRINT.md) / [Domain 2](DOMAIN-2-BLUEPRINT.md) / [Domain 3](DOMAIN-3-BLUEPRINT.md) / [Domain 4](DOMAIN-4-BLUEPRINT.md) Blueprints | TEACH content and domain-specific APPLY scenarios for each curriculum stage. |
| [Pattern Library](PATTERN-LIBRARY.md) | The reusable reasoning shapes referenced by Foundation and every domain's TEACH and APPLY content. |
| [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md) | Canonical role vocabulary used across all TEACH/APPLY/REINFORCE content. |
| [Qualifier Decoder](QUALIFIER-DECODER.md) | Canonical qualifier vocabulary used across all TEACH/APPLY/REINFORCE content. |
| [Lifecycle Model](LIFECYCLE-MODEL.md) | Canonical lifecycle stage vocabulary for Domains 2 and 4, used across STAGE reasoning and lifecycle-application content. Domain 1/3 have a `CANDIDATE` conceptual model only — not a canonical lifecycle. |
| [Confusing Concepts](CONFUSING-CONCEPTS.md) | Term-pair reference used by TEACH content and by "knowledge gap"/"vocabulary error" REINFORCE content. |
| [Lesson Design Standard](LESSON-DESIGN-STANDARD.md) | Governs how TEACH and MEASURE (explanation) content is shaped. |
| [Daily Study Model](DAILY-STUDY-MODEL.md) | The session-level expression of this loop, with its own timing and calm-UX requirements. |
| [Repair Model](REPAIR-MODEL.md) | Governs REINFORCE, and defines the diagnostic vocabulary MEASURE resolves to. |

## Product requirement: user interface & experience

**Status: [CANONICAL] — a product requirement, not an implementation.**
Added during Phase 2 review. This section documents the required *quality
bar and design principles* for the rebuilt application's interface. It is
**not** a UI design, not a design system, and not implementation guidance
beyond the principle level — no `index.html`, `css/`, or `js/` file was
touched to produce this section, and none should be, until a dedicated,
separately-approved UI/UX Design System phase. Building it is future work;
this section exists so that future work has a written target, the same way
the rest of this document gives the curriculum work a written target.

### The required experience

The rebuilt CISM Study Companion must have a highly polished, modern,
premium-quality user interface. The desired experience is: modern,
beautiful, calm, clean, premium, highly polished, approachable, focused,
responsive, and accessible. The application should feel like a high-quality
modern study companion — **not** a traditional corporate LMS.

### Core visual principle

> **Beautiful does not mean busy.**

**Avoid:** dashboard overload; excessive cards; excessive widgets; visual
clutter; childish gamification; streak pressure; guilt-oriented visuals;
dense enterprise-LMS styling; excessive navigation choices; arbitrary
decorative elements; overwhelming amounts of information on one screen.

**Prefer:** strong typography; excellent spacing; whitespace; restrained
visual hierarchy; subtle depth; purposeful motion where appropriate;
consistent components; clear focus states; excellent readability; polished
micro-interactions; responsive layouts; excellent light mode; an equally
intentional dark mode; WCAG-conscious accessibility.

This directly extends the calm-UX product principle already established for
[Daily Study](DAILY-STUDY-MODEL.md) — "no guilt, no backlog, no streak
pressure" — from a behavioral requirement into a visual one. The two must
not contradict each other in implementation: a visually calm interface that
still nags or gamifies would not satisfy this requirement, and vice versa.

### Daily Study as the visual and functional center

Daily Study — already the primary learner experience per
[Daily Study Model](DAILY-STUDY-MODEL.md) — is also the **visual and
functional center of the product.** On opening the application, the learner
should immediately understand, without navigating a complex dashboard:

1. What am I doing today?
2. Where am I?
3. What should I do next?
4. When am I finished?

A conceptual (visual/UX-level) framing of the Daily Study progression:

```
Recall → Learn → Apply → Targeted Repair (when needed) → Complete
```

This is the same underlying session shape as
[Daily Study Model](DAILY-STUDY-MODEL.md#typical-session-shape)'s
`Recall → concise teaching → pattern/role/lifecycle/definition as
appropriate → application → explanation → targeted repair if needed →
close`, described at the granularity appropriate for visual/UX design rather
than learning-model design — the two are not competing specifications. This
progression should **feel calm and guided rather than like a checklist
demanding completion.**

### Lesson presentation

Per the [Lesson Design Standard](LESSON-DESIGN-STANDARD.md), lesson content
should support concise learning through visually differentiated but
restrained treatment of elements such as: core idea, explanation/context,
CISM pattern, recognition clue, common trap, scenario/application, memory
rule. **Do not require every item to become a separate card.** Visual
differentiation (typography, spacing, subtle color/weight) should carry the
structure that the Lesson Design Standard's sequence defines, rather than
mechanically wrapping each step in its own container.

### Feedback and review

Feedback/review is a major learning surface and deserves especially strong
UX. This is the visual expression of the
[Explanation Standard](LESSON-DESIGN-STANDARD.md#explanation-standard)
already specified — the two must stay in sync; this section does not
redefine what an explanation contains, only how it should present. During
answer review, the interface must:

- keep the original question visible
- clearly show the learner's answer
- clearly show the correct answer
- explain why
- identify the relevant reasoning pattern when useful
- identify important wording/qualifier when useful
- explain why a tempting alternative is weaker when useful
- provide a concise, reusable takeaway

### Visual language for the learning model

The interface should visually support concepts, patterns, qualifiers,
roles, lifecycle stages, and learner evidence — the same vocabulary defined
by [Pattern Library](PATTERN-LIBRARY.md),
[Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md),
[Qualifier Decoder](QUALIFIER-DECODER.md), and
[Lifecycle Model](LIFECYCLE-MODEL.md) — through a **consistent design
language**, without becoming overly colorful or noisy. A future design
system should give each of these five vocabularies a recognizable but
restrained visual treatment (e.g., a consistent way patterns are referenced,
a consistent way roles are labeled), not a distinct color-coded system per
category.

### Accessibility

Accessibility is part of quality, not a later add-on. The future UI
implementation must be tested for: keyboard navigation; focus behavior;
semantic structure; contrast; responsive behavior; major interaction
states; and accessibility regressions where automation can reasonably
detect them. This extends, at the interface level, the same seriousness
this project already applies to engineering quality — see
[`docs/engineering/BASELINE.md`](../engineering/BASELINE.md)'s
accessibility findings from the current prototype, which this requirement
is intended to substantially improve on, not merely preserve.

### Explicit boundary for this phase

This is a **product requirement only** during Phase 2. Per direct
instruction: do not redesign `index.html`; do not modify CSS; do not modify
JavaScript; do not install UI frameworks; do not create mock application
code; do not begin the design system; do not begin Phase 3 or a UI
implementation phase as a result of this section existing. A dedicated
UI/UX Design System phase will occur later, separately approved.

## What this document does not decide

Implementation architecture, data model, storage schema, specific UI
component design, and specific screen flow are out of scope for this
document and for Phase 2 as a whole. The section above establishes the
*required quality bar and principles* for the interface — it does not
design the interface. This is a learning/product specification only — see
the Phase 2 scope statement in [`docs/learning/README.md`](README.md).
