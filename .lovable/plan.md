

## Fix: Cache Recent Creations Thumbnails

### Problem

Every time you visit `/app/workflows`, the Recent Creations thumbnails shimmer and reload from scratch because:

1. **Signed URLs are stored in component state** (`useState`) -- lost on every unmount/remount (navigation away and back)
2. **The `useEffect` re-runs on every refetch** because the `jobs` array reference changes, even when the actual data hasn't changed
3. **No caching** of the signed URL mapping between page visits

### Solution

Move the signed URL resolution into a React Query hook so it benefits from the same caching as all other data. React Query will keep the signed URLs in memory across navigations and only refetch when truly stale.

### Changes

**File: `src/components/app/WorkflowRecentRow.tsx`**

1. Replace the `useState` + `useEffect` pattern for signed URLs with a `useQuery` call:
   - Query key: `['workflow-recent-thumbnails', jobIds]` (derived from jobs)
   - Query function: extract raw URLs from jobs, call `toSignedUrls`, return the map
   - `staleTime: 5 * 60 * 1000` (5 minutes -- signed URLs are valid for 1 hour)
   - `enabled: jobs.length > 0`
   - `keepPreviousData: true` (so old thumbnails stay visible during background refresh)

2. Remove the `signedUrlMap` state, `urlsReady` state, and the `useEffect` that populates them

3. Derive `signedUrlMap` and `urlsReady` directly from the query result

This means:
- First visit: shimmer, then images appear (same as now)
- Navigating away and back: images appear instantly from cache
- Background refetch happens silently without shimmer

### Technical Details

```text
Before:
  useState(signedUrlMap) + useEffect([jobs]) -> toSignedUrls() -> setState
  Result: Fresh network calls every mount

After:
  useQuery(['workflow-recent-thumbnails', jobIds]) -> toSignedUrls()
  Result: Cached in memory, instant on revisit, background refresh
```

| Item | Detail |
|------|--------|
| File | `src/components/app/WorkflowRecentRow.tsx` |
| Lines changed | ~20 lines (replace useState+useEffect with useQuery) |
| New dependency | None (already uses `@tanstack/react-query`) |
| Cache duration | 5 minutes staleTime, stays in memory while app is open |

