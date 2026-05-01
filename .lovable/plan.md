
# Remove OTP Code Entry — Use Email Link Verification Only

## What changes

After signing up, users currently see a screen with both a 6-digit OTP input and a note about clicking the email link. We'll simplify this to **link-only verification** — users just click the link in their email.

## Changes

### 1. Update `src/pages/Auth.tsx`

- Remove the `handleVerifyOtp` function and all OTP-related state (`otpCode`, `otpLoading`)
- Remove the `InputOTP` import and component usage
- Change the signup confirmation `renderCheckInbox` call to use `showOtp: false` instead of `true`
- Update the confirmation copy from "We sent a confirmation code to" to "We sent a confirmation link to"
- Add clear instruction: "Click the link in your email to activate your account. Check your spam folder if you don't see it."
- Keep the resend button (calls `supabase.auth.resend({ type: 'signup' })` which resends the verification email with link)

### 2. Clean up unused imports

- Remove `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator` imports since they're no longer used

## What stays the same

- Google/Apple OAuth sign-in (unchanged)
- Magic link sign-in flow (already link-only, unchanged)
- Password reset flow (unchanged)
- Email is still required to be verified before sign-in works
- The resend email functionality remains
