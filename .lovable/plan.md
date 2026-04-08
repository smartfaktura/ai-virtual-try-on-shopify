

# Fix Per-Scene Ratio Multi-Select & Improve Section Naming

## Problem
1. **Broken multi-format per-scene view**: The global Format selector supports multi-select (e.g., selecting both 4:5 and 1:1), but the per-scene ratio chips (`MiniRatioChips`) only show/support a single active ratio. The override data model is `Record<string, string>` (single value), so selecting a ratio per scene overwrites the global multi-selection instead of extending it.
2. **Poor section naming**: "Scene Ratios & Props" with subtitle "Set per-scene aspect ratios or add styling accessories" is unclear for users.

## Solution

### 1. Upgrade per-scene overrides to multi-select — `types.ts`
Change `sceneAspectOverrides` type from `Record<string, string>` to `Record<string, string[]>`. Each scene's override becomes an array of ratios. When no override exists, the scene inherits the global `selectedAspectRatios` array.

### 2. Update `MiniRatioChips` to multi-select — `ProductImagesStep3Refine.tsx` + `ProductImagesStep3Settings.tsx`
- Accept `activeRatios: string[]` (the effective ratios for this scene — either override or global) instead of a single `value`
- Toggle individual ratios on/off; show all globally-selected ratios as active by default
- Prevent deselecting the last ratio
- Show a "×N" badge or highlight when a scene has a custom override differing from global

### 3. Update Step 4 Review handler — `ProductImagesStep4Review.tsx`
- `handleSceneRatioChange` toggles a ratio in the scene's override array
- Show active count per scene
- Inherit global ratios when scene has no override

### 4. Update generation logic — `ProductImages.tsx`
Where `details.sceneAspectOverrides?.[scene.id]` is read (lines ~384, ~428), resolve it as an array. The existing loop already iterates `selectedRatios` — just replace with per-scene resolved ratios when an override exists.

### 5. Update `computeTotalImages` — `sceneVariations.ts`
Account for per-scene ratio counts instead of one global `formatCount`.

### 6. Rename section — `ProductImagesStep4Review.tsx`
- Title: **"Advanced Scene Controls"**
- Subtitle: *"Fine-tune format and props for individual scenes"*

## Files modified
1. `src/components/app/product-images/types.ts` — change override type to `string[]`
2. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — multi-select `MiniRatioChips`
3. `src/components/app/product-images/ProductImagesStep3Settings.tsx` — same `MiniRatioChips` update
4. `src/components/app/product-images/ProductImagesStep4Review.tsx` — multi-toggle handler + rename section
5. `src/pages/ProductImages.tsx` — resolve per-scene ratio arrays in generation
6. `src/lib/sceneVariations.ts` — per-scene ratio count in total calculation

