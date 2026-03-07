

## Email Notification System — Final Audit

### What's Working Correctly

| Component | Status |
|-----------|--------|
| `send-email` Edge Function | 4 templates (welcome, generation_complete, generation_failed, low_credits), service-role auth, Resend integration |
| `notify_new_user()` DB function | Uses `net.http_post` (correct) |
| `deduct_credits()` DB function | Uses `net.http_post`, checks `emailLowCredits` preference, 24h rate limit |
| Generation complete emails | Opt-in (`emailOnComplete === true`), hooked into all 3 generators |
| Generation failed emails | Opt-out (`emailOnFailed !== false`), hooked into all 3 generators |
| Settings UI | Correct defaults (complete=OFF, failed=ON, low credits=ON), weekly digest removed |

### Critical Bug: Welcome Email Trigger is Missing

The `trg_notify_new_user` trigger on the `profiles` table **does not exist in the database**. The function `notify_new_user()` exists and is correct, but nothing calls it. New users will never receive a welcome email.

**Fix**: A single migration to recreate the trigger.

### No Other Issues Found

After full audit of all email-related code paths:
- All 3 generation functions (freestyle, tryon, workflow) correctly check user preferences before sending
- The `deduct_credits` function correctly checks `emailLowCredits` and the 24h cooldown
- The `send-email` function has all 4 templates and proper auth
- Settings UI matches the backend logic

### Plan

**1. Database migration — recreate the missing trigger**

```sql
DROP TRIGGER IF EXISTS trg_notify_new_user ON public.profiles;
CREATE TRIGGER trg_notify_new_user
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_user();
```

That's it — one migration, one fix. Everything else is working correctly.

### Files Changed
| File | Change |
|------|--------|
| DB migration | Recreate `trg_notify_new_user` trigger on `profiles` table |

