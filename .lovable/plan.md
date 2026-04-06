

# Refine Step — UI Polish Pass

## Changes

### 1. Smaller background swatch cards + remove Charcoal
**File: `ProductImagesStep3Refine.tsx`**
- Change card aspect from `aspect-[4/3]` to `aspect-square` in the `BackgroundSwatchSelector` grid
- Increase grid density: `grid-cols-4 sm:grid-cols-8` (was `grid-cols-3 sm:grid-cols-6`)
- Remove `charcoal` entry from `BG_SWATCH_OPTIONS` array
- Shrink label text and overlay padding to match smaller cards

### 2. Improve "needs model" banner
**File: `ProductImagesStep3Refine.tsx`**
- Restyle the model-needed banner from the current amber left-bordered card into a proper wizard-style attention card with an icon, bold heading, description text, and a styled "Select Model" button (not the current tiny pill)
- Use a card-like layout: rounded-xl, subtle background, centered content with a User icon and clear CTA

### 3. Reorder: Product shots before Background
**File: `ProductImagesStep3Refine.tsx`**
- In the scenes section render block (~lines 1972-2037), move the product shots grid **above** the Background strip
- Background strip moves to render between product shots and on-model shots (or after both if no model shots)

### 4. Add background attention message
**File: `ProductImagesStep3Refine.tsx`**
- Add a small attention banner above the Background section (similar style to model banner but more subtle) reading: "Select a background for your selected scenes" with a Paintbrush icon
- Show count of scenes that use backgrounds, hide banner once at least one background is selected

### 5. Improve outfit presets — descriptive cards instead of color dots
**File: `ProductImagesStep3Refine.tsx`**
- Replace the current preset bar (horizontal chips with `PresetColorDots`) with descriptive cards
- Each card: title, 1-line description of the styling direction, no color swatches
- Descriptions:
  - **Studio Standard** — "Clean, neutral styling for commercial product focus"
  - **Editorial** — "Dark tones, tailored fits for magazine-ready shots"
  - **Minimal** — "Stripped-back whites and creams, relaxed silhouettes"
  - **Streetwear** — "Oversized fits, dark palette, urban energy"
  - **Luxury Soft** — "Silk and cashmere in warm neutrals, elevated elegance"
- Cards layout: horizontal scroll row, each ~160px wide, rounded-xl border, active state with primary ring
- Remove `PresetColorDots` component usage from preset buttons

## Files

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | All 5 changes above |

