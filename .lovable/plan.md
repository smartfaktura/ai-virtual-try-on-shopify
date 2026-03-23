

# Debug: "Oldest" Sort Button Not Working in Library

## Investigation

I reviewed the full sorting pipeline:

1. **`Jobs.tsx`**: `setSortBy('oldest')` is called on button click — correct
2. **`useLibraryItems.ts`**: `ascending = sortBy === 'oldest'` — correct
3. **Query key**: `['library', sortBy, ...]` — includes sortBy, so TanStack Query will refetch
4. **SQL queries**: Both use `.order('created_at', { ascending })` — correct
5. **Merge sort**: `rawItems.sort(...)` respects `ascending` — correct
6. **`placeholderData: keepPreviousData`**: Shows previous data while new data loads — this is fine

## Likely Root Cause

The code looks functionally correct. The most likely issue is that **the user has very few images**, so the "oldest" and "newest" results look nearly identical (same items, slightly different order), making it appear broken. 

However, there's a subtle potential bug: the `initialPageParam` is `{} as Cursor` (empty object). When `sortBy` changes, TanStack Query creates a **new** query with the new key and starts fresh with `initialPageParam`. This should work correctly.

## Recommended Fix: Verify with User

Before making code changes, I'd like to verify what's happening by checking in the browser. But since I can't do that in plan mode, the safest fix is to **ensure the query fully resets** when sort changes:

### `src/hooks/useLibraryItems.ts`

No code change appears necessary — the logic is correct. The sort button should work. 

## Alternative: Could be a visual perception issue

If the user has many images from the same time period, switching between newest/oldest might show similar-looking results at the top. We could add a visual indicator (like showing the date more prominently) to confirm the sort is applied.

## Recommendation

Let me switch to default mode and test this in the browser to confirm whether it's actually broken or a perception issue. If there is a real bug, I'll fix it.

