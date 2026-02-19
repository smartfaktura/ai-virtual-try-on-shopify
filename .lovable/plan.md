

## Shopify Direct Sync: Bulk Product Import

### Overview

Add a new "Shopify" tab to the Add Product modal that lets users connect their Shopify store and bulk-import products. Only the data our platform actually needs gets imported (title, type, description, images) -- no variants, inventory, pricing, or other Shopify-specific data.

### Security

- All imported products go into `user_products` which has RLS: `auth.uid() = user_id`. Only the owner can see, edit, or delete their products.
- The Shopify access token is sent per-request to the edge function and never stored in the database.
- The edge function validates the user's auth token before doing anything.

### Handling Thousands of Products

Instead of importing everything at once (which would time out), the flow works in two steps:

1. **List step**: Fetches product titles + thumbnail URLs from Shopify (fast, lightweight -- just metadata). Paginated at 250/page per Shopify API limits.
2. **Import step**: User selects which products to import. We process them in batches of 10 -- downloading images, uploading to storage, creating DB rows. A progress bar shows real-time status. User can import a few now and come back for more later.

### User Instructions (Built Into UI)

The Shopify tab will include a clear 3-step guide with no technical jargon:

```text
1. In your Shopify admin, go to Settings -> Apps -> Develop apps
2. Create an app, enable "read_products" access scope
3. Copy your Admin API access token and paste it below
```

A helper link to Shopify's official docs will be provided.

### What Gets Imported (Only What We Need)

| Imported | NOT Imported |
|----------|-------------|
| Title | Prices / variants |
| Product type (free-text) | Inventory / stock |
| Description (text only) | Tags / collections |
| Up to 6 images | Metafields |
| | SEO data |
| | Shipping info |

### Files to Create/Edit

| File | Change |
|------|--------|
| `supabase/functions/shopify-sync/index.ts` | **New** -- edge function to list and import from Shopify Admin API |
| `src/components/app/ShopifyImportTab.tsx` | **New** -- UI for connecting store, browsing, selecting, importing |
| `src/components/app/AddProductModal.tsx` | Add "Shopify" tab to the tab bar |
| `supabase/config.toml` | Register new function with `verify_jwt = false` |

### Technical Details

**Edge function `shopify-sync`** handles two actions:

- `action: "list"` -- Calls `GET /admin/api/2024-01/products.json?fields=id,title,product_type,body_html,images&limit=250` with pagination via Link header. Returns lightweight product list (id, title, type, thumbnail). Fetches all pages but only returns summary data.

- `action: "import"` -- Receives array of selected Shopify product IDs. For each product, downloads up to 6 images, uploads to `product-uploads` bucket, creates `user_products` + `product_images` rows. Processes in batches of 10 products to stay within timeout. Returns progress so frontend can call again with remaining IDs.

**ShopifyImportTab.tsx** UI flow:

1. Domain input + access token input (with inline setup instructions)
2. "Connect & Load Products" button
3. Product grid with checkboxes, "Select All" toggle, product count
4. "Import Selected (N)" button with progress bar
5. Success state showing how many were imported

**AddProductModal.tsx** -- adds a 5th tab:

```tsx
<TabsTrigger value="shopify">
  <ShoppingBag className="w-3.5 h-3.5" />
  Shopify
</TabsTrigger>
```

The import follows the exact same pattern as existing `StoreImportTab` and `ManualProductTab` -- same DB writes, same storage bucket, same RLS protection.

