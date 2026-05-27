## Goal

Make Resend properties reliably fresh and stop silent failures — without overloading the app.

## Three independent fixes

### 1. Fix `track-resend-event` duplicate `const` (BLOCKS automations)

File: `supabase/functions/track-resend-event/index.ts`
- Remove the duplicate `const RESEND_AUDIENCE_ID` declaration (declared at line 25 AND line 84).
- Deploy.
- Verify: trigger a low-credit event from one test user, confirm `LAST_EVENT` / `LAST_EVENT_AT` populate in Resend, confirm a row appears in any send/event log.

Impact: unlocks `user.first_generation`, `credits.low`, `credits.purchased`, `generation.milestone.*` events — all currently lost.

### 2. Fix the 5-min 401 (`schedule-campaigns-tick`)

Confirmed: every run since 14:00 UTC returns `401 Unauthorized`. Cron command sends only `apikey: <anon>` but the function rejects anon.
- Inspect `supabase/functions/schedule-campaigns-tick/index.ts` to confirm whether it needs service-role (admin work) or is fine being called with anon JWT.
- If it needs service-role: rewrite the cron SQL to pull `SUPABASE_SERVICE_ROLE_KEY` from `vault.decrypted_secrets` and pass it as `Authorization: Bearer …` (same pattern as `process-email-queue` cron).
- If it can accept anon: add a proper `Authorization: Bearer <anon>` header alongside `apikey`.
- Verify: next cron tick returns 200, `net._http_response` stops logging 401s.

Impact: removes ~288 failed HTTP calls/day, restores whatever campaign scheduling this was meant to do.

### 3. Add 60-min Resend property refresh cron

New scheduled job: `refresh-resend-properties` running `0 * * * *` (every 60 min).
- Calls existing `resync-resend-audience` edge function (already idempotent, already used by admin "Resync" button).
- Uses vault service-role key (same pattern as `process-email-queue`).
- Lightweight: 1 invocation/hour, function does batched Resend PATCHes internally.

Impact: `credits_balance`, `plan`, `lifecycle_stage`, `last_generated_at`, `total_generations` stay max 1 hour stale in Resend — fine for segmentation/automation. No real-time pressure, no app overload (~24 runs/day).

## Load summary after fixes

| Source | Frequency | Type |
|---|---|---|
| Real-time events (signup, credit, milestone) | per user action | fire-and-forget, already wrapped in `EXCEPTION WHEN OTHERS` |
| Property refresh cron (NEW) | 1×/hour | single edge fn call, internally batched |
| Campaign scheduler (FIXED) | 1×/5 min | already existed, just stops 401-ing |

No new app-facing load. All Resend writes remain server-side via pg_net or edge functions — never from the browser.

## Order of operations

1. Fix duplicate `const` in `track-resend-event` + deploy (5 min, unblocks events)
2. Diagnose + fix `schedule-campaigns-tick` 401 (10 min)
3. Add `refresh-resend-properties` pg_cron job (5 min)
4. Wait 60 min, verify Resend properties on a free user show recent `LAST_ACTIVE_AT` / `TOTAL_GENERATIONS` without admin clicking Resync.

## Out of scope

- `REFERRAL_SOURCE` capture (separate work — needs signup form change)
- `PRODUCT_CATEGORIES` backfill for users who skipped onboarding
- Switching activation/winback to Resend Broadcasts vs Automations
