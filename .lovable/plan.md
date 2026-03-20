

# Creative Drops: Schedule, Run Now & Next Month — Status Report

## What's Working Correctly

1. **"Run Now" button** — Works. `DropCard` calls `supabase.functions.invoke('trigger-creative-drop')` with user JWT auth. The function reads the schedule, builds payloads, creates a `creative_drops` record with `status: "generating"`, enqueues jobs via `enqueue_generation` RPC, and triggers `process-queue`. No bugs here.

2. **Wizard "Generate Now" delivery mode** — Works. When `deliveryMode === 'now'`, the wizard saves the schedule with `frequency: 'one-time'` and `next_run_at: null`, then immediately invokes `trigger-creative-drop`. After execution, `trigger-creative-drop` deactivates one-time schedules (`active: false`).

3. **Next run calculation after execution** — Works. `trigger-creative-drop` (lines 347-373) correctly advances `next_run_at` for recurring schedules: +7 days (weekly), +14 days (biweekly), +1 month (monthly). One-time schedules get deactivated.

4. **Scheduled execution via cron** — Works. `run-scheduled-drops` queries `creative_schedules` where `active = true AND next_run_at <= now()`, then calls `trigger-creative-drop` with internal auth. The daily 7 AM UTC cron job fires this.

5. **Drop completion tracking** — Works. `complete-creative-drop` checks pending queue jobs, collects images with resolved names, and transitions drops to `ready`/`failed`.

6. **UI polling** — Works. The drops query re-fetches every 10 seconds when any drop is `generating`.

## One Bug Found

### Wizard: `next_run_at` set to start date, not first *scheduled* run date

**Lines 461-464** in `CreativeDropWizard.tsx`:
```ts
let nextRun: Date | null = null;
if (deliveryMode === 'scheduled') {
  nextRun = new Date(effectiveStartDate);
}
```

When `deliveryMode === 'now'`, `nextRun` is `null` — so one-time "Run Now" drops correctly have no next run. But for **scheduled recurring** drops, `nextRun` is just the `startDate` without any frequency offset. This means:

- User creates a monthly schedule with start date = March 20
- `next_run_at` is set to March 20
- The cron at 7 AM UTC on March 20 triggers it (correct for the first run)
- After that first run, `trigger-creative-drop` advances `next_run_at` to April 20 (correct)

This actually works correctly for the first run and subsequent runs. The start date IS the first scheduled run date, which is the intended behavior.

## Verdict

**Everything is working correctly.** The schedule system, Run Now, recurring next-month calculation, and cron execution are all properly wired. No code changes needed.

The only consideration: if the daily cron hasn't been set up yet via the SQL insert tool, scheduled drops won't auto-execute. But the code itself is correct.

