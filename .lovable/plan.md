
## Investigation Summary

### What's broken
The `process-queue` edge function returns **401 Unauthorized** on every call. This means **no image generation jobs are being processed**. There are **171 queued jobs** stuck since May 7 ~10:41 UTC. The last successful generation completed at **May 7 09:31 UTC** — almost 20 hours of downtime.

### Affected users
Every user who tried generating since May 7, including hello@123presets.store (3 jobs from today) and whoever else messaged you.

### Root cause analysis
The `process-queue` function has an in-code auth guard that compares the `Authorization` header against `SUPABASE_SERVICE_ROLE_KEY`:

```
if (authHeader !== `Bearer ${serviceRoleKey}`) → 401
```

Both callers (`retry-queue` and `enqueue-generation`) correctly pass `Bearer ${serviceRoleKey}` from their own Deno env. The comparison should always match since all functions share the same env var.

**Most likely cause:** A stale deployment of `process-queue`. On May 6-7, several edge functions were modified (`generate-workflow` got bundle prompt fixes). Lovable auto-deploys changed functions, but `process-queue` itself wasn't changed — it may have ended up in an inconsistent deployment state where its runtime environment doesn't match the current service role key. This can happen after internal infrastructure updates or key rotations.

**Evidence:**
- Analytics show 100% of process-queue calls return 401 (not intermittent — every single one)
- The function boots and runs (we see boot logs), but no request-handling logs appear (because the code returns 401 before any console.log)
- The dispatch lock table is clean (not locked), so it's not a lock issue
- No cron job exists for process-queue — it relies entirely on being called by retry-queue and enqueue-generation

### What did NOT cause this
- No code changes were made to process-queue itself
- The retry-queue and enqueue-generation functions work fine (200 status)
- RLS / database is healthy
- The dispatch lock is not stuck

---

## Fix Plan (Safe, Non-Destructive)

### Step 1: Add diagnostic logging to process-queue
Add a `console.log` at the auth guard to log key length comparison (NOT the actual keys) so if this ever recurs we can diagnose instantly:
```typescript
console.log(`[process-queue] Auth check: header=${authHeader?.substring(0, 15)}... (len=${authHeader?.length}), expected len=${('Bearer ' + serviceRoleKey).length}`);
```

### Step 2: Redeploy process-queue
Force a fresh deployment to ensure it picks up the current environment. This is the primary fix.

### Step 3: Verify the fix
Call `process-queue` via curl and check edge function logs + analytics to confirm it returns 200 (not 401).

### Step 4: Flush the stuck queue
The 171 queued jobs should start processing automatically once process-queue is healthy — retry-queue fires every ~30 seconds and will wake the dispatcher. If not, manually trigger a retry-queue call.

### Step 5: Monitor
Check that jobs move from `queued` → `processing` → `completed` and that users' credits are correctly handled.

---

### Safety notes
- No database changes needed
- No schema or RLS changes
- Only one file touched: `supabase/functions/process-queue/index.ts` (adding 1 log line)
- The 171 stuck jobs already have credits deducted — they will either complete or fail+refund via existing cleanup logic
- No risk to other workflows
