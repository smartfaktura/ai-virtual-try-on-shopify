

# Debug Report: Product Images — Issues Found & Fixes

## Bug 1: `hasMultipleCategories` uses raw `product_type` instead of resolved category IDs

**File:** `src/pages/ProductImages.tsx` (lines 154-162)

The `hasMultipleCategories` memo falls back to `p.product_type || 'other'` when `analysis_json` is missing, producing raw strings like `"bag"` instead of `"bags-accessories"`. Two products with types "bag" and "handbag" would show as 2 categories when they're actually the same (`bags-accessories`).

**Fix:** Apply the same `CATEGORY_KEYWORDS` keyword fallback used in `primaryCategory` — resolve each product's category to a proper ID before counting unique values.

## Bug 2: Missing outfit defaults for `hats-small`, `home-decor`, `tech-devices`, `food-beverage`, `supplements-wellness`

**File:** `src/components/app/product-images/ProductImagesStep3Refine.tsx` (line 845-875)

`CATEGORY_OUTFIT_CONFIG_DEFAULTS` only has entries for 6 categories. Products in `hats-small` (hats, jewelry, watches) have person-based scenes but `getBuiltInPresets` returns `[]` because there's no default config. No fashion presets show up.

**Fix:** Add outfit defaults for `hats-small` (accessories-appropriate clothing). Categories like `home-decor`, `tech-devices`, `food-beverage` typically don't have person scenes, so they can share a generic fallback.

## Bug 3: `outfitOpen` initial state computed once — stale if model selected later

**File:** `src/components/app/product-images/ProductImagesStep3Refine.tsx` (line 1346)

`outfitOpen` is `useState(needsModel || hasPersonBlock)` — computed once on mount. If a user deselects their model (making `needsModel` true again), the section stays collapsed because `useState` only uses the initial value. Not a critical bug but a UX gap.

**Fix:** No change needed — the model-needed banner's "Select" button already calls `scrollToOutfit()` which opens it. Current behavior is acceptable.

## Bug 4: `isPresetActive` checks `name` key on OutfitConfig — always fails

**File:** `src/components/app/product-images/ProductImagesStep3Refine.tsx` (line 1079)

`const keys: (keyof OutfitConfig)[] = ['top', 'bottom', 'shoes', 'accessories', 'name']` — `name` is not a key on `OutfitConfig` (it exists on `OutfitPreset`, not `OutfitConfig`). This means `currentConfig['name']` is always `undefined` and `presetConfig['name']` is also `undefined`, so it coincidentally passes. Not a runtime error but incorrect and fragile.

**Fix:** Remove `'name'` from the keys array.

## Summary of Changes

| File | Changes |
|---|---|
| `ProductImages.tsx` | Fix `hasMultipleCategories` to use keyword-resolved category IDs |
| `ProductImagesStep3Refine.tsx` | Add `hats-small` outfit defaults + male overrides; remove `'name'` from `isPresetActive` keys |

