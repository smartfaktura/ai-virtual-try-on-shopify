

## Diagnosis: Why "We already sent a verification email" appears

### Two separate issues found

**Issue 1: Rate limiting (immediate cause of the toast)**
The auth system has a per-email rate limit. Previous rapid signup attempts (before the domain fix) exhausted this limit. The Auth.tsx code (line 84-86) catches `rate_limit` / `over_email_send_rate_limit` errors and shows the friendly toast "We already sent a verification email" instead of the raw error. This clears automatically after a few minutes.

**Issue 2: Edge function silently failing (root cause — no emails ever sent)**
The edge function logs show ONLY "booted" and "shutdown" entries — zero application logs ("Received auth event", "Email sent", or any error). This means the function crashes during webhook verification or payload parsing before reaching the business logic. Even when the rate limit clears and auth triggers the hook, the email still won't send.

### Plan

1. **Delete stale auth.users records** for `tomassimkus@123presets.com` — previous signup attempts may have created ghost records that trigger rate limits on re-signup. (Need to verify if new records were created after our earlier cleanup.)

2. **Add error logging to the edge function** — wrap the top-level `handleWebhook` in try/catch with `console.error` to surface what's actually failing. The current code has a try/catch but the error may be in the webhook signature verification step before any log is written.

3. **Redeploy auth-email-hook** and test with a fresh email address (not rate-limited) to confirm emails actually send.

4. **Improve the Auth.tsx toast** — optionally distinguish between "rate limited because we already sent" vs "rate limited because sending failed" so users get clearer guidance.

### Steps

1. Query and delete any remaining `auth.users` records for `tomassimkus@123presets.com`
2. Add a `console.log("Webhook request received")` at the very top of the `Deno.serve` handler (before routing) to confirm requests reach the function
3. Redeploy `auth-email-hook`
4. Wait ~2 minutes for rate limit to clear, then test signup with a fresh email

