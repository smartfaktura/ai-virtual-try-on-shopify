

# Fix: "Beauty" and "Skincare" Category Mismatch

## Problem
Items categorized as `"skincare"` don't appear under the "Beauty" filter in Discover because:
1. `PRODUCT_CATEGORY_MAP` has no `skincare` entry — so items with `category: "skincare"` are invisible to the "Beauty" filter
2. The `resolveCategory` function (used for sorting/similarity) also doesn't map `skincare` → `beauty`

This affects all three places where `PRODUCT_CATEGORY_MAP` is defined: `Discover.tsx`, `PublicDiscover.tsx`, and `DashboardDiscoverSection.tsx`.

## Fix

**Add `skincare` as an alias for `beauty`** in the `PRODUCT_CATEGORY_MAP` in all 3 files:

```typescript
skincare: ['beauty', 'fragrances'],
```

Also add `"Beauty & Skincare"` as a full-label alias (in case the label gets saved as the category value):

```typescript
'Beauty & Skincare': ['beauty'],
```

This is a 3-file change, adding 2 lines to each `PRODUCT_CATEGORY_MAP`.

