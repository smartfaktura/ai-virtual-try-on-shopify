

# Remove Standard Quality + Add Live Credit Indicator to Steps 1-2

## Summary

Two changes:
1. Remove the "Standard (3 cr)" quality option from Product Images — all generations use Pro quality at 6 credits per image
2. Add a live credit estimate to the sticky bar that updates as users select products and scenes, with a warning when balance is insufficient

## Changes

### 1. Remove Standard quality option — force 6 credits per image

All `quality === 'standard' ? 3 : 6` references become a flat `6`.

| File | Change |
|---|---|
| `src/pages/ProductImages.tsx` (line 216) | Replace `creditsPerImage = quality === 'standard' ? 3 : 6` with `const creditsPerImage = 6` |
| `src/components/app/product-images/ProductImagesStep4Review.tsx` (line 83) | Same — hardcode `costPerImage = 6`, remove quality chip selector (lines 199-208) |
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` (line 1633) | Same — hardcode `costPerImage = 6` |
| `src/components/app/product-images/ProductImagesStep3Settings.tsx` | Remove any quality chip selector if present |

### 2. Live credit indicator in sticky bar during Steps 1-2

The sticky bar already shows credits on Steps 3-4. The fix is to ensure `totalCredits` is computed and passed even when `sceneCount > 0` during Step 2. Currently `totalImages` is already computed in `ProductImages.tsx` and passed to the sticky bar — the credit display is already wired. The bar already shows the credit pill when `totalCredits > 0`. Since `totalCredits = selectedProducts × selectedScenes × imageCount × 6`, it will display as soon as the user has at least 1 product and 1 scene selected.

The bar already turns the credit number red when `canAfford` is false. No additional work needed for the insufficient-credits warning — it's already wired.

### 3. Add insufficient-credits warning text

In the sticky bar, when `!canAfford && totalCredits > 0`, show a small "Not enough credits" label next to the credit pill, plus make the Generate button disabled with a tooltip. Currently the bar only turns the number red — add explicit text.

| File | Change |
|---|---|
| `src/components/app/product-images/ProductImagesStickyBar.tsx` | Next to credit pill, when `!canAfford`, render `<span className="text-xs text-destructive font-medium">Not enough credits</span>` |

### 4. Backend alignment

The `enqueue-generation` edge function already charges 6 credits for catalog jobs (`perImage = 4` for catalog, but product-images uses freestyle/workflow path with `quality === 'high'` → 6). Verify the job type sent is correct. The frontend sends `quality: 'high'` by default now, so the backend `calculateCreditCost` will return 6 per image for non-catalog jobs with high quality. No backend change needed.

## Files modified

- `src/pages/ProductImages.tsx`
- `src/components/app/product-images/ProductImagesStep4Review.tsx`
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`
- `src/components/app/product-images/ProductImagesStickyBar.tsx`

