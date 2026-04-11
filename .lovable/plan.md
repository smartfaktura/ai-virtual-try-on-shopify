

# Fix: Scarf Products Not Getting Correct Category

## Root Cause
Two issues combine to prevent scarf products from showing recommended scenes:

1. **AI returns wrong category**: The AI model returns `"bags-accessories"` or the invalid `"accessories"` instead of `"scarves"` for scarf products. Database evidence:
   - "Cream and Black Geometric Print Silk Scarf" → `bags-accessories`
   - "Geometric Patterned Silk Scarf" → `accessories` (not even a valid collection ID)

2. **Title fallback is too conservative**: The `applyCategoryFallback` function in the edge function only runs when `category === "other"`. If the AI returns any non-"other" value (even wrong ones like `"accessories"`), the title-based correction is skipped.

## Solution

### 1. Edge Function — Expand fallback trigger (`supabase/functions/analyze-product-category/index.ts`)

Change `applyCategoryFallback` to also trigger when the AI returns a category that's **not in the valid set** (e.g., `"accessories"`). Add a `VALID_CATEGORIES` set and run the title fallback whenever the returned category is missing from it.

```
Before: if (category && category !== "other") return;
After:  if (category && category !== "other" && VALID_CATEGORIES.has(category)) return;
```

### 2. Edge Function — Add title override for specific mismatches

When the AI returns `"bags-accessories"` but the title clearly says "scarf/shawl", the current fallback won't help (since `bags-accessories` is valid). Add a post-processing step that checks if the title strongly indicates a **more specific** sub-category and overrides the generic parent.

Logic: After AI analysis, if category is a generic parent (e.g., `bags-accessories`, `garments`, `shoes`) AND the title matches a specific child pattern (e.g., `scarf` → `scarves`, `dress` → `dresses`), override to the specific category.

### 3. Client-side — Same specificity override in `detectRelevantCategories`

In `ProductImagesStep2Scenes.tsx`, after getting a category from any source, check if the product title/type matches a more specific keyword. This provides immediate client-side correction without waiting for re-analysis.

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/analyze-product-category/index.ts` | Add `VALID_CATEGORIES` set; expand fallback trigger; add parent→child title override |
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Add specificity refinement after category detection in `detectRelevantCategories` |

## Technical Detail

**Parent → Child override map** (used in both edge function and client):
```
bags-accessories + title matches scarf/shawl → scarves
bags-accessories + title matches wallet/cardholder → wallets-cardholders
bags-accessories + title matches belt → belts
bags-accessories + title matches backpack → backpacks
garments + title matches dress → dresses
garments + title matches hoodie → hoodies
garments + title matches jeans/denim → jeans
garments + title matches jacket/blazer → jackets
shoes + title matches sneaker → sneakers
shoes + title matches boot → boots
shoes + title matches heel/stiletto → high-heels
```

This ensures both new analyses and cached results resolve to the most specific category.

