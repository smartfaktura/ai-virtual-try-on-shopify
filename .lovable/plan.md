

## Root Cause Analysis

### Critical Issue: Auth email hook is NOT connected to the auth system

The edge function logs are definitive — **every single request** to `auth-email-hook` is a `/preview` call (from the Cloud email settings UI). There are **zero actual auth webhook calls** even after multiple redeployments. This means:

- The domain `notify.vovv.ai` is verified and ready
- The edge function exists and responds to preview requests
- **BUT the auth system is NOT routing email events to the function**

This is why you see "rate limit exceeded" — the auth system IS trying to send emails through its **default built-in mailer** (not your custom templates), hitting its own rate limits, and those default emails likely aren't reaching your inbox either.

The fix: Use the `scaffold_auth_email_templates` tool to properly register the hook with the auth system, then redeploy. Previous template creation was done manually, which doesn't trigger the Cloud reconciliation that connects the hook.

### Secondary Issue: Reset dialog still uses toast for errors

The "Reset email already sent" toast in the screenshot (line 573) is still using `toast.error()` instead of inline error display inside the dialog.

### Why "already sent" appears on first attempt

The auth logs show `info@tsimkus.lt` (user ID `fe45fd27`) hit rate limits across multiple paths (`/otp`, `/recover`, `/signup`). All email-sending endpoints share the same per-email rate limit. Your earlier magic link and signup attempts exhausted this limit, so when you tried password reset for the first time, the limit was already hit.

## Plan

### Step 1: Re-scaffold auth email templates properly
Use the `scaffold_auth_email_templates` tool to create templates through the official flow. This registers the hook with the auth system. If it warns about existing templates, approve the overwrite. Then redeploy `auth-email-hook`.

### Step 2: Fix reset dialog error display
In `src/pages/Auth.tsx`, replace `toast.error()` calls inside the reset dialog (lines 572-576) with inline error state displayed inside the dialog itself:
- Add a `resetError` state variable
- Show error message inline inside the dialog using the same `bg-destructive/10` styling as the login form
- Clear error when user modifies the email input

### Step 3: Clean up stale auth records
Delete remaining test accounts (`info@tsimkus.lt`, `tomassimkus@123presets.com`) from `auth.users` to clear accumulated rate limits.

### Step 4: Test with fresh email
After redeployment, wait 2-3 minutes for rate limits to clear, then test signup with a fresh email to confirm emails are actually delivered.

