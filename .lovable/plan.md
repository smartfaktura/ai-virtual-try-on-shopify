

## Diagnosis

Two separate issues:

### Issue 1: Auth email hook is NOT connected to the auth system

The edge function logs are definitive — **every single request** to `auth-email-hook` is a `/preview` call (from the Cloud email settings UI). There are **zero actual auth webhook calls**. This means:

- The domain `notify.vovv.ai` is verified and ready
- The edge function exists and responds to preview requests
- BUT the auth system is not routing email events to the function

The fix is to **redeploy the edge function** — this triggers the Cloud reconciliation process that registers the hook with the auth system. Without this connection, no verification/reset emails will ever send regardless of domain or sender config.

### Issue 2: Raw error messages still shown as toasts

The inline error changes only covered the main `handleSubmit` flow. These code paths still use `toast.error` with raw Supabase errors:

- **Magic link** (line 136): `toast.error(error.message)` — shows raw "email rate limit exceeded"
- **Forgot password** flow — need to check if it has the same issue
- **Resend handlers** (lines 167-169): still use `toast.info`/`toast.error`

The screenshot shows "email rate limit exceeded" as a raw toast, likely from the forgot password or magic link flow.

### Plan

1. **Redeploy `auth-email-hook`** to trigger Cloud reconciliation and connect it to the auth system
2. **Update remaining toast calls** in Auth.tsx to use inline errors or user-friendly messages:
   - `handleMagicLink`: replace `toast.error(error.message)` with friendly inline error
   - `handleResendSignup` / `handleResendMagicLink`: use friendly messages
   - Forgot password dialog: ensure it uses friendly messages too
3. **Delete stale auth records** for test emails that are hitting rate limits

### Technical details

**Auth.tsx changes:**
- In `handleMagicLink` (line 136): replace `toast.error(error.message)` with rate-limit-aware friendly message
- In `handleResendSignup` (line 167): replace raw toast with friendly inline text
- In `handleResendMagicLink` (line 185): same treatment
- In forgot password handler: check and fix if using raw errors

