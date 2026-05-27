## Safe plan: Remove hourly Resend cron, keep real-time triggers

### What we do
1. **Unschedule the `refresh-resend-properties` cron job** via a single migration — this stops the hourly 403 errors and removes the only code path that touches `resync-resend-audience` without a real admin user.
2. **Verify the cron is gone** — query `cron.job` to confirm zero scheduled `refresh-resend-properties` entries.
3. **Spot-check real-time events** — confirm `track-resend-event` continues receiving `contact.sync` / `contact.property_sync` / `credits.purchased` / `generation.milestone.*` events from DB triggers.

### What stays exactly as-is (zero risk)
- All existing DB triggers that fire on user actions (signup, credits change, milestones, first generation).
- `track-resend-event` edge function — duplicate `const` fix stays, no new edits.
- `resync-resend-audience` edge function — no auth changes, no pagination loop changes.
- Admin `/admin/email-marketing` page — manual "Resync" button still works exactly the same.
- Generation pipeline, credit system, Stripe billing — untouched.

### Why this is the safest option
- No edge function code changes = no new bugs, no auth bypass risk, no timeout risk.
- Real-time triggers already cover 100% of active users. Inactive users don't need fresh properties for automations.
- Admin manual resync is available as a safety net for edge cases.

### Migration SQL
```sql
SELECT cron.unschedule('refresh-resend-properties');
```