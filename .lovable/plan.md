## Goal

On `/app/generate/product-images` Step 1 (Product), display the **canonical category label** (e.g. "Clothing & Apparel", "Eyewear", "Phone Cases") instead of the raw free-text `product_type` ("Garment", "Dress", "Dresses").

## Root cause

`ProductImagesStep1Products.tsx` reads `p.product_type` directly. That field is whatever the user typed in Add Product. The canonical, normalized category lives in `analysis_json.category` (e.g. `garments`, `eyewear`) and is mapped to a clean label via `CATEGORY_LABELS` in `src/lib/productCategories.ts`.

## Changes

Single file: `src/components/app/product-images/ProductImagesStep1Products.tsx`

1. Import the resolver:
   ```ts
   import { getCategoryLabel } from '@/lib/productCategories';
   ```

2. Add a helper that prefers the analyzer category, then falls back to `product_type`:
   ```ts
   const displayCategory = (p: UserProduct) => {
     const catId = (p as any)?.analysis_json?.category as string | undefined;
     const label = catId ? getCategoryLabel(catId) : '';
     return label || p.product_type || '';
   };
   ```
   (UserProduct already carries `analysis_json` — confirmed in `user_products` schema.)

3. Use it in:
   - The tile subtitle (line 169): `{displayCategory(p) || '\u00A0'}`
   - The search filter (line 50): also match against `displayCategory(p)` so searching "Clothing" finds garments.
   - The type filter dropdown (lines 41–53, 83–95): build the list from `displayCategory(p)` values and compare against it, so the filter chips read "Clothing & Apparel" / "Eyewear" / "Phone Cases" etc. instead of duplicated raw strings like "Dress" + "Dresses" + "dress".

No DB changes, no other surfaces touched. `product_type` is still kept as the fallback for legacy rows missing `analysis_json.category`.

## Out of scope

- Backfilling `analysis_json` for the ~1,224 legacy products without analyzer output.
- Other product list surfaces (Catalog, Perspectives, Products page) — can do the same swap later if you want a consistent look across the app; flag it and I'll extend the change.
