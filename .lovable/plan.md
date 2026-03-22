

# Fix: Image Appearing in Both Categories After Admin Edit

## Root Cause

Two issues:

1. **Stale query cache**: The save handler in `DiscoverDetailModal` mutates `item.data` locally but never calls `queryClient.invalidateQueries({ queryKey: ['discover-presets'] })`. The cached query data retains the old category, so the masonry grid still renders the item under the old category too.

2. **Direct category match missing**: `itemMatchesProductCategory()` only checks the `PRODUCT_CATEGORY_MAP` lookup — it never does a simple `itemCat === productCat` check. So if an admin sets category to `fashion` directly, it only works because `PRODUCT_CATEGORY_MAP['fashion']` happens to include `'fashion'`. But this indirect mapping can cause items to appear in multiple categories when the map entry covers several product categories.

## Changes

### `src/components/app/DiscoverDetailModal.tsx`
- Import `useQueryClient` from `@tanstack/react-query`
- After successful save, call `queryClient.invalidateQueries({ queryKey: ['discover-presets'] })` to refresh the cached data with the updated category from the database.

### `src/pages/Discover.tsx`
- In `itemMatchesProductCategory()`, add a direct equality check first: `if (itemCat === productCat) return true;` — before the PRODUCT_CATEGORY_MAP lookup. This ensures that items with a direct product category (e.g., `fashion`, `beauty`) always match correctly without relying on the legacy mapping table.

Two files, ~3 lines each.

