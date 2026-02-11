

## Phase 3 Audit: Process-Queue Worker

### Status: Mostly Solid -- 3 Issues Found

---

### Issue 1: Missing `generate-tryon` in config.toml (Critical)

The `process-queue` worker maps `tryon` jobs to the `generate-tryon` function (line 13), and the function directory exists at `supabase/functions/generate-tryon/`. However, `generate-tryon` is **not registered** in `supabase/config.toml`, which means it may fail to deploy or reject requests.

**Fix**: Add the following to `supabase/config.toml`:
```toml
[functions.generate-tryon]
verify_jwt = false
```

**File**: `supabase/config.toml`

---

### Issue 2: No Authentication on process-queue Endpoint (Medium)

The `process-queue` function is publicly callable (`verify_jwt = false` in config.toml) and has no internal authentication check. Anyone who knows the URL can trigger queue processing. While it only processes existing jobs (no data mutation risk beyond normal flow), it could be abused for:
- Denial of service (repeatedly triggering expensive generation calls)
- Race conditions from concurrent process-queue invocations

**Fix**: Add a check for the `x-queue-internal` header or validate the `Authorization` header matches the service role key:

```typescript
// At the top of the handler, after OPTIONS check:
const internalToken = req.headers.get("x-queue-internal");
const authHeader = req.headers.get("authorization");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

if (internalToken !== "true" || authHeader !== `Bearer ${serviceRoleKey}`) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

**File**: `supabase/functions/process-queue/index.ts`

---

### Issue 3: generation_jobs Insert Missing `creative_drop_id` (Minor)

When process-queue saves results to `generation_jobs` (lines 107-120), it maps `product_id`, `workflow_id`, and `brand_profile_id` from the payload but omits `creative_drop_id`, which is a column in the `generation_jobs` table. If the payload contains a `creative_drop_id`, it will be silently dropped.

**Fix**: Add `creative_drop_id` to the insert:

```typescript
creative_drop_id: (payload as Record<string, unknown>).creative_drop_id || null,
```

**File**: `supabase/functions/process-queue/index.ts` (line 120, inside the insert object)

---

### Everything Else Looks Good

- **Job claiming** (`claim_next_job`): Uses `FOR UPDATE SKIP LOCKED` -- correct for concurrent workers.
- **Stale job cleanup** (`cleanup_stale_jobs`): Properly refunds credits and marks timed-out jobs as failed.
- **Partial success refunds**: Math is correct (`perImageCost * missed`), uses `Math.floor` to avoid over-refunding.
- **Failure handling**: Credits are fully refunded, error messages are persisted.
- **Time budget loop**: 45s cap is safe under the 60s edge function limit.
- **No double credit deduction**: Downstream functions (`generate-freestyle`, `generate-product`, etc.) do not call `deduct_credits` -- credits are only deducted by `enqueue_generation`.

---

### Summary

| Priority | Issue | File |
|----------|-------|------|
| Critical | `generate-tryon` missing from config.toml | `supabase/config.toml` |
| Medium | No auth check on process-queue endpoint | `supabase/functions/process-queue/index.ts` |
| Minor | `creative_drop_id` not passed to generation_jobs | `supabase/functions/process-queue/index.ts` |

### Implementation Order

1. Add `generate-tryon` to config.toml
2. Add auth guard to process-queue
3. Add `creative_drop_id` to the generation_jobs insert

