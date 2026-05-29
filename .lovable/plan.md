# Show canonical Product Category badge on /app/products

## Problem

The pill under each product card on `/app/products` shows the free-form `product_type` (e.g. "Mini Dress", "Null product", "Pants"). Now that the analyzer writes a canonical id to `analysis_json.userCategory`, the list should show that proper label (e.g. "Dresses", "Trousers", "Phone Cases") and fall back to `product_type` only when missing.

## Change

`src/pages/Products.tsx` only — pure display layer, two badges.

1. **Type**: add `analysis_json?: { userCategory?: string | null } | null` to the `UserProduct` interface (line 27-37). Query already uses `select('*')` so no SQL change.
2. **Helper**: at top of component, derive
   ```ts
   const getDisplayCategory = (p: UserProduct) => {
     const id = p.analysis_json?.userCategory;
     const label = id ? getCategoryLabel(id) : '';
     return label || (p.product_type?.includes(':') ? p.product_type.split(':').pop() : p.product_type) || '';
   };
   ```
   Import `getCategoryLabel` from `@/lib/productCategories`.
3. **Grid badge** (line 528-530): render `getDisplayCategory(product)` instead of `displayType`.
4. **List badge** (line 567-569): same — show `getDisplayCategory(product)` and gate on its truthiness.

## Non-changes (safety)

- The "All Types" filter dropdown and search keep using `product_type` — no filter logic touched, so no risk of empty results.
- No DB migration, no query change, no edge function change.
- Products with no `analysis_json` (old rows) keep showing exactly what they show today.
- The colon-split rule for legacy `trigger:foo:bar` strings is preserved in the fallback branch.
- `getCategoryLabel` already returns `''` for null/empty and the raw id when unknown, so no crash path.

## Files

- `src/pages/Products.tsx`
