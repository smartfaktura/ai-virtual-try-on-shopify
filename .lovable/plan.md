

## Fix: Perspectives 429 Rate Limit Crash

### Problem
When generating perspectives, all 4 jobs are enqueued rapidly back-to-back. If the user has any existing running/processing jobs, or if the enqueue endpoint processes them faster than expected, the concurrency limit of 4 is hit and subsequent enqueue calls return 429. While the `shouldStop` flag prevents further attempts, the rapid-fire enqueue causes partial failures and the Lovable error overlay fires.

### Root Cause
The hook fires all `fetch` calls to `enqueue-generation` in a tight loop with no delay between them. The backend counts concurrent jobs and rejects when >= 4 are active.

### Solution
Two changes:

#### 1. `src/hooks/useGeneratePerspectives.ts` — Add delay between enqueue calls + pre-flight queue check

- **Pre-flight check**: Before the enqueue loop, query the `generation_queue` table for active jobs (`status in ('queued', 'processing')`). If count >= max (4), show a toast and bail early instead of starting and failing.
- **Staggered enqueue**: Add a 500ms `await sleep()` between each enqueue call to prevent rapid-fire 429s. The backend needs time to register each job before the next one arrives.

```typescript
// Pre-flight check
const { count } = await supabase
  .from('generation_queue')
  .select('*', { count: 'exact', head: true })
  .in('status', ['queued', 'processing'])
  .eq('user_id', user.id);

if ((count || 0) + totalJobs > 4) {
  toast.error(`You have ${count} active jobs. Wait for them to finish before starting ${totalJobs} more.`);
  return null;
}

// Between enqueue calls
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
// ... after each successful enqueue:
await sleep(500);
```

#### 2. `src/hooks/useGeneratePerspectives.ts` — Better 429 error message

Change the toast from `errorData.message` (which is undefined — the response has `error`, not `message`) to `errorData.error`:

```typescript
// Before:
toast.error(errorData.message || `Rate limit reached...`);
// After:
toast.error(errorData.error || `Rate limit reached...`);
```

### Files changed
| File | Change |
|------|--------|
| `src/hooks/useGeneratePerspectives.ts` | Add pre-flight queue check, stagger enqueue calls with 500ms delay, fix error field name |

