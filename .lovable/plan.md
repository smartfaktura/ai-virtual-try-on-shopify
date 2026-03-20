

# Fix: Replace "Images per Product" with Matrix-Based Calculation

## Problem
The wizard has two conflicting image-count concepts:
1. **"Images per Product"** — an arbitrary number (10/25/50/100) the user picks
2. **Model × Scene selections** — e.g., 5 models × 3 scenes = 15 combinations

These are contradictory. If you select 5 models and 3 scenes, the system should generate 15 images per product — not an unrelated "25" that the user separately chose.

## Solution
Make the image count work differently based on campaign mode:

### Curated Mode
Remove the "Images per Product" preset buttons entirely. The image count is **calculated automatically** from the matrix:
- `scenes × models × formats = images per product`
- Example: 3 scenes × 5 models × 2 formats = 30 images per product
- Show a live summary: "3 scenes × 5 models × 2 formats = 30 images per product"

For workflows without models (Product Listing Set), the matrix is just `scenes × formats`. If no scenes exist either, show a simple image count input.

### Mix Mode
Keep the "Images per Product" selector (10/25/50/100) since the system auto-randomizes and the user needs to specify how many total images they want.

## Changes

### File: `src/components/app/CreativeDropWizard.tsx`

**A. Compute image count from matrix in Curated mode** (near line 290)
```
const computedImageCount = (() => {
  if (campaignMode === 'mix') return imageCount; // user-chosen
  const sceneCount = Math.max(sceneSelections.size, 1);
  const modelCount = needsModels ? Math.max(modelSelections.length, 1) : 1;
  const formatCount = Math.max(formats.length, 1);
  return sceneCount * modelCount * formatCount;
})();
```

Use `computedImageCount` in the credit calculation and save logic instead of raw `imageCount`.

**B. Conditionally show "Images per Product" section** (lines 1001-1034)
- **Mix mode**: Show the preset buttons (10/25/50/100) as-is — user picks how many
- **Curated mode**: Replace with a read-only summary showing the matrix breakdown:
  ```
  3 scenes × 5 models × 2 formats = 30 images per product
  ```

**C. Update Credit Summary** (lines 1422-1441)
Use `computedImageCount` instead of `imageCount`. The breakdown text adjusts based on mode:
- Curated: "2 products × (3 scenes × 5 models × 2 formats) = 60 images"
- Mix: "2 products × 25 images × 2 formats = 100 images"

**D. Update save logic** (line 449)
Store `computedImageCount` as `image_count` in `sceneConfig`.

**E. Update the helper text under Models** (line 1273)
Remove the "25 images distributed across 5 models (~5 each)" text — it's misleading. In Curated mode, each model × scene combination is an explicit image.

## Summary
- 1 file, ~30 lines changed
- Curated mode: image count = scenes × models × formats (auto-calculated, no manual input)
- Mix mode: image count = user-chosen preset (10/25/50/100)
- Credit summary reflects the actual formula used

