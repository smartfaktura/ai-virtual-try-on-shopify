

# Debug & Fix Product Images Issues

## Bugs Found

### Bug 1: Category detection fails for "bag" products — scenes not recommended

**Root cause:** `primaryCategory` in `ProductImages.tsx` (line 133-139) falls back to `product_type` raw string (e.g. `"bag"`) when `analysis_json` is missing. But the scene system uses category IDs like `"bags-accessories"`. The `detectRelevantCategories` function in Step 2 has a keyword fallback with word-boundary matching, but `primaryCategory` does NOT use this — it just returns the raw `product_type` string.

Additionally, the `analyses` map from `useProductAnalysis` is populated asynchronously. If analysis hasn't completed yet when Step 2 renders, `productAnalyses` will be empty, and the keyword fallback in `detectRelevantCategories` will run. But since the keyword match for "bag" looks for `\bbag\b` in the combined text — and `product_type` IS included in the combined text — the Step 2 detection should work for scene recommendations.

The real gap is `primaryCategory`: it returns raw `product_type` ("bag") instead of the matching category ID ("bags-accessories"). This breaks outfit presets because `CATEGORY_OUTFIT_CONFIG_DEFAULTS` keys are category IDs.

**Fix:** In `ProductImages.tsx`, add a keyword-based fallback to `primaryCategory` that maps raw `product_type` to the correct category ID using the same `CATEGORY_KEYWORDS` logic from Step 2. Extract/share the keyword map, or inline a simple mapper function.

### Bug 2: Fashion presets (Streetwear, Luxury Soft) not showing

**Root cause:** `getBuiltInPresets` at line 899 does `CATEGORY_OUTFIT_CONFIG_DEFAULTS[category]` — if category is `"bag"` (the raw product_type), there's no matching key, so it returns `[]`. No presets show at all. This is a direct consequence of Bug 1.

**Fix:** Same as Bug 1 — once `primaryCategory` resolves to `"bags-accessories"`, the presets will render.

### Bug 3: `analyses` not passed to Step 2 correctly when products lack `analysis_json`

The `analyses` map is populated by `useProductAnalysis` which is triggered on Step 1. If the edge function hasn't responded yet when the user moves to Step 2, `productAnalyses` will be `{}`, and the system falls back to keyword matching. This is actually working correctly but may explain why the "Recommended" section shows "Other / Custom" instead of "Bags & Accessories" — the AI analysis may have returned a different category or failed.

**Fix:** Also pass the `analyses` map to `primaryCategory` computation so it uses AI results when available.

## Changes

### File: `src/pages/ProductImages.tsx`

1. Update `primaryCategory` to also check the `analyses` map (from `useProductAnalysis`) and add a keyword-fallback mapper that converts raw `product_type` strings to category IDs:

```
const primaryCategory = useMemo(() => {
  for (const p of selectedProducts) {
    // Check live analyses map first
    const liveAnalysis = analyses[p.id];
    if (liveAnalysis?.category) return liveAnalysis.category;
    // Then cached analysis_json
    const analysis = p.analysis_json as any;
    if (analysis?.category) return analysis.category;
  }
  // Keyword fallback: map raw product_type to category ID
  const combined = selectedProducts.map(p => 
    `${p.title} ${p.description} ${p.product_type} ${(p.tags || []).join(' ')}`.toLowerCase()
  ).join(' ');
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(combined))) return catId;
  }
  return undefined;
}, [selectedProducts, analyses]);
```

2. Import `CATEGORY_KEYWORDS` from Step 2 (or extract it to a shared constants file so both Step 2 and ProductImages.tsx can use it).

### File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

3. Export `CATEGORY_KEYWORDS` so it can be reused by `ProductImages.tsx`.

## Files

| File | Changes |
|---|---|
| `ProductImagesStep2Scenes.tsx` | Export `CATEGORY_KEYWORDS` |
| `ProductImages.tsx` | Import `CATEGORY_KEYWORDS`, update `primaryCategory` to check `analyses` map + keyword fallback |

