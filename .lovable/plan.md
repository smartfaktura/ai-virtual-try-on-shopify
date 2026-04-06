

# Upgrade Background Swatch Selector

## What changes

Redesign the background selector: bigger 3:4 swatch cards in a 6-column grid, expand to 12 total options (including gradients, custom color, custom gradient), and replace raw HEX inputs with modern popover-based color pickers.

## Layout

All 12 items in one unified grid — 2 rows of 6 on desktop:

```text
Row 1: Pure White | Off-White | Light Gray | Warm Beige | Cool Gray | Taupe
Row 2: Sage | Blush | Charcoal | Soft Gradient | Warm Fade | Cool Fade
```

Below the grid: two action buttons — `+ Custom Color` and `+ Custom Gradient` — that open popover pickers. When a custom color/gradient is picked, it appears as a temporary 13th card appended to the grid.

## Changes

### File: `ProductImagesStep3Refine.tsx`

**1. Redefine `BG_SWATCH_OPTIONS` to 12 items:**

| # | Value | Label | Fill |
|---|---|---|---|
| 1 | `white` | Pure White | #FFFFFF |
| 2 | `off-white` | Off-White | #FAFAFA |
| 3 | `light-gray` | Light Gray | #E5E7EB |
| 4 | `warm-neutral` | Warm Beige | #F5F0EB |
| 5 | `cool-neutral` | Cool Gray | #EDF0F4 |
| 6 | `taupe` | Taupe | #D6CFC7 |
| 7 | `sage` | Sage | #E8EDE6 |
| 8 | `blush` | Blush | #F8ECE8 |
| 9 | `charcoal` | Charcoal | #3A3A3A |
| 10 | `gradient` | Soft Gradient | linear-gradient(135deg, #F8F8F8, #EEE) |
| 11 | `gradient-warm` | Warm Fade | linear-gradient(135deg, #FAF7F2, #F0E6D8) |
| 12 | `gradient-cool` | Cool Fade | linear-gradient(135deg, #F0F4F8, #E0E8F0) |

Remove `gradient-sunset`, `custom`, `gradient-custom` from the grid array (custom options move to action buttons below).

**2. Bigger 3:4 swatch cards, 6 per row:**
- Change grid from `grid-cols-5 sm:grid-cols-10` → `grid-cols-3 sm:grid-cols-6`
- Each swatch: `aspect-[3/4]` rounded-xl card with full-bleed color fill, label overlaid at bottom (white text on dark gradient overlay), checkmark badge top-right when selected
- Matches the `CatalogStepBackgroundsV2` card style already in the codebase

**3. Custom Color popover:**
- `+ Custom Color` button below the grid
- Opens a `Popover` with a curated 6×5 palette grid of common product photography colors + HEX input at bottom
- Live preview swatch in popover
- On confirm, `custom` value is toggled into the selection and an extra card with the custom fill appears appended to the grid

**4. Custom Gradient popover:**
- `+ Custom Gradient` button next to custom color
- Opens a `Popover` with dual color pickers ("From" / "To"), each with the same palette grid + HEX input
- Live gradient preview bar between them
- On confirm, `gradient-custom` value is toggled and a gradient-filled card appears in the grid

**5. Multi-select logic stays the same** — toggle adds/removes from comma-separated string. `custom` and `gradient-custom` remain mutually exclusive with each other.

## Files

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | Rewrite `BG_SWATCH_OPTIONS` (12 items), redesign `BackgroundSwatchSelector` with 3:4 aspect cards, 6-col grid, popover color/gradient pickers |

