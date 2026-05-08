## Critical: `generate-workflow` returning 403 on ALL calls

### Root Cause
The `process-queue` auth fix worked — it dispatches jobs successfully. But the **next hop fails**: when `process-queue` calls `generate-workflow`, the platform-level JWT verification rejects the service role key with **403** before the function code even executes.

This is the same stale deployment / key rotation issue. `generate-workflow` needs to be redeployed to pick up the current service role key.

### Evidence
- 154 jobs stuck in `processing`, **0 completions** in the last hour
- `generate-workflow` edge logs: 100% of calls return **403** (not 401 — this is platform-level JWT rejection, not in-code auth)
- No error logs from inside the function — it never gets to execute

### Fix (2 steps)

1. **Redeploy `generate-workflow`** — this ensures it picks up the current environment/keys
2. **Verify** — check edge logs for 200 responses and confirm jobs start completing

### Impact
- All 154 currently processing jobs will timeout and be auto-retried by `cleanup_stale_jobs` (retry_count=0, so they get one free retry)
- After redeploy, retried jobs should succeed
- No code changes needed — just a redeploy
