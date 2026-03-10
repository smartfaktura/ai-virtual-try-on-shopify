

## Diagnosis: Email Verification Emails Not Sending

### Root Cause

The verified email domain is **`notify.vovv.ai`** (confirmed by the domain status check), but the edge function is currently configured with `SENDER_DOMAIN = "vovv.ai"` and `FROM_DOMAIN = "vovv.ai"`. The email API rejects sending because `vovv.ai` doesn't match the verified sender domain `notify.vovv.ai`.

The edge function logs confirm this: the function boots when signup requests come in, but there are zero "Received auth event" or "Email sent" log entries — the send call fails because of the domain mismatch.

Additionally, the auth logs show multiple `429: email rate limit exceeded` errors for `123case@123presets.com`, `tomassimkus@123presets.com`, and `hello@candleracandle.com` — these were caused by repeated signup attempts while emails were silently failing.

### Fix

**`supabase/functions/auth-email-hook/index.ts`** — revert two constants:

```typescript
const SENDER_DOMAIN = "notify.vovv.ai"  // was "vovv.ai"
const FROM_DOMAIN = "notify.vovv.ai"    // was "vovv.ai"
```

This makes the `from` address `vovvai <notifications@notify.vovv.ai>` and `sender_domain: "notify.vovv.ai"`, matching the verified domain exactly.

Then redeploy `auth-email-hook`.

### Why `notify.vovv.ai`?

When the email domain was set up, the system provisioned `notify.vovv.ai` as a subdomain specifically for sending. The root domain `vovv.ai` is listed as the workspace domain, but the actual verified sending subdomain is `notify.vovv.ai`. Emails must use this subdomain to pass verification.

### Summary of Changes

1. Update `SENDER_DOMAIN` and `FROM_DOMAIN` to `"notify.vovv.ai"` in the auth-email-hook
2. Redeploy the edge function

