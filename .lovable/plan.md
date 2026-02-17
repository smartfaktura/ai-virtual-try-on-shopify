

## Fix Freestyle Gallery Loading Performance

### Problem
The `useFreestyleImages` hook fetches **all** freestyle generations at once (no limit) and signs each URL individually via `toSignedUrl()` inside `Promise.all`. With 30+ generations, this creates dozens of sequential HTTP requests due to browser connection limits, causing long load times.

The same issue also exists in `refreshImages()` which re-fetches everything after each generation completes.

### Solution
Apply the same optimizations that fixed the Library:

1. **Paginate with `useInfiniteQuery`** -- load 20 images initially, "Load More" for the rest
2. **Batch URL signing** -- use `toSignedUrls()` (already built) instead of individual `toSignedUrl()` calls
3. **Keep save/delete/refresh working** by invalidating the infinite query cache

### Changes

**File: `src/hooks/useFreestyleImages.ts`**

- Replace manual `useState` + `useEffect` data loading with `useInfiniteQuery` (page size 20)
- Use Supabase `.range(from, to)` for pagination
- Replace individual `toSignedUrl` calls with batch `toSignedUrls`
- Keep `saveImage`, `saveImages`, `deleteImage` functions -- they will invalidate the query cache instead of manually updating local state
- Replace `refreshImages` with a simple query invalidation

**File: `src/pages/Freestyle.tsx`**

- Update to consume the infinite query: flatten `data.pages` into a single array
- Pass `fetchNextPage` and `hasNextPage` to the gallery

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

- Accept optional `onLoadMore` and `hasMore` props
- Render a "Load More" button at the bottom of the masonry grid when more pages are available
- Add `isFetchingMore` prop for loading state on the button

### Technical Detail

```text
useFreestyleImages (before):
  useEffect -> fetch ALL -> sign each URL one by one -> setState

useFreestyleImages (after):
  useInfiniteQuery -> fetch 20 per page with .range() -> batch sign with toSignedUrls()
  saveImage/deleteImage -> invalidateQueries(['freestyle-images'])
  refreshImages -> invalidateQueries(['freestyle-images'])
```

### Performance Impact
- Initial load: 20 images instead of all (could be 100+)
- URL signing: 1-2 batch requests instead of 20+ individual requests
- Users see images almost immediately, can load more on demand

