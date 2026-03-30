

## Fix: AI Gateway Rate Limit Failures on Batch Workflows

### Root Cause
The Product Listing Set workflow splits into ~10 parallel jobs. `process-queue` dispatches all claimed jobs immediately via fire-and-forget. All 10 jobs hit the AI Gateway at the same instant, triggering 429 rate limits. The retry logic (3 attempts with `3000 * attempt` ms backoff) retries all jobs at the same time again — a thundering herd — exhausting all retries and failing 9 of 10 jobs.

### Fix Strategy: Jittered Backoff + Staggered Dispatch

**1. Add jitter to retry backoff in `generate-workflow/index.ts` (line 599)**

Replace the fixed `3000 * (attempt + 1)` delay with randomized jitter so retries spread out:
```ts
// Before
await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));

// After  
const jitter = Math.random() * 3000;
await new Promise((r) => setTimeout(r, 3000 * (attempt + 1) + jitter));
```

Also increase `maxRetries` from 2 to 3 (4 total attempts) to give more room for rate-limited batches.

Apply the same fix to `generate-tryon/index.ts` which has the identical pattern.

**2. Add staggered dispatch delay in `process-queue/index.ts`**

After dispatching each job, add a small delay (500ms) to avoid firing all jobs at the exact same instant:
```ts
// After dispatchGenerationFunction(...)
dispatchedCount++;
// Stagger dispatches to avoid thundering herd on AI gateway
if (dispatchedCount > 0) {
  await new Promise((r) => setTimeout(r, 500));
}
```

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-workflow/index.ts` | Increase maxRetries to 3, add random jitter to 429 backoff |
| `supabase/functions/generate-tryon/index.ts` | Same jitter fix for consistency |
| `supabase/functions/process-queue/index.ts` | Add 500ms stagger between job dispatches |

### Impact
- Batch workflows will spread their AI gateway requests over time instead of stampeding
- Retry attempts will desynchronize via jitter, dramatically reducing concurrent 429s
- Credits are still refunded on failure (existing behavior), so no billing impact

