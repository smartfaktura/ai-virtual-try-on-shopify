## Safety verification (done before this plan)

I traced every dependency before writing this plan. Stopping the cron is 100% safe:

1. **The edge function does not exist** — `supabase/functions/` has no `process-automation-queue` folder. It was never deployed. Every call already returns 401 and does nothing.
2. **The table it was designed to drain was already dropped** — migration `20260429072506` ran `DROP TABLE IF EXISTS public.email_automation_queue CASCADE;`. The cron has had nothing to process since that migration.
3. **No code references it** — `rg` across `src/` and `supabase/functions/` finds zero references. Only historical migration files mention it.
4. **No other cron job depends on it** — the other 5 active crons (`run-scheduled-drops`, `schedule-campaigns-tick`, `process-email-queue`, `poll-stuck-videos-every-minute`, `cleanup-brand-scene-orphans-daily`) are independent and untouched.
5. **No user-facing feature uses it** — email automations today flow through `process-email-queue` (jobid=7), which is separate and stays running.

Conclusion: unscheduling jobid=6 only stops the noise. Nothing else changes.

## The fix

Single SQL statement in a migration:

```sql
SELECT cron.unschedule(6);
```

That's it. No edge function code, no frontend code, no table changes.

## After the fix

- The 401 entries in edge logs stop within ~1 minute
- `cron.job` will show 5 active jobs instead of 6
- All other crons keep running on their normal schedules

## Rollback (if ever needed)

The original `cron.schedule(...)` call still lives in migration `20260429070957_9cb79913-8259-4361-ae83-bffb3003f8fb.sql` and can be re-run to recreate it. But since the target function and table no longer exist, there is no realistic reason to restore it.