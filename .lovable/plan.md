

# Fix: Multi-Product Analysis Loading UI and Duplicate Calls

## Problems Found

1. **Duplicate API calls**: The `useEffect` on line 414 depends on `selectedProducts` (array reference). When `userProducts` refetches (e.g., after the fire-and-forget `analysis_json` DB update triggers a query invalidation), `selectedProducts` gets a new reference, re-triggering `analyzeProducts`. The second run hits the AI gateway again because the DB persist may not have completed yet.

2. **Loading UI shows only 1 product**: The analysis loading state (line 1191-1206) shows only `selectedProducts[0]`'s thumbnail and says "Analyzing your product..." (singular), regardless of how many products are being analyzed.

## Fix Plan

### 1. Prevent duplicate analysis calls
**`src/hooks/useProductAnalysis.ts`**
- Add an in-memory `Set` (via `useRef`) tracking product IDs that have already been analyzed or are currently in-flight during this session
- Before calling the edge function for a product, check this set — skip if already analyzed
- This prevents the second call entirely, even if `selectedProducts` changes reference

### 2. Improve multi-product loading UI
**`src/pages/ProductImages.tsx`** (lines ~1189-1207)
- Show a scrolling row of ALL selected product thumbnails with individual status indicators (checkmark when done, spinner when pending)
- Change text to "Analyzing your products..." (plural when > 1) with count: "Analyzing 3 of 4 products..."
- Show a small progress indicator (e.g., "2/4 complete")

### 3. Stabilize the useEffect dependency
**`src/pages/ProductImages.tsx`** (line 414-418)
- Change the dependency from `selectedProducts` to `selectedProductIds` (which is a stable `Set` reference) plus `step`
- Pass `selectedProducts` inside the callback but don't use it as a dependency trigger

## Files Changed
1. `src/hooks/useProductAnalysis.ts` — add in-flight dedup guard
2. `src/pages/ProductImages.tsx` — fix useEffect dependency + improve loading UI

