

# Analysis: Category Detection & Prompt Mapping Coverage

## Current State — What's Working

The system has three layers of category detection, executed in order:

1. **AI analysis (`productAnalyses` prop)** — from `useProductAnalysis` hook, which calls the `analyze-product-category` edge function using Gemini
2. **Cached `analysis_json`** — persisted on the `user_products` row after first analysis
3. **Keyword fallback** — substring matching against product title, description, product_type, and tags

All three layers output the same 12 category IDs, which perfectly align with the 12 `CATEGORY_COLLECTIONS` IDs in `sceneData.ts`:
`fragrance`, `beauty-skincare`, `makeup-lipsticks`, `bags-accessories`, `hats-small`, `shoes`, `garments`, `home-decor`, `tech-devices`, `food-beverage`, `supplements-wellness`, `other`

The prompt builder maps are also complete — `BG_MAP`, `LIGHTING_MAP`, `SHADOW_MAP`, `SURFACE_MAP`, `STYLING_DIRECTION_MAP`, `HAND_STYLE_MAP`, `NAIL_MAP` all have entries for every UI chip value, plus legacy keys for backward compatibility.

## Edge Cases Found

### 1. Keyword false positives from substring matching
The keyword matching uses `combined.includes(kw)` which means:
- A product called "**Organic** Cotton T-Shirt" matches `food-beverage` (keyword: `organic`) AND `garments` (keyword: `cotton`, `shirt`)
- A product called "**Honey** Gold Lipstick" matches `food-beverage` (keyword: `honey`) AND `makeup-lipsticks` (keyword: `lipstick`)
- "**Cream** Leather Bag" matches `beauty-skincare` (keyword: `cream`) AND `bags-accessories` (keyword: `bag`, `leather`)

**Impact**: Extra categories get recommended. Not harmful (user just sees more "Recommended" sections), but noisy.

**Fix**: When AI analysis is available, skip keyword fallback entirely. AI analysis is the authoritative source — keywords should only run when no AI category exists.

### 2. No `other` collection exists but category is valid
The `analyze-product-category` edge function can return `"other"`. The code correctly filters this out (`cat !== 'other'`). But there IS an `other` collection in `CATEGORY_COLLECTIONS` with scenes. Products classified as "other" will never get those scenes recommended.

**Impact**: Niche products (e.g., musical instruments, art supplies, pet accessories) get no category-specific recommendations even though the "other" collection has generic scenes for them.

**Fix**: Stop filtering out `"other"` — let it recommend the "other" collection.

### 3. Analysis timing race condition
On step 2, `productAnalyses` may still be empty if the AI analysis hasn't completed yet. The `useEffect` syncs `expandedCategories` when `relevantCatIds` changes, so this is handled — categories will update once analysis finishes. No fix needed.

### 4. Keyword partial-word matches
`includes('top')` would match "laptop", "desktop", "stopper". `includes('ring')` matches "string", "catering". `includes('bar')` matches "barbecue", "barista".

**Impact**: Can cause false positive category matches for `garments` (top), `hats-small` (ring), and `supplements-wellness` (bar).

**Fix**: Use word-boundary matching instead of raw `includes`.

## Plan

### File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

**A. Skip keyword fallback when AI analysis covers all products**:
```typescript
// Only run keyword fallback for products WITHOUT analysis
const unanalyzedProducts = products.filter(p => {
  const hasAnalysis = productAnalyses?.[p.id]?.category 
    || (p as any).analysis_json?.category;
  return !hasAnalysis;
});
if (unanalyzedProducts.length > 0) {
  // run keyword matching only on unanalyzed products
}
```

**B. Allow `"other"` category to recommend scenes**:
Remove the `cat !== 'other'` filter — the "other" collection has useful generic scenes.

**C. Use word-boundary matching**:
Replace `combined.includes(kw)` with a regex word-boundary check to prevent partial-word false positives:
```typescript
const regex = new RegExp(`\\b${kw}\\b`, 'i');
if (keywords.some(kw => regex.test(combined))) matched.add(catId);
```

These three changes eliminate all identified edge cases while keeping the system robust for any product type.

## Files to Update

| File | Change |
|------|--------|
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Word-boundary matching, skip keywords when AI analysis exists, allow "other" category |

