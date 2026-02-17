
## Fix: New Freestyle Images Not Appearing After Generation

### Root Cause

The `refreshImages()` function calls `queryClient.invalidateQueries()`, which for infinite queries can be unreliable -- it marks the query as stale but the background refetch may silently fail or get cancelled (e.g., if the auth session refreshed during the ~30-60s generation window). Meanwhile, `resetQueue()` is called immediately after, removing the "generating" placeholder cards before the refetch completes.

### Solution

Two changes to make the refresh robust:

**1. Use `refetchQueries` instead of `invalidateQueries` in `useFreestyleImages.ts`**

`refetchQueries` forces an immediate, active refetch rather than just marking the query as stale. This is more reliable for ensuring fresh data loads.

**2. Add a small delay before refreshing in the completion effect (`Freestyle.tsx`)**

Add a 500ms delay between the queue job completing and the refetch call. This ensures the database write from the edge function has fully propagated before the client queries for new data. Also, call `resetQueue` AFTER the refetch completes, not before, so the generating placeholder stays visible until the new image actually loads.

### Changes

**File: `src/hooks/useFreestyleImages.ts`**

Update `refreshImages` to use `refetchQueries` for a forced refetch:

```typescript
const refreshImages = useCallback(() => {
  queryClient.refetchQueries({ queryKey: [QUERY_KEY] });
}, [queryClient]);
```

**File: `src/pages/Freestyle.tsx`**

Update the completion effect to:
- Add a 500ms delay before refreshing to ensure DB propagation
- Call `resetQueue` only after the refetch is triggered, not simultaneously
- Use `await` to sequence operations properly

```typescript
useEffect(() => {
  if (!activeJob) return;
  const prevStatus = prevJobStatusRef.current;
  prevJobStatusRef.current = activeJob.status;

  if (activeJob.status === 'completed' && prevStatus !== 'completed') {
    const result = activeJob.result as { ... } | null;
    if (result?.contentBlocked) {
      setBlockedEntries(prev => [{ ... }, ...prev]);
      resetQueueRef.current();
    } else {
      // Delay to ensure DB write has propagated, then refetch
      setTimeout(() => {
        refreshImagesRef.current();
        refreshBalanceRef.current();
        resetQueueRef.current();
      }, 800);
    }
  }

  if (activeJob.status === 'failed' && prevStatus !== 'failed') {
    refreshBalanceRef.current();
    resetQueueRef.current();
  }
}, [activeJob]);
```

### Why This Works

1. `refetchQueries` actively re-runs the query function instead of just marking it stale, ensuring the DB is re-queried and URLs are re-signed.
2. The 800ms delay ensures the edge function's `freestyle_generations` INSERT has fully committed before the client queries.
3. The generating placeholder cards stay visible during the delay, providing a smooth visual transition to the loaded image.
