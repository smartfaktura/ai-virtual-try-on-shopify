

# Creative Drops: Bug Audit Results

## Bugs Found

### Bug 1 (Medium): `run-scheduled-drops` Has No Authentication
The function has **zero authentication**. Anyone can call it and trigger all due schedules for all users. It should verify the request comes from the cron job (service role key) or reject it.

**File**: `supabase/functions/run-scheduled-drops/index.ts` (lines 10-21)
**Fix**: Add service-role auth check before processing, same pattern as `complete-creative-drop`.

### Bug 2 (Medium): Progress Bar Always Shows 0% During Generation
`DropCard.tsx` line 291-293: `completedImages = dropImages.length`. But `drop.images` is only populated when `complete-creative-drop` runs (after ALL jobs finish). During generation, `drop.images` is always `[]`, so `completedImages = 0` and `progressPct = 0%`.

The time-based estimate text (lines 316-328) works fine, but the actual `<Progress>` bar is stuck at 0%.

**Fix**: Use time-based progress for the bar too: `Math.min(95, Math.round((elapsedMs / estimatedTotalMs) * 100))`.

### Bug 3 (Low): `complete-creative-drop` Queries Wrong Table for Pending Jobs
Line 54-58 queries `generation_queue` with `payload->>creative_drop_id`, but the PostgREST JSON arrow filter syntax may not work reliably with `payload->>` on `generation_queue`. The `generation_queue.payload` column stores `creative_drop_id` inside JSONB, and the filter `payload->>creative_drop_id` requires exact key match.

This is actually fine syntactically in PostgREST, but there's a subtle issue: the `not("status", "in", '("completed","failed","cancelled")')` filter uses parentheses syntax which may fail. The correct PostgREST syntax for `NOT IN` is `not.in.(completed,failed,cancelled)` — the current string `'("completed","failed","cancelled")'` might not parse correctly.

**Fix**: Change to `.in("status", ["queued", "processing"])` (positive match instead of negative).

### Bug 4 (Low): Double Credit Deduction
`trigger-creative-drop` checks credits balance at line 257, then enqueues via `enqueue_generation` RPC which ALSO deducts credits (line in the RPC function). So credits are deducted per-job by the RPC, but the balance check at line 257 only checks the raw balance vs total cost — it doesn't account for sequential deductions within the same batch. If user has exactly enough credits for 5 jobs, by job 3 the RPC might report "Insufficient credits" because jobs 1-2 already deducted.

This is actually handled correctly because `enqueue_generation` uses `FOR UPDATE` and deducts atomically. The pre-check at line 257 is just an early-exit optimization. However, if it passes the pre-check but a concurrent request drains credits between check and enqueue, some jobs will fail with "Insufficient credits" — which is handled gracefully (pushed to `errors` array). Not a real bug, just a race condition that's already handled.

### Bug 5 (Low): `creative_drops` Insert Uses User RLS But Service Role Client
Line 275-291 in `trigger-creative-drop` inserts into `creative_drops` using the service role client, which bypasses RLS. This is correct behavior. No bug here.

## What's Working Correctly
- Wizard saves schedules with proper `user_id` scoping
- "Run Now" triggers `trigger-creative-drop` which enqueues jobs correctly
- `complete-creative-drop` fires after each job and collects images as objects with metadata
- Daily cron at 7 AM UTC runs `run-scheduled-drops`
- Drop detail modal falls back to querying `generation_jobs` when `drop.images` is empty
- Toast notifications on drop completion (generating → ready/failed)
- 10-second polling while drops are generating
- One-time schedules get deactivated after execution
- Recurring schedules get `next_run_at` updated properly

## Recommended Fixes (Priority Order)

### Fix 1: Add Auth to `run-scheduled-drops`
Add service-role key check (5 lines).

### Fix 2: Time-Based Progress Bar
Replace count-based progress with time-based estimate in `DropCard.tsx` (3 lines).

### Fix 3: Fix Pending Jobs Query
Change the `NOT IN` filter to a positive `IN` filter for reliability (1 line).

## Summary
- 1 security issue (unauthenticated cron endpoint)
- 1 UX issue (progress bar stuck at 0%)
- 1 potential query issue (PostgREST filter syntax)
- No data loss or corruption risks
- 3 files, ~15 lines total to fix

