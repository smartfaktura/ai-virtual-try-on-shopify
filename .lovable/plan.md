

# Auto-Navigate to Unfinished Product Tabs on Continue

## Problem
In multi-category mode, users can click Continue even if some products have 0 shots selected. There's no validation or guidance to complete all products.

## Solution

### 1. Validate all products have shots (ProductImages.tsx)
Update `canProceed` for step 2: in multi-category mode, check that **every** selected product has at least 1 scene in `perProductScenes`.

### 2. Smart Continue behavior (ProductImages.tsx)
In `handleNext` for step 2: instead of immediately going to step 3, find the first product with 0 shots. If found:
- Switch the active product tab to that product
- Show a toast: "Please select at least one shot for [product name]"
- Don't advance the step

This requires exposing a way to set the active product tab from the parent. Add a new prop `activeProductId` / `onActiveProductIdChange` to Step2, or use a ref.

### 3. Visual indicator for missing products (ProductImagesStep2Scenes.tsx)
On product tabs with 0 shots selected, show a subtle warning indicator:
- Red/orange dot or outline instead of the count badge
- The summary strip already shows "→ 0 shots" which is good, but make it visually stand out (e.g. text-destructive color)

## Files to Change

| File | Change |
|------|--------|
| `src/pages/ProductImages.tsx` | Update `canProceed` for step 2 to check all products have scenes; update `handleNext` step 2 to auto-navigate to empty product tab with toast |
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Accept `activeProductId`/`onActiveProductIdChange` props; add warning styling on tabs with 0 shots |

## Key Details
- **Single-category mode**: No change — `selectedSceneIds.size > 0` remains sufficient since all products share the same scenes.
- **Multi-category mode**: `canProceed` becomes `selectedProducts.every(p => (perProductScenes.get(p.id)?.size || 0) > 0)`.
- Product tabs with 0 shots get a `border-destructive/50` style and a small "needs shots" indicator.
- On clicking Continue with incomplete products, the first incomplete product tab auto-activates and a toast fires.

