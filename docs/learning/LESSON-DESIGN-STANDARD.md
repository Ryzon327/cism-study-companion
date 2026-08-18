# Lesson Design Standard

**Status: [CANONICAL].** Both the lesson sequence and the
explanation dimensions below were specified directly in the Phase 2
architectural discussion. This document folds two related approved
specifications into one file — lesson design and the explanation standard —
because both govern the same underlying thing: how a single piece of
teaching or feedback content is shaped. `docs/learning/README.md` records
this folding decision explicitly, since neither was listed as its own
required file in the Phase 2 file list.

## Why this standard exists

The explicit product feedback that motivated this document: courses should
be **more fruitful without becoming long**. This is a reaction against two
failure modes at once — content that is too thin to actually teach
understanding, and content that turns into a textbook wall of text. This
standard is the mechanism for holding both at once.

## The lesson-design sequence

```
Concept
→ Why it matters
→ Plain-English context
→ CISM perspective
→ Reusable pattern
→ Recognition clue
→ Short scenario
→ Decision reasoning
→ Common trap
→ Memory rule
→ Retrieval / application
```

**This is a design sequence, not a required set of visible headings.** A
lesson author (human or the rebuilt application's content pipeline) uses
this order to make sure nothing important is skipped, but the *rendered*
lesson should read as compact prose/interaction, not as eleven labeled
sections. The current prototype's Daily Study "Learn" phase — term, plain
meaning, recognition clue, contrast, memory rule — is one existing
compressed example of this shape in practice.
**[PROTOTYPE REFERENCE]** — an illustration of compression, not a template
to copy without review.

| Step | What it does | What it is NOT |
|---|---|---|
| Concept | Names the one thing being taught. | A list of related things. |
| Why it matters | One sentence on exam/practical relevance. | A motivational paragraph. |
| Plain-English context | The concept explained without jargon. | A dictionary definition. |
| CISM perspective | How CISM specifically frames this concept (often ties to a [pattern](PATTERN-LIBRARY.md)). | A generic security-textbook framing. |
| Reusable pattern | Which [Pattern Library](PATTERN-LIBRARY.md) entry, if any, applies. | A brand-new pattern invented per-lesson. |
| Recognition clue | The wording/context signal that tells the learner "this is that concept." | The concept restated. |
| Short scenario | One compact, realistic application. | A multi-paragraph case study. |
| Decision reasoning | Why the correct response follows from the scenario. | A restatement of the rule. |
| Common trap | The most common wrong turn — often a [Confusing Concepts](CONFUSING-CONCEPTS.md) pair or a pattern's "common distractor/trap" field. | A list of every possible wrong answer. |
| Memory rule | One short, quotable sentence the learner can recall under exam pressure. | A paragraph. |
| Retrieval / application | An actual question requiring the learner to use the concept, not just reread it. | A restatement disguised as a question. |

**Compactness rule (approved):** prefer *one* important concept, *one*
useful explanation, *one* scenario, *one* memorable rule, and *immediate*
application, over broader coverage per lesson. Breadth comes from repeated,
varied sessions over time (see [Daily Study Model](DAILY-STUDY-MODEL.md) and
[Curriculum Blueprint](CURRICULUM-BLUEPRINT.md)), not from a single
long lesson.

## Explanation Standard

**Status: [CANONICAL].** Feedback shown after a learner answers a
question — in Daily Study, Mixed Practice, or Practice Exam review — is
governed by this same document because it is, in effect, the lesson-design
sequence's "decision reasoning" and "common trap" steps applied
retroactively to a specific answered question.

### Non-negotiable structural rules

1. **Explanations should exist for both correct and incorrect responses**, when useful — getting an answer right does not prove the reasoning was right.
2. **The original question must remain visible while reviewing the explanation.** A learner should never have to hold the question in memory to make sense of feedback about it.
3. Explanations stay **concise** — this standard exists specifically to prevent feedback from becoming a second lesson bolted onto the first.

### Explanation dimensions (use what's useful, not all of them every time)

- Why the correct answer is correct.
- What wording in the stem mattered (often the [qualifier](QUALIFIER-DECODER.md)).
- Which [pattern](PATTERN-LIBRARY.md) is involved, if any.
- Role / authority (see [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md)).
- Qualifier (see [Qualifier Decoder](QUALIFIER-DECODER.md)).
- Lifecycle stage (see [Lifecycle Model](LIFECYCLE-MODEL.md)).
- Why a tempting alternative is weaker — this is the per-option "why wrong" content, not just "why right."
- Memory rule.
- What to recognize next time — the transferable signal, not just this specific question's answer.

### Relationship to diagnosis

When an explanation reveals *why* a wrong answer was chosen, that reason
should map to one of the [Repair Model](REPAIR-MODEL.md)'s failure types
(knowledge gap, role error, qualifier error, lifecycle error, etc.), so that
targeted repair — not just "you got it wrong" — can follow.

## How this document is used elsewhere

- [Foundation](FOUNDATION-BLUEPRINT.md) and every domain blueprint should be authored to fit this sequence.
- [Daily Study Model](DAILY-STUDY-MODEL.md) applies the Explanation Standard specifically to its "explanation" step.
- [Repair Model](REPAIR-MODEL.md) applies it to repair-specific feedback.
- [Curriculum Blueprint](CURRICULUM-BLUEPRINT.md#product-requirement-user-interface--experience)'s UI/UX product requirement specifies how this sequence and the Explanation Standard should *present* visually (restrained, not one-card-per-item; feedback as "a major learning surface") — a requirement on the interface, not a redefinition of the content standard here.
