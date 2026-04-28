## Problem

Signup shows the generic message **"Something went wrong. Please try again."** with no actionable detail. Investigation found:

1. The user in the screenshot (`zahiddiu4@gmail.com`) **already has a confirmed account** (created Apr 27, last sign-in Apr 28). Supabase is returning a real error (e.g. `User already registered`) but our handler in `src/pages/Auth.tsx` only recognizes rate-limit errors — every other error falls through to the generic message.
2. Other signup-related errors (weak password rejected by HIBP, invalid email, password too short server-side, Lovable Cloud DB hiccups, etc.) all collapse to the same opaque string, so legitimate users have no idea what to do.
3. The same pattern exists for **login** errors (line 210) and in `SignupSlideUp.tsx` (line 79).

Backend is healthy — `handle_new_user()` trigger and `profiles` table look correct, recent signups for other emails today (`qatests609`, `umberfakhar10`) were processed and emails sent successfully. This is a **client-side error mapping** bug, not a backend failure.

## Fix

Replace the catch-all "Something went wrong" with specific, friendly messages mapped from the actual Supabase error codes/messages. Apply the same mapping to login and to the slide-up signup component.

### Changes

**1. `src/pages/Auth.tsx` — signup branch (lines 150–162)**

Map known errors to clear copy and switch the user to login mode when appropriate:

- `user already registered` / `email address already` / `already exists` → "An account with this email already exists. Try signing in instead." + switch to login mode and prefill email.
- `password should be at least` / `weak password` / `pwned` / `compromised` → "Please choose a stronger password (at least 6 characters, avoid common passwords)."
- `invalid email` / `unable to validate email` → "Please enter a valid email address."
- `signup is disabled` → "Account signups are temporarily disabled. Please try again later."
- `rate limit` / `over_email_send_rate_limit` (existing) → keep current behavior.
- Network failure / fetch error → "Network problem. Please check your connection and try again."
- Fallback: show the actual `error.message` (sentence-cased) instead of "Something went wrong" so we never hide useful info from the user again.

**2. `src/pages/Auth.tsx` — login branch (lines 204–214)**

- `invalid login credentials` (existing) → keep.
- `email not confirmed` → "Please confirm your email first. Check your inbox for the verification link." + offer "Resend confirmation".
- `too many requests` / `rate limit` → "Too many attempts. Please wait a minute and try again."
- Network failure → same as signup.
- Fallback: show actual error message.

**3. `src/components/landing/SignupSlideUp.tsx` (line 79)**

Apply the same signup error mapping helper so the homepage slide-up gives identical, specific feedback.

**4. Extract a shared helper**

Add `src/lib/authErrors.ts` exporting `mapAuthError(error, mode: 'signup' | 'login')` returning `{ message: string; switchToLogin?: boolean }`. Both `Auth.tsx` and `SignupSlideUp.tsx` use it. This keeps mapping consistent and easy to extend.

### Out of scope

- No DB migrations — `handle_new_user()` and `profiles` are working correctly.
- No edge function changes — `auth-email-hook` and the email queue are healthy (verified via `email_send_log`: `signup` emails today completed `pending → sent` within ~4s).
- No changes to OAuth/Google/Apple flows.

### Verification after deploy

1. Try to sign up with `zahiddiu4@gmail.com` again → should see "An account with this email already exists" and the form should switch to login with the email prefilled.
2. Try to sign up with a brand-new email → should see the existing success state.
3. Try to sign up with password `123` → should now say "Password must be at least 6 characters" instead of the generic error.
