

# Multi-Format Selection in Product Images Review Step

## What
Convert the Format (aspect ratio) selector in Step 4 (Review) from single-select to multi-select. When multiple formats are selected, each scene generates images in every selected format, multiplying the total image count and credit cost accordingly.

## Changes

### 1. Add `selectedAspectRatios` to `DetailSettings` — `types.ts`
Add a new optional field `selectedAspectRatios?: string[]` to store multiple selected ratios. The existing `aspectRatio` stays as the "primary" for backward compatibility.

### 2. Convert Format selector to multi-select chips — `ProductImagesStep4Review.tsx`
Replace the single-select `ChipSelector` for Format with a multi-select version (toggle on/off). Show a count badge when multiple are selected. Each chip toggles its ratio in/out of the set, with at least one always required.

### 3. Update `computeTotalImages` — `sceneVariations.ts`
Factor in `details.selectedAspectRatios?.length || 1` as a multiplier in the total image calculation. This automatically flows into the credit cost display since `totalCredits = totalImages * 6`.

### 4. Update generation loop — `ProductImages.tsx`
When enqueuing jobs, loop over each selected aspect ratio (in addition to existing product × scene × variation loops), setting the correct `aspectRatio` on each payload.

### 5. Update Step 4 credit summary
The existing credit math already derives from `computeTotalImages`, so once that function accounts for multi-ratio, the UI updates automatically. Add a "× N formats" label in the breakdown text when multiple formats are selected.

## UI behavior
- Chips work as toggles (click to add/remove)
- Selected chips get the existing `bg-primary text-primary-foreground` style
- At least 1 format must remain selected (prevent deselecting the last one)
- Credit cost updates in real-time as formats are toggled

## Files modified
1. `src/components/app/product-images/types.ts` — add `selectedAspectRatios`
2. `src/lib/sceneVariations.ts` — multiply by format count
3. `src/components/app/product-images/ProductImagesStep4Review.tsx` — multi-select chips UI
4. `src/pages/ProductImages.tsx` — loop over ratios during generation

