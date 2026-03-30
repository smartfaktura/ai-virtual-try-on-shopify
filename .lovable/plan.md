
Fix the confirmation email by refreshing both the template and the metadata that gets sent with it so it matches VOVV.AI instead of the current generic/plain version.

1. Update the signup confirmation email template
- Redesign `supabase/functions/_shared/email-templates/signup.tsx` to match the app brand:
  - use Inter-style font stack instead of Arial
  - keep white email background, with VOVV.AI dark slate accents from the app
  - add a clean branded header / badge so it feels like VOVV.AI, not a default system email
  - present the 8-digit code as the primary action in a polished code block/card
  - improve spacing, hierarchy, and footer copy
- Rewrite the visible copy so it matches the auth flow:
  - headline focused on confirming the account
  - short explanatory text
  - fallback verification link kept as secondary action

2. Fix the subject line and preheader
- Update the signup subject in `supabase/functions/auth-email-hook/index.ts` from the generic `Confirm your email` to a branded subject like `Your VOVV.AI verification code`
- Update the signup preheader inside `signup.tsx` so inbox preview text clearly says the email contains the 8-digit code and why

3. Fix branding values coming from the auth email hook
- Update the auth hook branding constants so the sender name/site name use the proper brand format (`VOVV.AI`), not the current lowercase `vovvai`
- This ensures the From name, template text, and any preview rendering all use the correct brand

4. Fix preview/sample data for the signup email
- Add the signup `token` in the preview sample data inside `auth-email-hook/index.ts`
- This makes the email preview show the real branded code layout instead of an incomplete preview

5. Keep the existing behavior intact
- Preserve the current 8-digit OTP flow
- Preserve the fallback confirmation link
- Do not change delivery logic or queue behavior; this is a branding/content upgrade for the confirmation email only

Files to update
- `supabase/functions/_shared/email-templates/signup.tsx`
- `supabase/functions/auth-email-hook/index.ts`

Technical details
- Brand cues already present in the app:
  - primary color: dark slate (`hsl(217 33% 17%)`)
  - muted text: `hsl(215 16% 47%)`
  - radius: `0.5rem`
  - typography: Inter
  - brand name shown in UI: `VOVV.AI`
- Current problems I found:
  - signup email uses very plain default styling
  - subject line is generic
  - preheader is generic
  - sender/site name in the hook is lowercase `vovvai`
  - signup preview sample is missing the token
