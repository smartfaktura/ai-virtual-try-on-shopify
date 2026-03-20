

# Set Up Daily Morning Cron for Scheduled Drops

## Current State
- `run-scheduled-drops` function exists and works — queries `creative_schedules` where `next_run_at <= now()` and triggers them
- No pg_cron job has been created yet
- "Run Now" already works instantly via `trigger-creative-drop` (no cron needed)

## Change

### Create pg_cron job — once per day at 7:00 AM UTC

Use the SQL insert tool (not migration) to schedule a single daily check:

```sql
SELECT cron.schedule(
  'run-scheduled-drops',
  '0 7 * * *',
  $$ SELECT net.http_post(
    url := 'https://azwiljtrbtaupofwmpzb.supabase.co/functions/v1/run-scheduled-drops',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6d2lsanRyYnRhdXBvZndtcHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTkzNzEsImV4cCI6MjA4NTM3NTM3MX0.w8Flgj4nld44gT4w-S_TSqzZ-FRPt4xTFiHm1U_c5VY"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  ); $$
);
```

- Runs at **7:00 AM UTC daily** (morning check)
- The function already handles the logic: finds all schedules where `next_run_at <= now()` and triggers them
- "Run Now" button bypasses cron entirely — calls `trigger-creative-drop` directly, so it works instantly regardless of cron timing

## Summary
- 1 SQL statement to execute via insert tool
- Once-daily morning check is sufficient for weekly/biweekly/monthly schedules
- No code changes needed — the function is already correct

