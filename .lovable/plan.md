

## Fix: Handle Large Perspective Batches (20+) Without Concurrent Limit Errors

### Root Cause
The DB `enqueue_generation` function checks concurrent **processing** jobs (Pro limit: 5). Jobs transition to "processing" almost instantly via `process-queue`, so by the time job #6 is enqueued, 5 are already processing → hard rejection with "Too many concurrent generations".

The burst-limit retry (added earlier) only catches errors with `burst_limit` in the response. The concurrent error has `max_concurrent` instead, so it triggers `shouldStop = true` and aborts the entire batch.

### Solution

**Two-part fix:**

#### 1. Client: Retry on concurrent-limit 429s too (`src/hooks/useGeneratePerspectives.ts`)
In the 429 handler, also detect `max_concurrent` in the error response and retry with the same 10s backoff (jobs complete in ~30-60s, so 10s wait is reasonable). Increase `MAX_BURST_RETRIES` to 3 for concurrent retries since jobs take longer to free up.

```
if (response.status === 429) {
  const isBurst = errorData.burst_limit !== undefined;
  const isConcurrent = errorData.max_concurrent !== undefined;
  if ((isBurst || isConcurrent) && attempt < MAX_BURST_RETRIES) {
    await sleep(isConcurrent ? 15_000 : 10_000); // longer wait for concurrent
    continue;
  }
}
```

#### 2. DB: Remove concurrent check from enqueue, let process-queue handle it (migration)
The better fix: allow jobs to queue freely (they're "queued" not "processing"), and let the `process-queue` function control concurrency. Remove the concurrent check from `enqueue_generation` entirely — the burst limit already prevents spam.

This way 25 jobs all enqueue immediately as "queued", and process-queue picks them up 5 at a time.

### Files changed
| File | Change |
|------|--------|
| New migration SQL | Remove concurrent processing check from `enqueue_generation` |
| `src/hooks/useGeneratePerspectives.ts` | Add concurrent-limit retry as fallback safety net |

