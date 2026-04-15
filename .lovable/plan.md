

# Optimized Scene Loading: Best Architecture

## Current State
The pagination fix (already deployed) fetches all 1,056 scenes in 2 batches. This works but loads ~1MB of data upfront, even though users only need 1-3 categories (20-60 scenes) when picking shots.

## Best Approach: Two-Tier Query with Shared Cache

Instead of one monolithic fetch, split into a fast primary query and a deferred background query. This gives instant UI for the relevant category while still making all scenes available.

### How It Works

**`useProductImageScenes.ts`** accepts an optional `priorityCategories` parameter:

- **When provided** (Step 2 scene picker): runs two React Query calls
  - Query A: `WHERE category_collection = ANY(priorityCategories)` — instant, ~20-60 rows
  - Query B: `WHERE category_collection != ALL(priorityCategories)` — deferred, loads after Query A renders
  - Merges both into the same `categoryCollections` and `allScenes` return shape
  - Returns `isLoadingRest` so the UI can show a subtle skeleton for "Other Categories"

- **When not provided** (admin pages, review step, results step): single paginated fetch as today — no change for those consumers

### Files Modified

1. **`src/hooks/useProductImageScenes.ts`**
   - Add `priorityCategories?: string[]` option
   - Split into two `useQuery` calls when priority categories are given
   - Query A uses `.in('category_collection', categories)` — no pagination needed (small result)
   - Query B uses `.not('category_collection', 'in', categories)` with pagination loop
   - Merge results into unified return, add `isLoadingRest` flag

2. **`src/components/app/product-images/ProductImagesStep2Scenes.tsx`**
   - Pass `relevantCatIds` to `useProductImageScenes({ priorityCategories: [...relevantCatIds] })`
   - Show a compact skeleton row under "Other Categories" while `isLoadingRest` is true
   - No structural changes — recommended sections render instantly

### Why This Is Best

- **Instant perceived speed**: recommended scenes appear in ~100ms instead of waiting for 1,056 rows
- **Zero complexity for other consumers**: admin, review, results pages are unchanged
- **Same total data**: everything loads, just prioritized
- **No database changes**: pure frontend optimization
- **React Query deduplication**: if another component calls the hook without priority, the cached data from both queries is already warm

### What Users See

1. Open Step 2 → recommended category scenes appear immediately
2. "Other Categories" section shows a subtle loading indicator for ~1-2 seconds
3. After background load completes, all categories are browsable
4. Navigate to Step 4/6 → all data already cached, zero delay

