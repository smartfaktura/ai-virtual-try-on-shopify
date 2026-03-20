

# Backend: Creative Drops Completion & Scheduled Execution

## Current Gap
1. **Drops stay "generating" forever** — `generate-workflow` and `generate-tryon` insert into `generation_jobs` with `creative_drop_id` but never update the `creative_drops` row to `ready`/`failed`
2. **No automatic scheduled execution** — schedules store `next_run_at` but nothing triggers them

## Plan — 4 Independent Steps

### Step 1: Create `complete-creative-drop` Edge Function (NEW)

Standalone, idempotent function. Accepts `{ creative_drop_id }`, service-role only.

Logic:
1. Count pending queue jobs: `generation_queue` where `payload->>'creative_drop_id' = id` AND `status NOT IN ('completed','failed','cancelled')`
2. If any remain → exit early (not done yet)
3. If all terminal → collect all image URLs from `generation_jobs` where `creative_drop_id = id`
4. If images exist → update `creative_drops` set `status = 'ready'`, `images = [collected URLs]`, `total_images = count`
5. If no images → set `status = 'failed'`

**File**: `supabase/functions/complete-creative-drop/index.ts` (~70 lines)
**Config**: Add to `supabase/config.toml`

### Step 2: Add Fire-and-Forget Trigger in `generate-workflow` and `generate-tryon`

After each job completes (both success AND failure paths), add ~5 lines:

```ts
if (payload.creative_drop_id) {
  fetch(`${supabaseUrl}/functions/v1/complete-creative-drop`, {
    method: "POST",
    headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ creative_drop_id: payload.creative_drop_id }),
  }).catch(() => {});
}
```

Added after the `generation_jobs` insert in both functions (lines ~732 and ~421). Non-blocking, no impact on non-drop jobs.

**Files**: `generate-workflow/index.ts` (+5 lines at 2 places), `generate-tryon/index.ts` (+5 lines at 2 places)

### Step 3: Create `run-scheduled-drops` Edge Function (NEW)

Cron-triggered function, service-role only.

Logic:
1. Query `creative_schedules` where `active = true AND next_run_at <= now()`
2. For each due schedule, call `trigger-creative-drop` internally with the schedule's `user_id`
3. Log results

Requires: Update `trigger-creative-drop` to accept an internal service-role bypass (accept `user_id` from body when called with `x-queue-internal: true` header + service role auth, instead of requiring user JWT).

**Files**: 
- `supabase/functions/run-scheduled-drops/index.ts` (~60 lines, NEW)
- `supabase/functions/trigger-creative-drop/index.ts` (~10 lines modified for internal auth bypass)
- `supabase/config.toml` (add function entry)

### Step 4: Set Up pg_cron Job

Using the insert tool (not migration — contains project-specific URL/key):

```sql
SELECT cron.schedule(
  'run-scheduled-drops',
  '*/15 * * * *',
  $$ SELECT net.http_post(
    url := 'https://azwiljtrbtaupofwmpzb.supabase.co/functions/v1/run-scheduled-drops',
    headers := '{"Authorization": "Bearer <anon_key>", "Content-Type": "application/json"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  ); $$
);
```

Requires `pg_cron` and `pg_net` extensions (already used by `notify_new_user`).

## Implementation Order & Safety

| Step | Risk | Can deploy independently | Rollback |
|------|------|--------------------------|----------|
| 1 | Zero — new function, nothing calls it yet | Yes | Delete function |
| 2 | Very low — 5 non-blocking lines, only fires for drop jobs | Yes (but needs Step 1) | Remove the lines |
| 3 | Zero — new function, nothing calls it yet | Yes | Delete function |
| 4 | Low — just a scheduled query | Yes (needs Step 3) | `cron.unschedule()` |

## Files Summary

| File | Change |
|------|--------|
| `supabase/functions/complete-creative-drop/index.ts` | **NEW** ~70 lines |
| `supabase/functions/run-scheduled-drops/index.ts` | **NEW** ~60 lines |
| `supabase/functions/generate-workflow/index.ts` | +10 lines (2 fire-and-forget calls) |
| `supabase/functions/generate-tryon/index.ts` | +10 lines (2 fire-and-forget calls) |
| `supabase/functions/trigger-creative-drop/index.ts` | +10 lines (internal auth bypass) |
| `supabase/config.toml` | +4 lines (2 new function entries) |

