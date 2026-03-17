

## Fix: Recent workflow jobs not appearing immediately after completion

### Root Cause

The `workflow-recent-jobs` query in `Workflows.tsx` (line 164) has `staleTime: 30_000` but **no `refetchInterval`**. It only gets invalidated via the `useEffect` on line 248, which triggers when `activeJobs` count drops from >0 to 0. 

If the user navigates to the Workflows page after a job already completed (so the page never saw an active job), the invalidation logic doesn't fire and the cached data stays stale for up to 30 seconds.

### Fix — `src/pages/Workflows.tsx`

1. **Add `refetchInterval: 30_000`** to the `workflow-recent-jobs` query (line 164) so it polls periodically even without the active-job transition trigger.

2. **Reduce `staleTime` to `10_000`** (10 seconds) so navigating to the page after a completion shows fresh data more quickly.

These are two small property changes on lines 185-186. No other files affected.

