## Issue

Editing Step3/Step4 causes the whole `/app/generate/product-images` page to fully reload (losing your selections/state) instead of doing a hot module swap.

Dev server logs show the cause clearly:
```
hmr invalidate ProductImagesStep3Refine.tsx
  Could not Fast Refresh ("ASPECT_RATIOS" export is incompatible)
hmr invalidate ProductImagesStep2Scenes.tsx
  Could not Fast Refresh ("CATEGORY_KEYWORDS" export is incompatible)
```

React Fast Refresh requires that a file export **only** React components. `ProductImagesStep3Refine.tsx` exports both its component and a constant `ASPECT_RATIOS`; `ProductImagesStep2Scenes.tsx` exports both its component and `CATEGORY_KEYWORDS`. Whenever either file (or anything it imports) changes, Vite must do a full reload.

## Fix

Pure code move — no behavior, no UI changes.

1. Create `src/components/app/product-images/constants.ts` containing:
   - `ASPECT_RATIOS` (moved from `ProductImagesStep3Refine.tsx`)
   - `CATEGORY_KEYWORDS` (moved from `ProductImagesStep2Scenes.tsx`)

2. Update imports in the 4 consumers to pull these from the new constants file instead of the step components:
   - `src/pages/ProductImages.tsx`
   - `src/components/app/product-images/ProductImagesStep2Scenes.tsx`
   - `src/components/app/product-images/ProductImagesStep3Refine.tsx`
   - `src/components/app/product-images/ProductImagesStep3Settings.tsx`
   - `src/components/app/product-images/ProductImagesStep4Review.tsx`

3. Remove the `export` from the constants left inside the step files (or delete them entirely if unused locally after the move).

After this, editing Step3/Step4 will hot-swap in place and the page will stop refreshing.
