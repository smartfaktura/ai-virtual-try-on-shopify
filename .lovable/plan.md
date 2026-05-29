## Problem

The drag-and-drop / "Upload Image" tile on `/app/generate/product-images` writes the analyzer's free-form `productType` (e.g. "Midi Dress", "Maxi Dress") into `user_products.product_type`. That free-form value is what shows under each tile in the grid.

The Add Product modal and Bulk Add tab (`src/components/app/ManualProductTab.tsx`) instead store the canonical Product Category:
- `product_type` ← `getCategoryLabel(userCategory) || productType` (≤100 chars)
- `analysis_json` ← `{ userCategory }` (canonical id)

Result: quick-uploaded products look inconsistent in the grid and don't carry the canonical category that downstream prompt logic relies on.

## Fix (one file, one function)

Edit `src/pages/ProductImages.tsx` → `handleQuickUpload` only:

1. Add import: `import { getCategoryLabel } from '@/lib/productCategories';` (same module ManualProductTab uses).
2. Capture both fields from the analyzer response:
   - `userCategory` (canonical id, e.g. `dresses`)
   - `productType` (free-form fallback)
3. Compute display value the same way the bulk path does:
   ```ts
   const resolvedCategory = (getCategoryLabel(userCategory) || productType || '').substring(0, 100);
   ```
4. Insert payload becomes:
   - `product_type: resolvedCategory`
   - `analysis_json: userCategory ? { userCategory } : null`
5. Leave `title`, `description`, `image_url`, optimistic cache update, auto-select, and toast behavior untouched.

## What this does NOT change

- No DB migration, no edge function change, no RLS change.
- `analyze-product-image` already returns both `productType` and `userCategory` — we just consume the canonical one.
- No change to `handleDemoSelect` (demo products already ship pre-baked metadata).
- No change to existing rows in `user_products`.
- No UI/grid component changes — the corrected `product_type` value renders through the existing card subtitle.

## Safety

- Pure additive client logic; failures fall back to empty string exactly like today.
- `getCategoryLabel` returns `''` for unknown ids, so when the analyzer can't categorize, behavior matches current (free-form `productType` or empty).
- Matches the already-shipped pattern in `ManualProductTab.tsx` lines 619 and 627, so there's no new convention to maintain.

## Files touched

- `src/pages/ProductImages.tsx` — import + `handleQuickUpload` insert payload only.
