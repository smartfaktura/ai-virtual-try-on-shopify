

# Fix OTP Length and Improve Auth Email Branding

## Issues Found

1. **OTP length mismatch**: Auth page expects 8 digits (`maxLength={8}`, text says "8-digit code", verify triggers at length 8) but the backend now sends 6-digit codes. Users see 8 input slots but only get a 6-digit code.

2. **Signup email template**: Functional but could match the VOVV.AI brand better — uses generic font stack, basic styling, no visual warmth.

3. **Recovery email template**: Very basic — no brand header, no logo badge, minimal styling, generic Arial font. Inconsistent with the signup template.

## Changes

### 1. Fix OTP to 6 digits — `src/pages/Auth.tsx`
- Change `maxLength={8}` to `maxLength={6}`
- Change OTP slots from 8 (4+4) to 6 (3+3)
- Update verify trigger from `length === 8` to `length === 6`
- Update text from "8-digit code" to "6-digit code"

### 2. Upgrade signup email — `supabase/functions/_shared/email-templates/signup.tsx`
- Add Inter font stack (already there but reinforce)
- Larger, bolder OTP code display with more prominent card styling
- Add a subtle welcome line with warmer tone matching the app's casual style
- Refine spacing and color palette to match VOVV.AI Slate-800 brand accent
- Add a branded CTA-style link instead of plain text link for auto-verify

### 3. Upgrade recovery email — `supabase/functions/_shared/email-templates/recovery.tsx`
- Add brand header badge (matching signup template)
- Switch to Inter font stack
- Add warmer copy matching app tone
- Style the reset button with proper brand colors and rounded corners
- Add consistent footer styling matching signup template
- Add divider and "safe to ignore" footer

### 4. Redeploy auth-email-hook
- Deploy updated edge functions so email changes take effect

