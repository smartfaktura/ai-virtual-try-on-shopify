

# Move Format & Output to Review Step

## Rationale

The Refine step should focus purely on **creative direction** (backgrounds, lighting, mood, model, outfit). Format settings (aspect ratio, image count, quality) and per-scene overrides/props are **output configuration** — they naturally belong in the Review step where the user finalizes their generation plan before hitting Generate.

This reduces cognitive load in Refine and makes Review more actionable (not just a read-only summary).

## Changes

### 1. Remove Format & Output from Refine (`ProductImagesStep3Refine.tsx`)
- Delete the entire "SECTION 5: Format & Output" collapsible (lines ~1726–1841)
- Delete the credit preview bar (lines ~1843–1855) — Review already shows credits
- Remove related state (`formatOpen`, `overridesOpen`) and helper components (`RatioShape`, `MiniRatioChips`, `PropPickerModal`) only if they're not used elsewhere — but they'll be moved to Review, so extract them first
- Remove `IMAGE_COUNT_OPTIONS`, `ratioOptions` constants if only used here

### 2. Expand Review step into an interactive step (`ProductImagesStep4Review.tsx`)
- Add `onDetailsChange` prop so format settings are editable (not read-only)
- Move the Format card (aspect ratio chips), Images per scene card, and Quality card into the Review layout — place them **above** the existing summary cards
- Move the Scene Ratios & Props collapsible into Review as well
- Move `PropPickerModal`, `MiniRatioChips`, `RatioShape` components into this file
- The existing Products/Scenes/Credits summary cards remain below as confirmation
- Credits card updates live as format settings change

### 3. Update parent orchestrator (`ProductImages.tsx`)
- Pass `onDetailsChange={setDetails}` to `ProductImagesStep4Review`
- Pass `allProducts` (for prop picker) to Step 4

### Files

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | Remove Format & Output section, credit preview, and related state/constants |
| `ProductImagesStep4Review.tsx` | Add editable Format & Output controls (aspect ratio, image count, quality, scene overrides, props) above the summary. Accept `onDetailsChange` and `allProducts` props. Move helper components from Refine. |
| `ProductImages.tsx` | Pass `onDetailsChange` and `allProducts` to Step4Review |

