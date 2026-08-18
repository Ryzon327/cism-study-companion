# Question / Application and Feedback / Explanation

**Status: [CANONICAL]** for the original question staying visible during
feedback, explanations for both correct and incorrect answers, no
pre-submission answer signaling, and calm (non-harsh) correct/incorrect
presentation (all stated directly during Phase 4 review, reaffirming
[`docs/learning/LESSON-DESIGN-STANDARD.md`](../learning/LESSON-DESIGN-STANDARD.md)'s
Explanation Standard). **[CANDIDATE]** for the specific layout below.

> **Gate screens.** "Question / Apply" and "Answer Feedback" are two of the
> seven screens required by the
> [Visual Prototype Gate](TESTING-STRATEGY.md#visual-prototype-gate) — no
> complete application implementation proceeds until these are visually
> validated at desktop/mobile and light/dark.

## Question / Application

```
[QUESTION 3 OF 5]                          (quiet meta, top-left)
[Stem — H3 weight, dominant element]

○  A. [option text]
○  B. [option text]
○  C. [option text]
○  D. [option text]
   ↑ full-width rows, generous padding, min 44px height, letter indicator

[Confidence: Sure · Not sure · Guessing]   (segmented control, when present)

[Check answer →]                            (disabled until an option is chosen)
```

Selected-but-unsubmitted state is a **neutral** border/background tint —
never green/red before submission. This is a hard rule: **avoid visually
signaling the answer before submission**, both for fairness of assessment
and because it is a pattern worth preserving from the current prototype.
Mark-for-review (exam mode only —
[`SCREEN-PRACTICE-EXAM.md`](SCREEN-PRACTICE-EXAM.md)) is a small icon
toggle, top-right, not a separate button competing with the primary flow.
Every option is a real, focusable, keyboard-operable control (arrow/tab
navigation, Enter/Space to select), with a visible focus ring at all times
— see [`ACCESSIBILITY-STANDARD.md`](ACCESSIBILITY-STANDARD.md).

## Feedback / Explanation

The most important learning surface in the product, designed accordingly:

```
[Question — repeated, slightly condensed but fully readable]

Your answer:      B. [text]        ✕ (quiet icon, not a red block)
Correct answer:    A. [text]        ✓

Why
[explanation prose]

▸ Why B was weaker  (collapsed by default, expandable — keeps default view calm)

[pattern chip]  [qualifier chip]  [role chip]  [lifecycle-stage chip]   ← only the ones relevant to this question

↳ MEMORY RULE
  [reusable takeaway]
```

**The original question stays visible at all times** — non-negotiable, per
direct instruction and per the Explanation Standard. Correct answers render
the same structure minus the "why B was weaker" expandable section, but
*with* the "why" prose — matching the explicit requirement that correct
answers still get useful explanation when the concept warrants it. No wall
of text: every dimension tag (pattern/qualifier/role/lifecycle) is a single
compact chip from the shared family in
[`SEMANTIC-VISUAL-LANGUAGE.md`](SEMANTIC-VISUAL-LANGUAGE.md), and only
appears when that specific question actually tags that dimension — per
[`docs/data-model/SCHEMA-QUESTION.md`](../data-model/SCHEMA-QUESTION.md)'s
"don't force every field" rule, an untagged dimension simply doesn't
render, rather than showing an empty placeholder.

## Correct/incorrect presentation is calm, not harsh

Per direct instruction: incorrect answers do not create a harsh failure
experience. The `✕`/`✓` glyphs plus quiet neutral-surface rows (not colored
banners) are the entire visual vocabulary for right/wrong — see
[`DESIGN-TOKENS.md`](DESIGN-TOKENS.md)'s semantic-state rule (icon or label
always accompanies color, color never stands alone, no large colored
panels). A miss transitions naturally into the Repair phase
([`SCREEN-DAILY-STUDY.md`](SCREEN-DAILY-STUDY.md)), which is explicitly
designed as encouragement, not remediation.
