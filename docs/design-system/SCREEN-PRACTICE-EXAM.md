# Practice Exam and Review Center

**Status: [CANONICAL]** for preserving the existing Review Center behavior
and keeping the exam free of coaching hints (stated directly during Phase 4
review, reaffirming the Phase 1 engineering baseline's identification of
the Review Center as a genuinely well-built state machine worth
preserving). **[CANDIDATE]** for the specific layout below.

> **Gate screens.** "Practice Exam" and "Review Center" are two of the
> seven screens required by the
> [Visual Prototype Gate](TESTING-STRATEGY.md#visual-prototype-gate) — no
> complete application implementation proceeds until these are visually
> validated at desktop/mobile and light/dark.

## Exam question

The same `Question` component used everywhere else
([`SCREEN-QUESTION-FEEDBACK.md`](SCREEN-QUESTION-FEEDBACK.md)), **with all
coaching chrome stripped** — no domain label, no memory rule, no pattern
hints, no recognition clue. This is a hard rule: *no Daily Study coaching
or unnecessary instructional UI inside active exam mode.*

## Header

```
[12 / 40]                     ← quiet counter, thin progress line
[Timer: 42:18]                ← tabular numerals, quiet, when timed
```

The timer shifts to a single muted-warning tint at 10 minutes remaining —
no flashing, no escalating alarms, preserving the existing calm-timer
behavior exactly.

## Review Center

Two labeled sections, **Marked** and **Unanswered**, each a compact
numbered grid of jump buttons showing answered/unanswered state via icon +
quiet fill (never color alone). "Review all marked" / "Review all
unanswered" as clear secondary actions that enter a dedicated review queue
— preserving the existing state machine exactly:

- Jump to any individual marked or unanswered question directly.
- Enter a sequential review queue (marked, or unanswered) with its own Previous/Next confined to that queue.
- Unmark or answer a question mid-review and have it cleanly leave the relevant queue.
- An always-available "Return to Review Center" action while reviewing.
- Return to the main exam from Review Center without losing position.

Submit requires a confirmation `Dialog`
([`COMPONENT-INVENTORY.md`](COMPONENT-INVENTORY.md)) stating the
unanswered-question count — a deliberate, calm checkpoint, not a scary
warning ("You have 3 unanswered questions. Submit anyway?" — neutral tone,
no urgency styling).

## What does not appear in exam mode

Memory rules, pattern callouts, recognition clues, mark-for-review styling
borrowed from Daily Study's calm palette but never any instructional
copy — the exam surface stays deliberately plain and serious throughout,
consistent with [`DESIGN-PRINCIPLES.md`](DESIGN-PRINCIPLES.md)'s
content-first rule applied to a context where the "content" is the
assessment itself, not teaching.
