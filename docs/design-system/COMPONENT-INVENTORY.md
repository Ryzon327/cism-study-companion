# Component Inventory

**Status: [CANDIDATE].** A naming and composition proposal — nothing here
is implemented. Names and boundaries may reasonably shift once the
technology decision in [`TECHNOLOGY-ASSESSMENT.md`](TECHNOLOGY-ASSESSMENT.md)
is made and the Visual Prototype Gate
([`TESTING-STRATEGY.md`](TESTING-STRATEGY.md#visual-prototype-gate))
produces evidence; the *set* of concerns each name represents is the
durable part of this document, not the exact name.

## Shell

- **`AppShell`** — the outer frame: nav rail/bar + content region, per [`SPACING-AND-LAYOUT.md`](SPACING-AND-LAYOUT.md).
- **`NavigationRail`** — the four-item, collapsible desktop/tablet nav; becomes a bottom tab bar or minimal top bar on mobile.
- **`PageHeader`** — page title + minimal supporting meta, used outside immersive Daily Study mode.

## Study flow

- **`StudyPhaseIndicator`** — the quiet eyebrow + thin progress line in [`SCREEN-DAILY-STUDY.md`](SCREEN-DAILY-STUDY.md).
- **`LessonSection`** — the flowing Learn-phase module (title, subhead, body prose).
- **`Scenario`** — the quiet inset/quoted scenario block, reused in lessons and repair.
- **`PatternCallout`** — the one block-level content-type component (see [`SEMANTIC-VISUAL-LANGUAGE.md`](SEMANTIC-VISUAL-LANGUAGE.md)), reused identically across Lesson, Feedback, and Repair.
- **`MemoryRule`** — the small pull-quote strip, reused across Lesson, Feedback, and Repair.
- **`RepairNote`** — the calm, non-punitive repair-phase wrapper around `PatternCallout` + one alternate example.

## Question/answer

- **`Question`** — stem + options, shared by Daily Study Apply, Mixed Practice, and Practice Exam (with coaching chrome conditionally stripped for exam mode).
- **`AnswerOption`** — a single full-width, keyboard-operable option row with a stable `key` (a–d), never a position-dependent index (per [`docs/data-model/SCHEMA-QUESTION.md`](../data-model/SCHEMA-QUESTION.md)'s stable-option-key design).
- **`ConfidenceControl`** — the Sure/Not sure/Guessing segmented control.
- **`FeedbackPanel`** — the full post-answer explanation surface in [`SCREEN-QUESTION-FEEDBACK.md`](SCREEN-QUESTION-FEEDBACK.md).

## Semantic tags

- **`PatternCallout`** (listed above) doubles as the Pattern treatment.
- **`RoleTag`** — the role pill.
- **`QualifierMark`** — the typographic qualifier treatment.
- **`LifecycleTrack`** — the horizontal stage sequence with current-stage highlight.

## Progress/navigation

- **`Journey`** — the six-node curriculum stepper, visually distinct from `LifecycleTrack` by design (see [`SCREEN-HOME-JOURNEY.md`](SCREEN-HOME-JOURNEY.md)).
- **`ReviewCenter`** — the Practice Exam marked/unanswered review surface and its queue navigation.
- **`ProgressLine`** — the thin 2px fill bar used by `StudyPhaseIndicator` and the exam header.

## Primitives

- **`Button`** — primary / secondary / text-weight variants (the weight distinction is what makes "optional" visually mean optional, per [`SCREEN-DAILY-STUDY.md`](SCREEN-DAILY-STUDY.md)'s Completion phase).
- **`FormControl`** — labeled input wrapper with built-in error/validation accessibility (see [`ACCESSIBILITY-STANDARD.md`](ACCESSIBILITY-STANDARD.md)).
- **`Dialog`** — modal primitive with the focus-trap/return behavior required by `ACCESSIBILITY-STANDARD.md`; used for exam-submit confirmation and any future confirmation flow.
- **`EmptyState`** — quiet "nothing here yet" treatment (e.g., Weak Areas with no evidence), never alarming.
- **`Toast`** — the existing runtime-warning pattern (storage warnings, background errors), elevated visually but kept calm and non-blocking.

Roughly twenty components — deliberately small, matching a low-chrome
product with few distinct interaction surfaces.
