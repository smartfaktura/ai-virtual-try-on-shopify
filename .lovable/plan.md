

# Fix Stale Analysis Detection & Title-Based Category Fallback

## Problem
Products with outdated or missing analysis (no `version: 2` stamp) get misclassified (e.g., perfume classified as "other"), causing prompts to use wrong tokens and generate incorrect images.

## Plan

### 1. Edge function: title-based category fallback
**File: `supabase/functions/analyze-product-category/index.ts`**

After parsing the AI response and before stamping `version: 2`, add a post-processing step that checks the product title against known keyword patterns. If the AI returned `category: "other"` but the title clearly indicates a known category, override it:

- `perfume|fragrance|eau de|cologne|parfum` → `fragrance`
- `lipstick|mascara|foundation|concealer|blush|eyeshadow` → `makeup-lipsticks`
- `serum|moisturizer|cream|cleanser|toner|sunscreen` → `beauty-skincare`
- `bag|handbag|clutch|wallet|belt|scarf` → `bags-accessories`
- `hat|cap|beanie` → `hats-small`
- `shoe|sneaker|boot|sandal|heel` → `shoes`
- `shirt|dress|jacket|pants|skirt|coat|hoodie|sweater` → `garments`
- `candle|vase|pillow|lamp|decor` → `home-decor`
- `phone|laptop|tablet|headphone|speaker|camera|watch` → `tech-devices`
- `protein|vitamin|supplement|probiotic` → `supplements-wellness`

Also switch from tool-calling schema to plain JSON prompt (same pattern as the `analyze-trend-post` fix) to avoid Gemini 400 errors on the large branchy schema.

### 2. Hook: add `reAnalyzeProduct` method
**File: `src/hooks/useProductAnalysis.ts`**

Add a new `reAnalyzeProduct(product: UserProduct)` callback that:
- Marks the product as pending
- Calls `analyze-product-category` edge function
- Updates state and persists to DB
- Returns the fresh analysis

Export it alongside existing methods.

### 3. Step 1 UI: stale badge + re-analyze button
**File: `src/pages/ProductImages.tsx`**

In both grid and list views of Step 1:
- For selected products, check if `analysis_json` is missing or `version < 2`
- Show a small amber "Outdated" badge on the product card
- Add a small `RefreshCw` icon button (visible on selected + stale products) that calls `reAnalyzeProduct`
- Show a spinner on the icon while re-analysis is in progress
- Import `reAnalyzeProduct` from the hook alongside existing destructured values

### 4. Auto re-analysis on Step 2 entry (already works)
The existing `analyzeProducts` call on Step 2 already filters for `version === 2`, so stale products will automatically get re-analyzed. No change needed here.

## Files to update
- `supabase/functions/analyze-product-category/index.ts` — switch to JSON prompt + add title fallback
- `src/hooks/useProductAnalysis.ts` — add `reAnalyzeProduct` method
- `src/pages/ProductImages.tsx` — add stale badge + re-analyze button on Step 1 cards

