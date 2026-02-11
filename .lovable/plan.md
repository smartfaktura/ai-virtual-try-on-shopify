

## Fix: Jobs Getting Stuck in Queue Forever

### What Happened

Your generation job was enqueued successfully, but the fire-and-forget call to `process-queue` silently failed. Since there's no retry or fallback, the job sat in "queued" status indefinitely. The comment even says "pg_cron will pick it up" but there's no pg_cron configured.

### Solution: Two-Part Fix

#### Part 1: Add a retry mechanism in `enqueue-generation`

Instead of a single fire-and-forget fetch, `await` the process-queue call with a short timeout and retry once on failure. This ensures the queue worker is actually triggered.

**File:** `supabase/functions/enqueue-generation/index.ts`

Replace the fire-and-forget block (lines 142-157) with:

```typescript
// Trigger process-queue with retry
const triggerQueue = async () => {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/process-queue`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          "x-queue-internal": "true",
        },
        body: JSON.stringify({ trigger: "enqueue" }),
        signal: AbortSignal.timeout(5000), // 5s timeout
      });
      if (res.ok || res.status === 200) break;
      console.warn(`[enqueue] process-queue attempt ${attempt + 1} returned ${res.status}`);
    } catch (e) {
      console.warn(`[enqueue] process-queue attempt ${attempt + 1} failed:`, e.message);
    }
  }
};
// Don't block the response, but do retry
triggerQueue().catch(() => {});
```

#### Part 2: Add client-side stuck detection in `useGenerationQueue`

If a job has been in "queued" status for more than 30 seconds without moving to "processing", the polling logic will re-trigger the process-queue via the enqueue endpoint or directly. This acts as a safety net.

**File:** `src/hooks/useGenerationQueue.ts`

In the `pollJobStatus` callback, after detecting the job is still `queued`, add a check:

```typescript
// If stuck in queue for 30+ seconds, re-trigger process-queue
if (job.status === 'queued') {
  const queuedDuration = Date.now() - new Date(job.created_at).getTime();
  if (queuedDuration > 30_000 && !retriggeredRef.current) {
    retriggeredRef.current = true;
    // Re-trigger via a lightweight call
    fetch(`${SUPABASE_URL}/functions/v1/process-queue`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trigger: 'stuck-retry' }),
    }).catch(() => {});
  }
}
```

Wait -- `process-queue` requires the service role key, so the client can't call it directly. Instead, we'll add a lightweight "retry-trigger" endpoint or modify `process-queue` to accept the anon key for a trigger-only call. Actually, the simplest approach:

#### Revised Part 2: Client re-triggers via enqueue-generation

Add a `/retry` path or simply have the client call a new small edge function `retry-queue` that just calls `process-queue` with the service role key internally.

**New file:** `supabase/functions/retry-queue/index.ts`

A minimal function that:
1. Accepts any authenticated user call
2. Checks if they have a queued job
3. Triggers `process-queue` with the service role key

This is the safety net -- if polling detects a stuck job, the client calls `retry-queue`.

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/enqueue-generation/index.ts` | Replace fire-and-forget with retry-aware trigger (2 attempts, 5s timeout each) |
| `supabase/functions/retry-queue/index.ts` | New minimal function: accepts auth user, triggers process-queue with service role key |
| `src/hooks/useGenerationQueue.ts` | Add stuck detection: if queued > 30s, call retry-queue as safety net |
| `supabase/config.toml` | Add retry-queue function config |

### Immediate Fix for Your Stuck Job

As part of this change, the `retry-queue` function will also allow me to unstick your current job. Alternatively, we can mark it as failed and refund credits via a direct DB update.

