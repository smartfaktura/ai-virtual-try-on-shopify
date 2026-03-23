

# Add Loading State When Switching Sort Order

## Problem
When clicking "Oldest", `keepPreviousData` keeps showing the previous results with zero visual feedback. The user can't tell if anything happened — it looks broken.

## Fix

### `src/pages/Jobs.tsx`

1. **Destructure `isFetching`** from `useLibraryItems` (already available from TanStack Query's `useInfiniteQuery`):
   ```tsx
   const { data, isLoading, isFetching, fetchNextPage, ... } = useLibraryItems(sortBy, searchQuery);
   ```

2. **Add a subtle opacity/spinner on the grid** while refetching (not initial load — that already has a full spinner). When `isFetching && !isLoading`, apply `opacity-50 pointer-events-none` to the masonry grid + show a small spinner overlay:
   ```tsx
   <div className={cn("flex gap-1", isFetching && !isLoading && "opacity-50 transition-opacity")}>
     {columns.map(...)}
   </div>
   ```

3. **Optionally add a small spinner** next to the active sort button label while fetching, so the user sees immediate feedback on click.

### `src/hooks/useLibraryItems.ts`

No changes needed — `isFetching` is already returned by `useInfiniteQuery`.

One file, ~3 lines changed.

