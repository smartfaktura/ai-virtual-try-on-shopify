

## Fix: Send Auth Emails from `noreply@vovv.ai` Instead of `notify.vovv.ai`

### Problem
Auth emails are configured to send from `noreply@notify.vovv.ai`, but the verified domain is `vovv.ai`. The user wants to send from `notifications@vovv.ai` (or similar `@vovv.ai` address).

### Fix

**`supabase/functions/auth-email-hook/index.ts`** — update three constants:

- `SENDER_DOMAIN`: `"notify.vovv.ai"` → `"vovv.ai"`
- `FROM_DOMAIN`: `"notify.vovv.ai"` → `"vovv.ai"`  
- The `from` address becomes `vovvai <notifications@vovv.ai>` (or `noreply@vovv.ai` — user's preference)

Then redeploy `auth-email-hook`.

