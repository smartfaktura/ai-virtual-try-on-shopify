

## Fix: Revert Sender Domain to `notify.vovv.ai`

### Root Cause
The verified email sender domain is `notify.vovv.ai`, but the previous fix changed `SENDER_DOMAIN` and `FROM_DOMAIN` to `vovv.ai`. The Email API rejects it with "No sender domain matches the requested sender domain."

### Fix

**`supabase/functions/auth-email-hook/index.ts`** — revert two constants:

- `SENDER_DOMAIN` back to `"notify.vovv.ai"`
- `FROM_DOMAIN` back to `"notify.vovv.ai"`

This makes the `from` address `vovvai <noreply@notify.vovv.ai>` and `sender_domain: "notify.vovv.ai"`, matching the verified domain.

Then redeploy `auth-email-hook`.

### Resend Timer
Also increase the resend countdown from 30s to 60s in `Auth.tsx` — the server enforces a 59-second rate limit, so a 30s client timer causes users to hit the rate limit.

