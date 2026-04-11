

# Fix: Recommended Categories Not Showing in Step 2 (Shots)

## Root Cause

When a product has a stale or invalid `analysis_json.category` (e.g. `"accessories"` instead of `"bags-accessories"`, or `"food-beverage"` instead of `"food"`), the `detectRelevantCategories` function:

1. Reads the invalid category from `analysis_json`
2. Tries to refine it via `SPECIFICITY_OVERRIDES` — but those only handle known parent categories like `bags-accessories`, `garments`, `shoes`
3. Adds the invalid category (e.g. `"accessories"`) to the matched set
4. Marks the product as analyzed, so keyword fallback never runs
5. The invalid category doesn't match any `category_collection` in the database
6. Result: `unifiedRecommended` is empty, so no recommended section shows

The same issue can happen when the async `analyzeProducts` returns a category that doesn't exist in the DB.

## Fix (single file: `ProductImagesStep2Scenes.tsx`)

1. **Add a validation step in `detectRelevantCategories`**: After getting a category from any source (productAnalyses, analysis_json), validate it against `ACTIVE_CATEGORY_COLLECTIONS` IDs. If invalid, fall through to keyword detection instead of accepting the bad value.

2. **Add a normalization map** for common AI mismatches (e.g. `"accessories" → "bags-accessories"`, `"food-beverage" → "food"`).

3. **Simplify the 3-tier cascade**: Instead of checking `productAnalyses` → `analysis_json` → keywords separately with an `analyzedIds` tracker, merge the first two checks and always validate the result against valid collection IDs before accepting.

## Implementation Detail

```
CATEGORY_ALIASES: Record<string, string> = {
  "accessories": "bags-accessories",
  "food-beverage": "food",
  "food-beverages": "food",
  "jewelry": "jewellery-necklaces",  // generic fallback
  "jewellery": "jewellery-necklaces",
  ...
}
```

In `detectRelevantCategories`:
- Get category from analyses or analysis_json
- Run through `refineCategory` (existing specificity overrides)
- Run through `CATEGORY_ALIASES` normalization
- **Validate** against the set of valid category_collection IDs (passed as param or derived from `CATEGORY_KEYWORDS` keys)
- If still invalid → fall through to keyword detection for that product

This ensures any AI-returned garbage category gracefully degrades to keyword matching.

