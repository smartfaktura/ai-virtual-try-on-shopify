

# Fix: Stop Tag-Based Category Cross-Matching

## Problem
Items appear in wrong Discover tabs because the filter checks tags against `PRODUCT_CATEGORY_MAP`. A sports/activewear image tagged `"studio"` or `"commercial"` gets pulled into Beauty, Jewelry, Electronics, etc. because those style words broadly map to many product categories.

The new multi-select `discover_categories` array on each item is the correct source for cross-category visibility. Tags should not be used for tab filtering.

## Fix

**Files: `src/pages/Discover.tsx`, `src/pages/PublicDiscover.tsx`, `src/components/app/DashboardDiscoverSection.tsx`**

In `itemMatchesProductCategory`, remove the tag-matching block (lines ~130-135 in Discover.tsx). Keep only:
1. Direct `category === productCat` match
2. `PRODUCT_CATEGORY_MAP[category]` lookup
3. `discover_categories` array check

```typescript
function itemMatchesProductCategory(item: DiscoverItem, productCat: string): boolean {
  const itemCat = item.data.category;
  if (itemCat === productCat) return true;
  const mapped = PRODUCT_CATEGORY_MAP[itemCat] ?? [];
  if (mapped.includes(productCat)) return true;
  const discoverCats = (item.data as any).discover_categories;
  if (Array.isArray(discoverCats) && discoverCats.includes(productCat)) return true;
  return false;
  // REMOVED: tag-based matching that caused false positives
}
```

**3 files changed, ~5 lines removed per file.**

