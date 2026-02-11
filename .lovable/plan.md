

## Phase 2 Remaining Issues

### Issue 1: Client-Side Position Polling Is Wrong (Medium)

In `useGenerationQueue.ts` lines 104-105, the polling position query uses:
```
priority_score=lt.${job.priority}
```
This only counts jobs with a **strictly lower** priority score, ignoring same-priority jobs that were enqueued earlier. The SQL function was fixed to use `priority_score < v_priority OR (priority_score = v_priority AND created_at < ...)`, but the client polling doesn't match.

**Fix**: Update the polling position query to also count same-priority jobs with earlier `created_at`, or simplify by counting all queued jobs ahead (using a compound filter). The simplest accurate approach is to count all queued jobs where `(priority_score < this.priority) OR (priority_score = this.priority AND created_at < this.created_at)`. Since PostgREST doesn't support OR filters natively, the cleanest fix is to use an RPC or just count all queued jobs with `priority_score <= this.priority` excluding self (slightly overestimates but much better than current).

**File**: `src/hooks/useGenerationQueue.ts` (lines 102-118)

### Issue 2: Rate Limit Counts All Job Statuses (Minor)

In `enqueue-generation/index.ts` lines 91-97, the hourly rate limit counts ALL jobs in the last hour regardless of status (completed, failed, cancelled). A user who had 9 failed jobs and 1 success would hit the free-tier limit of 10, even though most didn't produce results.

**Fix**: Add a status filter to exclude `cancelled` jobs at minimum:
```
.in("status", ["queued", "processing", "completed", "failed"])
```
Or more generously, only count `queued`, `processing`, and `completed`.

**File**: `supabase/functions/enqueue-generation/index.ts` (lines 93-97)

### Issue 3: Dead `maxConcurrent` in RATE_LIMITS (Cleanup)

The `RATE_LIMITS` object (lines 11-17) defines `maxConcurrent` per plan, but this is never used -- concurrency is now enforced atomically in the SQL `enqueue_generation` function. This dead code could mislead future developers.

**Fix**: Remove `maxConcurrent` from `RATE_LIMITS` and rename it to something clearer like `HOURLY_LIMITS`.

**File**: `supabase/functions/enqueue-generation/index.ts` (lines 10-17)

---

### Summary

| Priority | Issue | File |
|----------|-------|------|
| Medium | Position polling doesn't match SQL logic | `useGenerationQueue.ts` |
| Minor | Rate limit counts cancelled jobs | `enqueue-generation/index.ts` |
| Cleanup | Dead `maxConcurrent` in RATE_LIMITS | `enqueue-generation/index.ts` |

