

## Fix Library Loading Performance with Pagination

### Problem
The Library page loads slowly because:
1. It fetches 100 generation jobs + 100 freestyle items upfront
2. Each image URL is signed **sequentially** with `await toSignedUrl(url)` -- if you have 50 images, that's 50 sequential network calls before anything renders
3. All images render at once with no pagination

### Solution
Implement cursor-based pagination with a "Load More" button, reduce the initial fetch size, and sign URLs in parallel batches.

### Changes

**File: `src/hooks/useLibraryItems.ts`**
- Change from `useQuery` to `useInfiniteQuery` with a page size of 20
- Accept a `page` parameter and use Supabase `.range()` for pagination
- Sign URLs in parallel using `Promise.all` instead of sequential `await` in a loop
- Return `{ items, hasMore }` per page so the UI knows when to show "Load More"

**File: `src/pages/Jobs.tsx`**
- Consume the infinite query: flatten pages into a single items array
- Add a "Load More" button at the bottom of the masonry grid
- Show a count indicator (e.g., "Showing 20 of 85 images")
- Keep all existing functionality (search, sort, select, delete, bulk download)

### Technical Details

**useLibraryItems.ts** -- switch to `useInfiniteQuery`:
```typescript
const PAGE_SIZE = 20;

export function useLibraryItems(sortBy, searchQuery) {
  return useInfiniteQuery({
    queryKey: ['library', sortBy, searchQuery, user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      // Fetch with .range(from, to) instead of .limit(100)
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      // ... fetch jobs and freestyle with .range(from, to)
      // ... sign URLs in parallel: await Promise.all(items.map(...))
      
      return { items, hasMore: items.length === PAGE_SIZE };
    },
    getNextPageParam: (lastPage, allPages) => 
      lastPage.hasMore ? allPages.length : undefined,
    initialPageParam: 0,
  });
}
```

**Jobs.tsx** -- flatten pages + Load More button:
```typescript
const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } 
  = useLibraryItems(sortBy, searchQuery);

const items = data?.pages.flatMap(p => p.items) ?? [];

// At bottom of masonry grid:
{hasNextPage && (
  <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
    {isFetchingNextPage ? <Loader2 /> : 'Load More'}
  </Button>
)}
```

### Performance Impact
- Initial load: ~20 images instead of ~200 (10x fewer signed URL calls)
- Signed URLs fetched in parallel instead of sequentially
- Users see content almost immediately, can load more on demand

