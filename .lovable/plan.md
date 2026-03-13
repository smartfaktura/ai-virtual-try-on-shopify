

## Shopify CSV Export Import — Replace "Coming Soon" with Working Importer

### What We're Building
Replace the `ShopifyImportTab` placeholder with a functional Shopify CSV importer that:
1. Shows a 3-step mini guide on how to export products from Shopify admin
2. Accepts the Shopify CSV export file
3. Parses the Shopify-specific format (deduplicates by `Handle`, maps `Title`, grabs the first `Image Src` where `Image Position` = 1)
4. Shows a preview table, then bulk-inserts into `user_products`

### Shopify CSV Format Notes
- Multiple rows share the same `Handle` (variants + extra images)
- Key columns: `Handle` (0), `Title` (1), `Type` (5), `Body (HTML)` (2), `Image Src` (32), `Image Position` (33)
- Only the first row per Handle has the Title populated
- We take the image with `Image Position` = "1" as the primary image

### Changes

**File: `src/components/app/ShopifyImportTab.tsx`** — full rewrite

- Remove the "Coming Soon" placeholder
- Add a collapsible 3-step Shopify export guide:
  1. Go to Shopify Admin → Products
  2. Click Export → Select "All products" → CSV for Excel/Numbers
  3. Upload the exported file below
- Add a CSV drop zone (reuse the same drag/drop pattern from `CsvImportTab`)
- Parse logic: use the existing `parseCSV` helper, then group rows by `Handle`, extract Title from first row with a title, pick `Image Src` where `Image Position` is "1" (or first available image), use `Type` as product_type
- Show preview table with product count, valid/invalid badges
- Import button inserts deduplicated products into `user_products` (same pattern as `CsvImportTab`)
- Keep the "App coming soon" as a small subtle note at the bottom: "Direct Shopify sync is coming soon. For now, use the CSV export method above."

No database changes needed — uses existing `user_products` table and the same insert pattern as `CsvImportTab`.

