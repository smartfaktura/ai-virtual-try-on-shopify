

# Debug Analysis: Product Images Flow — Current State

## Previous 11 issues — Status Check

All 11 previously identified bugs have been fixed:
- Credit calc now dynamic (line 989)
- INITIAL_DETAILS aligned with AUTO_AESTHETIC_DEFAULTS (brandingVisibility: 'product-accent')
- BLOCK_FIELD_MAP centralized in detailBlockConfig.ts
- Stale scene pruning effect added (Step2Scenes lines 228-242)
- buildOutfitDirective removed
- Person details hidden when model selected (line 452 check + UI line 1312)
- All injectIfMissing calls use globalOnly=true (lines 805-813)
- Quality toggle added (lines 1101-1111)

## New Issues Found

### 1. OutfitConfig not passed to prompt builder via `defaultOutfitDirective`
**File:** `productImagePromptBuilder.ts` line 423-428
**Severity:** Medium
**Issue:** `defaultOutfitDirective` checks `details.outfitConfig` and calls `buildStructuredOutfitString`. But if user edits outfit pieces in the UI without explicitly saving, `details.outfitConfig` reflects their edits. However, when the user loads a preset via `OutfitLockPanel.loadPreset()`, it calls `update({ outfitConfig: { ...preset.config } })`, which correctly updates. The issue is that on first mount, `details.outfitConfig` is `undefined` — so the prompt builder falls through to `categoryOutfitDefaults()` which returns flat strings. This is intentional, BUT the Refine UI shows `currentConfig = details.outfitConfig || defaultConfig` (line 779), making the user think their displayed outfit IS the active config. The UI shows "fitted white cotton t-shirt" but the prompt builder uses "fitted white t-shirt" from `categoryOutfitDefaults` (different wording).
**Fix:** When Refine step mounts and no `outfitConfig` exists, initialize it from the category defaults by calling `update({ outfitConfig: defaultConfig })` in a `useEffect`. This ensures what the user sees matches what the prompt builder uses.

### 2. Review step ignores `creditsPerImage` prop — recalculates internally
**File:** `ProductImagesStep4Review.tsx` lines 46-50
**Severity:** Low
**Issue:** The Review step receives `creditsPerImage` as a prop (line 750 passes it) but ignores it — recalculating `costPerImage` internally on line 49. This means the prop is dead. Not a bug since both calculate the same way, but the dead prop is confusing.
**Fix:** Remove the `creditsPerImage` prop from Step4Review or use it instead of recalculating.

### 3. `loadLastSettings` preserves format but loses `outfitConfig`
**File:** `ProductImages.tsx` line 173
**Severity:** Medium
**Issue:** `loadLastSettings` does `{ ...parsed, aspectRatio: details.aspectRatio, quality: details.quality, imageCount: details.imageCount }`. If the saved settings included an `outfitConfig` for garments but the user is now shooting fragrances, the old garments outfit gets loaded. The settings ARE keyed by category, so this is a low-probability scenario — but if the user had a garment product, saved settings, then switched to "other" category (which maps to the same key), the outfit won't match.
**Fix:** When loading last settings, clear `outfitConfig` if the saved category doesn't match the current `primaryCategory`. Already keyed by category so this is minor.

### 4. `hasMultipleCategories` computed inline on every render
**File:** `ProductImages.tsx` lines 731-739
**Severity:** Low (performance)
**Issue:** An IIFE computes `hasMultipleCategories` inline inside JSX on every render, creating a new function + Set each time. Should be a `useMemo`.
**Fix:** Move to a `useMemo` alongside `primaryCategory`.

### 5. `customizedCount` counts outfit and model fields as "customized"
**File:** `ProductImagesStep3Refine.tsx` line 976
**Severity:** Low (UX)
**Issue:** The "X customized" badge counts `outfitConfig`, `selectedModelId`, `customNote`, `outfitTop`, etc. as customizations. If a user selects a model and leaves everything else on auto, it shows "2 customized" (model + outfitConfig written by default). This inflates the count and makes the user think they've changed more than they have.
**Fix:** Add `outfitConfig`, `selectedModelId`, `outfitTop`, `outfitBottom`, `outfitShoes`, `outfitAccessories`, `customNote` to the `IGNORE_KEYS` set.

### 6. Preset bar doesn't highlight active preset
**File:** `ProductImagesStep3Refine.tsx` lines 832-851
**Severity:** Low (UX)
**Issue:** The preset bar chips all look identical regardless of whether the current outfit matches one. After loading "Studio Standard", the chip still has the same styling as unselected presets. Users can't tell which preset is active.
**Fix:** Compare `currentConfig` against each preset's `config` and apply the active chip style (`bg-primary text-primary-foreground`) when they match.

### 7. Prop picker modal excludes selected product IDs — should exclude the PRODUCTS being shot, not the selections
**File:** `ProductImagesStep3Refine.tsx` line 1414
**Severity:** Medium
**Issue:** `excludeIds={selectedProductIds}` passes the Set of selected product IDs (the products being photographed). This correctly prevents users from adding a product as its own prop. But the prop picker should also allow selecting products from `allProducts` that are NOT in the current shoot batch. Currently this works correctly — the exclude prevents self-reference. However, the prop picker only shows `allProducts`, which is ALL user products. If a user has 100 products and selected 3 for this shoot, they see all 100 minus those 3 in the prop picker. This is correct behavior.
**Status:** Not a bug after closer inspection.

## Summary — 6 issues (post-fix)

| # | Severity | Issue | File |
|---|----------|-------|------|
| 1 | Medium | OutfitConfig undefined on mount — UI shows defaults but prompt uses different strings | Step3Refine |
| 2 | Low | Dead `creditsPerImage` prop in Review step | Step4Review |
| 3 | Low | Last settings could load wrong outfit if category edge case | ProductImages |
| 4 | Low | `hasMultipleCategories` computed inline in JSX | ProductImages |
| 5 | Low | Customized count inflated by outfit/model fields | Step3Refine |
| 6 | Low | Active preset not visually indicated | Step3Refine |

## Files to Update

| File | Change |
|------|--------|
| `ProductImagesStep3Refine.tsx` | Initialize outfitConfig on mount, highlight active preset, expand IGNORE_KEYS |
| `ProductImagesStep4Review.tsx` | Remove dead `creditsPerImage` prop |
| `ProductImages.tsx` | Move hasMultipleCategories to useMemo, remove creditsPerImage from Step4 props |

