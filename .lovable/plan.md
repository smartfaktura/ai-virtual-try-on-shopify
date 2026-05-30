## Fix

The category is already saved in `analysis_json.category` (verified: phone case row = `"phone-cases"`). The Step 1 tile just isn't reading it.

The real Step 1 UI is inline in `src/pages/ProductImages.tsx` (my earlier edit went to an unused component file).

## One file: `src/pages/ProductImages.tsx`

1. Import `getCategoryLabel` from `@/lib/productCategories`.
2. Add helper:
   ```ts
   const displayCategory = (p: UserProduct) =>
     getCategoryLabel((p as any)?.analysis_json?.category) || p.product_type || '';
   ```
3. Line 1600 — tile subtitle: replace `{up.product_type || '\u00A0'}` with `{displayCategory(up) || '\u00A0'}`.
4. Lines 1407 and 1467 — search filters: also match `displayCategory(p).toLowerCase()` so "phone" / "clothing" find the right products.

That's it. No DB or data changes.
