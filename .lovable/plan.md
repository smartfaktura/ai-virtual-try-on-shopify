

## Bigger OTP Inputs + Resend Button with Countdown

### Changes

**1. Restyle OTP slots (`src/components/ui/input-otp.tsx`)**
- Increase slot size from `h-10 w-10` to `h-14 w-14`
- Font: `text-2xl font-semibold`
- Individual `rounded-xl` corners on every slot (remove first/last-only rounding)
- Individual borders on all sides with subtle background on focus

**2. Split OTP into 3+3 groups with separator (`src/pages/Auth.tsx`)**
- Two `InputOTPGroup` components with 3 slots each, separated by a dash
- Add `gap-2` spacing within each group

**3. Add "Resend code" button with 30-second countdown (`src/pages/Auth.tsx`)**
- New state: `resendTimer` (starts at 30 on signup complete), `resendLoading`
- `useEffect` counts down from 30 to 0
- When timer hits 0, show "Didn't get the code? Resend" button
- On click, calls `signUp(email, password)` again to trigger a fresh email (both old and new codes remain valid for their default 30-min window — this is handled server-side by default)
- Reset timer to 30 after resend
- Also add resend for magic link screen: re-calls `supabase.auth.signInWithOtp`

**4. Copy update**
- Below OTP: "Didn't receive it? You can resend in {timer}s" → then "Resend code" button

No backend changes needed — OTP tokens are valid for their configured duration (default is fine).

