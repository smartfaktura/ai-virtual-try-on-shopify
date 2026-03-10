

## Current State

The Shopify import tab **already supports**:
- Selective product import (checkboxes, not auto-import-all)
- Search/filter by product title and product type
- 100-product batch limit with counter
- Select All / deselect

**What's missing**: Filtering by Shopify **collection** (e.g., "Summer 2026", "Best Sellers"). Currently the edge function fetches ALL products flat — no collection awareness.

## Plan: Add Collection-Based Filtering

### 1. Update `shopify-sync` edge function

Add a new action `"collections"` that fetches all collections from the store:
```
GET /admin/api/2024-01/custom_collections.json
GET /admin/api/2024-01/smart_collections.json
```

Update the `"list"` action to accept an optional `collection_id` parameter. When provided, fetch products from that collection only:
```
GET /admin/api/2024-01/collections/{id}/products.json
```

### 2. Update `ShopifyImportTab.tsx`

- After connecting, first fetch collections list
- Add a dropdown/filter bar above the product list: "All Products" | collection names
- When a collection is selected, re-fetch products filtered to that collection
- Keep the existing text search for further filtering within results
- Show collection count badges

### UI Flow
```text
[Connected to mystore.myshopify.com]
                    ↓
[Load Products] → fetches collections + all products
                    ↓
┌─────────────────────────────────────┐
│ Filter: [All Products ▾]  [Search…] │
│ Collections: Summer '26 (12) │ ...  │
├─────────────────────────────────────┤
│ ☐ Product A          product_type   │
│ ☑ Product B          product_type   │
│ ...                                 │
├─────────────────────────────────────┤
│           Import Selected (2)       │
└─────────────────────────────────────┘
```

### Files Changed

| File | Change |
|---|---|
| `supabase/functions/shopify-sync/index.ts` | Add `listCollections()` function, add `collections` action, add optional `collection_id` param to `list` action |
| `src/components/app/ShopifyImportTab.tsx` | Add collection dropdown filter, fetch collections on load, re-fetch products when collection changes |

