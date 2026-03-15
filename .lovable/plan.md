

## Fix Library Sort Order

### Problem

The library fetches from two separate tables (`generation_jobs` and `freestyle_generations`) using the same `range(from, to)` pagination, but each job can expand into **multiple** library items (one per result image). This causes a time-range mismatch between the two sources — 20 jobs covering March 1-15 might expand to 60 items, while 20 freestyles cover March 10-15 with only 20 items. The merge-sort within each page is correct, but **across pages** the ordering breaks because page boundaries don't align between the two sources.

### Fix

**`src/hooks/useLibraryItems.ts`** — Two changes:

1. **Over-fetch and trim**: Fetch more rows from `generation_jobs` (e.g., `PAGE_SIZE * 3`) since each job can produce multiple result images, then trim the merged list to `PAGE_SIZE` items after sorting.

2. **Use cursor-based pagination instead of offset-based**: Track the last `created_at` timestamp from each source and use `.lt('created_at', lastTimestamp)` for the next page instead of `.range()`. This ensures correct chronological pagination across both tables.

The simpler approach (option 1) is faster to implement:

```typescript
// Over-fetch jobs since each can have multiple result images
const JOB_FETCH_SIZE = PAGE_SIZE * 3;

const [jobsResult, freestyleResult] = await Promise.all([
  supabase.from('generation_jobs')
    .select(...)
    .order('created_at', { ascending: sortBy === 'oldest' })
    .range(from, to * 3),  // fetch more jobs
  supabase.from('freestyle_generations')
    .select(...)
    .order('created_at', { ascending: sortBy === 'oldest' })
    .range(from, to),
]);

// After merge-sort, trim to PAGE_SIZE
const trimmed = rawItems.slice(0, PAGE_SIZE);
```

And update `hasMore` logic to check if we had more items than PAGE_SIZE after trimming.

### Files modified
| File | Change |
|---|---|
| `src/hooks/useLibraryItems.ts` | Over-fetch jobs, trim merged results to PAGE_SIZE |

