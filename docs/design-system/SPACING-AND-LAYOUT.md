# Spacing, Density, Layout Shell, Navigation, and Responsive Strategy

**Status: [CANONICAL]** for the structural requirements (capped reading
width, restrained navigation, mobile-first responsive behavior, minimal
dashboard behavior — all stated directly during Phase 4 review).
**[CANDIDATE]** for the specific scale, breakpoints, and pixel values
below.

## Spacing scale

8px base grid (4px for fine control):
```
4  8  12  16  24  32  48  64  96
```

## Density

"Comfortable," not compact-enterprise density — generous padding on every
interactive target (buttons, options, nav items), never the tight
4px-padding rows typical of admin dashboards.

## Reading measure

Content column capped at **~65–75 characters** (roughly 640–720px) for
lesson, explanation, and question text. This is a hard rule, not a
suggestion — it is the single decision that most directly prevents the
"wide dashboard" feeling on large screens, and it holds regardless of
viewport width (see Responsive, below).

## Touch/click targets

Minimum **44×44px**, no exceptions — including on desktop, both for
consistency and because it's required for tablet/mobile regardless.

## Application shell

**Desktop (≥1024px):** A slim, collapsible **navigation rail** on the left
(~72px collapsed / ~200px expanded, icon + label) — never a heavy sidebar
with nested menus. Central content column, capped per the reading measure
above, centered in the remaining space — **not stretched full-width on
ultra-wide monitors.** **No persistent right-hand context panel** — this is
the single biggest structural decision preventing a dashboard feeling.
Contextual information (e.g., "why you're seeing this") renders *inline*,
above the content it explains, never in a side rail.

**Tablet (640–1024px):** Nav rail collapses to icon-only by default;
content reflows to the same single reading column with adjusted margins.

**Mobile (<640px):** Nav becomes a minimal top bar (app mark + one menu
affordance) or a 3–4-item bottom tab bar (Today / Explore & Practice /
Progress); content is full-width, single column, edge padding only.

**Daily Study is an immersive mode, not a page.** When active, it takes
over the full viewport — nav chrome recedes to a single quiet close
affordance. See [`SCREEN-DAILY-STUDY.md`](SCREEN-DAILY-STUDY.md).

## Navigation model

Four top-level destinations, maximum: **Today**, **Explore & Practice**,
**Progress**, **Settings**. No nested menus for ordinary use — a learner
reaches Daily Study in one tap from Today, always. Explore & Practice and
Progress are one level deep, never two.

## Responsive strategy

| Breakpoint | Range | Behavior |
|---|---|---|
| Mobile | <640px | Single column, full-width content, bottom tab or minimal top bar, fixed-bottom primary actions where scroll requires it |
| Tablet | 640–1024px | Same single reading column, collapsed icon-only nav rail |
| Laptop | 1024–1440px | Full nav rail, reading column capped and centered |
| Wide desktop | ≥1440px | Identical to laptop — extra width becomes margin, never extra content width (the reading-measure cap is absolute) |

**Mobile-first, not "shrink the desktop layout."** The mobile Daily Study
experience is designed as the primary case first (most daily study likely
happens on a phone), then progressively enhanced with more breathing room
at larger sizes — never the reverse. This is directly what the Visual
Prototype Gate's mobile check ([`TESTING-STRATEGY.md`](TESTING-STRATEGY.md#visual-prototype-gate))
exists to confirm before implementation proceeds broadly.
