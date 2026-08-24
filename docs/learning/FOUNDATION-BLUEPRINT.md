# Foundation Blueprint — How to Read CISM

**Status: [CANONICAL].** The eight-step reasoning process and its
elimination trap list were specified directly in the Phase 2 architectural
discussion. This document formalizes Foundation as the first stage of the
[Curriculum Blueprint](CURRICULUM-BLUEPRINT.md), preceding Domain 1.

## Purpose

Foundation's job is to teach the learner **how to reason through a CISM
question** before any domain content is taught, and specifically before
Mixed Practice ever asks the learner to classify a question's qualifier,
role, lifecycle, or decision type. Testing a skill before teaching it
produces guessing, not learning — this ordering constraint is structural,
not a suggestion (see [Curriculum Blueprint](CURRICULUM-BLUEPRINT.md) and
[Mixed Practice section of the Repair Model](REPAIR-MODEL.md#relationship-to-mixed-practice)).

## The eight-step reasoning process

**[CANONICAL]** — this is the canonical sequence; all
domain-blueprint application content and all Mixed Practice/Daily Study
apply-phase feedback should be teachable as an instance of these eight
steps.

### 1. ASK — What is the qualifier?
FIRST / NEXT / BEST / MOST / PRIMARY / etc. See the full
[Qualifier Decoder](QUALIFIER-DECODER.md). This is the first thing to
identify because it determines what *kind* of answer the question wants
(sequence, priority, fit, or purpose) before any content knowledge is
applied.

### 2. STATE — What has already happened?
The facts already established in the stem. This is the input to steps 3
(STAGE) and 8 (ELIMINATE) — most lifecycle-jumping and lifecycle-reversal
traps are caught here, by taking the stem's stated facts literally instead
of assuming a "typical" scenario.

### 3. STAGE — Where are we in the relevant lifecycle?
Using the [Lifecycle Model](LIFECYCLE-MODEL.md)'s canonical stage sequence
for Domain 2 (risk) or Domain 4 (incident) scenarios. This step is what
makes [Pattern P04](PATTERN-LIBRARY.md#p04--no-lifecycle-jumping) and
[Pattern P05](PATTERN-LIBRARY.md#p05--no-lifecycle-reversal) operational
rather than abstract. **Domain 1 and Domain 3 do not have a canonical
lifecycle** — for those domains this step instead means locating the
scenario against the domain's [conceptual model](LIFECYCLE-MODEL.md#domain-1--domain-3--conceptual-model-not-canonical)
(governance/direction vs. program/execution), which is a coarser signal
than true lifecycle positioning.

### 4. ROLE — Who is involved?
Using the [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md)'s twelve
canonical roles.

### 5. VERB — What is that role being asked to do?
Approve / accept / develop / recommend / implement / monitor / audit /
classify / sponsor / etc. — matched against the role identified in step 4.
This is [Pattern P03](PATTERN-LIBRARY.md#p03--role-verb-matching) applied
directly.

### 6. OBJECTIVE — What outcome is actually being sought?
Distinguishing the *purpose* of the question from the *activity* described
in it — [Pattern P06](PATTERN-LIBRARY.md#p06--purpose-vs-activity).

### 7. BUSINESS CONTEXT — What business consequence or objective matters?
Anchoring back to [Pattern P01](PATTERN-LIBRARY.md#p01--business-alignment) —
the business objective or consequence stated in the stem, not a generic
security preference.

### 8. ELIMINATE — Identify attractive wrong answers
**[CANONICAL]** — the canonical elimination trap list:

- Right action, wrong time (lifecycle mismatch — [P04](PATTERN-LIBRARY.md#p04--no-lifecycle-jumping)/[P05](PATTERN-LIBRARY.md#p05--no-lifecycle-reversal)).
- Right person, wrong authority (role/verb mismatch — [P02](PATTERN-LIBRARY.md#p02--authority-follows-accountability)/[P03](PATTERN-LIBRARY.md#p03--role-verb-matching)).
- Technical answer to a management question.
- Activity instead of purpose ([P06](PATTERN-LIBRARY.md#p06--purpose-vs-activity)).
- Control exists but effectiveness not demonstrated ([P07](PATTERN-LIBRARY.md#p07--implementation--effectiveness)).
- Preventive action after the event already occurred ([P05](PATTERN-LIBRARY.md#p05--no-lifecycle-reversal)).
- Implementation-level answer to a governance-level question.

This list is not exhaustive of every distractor in the exam — it is the set
of *recurring shapes* the learner should scan for once a candidate answer
looks attractive but wrong.

## How Foundation should be taught

Per the [Lesson Design Standard](LESSON-DESIGN-STANDARD.md): compact,
scenario-driven, immediate retrieval — not a lecture on all eight steps at
once. A workable approach (subject to confirmation in Phase 4 implementation
planning, not decided here) is to introduce the eight steps gradually across
Foundation's early sessions, each paired with a short scenario and immediate
application, rather than presenting the full process as a single upfront
list before any practice. **[CANDIDATE / IMPLEMENTATION
DECISION — not a content claim, a sequencing suggestion for Phase 4]**

## What Foundation must accomplish before Domain 1 begins

- The learner can identify a qualifier and state what kind of test it implies (ranking, sequencing, fit, or purpose).
- The learner can locate "what has already happened" in a stem and use it to reason about lifecycle position, generically (without yet knowing any one domain's specific lifecycle in depth).
- The learner can name the role and verb in a simple stem.
- The learner can recognize, by name, the seven elimination traps above.
- The learner has NOT yet been asked to classify a question across all four Mixed Practice dimensions at once — that remains gated until domain content exists to ground it (see [Curriculum Blueprint](CURRICULUM-BLUEPRINT.md)).

## Foundation readiness note (Phase 9B-4) — approved future enhancement, not yet implemented

**[CANDIDATE — operational note, not a change to the canonical eight-step
process above.]** During the Phase 9B-4 Domain 2 gate
([`PHASE-9B4-GATE-RECORD.md`](PHASE-9B4-GATE-RECORD.md)), the founder
reported that a D2-U8 question specifically felt like a real CISM exam
question because it required close attention to wording and to what was
actually being asked, and identified this as a gap worth strengthening in
Foundation's own question-interpretation teaching.

**This is approved as a future, separately-bounded enhancement — it is
NOT implemented by this note, and no Foundation production content has
been modified.** Before any implementation, it requires its own bounded
implementation/review step, per explicit instruction. It does not replace
or redefine the canonical eight-step process above; it is a compact,
learner-facing reading checklist that the eight steps already support.

Approved reasoning model for that future work:

1. What is the question actually asking me to decide?
2. Who am I in this scenario? (Board, management, information security
   manager, risk owner, control owner, or other relevant roles.)
3. What VERB matters? (recommend, approve, implement, validate, monitor,
   assess.)
4. Where am I in the lifecycle? — Ask: "What has already happened?"
5. What does the qualifier change? (FIRST, NEXT, BEST, MOST, PRIMARY.)
6. Which answer fits the CISM management/governance perspective, rather
   than simply being the most technical or immediately actionable answer?

**Binding guardrail:** this must **not** become a collection of exam
hacks such as "when you see FIRST, always choose X." Qualifiers are
contextual (see the [Qualifier Decoder](QUALIFIER-DECODER.md)'s own
explicit warnings against this); the enhancement teaches reasoning, not
shortcut memorization. A future implementation may use tightly controlled
paired scenarios where one important word or lifecycle condition changes,
so the learner experiences *why* the correct decision changes — those
paired questions are not implemented now.

## Cross-references

- [Qualifier Decoder](QUALIFIER-DECODER.md), [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md), [Lifecycle Model](LIFECYCLE-MODEL.md), [Pattern Library](PATTERN-LIBRARY.md) — Foundation's four supporting reference documents.
- [Curriculum Blueprint](CURRICULUM-BLUEPRINT.md) — where Foundation sits in the overall sequence.
