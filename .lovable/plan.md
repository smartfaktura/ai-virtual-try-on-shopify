

# Fix: Product scenes leaking into wrong workflows + Skyline scene missing

## Problems

1. **Product scenes appearing in Selfie/UGC and Mirror Selfie workflows**: The merge logic at line 435 only skips "Flat Lay Set" and "Interior / Exterior Staging". Selfie/UGC and Mirror Selfie are NOT excluded, so all product scenes get injected into them.

2. **Skyline Laundry missing from Product Listing Set**: Custom scenes whose category (or `category_override`) maps to an on-model category (studio/lifestyle/editorial/streetwear) get filtered out by `!ON_MODEL_CATEGORIES.includes(s.category)`. "Skyline Laundry" likely has a lifestyle or similar category, so it's excluded from the product scene merge.

## Fix (single file: `src/pages/Generate.tsx`)

### A. Restrict merge to product-only workflows (~line 435)

Change the exclusion list to a whitelist approach — only merge product scenes for workflows that are actually product-oriented. Skip the merge for:
- `Flat Lay Set` (already skipped)
- `Interior / Exterior Staging` (already skipped)  
- Any workflow with `uses_tryon` (Try-On, Selfie/UGC, Mirror Selfie)

```typescript
if (wName === 'Flat Lay Set' || wName === 'Interior / Exterior Staging' || activeWorkflow?.uses_tryon) return rawVariationStrategy;
```

This prevents product scenes from appearing in Selfie/UGC and Mirror Selfie.

### B. Include ALL custom scenes in product workflow merge (~line 440-441)

For product workflows, remove the `ON_MODEL_CATEGORIES` filter from the merge. Custom scenes created by admins (like "Skyline Laundry") should appear regardless of their category. The filter was meant to exclude on-model *mock* poses (studio/lifestyle/editorial/streetwear from `mockTryOnPoses`), not custom admin scenes.

Split the filtering: keep the on-model filter for mock poses only, but include all custom scenes:

```typescript
const filteredMockPoses = filterVisible(mockTryOnPoses).filter(s => !ON_MODEL_CATEGORIES.includes(s.category));
const allCustom = customPoses; // Include ALL custom scenes
const freestyleScenes = sortScenes(applyCategoryOverrides([...filteredMockPoses, ...allCustom]))
  .filter(s => !dbLabelsLower.has(s.name.toLowerCase()));
```

This ensures "Skyline Laundry" and any other admin-created custom scene appears in Product Listing Set, regardless of its category assignment.

## Summary

One file changed (`Generate.tsx`), two tweaks:
1. Add `activeWorkflow?.uses_tryon` to the skip condition → no product scenes in Selfie/UGC or Mirror Selfie
2. Only apply `ON_MODEL_CATEGORIES` filter to built-in mock poses, not custom scenes → Skyline Laundry appears in Product Listing Set

