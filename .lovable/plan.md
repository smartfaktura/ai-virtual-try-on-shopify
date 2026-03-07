

## Email System Audit — Issues Found and Fix Plan

### Critical Bugs

**1. Wrong schema for HTTP calls — emails silently fail**
Both `notify_new_user()` and `deduct_credits()` call `extensions.http_post()`, but the function only exists as `net.http_post()`. This means:
- Welcome emails never actually send (error caught silently)
- Low credits emails never actually send (error caught silently)

**Fix**: Database migration to recreate both functions using `net.http_post()` instead of `extensions.http_post()`.

**2. `emailWeeklyDigest` toggle exists in Settings UI but has no backend**
The Settings page shows a "Weekly usage digest" checkbox but there's no edge function, no cron job, and no email template for it. Users see a toggle that does nothing.

**Fix**: Either remove the toggle from Settings or build the weekly digest system. Recommend removing it for now since it's a larger feature (needs a cron job + aggregation query + new template).

### What's Working Correctly

- `send-email` edge function: 4 templates (welcome, generation_complete, generation_failed, low_credits) all branded correctly
- Generation complete emails: properly opt-in (checks `emailOnComplete === true`), hooked into all 3 generators
- Generation failed emails: properly opt-out (checks `emailOnFailed !== false`), hooked into all 3 generators
- Service role auth on `send-email` function
- Trigger `trg_notify_new_user` exists on `profiles` table
- `deduct_credits()` checks `emailLowCredits` preference and 24h rate limit

### Plan

**1. Database migration — fix `extensions.http_post` → `net.http_post`**
Recreate both `notify_new_user()` and `deduct_credits()` functions with the correct `net.http_post()` call. Everything else stays identical.

**2. Remove `emailWeeklyDigest` from Settings UI**
Remove the toggle from `src/pages/Settings.tsx` since there's no backend for it. This prevents user confusion. Can be added back later when the cron job is built.

### Files Changed
| File | Change |
|------|--------|
| DB migration | Fix `extensions.http_post` → `net.http_post` in both `notify_new_user()` and `deduct_credits()` |
| `src/pages/Settings.tsx` | Remove `emailWeeklyDigest` from `UserSettings` interface and UI |

