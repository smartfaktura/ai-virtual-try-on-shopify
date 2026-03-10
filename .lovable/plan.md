

## Fix: Unconfirmed Account Re-registration + Rate Limit Handling

### Problem
When a user signs up but never confirms their email, then tries to register again, two things go wrong:
1. The `signUp` call triggers another confirmation email, but hits the **email rate limit** (429) because the previous emails were sent too recently
2. The duplicate-detection logic (`!data?.user?.identities?.length`) may incorrectly tell the user "account already exists" and switch to login mode — but they can't login either since the account is unconfirmed

### Solution

**1. Handle the rate limit error gracefully (`src/pages/Auth.tsx`)**
- In `handleSubmit` and `handleResendSignup`, catch the specific "email rate limit exceeded" error message
- Show a user-friendly message: "We already sent a verification email. Please check your inbox (and spam folder), or wait a few minutes before requesting another."
- When rate-limited on signup, still show the OTP verification screen (since an email was already sent) instead of keeping them stuck on the registration form

**2. Detect unconfirmed re-registration and show OTP screen**
- When `signUp` returns a user with identities but `email_confirmed_at` is null/falsy, the account exists but is unconfirmed
- In this case, use `supabase.auth.resend({ type: 'signup', email })` instead of calling `signUp` again — this is the proper API for resending confirmation to existing unconfirmed users and has its own rate limit handling
- Show the OTP verification screen so the user can enter the code

**3. Update `handleResendSignup` to use `resend` API**
- Replace `await signUp(email, password)` with `await supabase.auth.resend({ type: 'signup', email })`
- This avoids triggering the full signup flow again and is specifically designed for resending confirmation emails
- Handle the rate limit error from `resend` the same way

### Changes

**`src/pages/Auth.tsx`** — three modifications:

1. In `handleSubmit` (signup branch): after `signUp` call, if error message contains "rate limit", show friendly toast and transition to OTP screen anyway (email was already sent previously)

2. In `handleSubmit` (signup branch): if `data?.user` exists and has identities but is unconfirmed (`!data.user.confirmed_at`), call `supabase.auth.resend({ type: 'signup', email })` and show OTP screen

3. In `handleResendSignup`: replace `signUp(email, password)` with `supabase.auth.resend({ type: 'signup', email })`, and handle rate limit errors with a friendly message instead of always showing "New code sent!"

