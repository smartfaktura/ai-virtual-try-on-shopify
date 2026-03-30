

## Fix: Add Retry-with-Backoff to Workflow Batch Enqueue Loop

### Problem
The workflow enqueue loop in `Generate.tsx` (around line 1401) fires many rapid `enqueue-generation` calls but has **no retry logic** for 429/rate-limit responses. It simply shows a toast error and moves on. The try-on enqueue loop already has proper retry-with-backoff (6 retries, exponential backoff with jitter) — the workflow loop is missing this.

This is separate from publishing. The backend changes (higher burst limits) deployed automatically, but the frontend code still doesn't retry when a 429 does occur.

### Fix

**Extract a shared `enqueueWithRetry` helper** and use it in both the workflow and try-on batch loops. This helper will:
- Retry up to 6 times on 429/502/503 responses
- Use exponential backoff with random jitter (same pattern as the existing try-on loop)
- Only show a toast error on the final failure
- Silently retry on transient rate limits

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Replace the raw `fetch` call in the workflow enqueue loop (~line 1401) with the same retry-with-backoff pattern used in `enqueueTryOnForProduct`. Extract a reusable helper to avoid duplication. |

### What changes specifically

1. Create a local helper function `enqueueWithRetry(url, body, token, maxRetries=6)` that wraps the fetch call with:
   - Retry on 429, 502, 503, or burst/concurrent error messages
   - Exponential backoff: `2^attempt` seconds + random jitter
   - Returns the result on success, `null` on final failure
   - Only shows toast on non-retryable errors (402, unknown errors)

2. Replace the workflow loop's raw fetch (lines ~1401-1415) to use this helper

3. Simplify `enqueueTryOnForProduct` to also use the same helper (dedup)

### Impact
- No more error toasts from transient 429s during batch workflow generation
- Both workflow and try-on batch loops have identical resilience
- If a 429 persists after 6 retries (~60s of backoff), it will show one error instead of spamming toasts

