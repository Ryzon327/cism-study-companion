# Typography System

**Status: [CANONICAL]** for the requirement that typography carry a major
share of the premium feel and avoid unnecessary font dependencies (stated
directly during Phase 4 review). **[CANDIDATE]** for the specific stack,
scale, and sizing below.

## Font strategy

System-UI stack as the baseline:
```
-apple-system, "Segoe UI", Roboto, Helvetica, Arial, system-ui, sans-serif
```
Zero network dependency, zero added weight — consistent with the project's
established zero-added-dependency posture through Phases 1–3 for anything
that doesn't need to be a dependency. Modern OS system fonts (San Francisco,
Segoe UI) are already excellent; a self-hosted variable font (never a CDN
font-loading dependency) is a legitimate future enhancement, not a
requirement — flagged as optional, not recommended by default. This is a
typography decision, independent of the technology architecture decision
deferred in [`TECHNOLOGY-ASSESSMENT.md`](TECHNOLOGY-ASSESSMENT.md).

## Scale

Modular, approximately 1.25 ratio:

| Role | Use |
|---|---|
| Display | Rare — completion headline only |
| H1 | Page title |
| H2 | Section heading |
| H3 | Card/subsection title, question stem weight |
| Body-reading | Lesson prose, explanations — slightly larger than typical UI text, for reading comfort |
| Body-UI | Buttons, labels, controls |
| Meta/caption | Timestamps, secondary metadata, eyebrow labels |

## Line height

- **1.6** for reading content (lessons, explanations, scenarios).
- **1.3–1.4** for UI/controls.

## Content-specific treatment

- **Question stem:** set at H3 weight/size — the visually heaviest text on the answer screen, establishing it as the thing being read, not a form label. See [`SCREEN-QUESTION-FEEDBACK.md`](SCREEN-QUESTION-FEEDBACK.md).
- **Explanation text:** Body-reading, generous paragraph spacing, capped line length (see [`SPACING-AND-LAYOUT.md`](SPACING-AND-LAYOUT.md)) — reads as a short editorial paragraph, not a terse system message.
- **Metadata/numeric treatment:** tabular figures for any number appearing in a list or counter (progress counts, exam timer), meta-size, `text-secondary` — numbers inform, they don't compete with content.
- **Eyebrow labels** (e.g., "PATTERN", "CURRENT FOCUS"): small caps or uppercase, letter-spaced, `text-secondary` — the one deliberate use of uppercase in the system, applied consistently rather than ad hoc.

## Accessibility interaction

Text sizing must tolerate 200% browser zoom and OS-level text-size
increases without content loss or horizontal scroll — see
[`ACCESSIBILITY-STANDARD.md`](ACCESSIBILITY-STANDARD.md). Relative units
(`rem`) throughout, never fixed pixel font sizes, so the scale above
resizes coherently with user preference.
