

## Shopify Import Flow — Analysis

I examined the entire Shopify product import pipeline (edge function, frontend, database schema, and how products appear in the app). Here is what I found:

### What works correctly

- **List step**: Fetches product `id`, `title`, `product_type`, and first image thumbnail from Shopify API
- **Import step**: For each selected product, fetches full details (`title`, `product_type`, `body_html`, up to 6 images), downloads images to storage, inserts into `user_products` table with `title`, `product_type`, `description`, `image_url`, and inserts additional images into `product_images` table
- **Database schema**: `user_products` has `title`, `product_type`, `description`, `image_url`, `tags`, `dimensions` — all populated correctly during import
- **Products page**: Displays products from `user_products` with image counts from `product_images`

### Issues found

1. **Description not shown in product list during selection** — When browsing Shopify products before import, users only see title + product_type + thumbnail. No description preview. This is by design (description requires fetching each product individually, which is expensive for listing).

2. **Tags not imported** — Shopify products have tags, but the import function doesn't fetch or save them. The `user_products` table has a `tags` column but it stays `null` after Shopify import.

3. **Dimensions not imported** — Shopify has variant data with weight/dimensions, but these aren't pulled.

4. **Product list UI is minimal** — During the selection step, each product shows only a small 10x10 thumbnail, title, and product_type in a flat list. No description, no image count, no additional details.

### Proposed fixes

| Change | File |
|---|---|
| Import Shopify tags into `user_products.tags` | `shopify-sync/index.ts` — add `tags` to the API fields and save to DB |
| Show richer product cards during selection | `ShopifyImportTab.tsx` — switch from flat list to grid cards with larger thumbnails and image count badge |
| Add `tags` field to Shopify API fetch | `shopify-sync/index.ts` — add `tags` to both `listProducts` and `importProducts` API field lists |

### Technical details

**Edge function — add tags to import:**
```typescript
// In importProducts(), change API fields to include tags:
`fields=id,title,product_type,body_html,images,tags`

// When inserting:
tags: product.tags ? product.tags.split(', ') : [],
```

**Edge function — add tags to list preview:**
```typescript
// In listProducts(), add tags to fields:
`fields=id,title,product_type,images,tags`

// Return tags in list response for richer UI
```

**Frontend — richer selection cards:**
- Switch from flat list rows to a 2-column grid with larger thumbnails (like the `ProductMultiSelect` component pattern already used elsewhere)
- Show image count indicator on thumbnail
- Show tags as small badges below product type

