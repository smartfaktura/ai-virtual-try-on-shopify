

## Fix: Add Auto-Retry to Single-Job Enqueue

### Problem

The single-job `enqueue()` function in `useGenerationQueue.ts` has zero retry logic. If the edge function returns a transient error (502, 503, network timeout, cold start), the user sees "Failed to start generation" with no recourse. The batch path already uses `enqueueWithRetry` from `src/lib/enqueueGeneration.ts` which handles this — but the single-job path does a raw `fetch` with no retries.

### Fix

**File: `src/hooks/useGenerationQueue.ts`** — Replace the raw `fetch` call (lines 444-480) with the existing `enqueueWithRetry` utility, and handle its error result types gracefully with user-friendly toasts.

Concrete changes:

1. **Import** `enqueueWithRetry`, `isEnqueueError`, and `getAuthToken` from `@/lib/enqueueGeneration`
2. **Replace** the manual `fetch` + error handling block (lines 444-480) with a call to `enqueueWithRetry(body, token)`
3. **Map error types** to appropriate toasts:
   - `rate_limit` → existing concurrent/rate-limit message
   - `insufficient_credits` → existing credits message  
   - `network` → "Connection issue — please check your network and try again"
   - `fatal` → generic error message
4. **Remove** the outer `try/catch` around fetch since `enqueueWithRetry` never throws

This means transient 502/503/timeout errors get up to 6 retries with exponential backoff automatically — the user never sees "Failed" for a cold-start issue.

| File | Change |
|------|--------|
| `src/hooks/useGenerationQueue.ts` | Use `enqueueWithRetry` instead of raw fetch; map error types to friendly toasts |

