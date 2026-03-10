

## Fix Email Sender Identity & OTP Code Missing

### Problem 1: No OTP code in signup email
The UI shows a 6-digit OTP input after signup, but the email template only has a "Verify Email" link — no code displayed. The auth system sends both a `confirmationUrl` and a `token` to the template, but the signup template ignores the `token`.

**Fix in `supabase/functions/_shared/email-templates/signup.tsx`:**
- Add a section displaying the 6-digit OTP code (`token` prop) between the button and the disclaimer text
- Style it as a large, monospaced code block so it's easy to read and copy
- Add text: "Or enter this code manually:"

### Problem 2: Unprofessional sender identity
The `SITE_NAME` in `auth-email-hook/index.ts` is `"vovvai"` (lowercase, no dot) — this shows as the sender name in email clients.

**Fix in `supabase/functions/auth-email-hook/index.ts`:**
- Change `SITE_NAME` from `"vovvai"` to `"VOVV.AI"`
- This fixes the `from` field: `VOVV.AI <noreply@notify.vovv.ai>`

### Problem 3: Email subjects could be more professional
Current subjects are generic. Improve them:

| Type | Current | New |
|---|---|---|
| signup | "Confirm your email" | "Confirm your VOVV.AI account" |
| recovery | "Reset your password" | "Reset your VOVV.AI password" |
| magiclink | "Your login link" | "Your VOVV.AI login link" |
| invite | "You've been invited" | "You've been invited to VOVV.AI" |
| email_change | "Confirm your new email" | "Confirm your new VOVV.AI email" |
| reauthentication | "Your verification code" | "Your VOVV.AI verification code" |

### Problem 4: UI text says "code" for magic link resend
In `renderCheckInbox`, the resend button always says "Resend code" even for magic link flow (which has no code). Should say "Resend email" instead.

### Files to change
1. **`supabase/functions/_shared/email-templates/signup.tsx`** — add OTP code display section using `token` prop
2. **`supabase/functions/auth-email-hook/index.ts`** — fix `SITE_NAME` to `"VOVV.AI"`, update all `EMAIL_SUBJECTS`, add `token` to signup sample data
3. **`src/pages/Auth.tsx`** — change "Resend code" to "Resend email" in the resend button text
4. **Redeploy** `auth-email-hook` edge function

