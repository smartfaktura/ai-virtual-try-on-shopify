

# Fix: Explicit-Only Discover Category Filtering

## Problem
Items appear in wrong Discover tabs because `PRODUCT_CATEGORY_MAP` automatically cross-maps style categories (e.g., `beauty` maps to `['beauty', 'fragrances']`, `studio` maps to 5 different tabs). This causes items like skincare products to show up in Fragrances, or activewear in Beauty.

Additionally, `discover_presets` table lacks a `discover_categories` column, so even when admin saves categories via the multi-select chips, the array is never persisted or fetched for presets.

## Plan

### 1. Add `discover_categories` column to `discover_presets` table
**Database migration:**
```sql
ALTER TABLE public.discover_presets
  ADD COLUMN discover_categories text[] NOT NULL DEFAULT '{}'::text[];
```

### 2. Update `useDiscoverPresets.ts` — add field to interface
Add `discover_categories: string[] | null` to the `DiscoverPreset` interface so TypeScript recognizes the field from `select('*')`.

### 3. Remove `PRODUCT_CATEGORY_MAP` and simplify filtering in all 3 files
**Files:** `src/pages/Discover.tsx`, `src/pages/PublicDiscover.tsx`, `src/components/app/DashboardDiscoverSection.tsx`

Delete the entire `PRODUCT_CATEGORY_MAP` object. Replace `itemMatchesProductCategory` with:

```typescript
function itemMatchesProductCategory(item: DiscoverItem, productCat: string): boolean {
  if (item.data.category === productCat) return true;
  const cats = (item.data as any).discover_categories;
  return Array.isArray(cats) && cats.includes(productCat);
}
```

Items with no `discover_categories` set will only appear in the tab matching their primary `category`.

### 4. Save `discover_categories` array when saving preset metadata
**File:** `src/components/app/DiscoverDetailModal.tsx` (~line 656-667)

Add `discover_categories: editCategories` to the `presetData` object so the array is persisted to `discover_presets` (not just `custom_scenes`).

### 5. Remove stale `PRODUCT_CATEGORY_MAP` from `DashboardDiscoverSection.tsx`
Same deletion as step 3 — the large map object at the top of the file gets removed entirely.

## Summary
- **1 migration** — adds `discover_categories` column to `discover_presets`
- **4 files changed** — removes ~35 lines of cross-mapping, adds ~2 lines for explicit filtering
- **Result**: items appear only in their primary category tab + any categories explicitly selected by admin

