

## Fix: Global Dispatch Rate Limiting for Concurrent Users

### Problem
Each `enqueue-generation` call triggers its own `process-queue` invocation. With 10 users generating simultaneously, 10 process-queue instances run in parallel. `SKIP LOCKED` prevents duplicate claims, but all instances dispatch jobs concurrently — overwhelming the AI gateway with ~100 simultaneous requests. The 500ms stagger only works within a single instance.

### Solution: Singleton Dispatcher + Global Concurrency Cap

**1. Add a `queue_dispatch_lock` table to enforce single-dispatcher**

A simple advisory lock pattern: only one process-queue instance dispatches at a time. Others exit early.

```sql
-- New migration
CREATE TABLE IF NOT EXISTS queue_dispatch_lock (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  locked_at timestamptz,
  locked_by text
);
INSERT INTO queue_dispatch_lock (id) VALUES (1) ON CONFLICT DO NOTHING;
```

**2. Update `process-queue/index.ts` — try-lock before dispatching**

At the start, attempt to acquire the lock with a short expiry (30s). If another instance holds it, return immediately (the active instance will process all queued jobs).

```ts
// Try to acquire singleton lock (expires after 30s for safety)
const { data: lockAcquired } = await supabase.rpc('try_acquire_dispatch_lock');
if (!lockAcquired) {
  return new Response(JSON.stringify({ skipped: true, reason: 'another dispatcher active' }), ...);
}
// ... existing dispatch loop ...
// Finally: release lock
await supabase.rpc('release_dispatch_lock');
```

**3. Add DB functions for lock management**

```sql
CREATE FUNCTION try_acquire_dispatch_lock() RETURNS boolean ...
-- Acquires if unlocked or lock expired (>30s ago)

CREATE FUNCTION release_dispatch_lock() RETURNS void ...
-- Clears the lock
```

**4. Increase stagger from 500ms to 1000ms**

With a single dispatcher, we can afford a longer stagger to smooth out AI gateway load across all users' jobs.

**5. Add global concurrency cap**

Before dispatching, check how many jobs are currently `processing`. If above a threshold (e.g., 20), pause dispatching and let running jobs finish first.

```ts
const { count: activeJobs } = await supabase
  .from('generation_queue')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'processing');

if ((activeJobs || 0) >= MAX_CONCURRENT_JOBS) {
  console.log('[process-queue] Concurrency cap reached, pausing dispatch');
  break;
}
```

### Files Changed

| File | Change |
|------|--------|
| **New migration** | Create `queue_dispatch_lock` table + `try_acquire_dispatch_lock` / `release_dispatch_lock` functions |
| `supabase/functions/process-queue/index.ts` | Add singleton lock, increase stagger to 1s, add concurrency cap (20 active jobs) |

### Impact
- Only one dispatcher runs at a time — no parallel stampede
- Global concurrency cap prevents AI gateway overload regardless of user count
- Lock auto-expires after 30s so a crashed dispatcher won't block the queue permanently
- No changes needed to enqueue or generation functions

