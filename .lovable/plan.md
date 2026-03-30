

## Fix: Signup Email to Show 8-Digit OTP Code

### Problem
The signup email template currently shows a "Verify Email" button with a click-to-verify link. The Auth page expects an 8-digit OTP code. The auth-email-hook already passes `token` (the OTP code) to the template — the template just ignores it.

### Fix

**File: `supabase/functions/_shared/email-templates/signup.tsx`**

1. Add `token` to the `SignupEmailProps` interface
2. Replace the "Verify Email" button with a large, styled OTP code display (similar to how `reauthentication.tsx` displays its code)
3. Keep the confirmation link as a small fallback text link below ("Or click here to verify")
4. Update the instructional text to say "Enter this code to verify your email"

After editing, redeploy `auth-email-hook` edge function.

### Files
- `supabase/functions/_shared/email-templates/signup.tsx` (template update)
- Deploy `auth-email-hook`

