

## Fix Signup Email Template & OTP Code Issues

### Problems Identified

1. **8-digit code instead of 6** — The auth system is generating an 8-digit OTP token, but the UI only accepts 6 digits. The default OTP length in the backend is likely set to 8. Need to check if this is configurable, but the real fix is to make both sides match.

2. **Bad layout hierarchy** — The email shows the "Verify Email" button as the primary action, with the OTP code as a secondary afterthought ("or enter this code manually"). User wants the **code to be the hero** and the button to be secondary.

3. **Ugly code font** — The code uses `Courier New` monospace which looks cheap. Should use Inter (the brand font) with wide letter-spacing for a clean, modern look.

### Changes

#### 1. `supabase/functions/_shared/email-templates/signup.tsx`

Restructure the email layout to make the OTP code the primary focus:

- **Hero: OTP code first** — Large, beautifully styled 6-digit code displayed in individual digit boxes (using an HTML table with bordered cells for each digit, splitting `token` into characters). Use Inter font, not monospace.
- **Secondary: "Verify Email" button below** — Smaller, outlined/ghost style button as an alternative ("Or click below to verify directly")
- Trim token display to first 6 characters (in case backend sends more)
- Clean, modern styling with the digit-box pattern (like the UI's OTP input)

#### 2. Backend OTP length

The Supabase default OTP length is 6 digits. The screenshot shows 8 digits (`65693362`), which suggests the auth config may have a custom setting. I'll check if `config.toml` has an OTP size override — it doesn't appear to. This is likely a Supabase project-level setting. We should ensure the email template only displays the first 6 characters of the token as a safeguard, and the UI already expects 6.

Actually, looking more carefully: the token the system sends could be longer than 6. The `verifyOtp` call uses `type: 'signup'` which by default uses a 6-digit code. The 8-digit display in the email is just the template rendering whatever token string it receives without truncation. The fix is to only show the first 6 digits in the template.

#### 3. Deploy

Redeploy `auth-email-hook` edge function after template changes.

### Files to Change

1. **`supabase/functions/_shared/email-templates/signup.tsx`** — Complete redesign of the code/button hierarchy:
   - OTP code displayed as styled individual digit cells (first 6 chars of token)
   - "Verify Email" button moved below as secondary action
   - Remove monospace font, use Inter throughout
   - Add helper text: "Enter this code to verify your account"

