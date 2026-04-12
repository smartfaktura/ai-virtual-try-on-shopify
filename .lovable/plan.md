

# Fix: Stop Sorting Scenes by Updated Time Inside Categories

## Problem
When a scene is edited, it gets re-sorted to the top within its category group. The user only wants **categories** to bubble up by latest activity — scenes within each category should keep their original `sort_order`.

## Fix
**File:** `src/pages/AdminProductImageScenes.tsx` (lines 166-170)

Change the per-scene sort from `updated_at DESC` back to `sort_order ASC`:

```ts
// Before
const sortedScenes = [...scenes].sort(
  (a, b) =>
    new Date(b.updated_at ?? b.created_at).getTime() -
    new Date(a.updated_at ?? a.created_at).getTime()
);

// After
const sortedScenes = [...scenes].sort(
  (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
);
```

The `latestUpdatedAt` calculation stays unchanged — it still drives category-level sorting.

