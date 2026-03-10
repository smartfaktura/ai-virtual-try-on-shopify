

## Add Magic Link Login + OTP Code Verification on Signup

### Overview

Two features: (1) passwordless magic link sign-in option, and (2) OTP code entry on the signup confirmation screen so users can verify without leaving the page.

Both are common practice — magic link login reduces friction for returning users, and inline OTP verification keeps users in-flow instead of forcing a tab switch.

### Changes

**1. Magic link login option (`src/pages/Auth.tsx`)**
- Add a "Sign in with email link" button below the password form (or as an alternative login mode)
- Calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/app' } })`
- On success, show a "Check your email" confirmation (similar to signup complete screen) with message "We sent a login link to {email}"
- No password required — just email

**2. OTP code input on signup confirmation screen (`src/pages/Auth.tsx`)**
- On the existing "Check your inbox" screen, add a 6-digit OTP input (using the existing `InputOTP` component)
- User enters the code from their email → calls `supabase.auth.verifyOtp({ email, token, type: 'signup' })`
- On success, user is automatically logged in and redirected to `/app`
- The confirmation link in the email still works as fallback if user closes the page
- Update copy: "Enter the 6-digit code from your email, or click the link to activate your account"

**3. Update signup email template (`supabase/functions/_shared/email-templates/signup.tsx`)**
- Add the `token` prop to the template
- Display the 6-digit code prominently in a styled box (large monospace digits) above the existing "Confirm Email" button
- Copy: "Your verification code" with the code, then "Or click the button below to confirm"
- Both the code and link work — user picks whichever is easier

**4. Update auth-email-hook (`supabase/functions/auth-email-hook/index.ts`)**
- The `token` is already passed in `templateProps` — no change needed in the hook itself

**5. Redeploy edge function**
- Deploy `auth-email-hook` after template changes

### Technical Details

- `supabase.auth.signInWithOtp()` sends a magic link email using the existing `magiclink` template
- `supabase.auth.verifyOtp({ email, token, type: 'signup' })` verifies the 6-digit code and creates a session
- The `InputOTP` component from `input-otp` is already installed and available at `@/components/ui/input-otp`
- The signup email template already receives `token` from the auth hook — it just isn't displayed yet

