

## Potential Errors Found in Shopify Import Flow

### 1. Frontend: `handleConnectOAuth` sends raw store name but `loadProducts` sometimes sends full domain
- `handleConnectOAuth` (line 163) constructs `${shop.trim()}.myshopify.com`
- But `loadProducts` at line 114 sends `shop.trim()` (without `.myshopify.com`) when no `shopDomain` param is passed
- The edge function normalizes this, but the `connection.shop_domain` stored in DB may already include `.myshopify.com`, creating inconsistency in how the domain is sent

### 2. Frontend: "Import More" button doesn't re-fetch products
- Line 563: clicking "Import More" sets step to `select` and clears selections, but the `products` array is stale -- it still contains already-imported products. Users will see and may re-select products that were just imported. The edge function catches duplicates, but users get confusing "failed" results.
- **Fix**: Re-fetch products after import, or visually mark already-imported items.

### 3. Frontend: `handleImport` batches on client AND edge function batches internally
- The client splits `ids` into batches of 10 (line 234) and sends each batch to the edge function
- The edge function's `importProducts` also has `BATCH_SIZE = 10` internal batching (line 130-133), but since it receives exactly 10 IDs from the client, this internal loop does nothing useful
- Not a bug, but redundant logic

### 4. Edge function: No rate limiting on Shopify API calls
- `importProducts` fetches each product + all its images sequentially with no delay
- Shopify's API rate limit is 2 requests/second on basic plans. A 100-product import could trigger 100 product fetches + up to 600 image fetches = 700 requests, easily hitting rate limits
- **Fix**: Add small delays between batches or check `Retry-After` headers

### 5. Edge function: `product_images` insert errors silently ignored
- Line 244: `await supabaseAdmin.from("product_images").insert(imageRows)` -- the result is not checked for errors. If this fails, the product is marked as successfully imported but has no additional images in the DB.
- **Fix**: Check for insert error and log/report it

### 6. Frontend: `access_token` passed directly in body (security concern)
- The frontend never sends `access_token` in the body (it relies on the edge function looking it up from `shopify_connections`), which is correct
- However, the edge function accepts `body.access_token` if provided (line 298), meaning any authenticated user could pass an arbitrary access token. This isn't a critical vulnerability but is unnecessary attack surface.
- **Fix**: Remove the `body.access_token` path entirely; always look up from DB

### 7. Edge function: `mainImageUrl` fallback uses raw Shopify CDN URL
- Line 190-191: If the first image upload fails but the Shopify image exists, it falls back to `images[0].src` (a Shopify CDN URL). These URLs expire or become unavailable if the product is deleted from Shopify.
- **Fix**: Either retry the upload or skip the product

### 8. Frontend: No timeout/abort on long imports
- A 100-product import with 6 images each could take several minutes. If the user navigates away or the edge function times out (Deno has a ~150s limit for edge functions), the import silently fails mid-batch with no recovery.
- The client-side batching of 10 helps, but each batch could still timeout on the edge function side.

### Summary of fixes

| Priority | Issue | File |
|---|---|---|
| High | Add Shopify API rate limit handling (delays/retry) | `shopify-sync/index.ts` |
| High | Check `product_images` insert errors | `shopify-sync/index.ts` |
| Medium | Re-fetch or mark products after "Import More" | `ShopifyImportTab.tsx` |
| Medium | Remove `body.access_token` acceptance | `shopify-sync/index.ts` |
| Low | Remove Shopify CDN URL fallback | `shopify-sync/index.ts` |
| Low | Remove redundant internal batching | `shopify-sync/index.ts` |

