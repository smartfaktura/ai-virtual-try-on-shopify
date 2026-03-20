

# Fix Rate Limiting for Bulk Enqueue Requests

## Root Cause

The multi-product loop in `Generate.tsx` fires 25+ `enqueue-generation` edge function calls in a tight `for` loop with zero delay. The Deno edge function platform rate-limits concurrent invocations, returning 402/429 errors. The client then incorrectly shows "Not enough credits" (because 402 is mapped to credit errors), when the real issue is platform-level rate limiting.

The queue system is working correctly — it is designed to handle processing at scale. The bottleneck is only the **enqueue step** flooding too many HTTP requests at once.

## Solution

### 1. Add staggered delay between enqueue calls
**File**: `src/pages/Generate.tsx` (~line 1277-1296)

Add a 300ms delay between each `enqueueTryOnForProduct` call to avoid hitting edge function rate limits. This adds ~7.5s for 25 products, which is acceptable since the user sees the progress banner immediately.

### 2. Add silent retry with backoff on 429 errors
**File**: `src/pages/Generate.tsx` (~line 1232-1243)

Instead of showing a toast on 429 or platform 402 errors, silently retry up to 3 times with exponential backoff (1s, 2s, 4s). Only show an error toast if all retries fail. The key insight: the "Too many requests" error from the screenshot is a platform rate limit, not a credit issue.

```typescript
// Retry logic in enqueueTryOnForProduct
for (let attempt = 0; attempt < maxRetries; attempt++) {
  const response = await fetch(...);
  if (response.ok) return response.json();
  if (response.status === 429 || response.status === 502 || response.status === 503) {
    await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    continue; // silent retry
  }
  // Only show error for genuine failures (402 credit, 400 bad request)
  break;
}
```

### 3. Only wake process-queue once after all jobs are enqueued
**File**: `supabase/functions/enqueue-generation/index.ts` (line 161-170)

Currently every enqueue call fires a wake to `process-queue`, creating 25 parallel process-queue invocations. Add a `skipWake` parameter so the client can suppress the wake for all but the last job. The client will trigger one final wake after the loop.

### 4. Fix misleading error message for 402
**File**: `src/pages/Generate.tsx` (~line 1234)

Check the actual error body: if it contains "Too many requests" or "concurrent", treat it as a rate limit (retry silently) rather than a credit error.

## Architecture Note

The queue system is exactly the right design for multi-user scale. The `claim_next_job` with `FOR UPDATE SKIP LOCKED` handles concurrent workers. The issue is purely at the **enqueue ingestion** layer — too many simultaneous HTTP calls to a single edge function. The staggered delay + retry pattern solves this without architectural changes.

### Files to edit
- `src/pages/Generate.tsx` — add delay between calls + silent retry logic
- `supabase/functions/enqueue-generation/index.ts` — add `skipWake` parameter

