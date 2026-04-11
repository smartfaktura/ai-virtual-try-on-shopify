

# Fix: Limit to 1 Recommended Category Per Product

## Problem
When a single product is selected, multiple category collections can appear as "Recommended," leading to duplicate scene names (e.g., two "Angle View" entries). This happens because the detection logic can match multiple categories from different sources (AI analysis, `analysis_json` cache, keyword fallback).

## Solution
Change `detectRelevantCategories` to enforce a **one-category-per-product** rule using a priority cascade:

1. If `productAnalyses[product.id]` has a category → use it, skip all other sources
2. Else if `analysis_json.category` exists → use it, skip keyword fallback  
3. Else run keyword fallback but **stop at the first match** (specific-first ordering already exists in `CATEGORY_KEYWORDS`)

## File Changed
**`src/components/app/product-images/ProductImagesStep2Scenes.tsx`** — `detectRelevantCategories` function (lines 78–110)

### Logic Change
```
For each product:
  1. Check productAnalyses → if found, add category, mark done
  2. Check analysis_json → if found, add category, mark done  
  3. If still unanalyzed, scan CATEGORY_KEYWORDS but BREAK after first match
```

The key difference from current code:
- **Keyword fallback** currently combines ALL unanalyzed products into one string and matches ALL categories. New logic processes each unanalyzed product individually and stops at the first keyword match per product.
- This ensures each product contributes at most 1 category to the recommended set.

No other files change. No database changes.

