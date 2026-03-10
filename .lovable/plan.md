

## Review: Shopify Import Flow — Issues Found

After reviewing both the edge function (`shopify-sync/index.ts`) and the frontend (`ShopifyImportTab.tsx`), the core logic is solid — collections, listing, tags, import batching, and image upload all work correctly. However, there is one real bug and a couple of minor robustness issues:

### Bug: Collection switch error kicks user back to "Connect" screen

In `loadProducts()` (line 142), the `catch` block calls `setStep('connect')`. This is correct on first load, but when `handleCollectionChange` calls `loadProducts` to switch collections, a network hiccup would boot the user from the product selection screen back to the connect screen — losing their selections and context.

**Fix:** Add an optional parameter to `loadProducts` to indicate it's a collection refresh. On error during a collection switch, show a toast but stay on the `select` step instead of resetting to `connect`.

### Minor: Duplicate product imports not prevented

If a user imports products, clicks "Import More", and re-imports the same products, the edge function will create duplicate `user_products` rows. There's no deduplication check.

**Fix:** Before inserting into `user_products`, check if a product with the same title + user_id already exists (or store the Shopify product ID in a column for exact matching). For now, adding a simple `upsert` or skip-if-exists check would prevent duplicates.

### Minor: `shopify_connections.shop_domain` format assumption

The connect step stores the domain, but `loadProducts` sometimes uses `shop.trim()` (user input without `.myshopify.com`) and other times `connection.shop_domain` (which may or may not include it). The edge function's `cleanShop` regex only strips protocol/trailing slashes — it doesn't normalize `.myshopify.com`. If the stored domain doesn't include it, the Shopify API calls would fail.

**Fix:** Ensure the edge function always appends `.myshopify.com` if not already present on `cleanShop`.

### Summary of changes

| File | Change |
|---|---|
| `ShopifyImportTab.tsx` | Fix `loadProducts` error handling to not reset step during collection switches |
| `shopify-sync/index.ts` | Normalize shop domain to always include `.myshopify.com`; optionally add duplicate detection |

