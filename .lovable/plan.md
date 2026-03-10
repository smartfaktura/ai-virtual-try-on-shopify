

## Fix OTP Verification Failure

### Root Cause Analysis

The auth logs show `otp_expired` errors, not wrong-code errors. Two issues:

1. **Token invalidation**: Each resend/re-signup generates a new token, expiring the previous one. The user likely entered a code from an older email.

2. **Possible OTP length mismatch**: The earlier screenshot showed 8 digits in the email. The Supabase default OTP size may be set to 8 for this project. The email template slices to 6 (`token?.slice(0, 6)`), and the UI accepts only 6 digits. If the backend expects all 8 digits, verification will always fail.

### Changes

#### 1. `src/pages/Auth.tsx` — Support 8-digit OTP input
- Change OTP input from 6 slots to 8 slots (4 + separator + 4 layout)
- Update `handleVerifyOtp` length check from `!== 6` to `!== 8`
- Update auto-submit trigger from `length === 6` to `length === 8`
- Update instruction text to say "8-digit code"

#### 2. `supabase/functions/_shared/email-templates/signup.tsx` — Show full token
- Remove the `.slice(0, 6)` — display the full token string so the code in the email always matches what the backend expects
- Update preview text accordingly

#### 3. `supabase/functions/auth-email-hook/index.ts` — Update sample data
- Change sample token from `'123456'` to `'12345678'` to match 8-digit format

#### 4. Redeploy `auth-email-hook`

### Why 8 digits?
The Supabase project-level OTP configuration likely has `otp_size = 8`. We cannot change this from config.toml (it's a server-side setting). The correct fix is to align the UI and email template with whatever the backend generates, which appears to be 8 digits based on the earlier evidence.

### Alternative approach
If we want to keep 6 digits, we'd need to change the Supabase project's OTP size setting — but that's a server-side config we can't modify from here. Aligning to 8 is the safer fix.

