

## Diagnose & Fix Email Delivery

### Problem
The edge function logs show `message_id: undefined` — meaning `sendLovableEmail` completes without error but returns no message ID. Emails are not arriving in the inbox.

### Root Cause (likely)
There's a potential domain mismatch. The code uses `sender_domain: "notify.vovv.ai"` and `from: "noreply@notify.vovv.ai"`, but `list_email_domains` reports the verified domain as `vovv.ai` (the root). The Email API may be silently rejecting or dropping the email because `sender_domain` doesn't exactly match the registered domain.

### Fix

**`supabase/functions/auth-email-hook/index.ts`** — two changes:

1. Change `SENDER_DOMAIN` from `"notify.vovv.ai"` to `"vovv.ai"` to match the verified domain, and update `FROM_DOMAIN` accordingly so the `from` address becomes `noreply@vovv.ai`

2. Add diagnostic logging: log the full `result` object from `sendLovableEmail` (not just `message_id`) so we can see the actual API response if the issue persists

Then redeploy the edge function.

