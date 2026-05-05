## Problem

The Library's Favorites tab filters client-side from paginated data (`allItems.filter(i => favoriteIds.has(i.id))`). Since `useLibraryItems` uses infinite scroll with 20 items per page, only favorites present in the first loaded page appear initially. The rest require manually clicking "Load More" repeatedly.

## Solution

When the user switches to the Favorites (or Brand Ready / Ready to Publish) smart view, automatically fetch all remaining pages so every matching item is visible without manual "Load More" clicks.

## Technical Details

**File: `src/pages/Jobs.tsx`**

Add a `useEffect` that auto-fetches remaining pages when a filtered smart view is active:

```typescript
// Auto-fetch all pages when a filtered smart view is active
useEffect(() => {
  if (smartView !== 'all' && hasNextPage && !isFetchingNextPage && !isFetching) {
    fetchNextPage();
  }
}, [smartView, hasNextPage, isFetchingNextPage, isFetching, fetchNextPage, allItems.length]);
```

This loops through all pages automatically when `smartView` is `favorites`, `brand_ready`, or `ready_to_publish`. Once all pages are loaded (`hasNextPage` becomes false), it stops. The `allItems.length` dependency ensures it re-triggers after each page loads.

The "Load More" button remains visible for the `all` view (unchanged behavior).
