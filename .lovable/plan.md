

# Multi-Model Selection in Product Images Flow

## What Changes

Currently the Product Images flow allows selecting **one model** via `details.selectedModelId`. This plan adds support for selecting **multiple models**, multiplying the generation matrix accordingly (Products × Scenes × Models × Ratios × Variations).

## Scope of Changes

### 1. Types — `src/components/app/product-images/types.ts`
- Add `selectedModelIds?: string[]` to `DetailSettings` (keep `selectedModelId` for backward compat)

### 2. Model Picker UI — `src/components/app/product-images/ProductImagesStep3Refine.tsx`
- Change `ModelPickerSections` to support multi-select (toggle models in/out of a Set)
- Update the `onSelect` callback: instead of toggling a single ID, add/remove from `selectedModelIds` array
- Show count badge: "2 selected" instead of just "selected"
- Keep the "View All" modal working with multi-select checkmarks

### 3. Credit Calculation — `src/lib/sceneVariations.ts`
- Update `computeTotalImages`, `computeTotalImagesPerProduct`, and `computeTotalImagesPerCategory` to accept a `modelCount` parameter (default 1)
- Multiply total by `modelCount`

### 4. Review Step — `src/components/app/product-images/ProductImagesStep4Review.tsx`
- Show all selected model thumbnails in the review summary
- Display updated credit math showing the model multiplier

### 5. Generation Loop — `src/pages/ProductImages.tsx`
- Resolve `selectedModelIds` → array of model refs (with base64 conversion)
- Add an outer loop over models in the job-building phase
- Each model gets its own set of jobs (same scenes/products, different model ref)
- Update `needsModel` check to use `selectedModelIds.length > 0`
- Update auto-select logic to set `selectedModelIds: [firstModel.modelId]`

### 6. Prompt Builder — `src/lib/productImagePromptBuilder.ts`
- No structural changes needed — it already receives `selectedModelId` per job via `details`
- Each job in the loop will have its own `selectedModelId` set

## Credit Math
```
Total = Products × Scenes × Models × Ratios × Variations × ImagesPerScene × 6 credits
```
Example: 2 products × 3 scenes × 2 models × 1 ratio = 12 images = 72 credits

## Files Changed
1. `src/components/app/product-images/types.ts` — add `selectedModelIds`
2. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — multi-select model picker
3. `src/components/app/product-images/ProductImagesStep4Review.tsx` — show multiple models in review
4. `src/lib/sceneVariations.ts` — multiply by model count
5. `src/pages/ProductImages.tsx` — generation loop over models, credit calc, auto-select

