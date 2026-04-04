

# Fixes: Scroll, Analysis, Prompt Data, Review Thumbnails

## Issues Found

### 1. Scroll to top of wizard on Refine step
`window.scrollTo({ top: 0 })` exists (line 125) but scrolls to the absolute top of the page, above the header and stepper. When navigating to Refine, the user should see the wizard content area, not the page title.

**Fix**: In `ProductImages.tsx`, use a ref on the wizard content area and scroll that into view instead of `window.scrollTo`.

### 2. Product analysis NEVER reaches prompts (CRITICAL BUG)
`useProductAnalysis()` stores analyses in its own React state (`analyses` map). But `buildInstruction` reads `(product as any).analysis_json` from the raw DB row (line 174). The DB update is fire-and-forget and the products query is NOT re-fetched after analysis completes. So `analysis_json` is always `null` during the current session — meaning every prompt gets zero category, material, color, or size data.

**Fix**: Pass the `analyses` map from `useProductAnalysis` into `buildInstruction` and look up `analyses[product.id]` instead of `(product as any).analysis_json`. Also pass analysis data to the generation payload.

### 3. Product dynamic info missing from prompts
Because of bug #2, `productType` falls back to the generic `product.product_type` string (e.g., "Fragrance") instead of the rich analysis category. Material, finish, color family, size class — all empty. The prompt builder's category-aware defaults (lighting, focus area) never activate.

**Fix**: Resolved by fix #2. Additionally, enrich the generation payload with analysis data so the backend also has it.

### 4. Review product thumbnails show as thin strips
The 40x40px containers with `object-contain` work correctly but are too small for narrow products (bottles, pens). The product appears as a 2-3px wide strip.

**Fix**: Increase product thumbnail size in the Review step from `w-10 h-10` to `w-14 h-14` and add a subtle rounded background.

## Files Modified

| File | Change |
|------|--------|
| `src/pages/ProductImages.tsx` | Add wizard ref for scroll-into-view; fix `buildInstruction` to use `analyses` map; pass analysis to payload |
| `src/components/app/product-images/ProductImagesStep4Review.tsx` | Increase product thumbnail size from 40px to 56px |

