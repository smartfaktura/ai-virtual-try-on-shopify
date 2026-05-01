
# Improve Auth Email Subject Lines, Preheaders & Fix Signup Template

## 1. Update subject lines in `auth-email-hook/index.ts`

Current → New:
| Type | Current Subject | New Subject |
|------|----------------|-------------|
| signup | Your VOVV.AI verification code | Confirm your VOVV.AI account |
| invite | You've been invited | You're invited to VOVV.AI |
| magiclink | Your login link | Your VOVV.AI sign-in link |
| recovery | Reset your password | Reset your VOVV.AI password |
| email_change | Confirm your new email | Confirm your new email — VOVV.AI |
| reauthentication | Your verification code | VOVV.AI security code |

## 2. Update `<Preview>` preheaders in each template

| Template | Current Preheader | New Preheader |
|----------|------------------|---------------|
| signup.tsx | Your VOVV.AI verification code | Confirm your email to start creating with VOVV.AI |
| recovery.tsx | Reset your password for {siteName} | Reset your VOVV.AI password and get back to creating |
| magic-link.tsx | Your login link for {siteName} | One click to sign in to VOVV.AI |
| invite.tsx | You've been invited to join {siteName} | You're invited to create with VOVV.AI |
| email-change.tsx | Confirm your email change for {siteName} | Confirm your new email address for VOVV.AI |
| reauthentication.tsx | Your verification code | Enter this code to verify your VOVV.AI identity |

## 3. Fix signup template for link-only flow

Since we removed OTP from the auth screen, the signup email should no longer show a verification code. Changes to `signup.tsx`:
- Remove the `{token && <Text style={codeStyle}>...` line
- Change heading from "Your verification code" to "Confirm your email"
- Update body text: "Click the button below to verify your email and start creating with VOVV.AI"
- Change button text from "Verify Email" to "Confirm My Account"
- Remove unused `codeStyle` constant

## 4. Deploy

Redeploy `auth-email-hook` edge function to apply all changes.
