# Design Tokens (Color, Elevation, Light/Dark)

**Status: [CANONICAL]** for the requirement that all color is
token-based and that light/dark are equally first-class (stated directly
during Phase 4 review). **[CANDIDATE]** for the specific token names and
value characteristics below — a coherent, implementation-ready starting
point, not a locked palette (no literal hex/HSL values are specified here;
final values are set at implementation time against these roles and the
contrast requirements in [`ACCESSIBILITY-STANDARD.md`](ACCESSIBILITY-STANDARD.md)).

## Why tokens, not literals

Every color used anywhere in the application must resolve to one of the
named roles below. This is what makes Principle 5
([`DESIGN-PRINCIPLES.md`](DESIGN-PRINCIPLES.md)) structurally enforceable —
an implementer reaching for "just this one color" has to name which
semantic role it plays, which is itself a useful design check.

## Token roles

**Background hierarchy** — three levels, deliberately shallow:
```
bg              page base
surface         cards, panels
surface-raised  dialogs, dropdowns — the only elevated level
```

**Text hierarchy:**
```
text-primary     main content
text-secondary   metadata, captions, secondary labels
text-tertiary    disabled/quiet text
text-inverse     text on accent-filled surfaces
```

**Border hierarchy:**
```
border-subtle   default dividers
border          card/input edges
border-strong   rare emphasis
```

**Accent:**
```
accent            primary actions, current-state indicators, focus rings
accent-muted      hover/active backgrounds for accent-adjacent elements
accent-contrast   text placed on an accent-filled surface
```

**Semantic states** — deliberately muted, never a full-panel wash:
```
success   warning   danger   info
```
Each is used only as a small icon, border, or text accent — never as a
large colored background. Per direct instruction, correct/incorrect states
must not create a harsh failure experience: **no state is color-only** —
every semantic state pairs with an icon or text label (see
[`ACCESSIBILITY-STANDARD.md`](ACCESSIBILITY-STANDARD.md)).

**Interaction:**
```
focus-ring             always visible, never suppressed without an equally visible replacement
interactive-hover
interactive-active
interactive-disabled
```

**Content-type tags** (shared by the pattern/role/qualifier/lifecycle family, see [`SEMANTIC-VISUAL-LANGUAGE.md`](SEMANTIC-VISUAL-LANGUAGE.md)):
```
tag-bg   tag-border   tag-text
```
One neutral set, reused by all four content types — differentiation between
them comes from icon and typography, not four different color sets. This
is the direct token-level enforcement of "do not assign each pattern a
random color."

## Elevation

Two levels only: `surface` (flat, border-defined) and `surface-raised`
(the one shadow level, for dialogs and dropdowns). No shadow scale, no
multi-level card elevation — consistent with the "quiet borders over
shadows" rule in [`VISUAL-LANGUAGE.md`](VISUAL-LANGUAGE.md).

## Light and dark: two designs, one token system

Every token above has an independently-tuned light value and dark value —
dark mode is not a filter over light mode.

- **Light:** `bg` a near-white, slightly warm off-white (reduces glare versus pure white); `surface` white; `surface-raised` white plus the one shadow. Borders low-contrast gray.
- **Dark:** `bg` a dark neutral gray, **not pure black** (pure black causes halation on OLED and reads harsher than intended); `surface` one lightness step up from `bg`; `surface-raised` one step further — **elevation communicated by lightness steps, not heavier shadows**, since shadows barely read on dark surfaces.
- **Borders in dark mode are slightly lighter than their surface** — the inverse of light mode's slightly-darker-than-surface borders — because a dark-on-dark border is nearly invisible.
- **`accent` gets an independently-tuned dark value** (typically a touch lighter/less saturated than its light value) to hold AA contrast against the darker background without appearing to glow.
- **Semantic states get independently-tuned dark values too** — a raw color inversion frequently breaks contrast or reads as garish; each is tuned on its own.

Every screen document in this directory is designed against these token
names, never against a literal light-mode color, so switching modes changes
zero layout and zero readability — verified at implementation time by the
Visual Prototype Gate's explicit light/dark check
([`TESTING-STRATEGY.md`](TESTING-STRATEGY.md#visual-prototype-gate)).
