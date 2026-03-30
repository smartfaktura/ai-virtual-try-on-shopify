

## Fix: Auth Emails Not Arriving

### What's happening
The email queue infrastructure works — the auth-email-hook receives signup events, enqueues them, and `process-email-queue` marks them as "sent." But the emails are not actually arriving in the inbox. The `email_send_log` shows `status: sent` for `ievute040@gmail.com`, meaning the email API accepted the request but the email is likely being rejected or lost because the hook was manually coded instead of properly scaffolded.

### Root cause
The `auth-email-hook` was hand-written. Lovable's email system requires the hook to be created through the managed scaffolding process to ensure full compatibility with the sending pipeline (correct callback format, signature verification, and template rendering).

### Plan

1. **Re-scaffold auth email templates** using Lovable's managed tool — this replaces the manually written hook with one that's fully compatible with the email delivery pipeline. The domain `notify.vovv.ai` is already verified.

2. **Re-apply VOVV.AI branding** to all 6 scaffolded templates:
   - Brand colors (Slate-800 `#1f2d3d` buttons)
   - VOVV.AI site name and copy
   - OTP code display in the signup template (the 8-digit code feature you requested earlier)

3. **Deploy the updated hook**

4. **Test** by triggering a new signup

### Files affected
- `supabase/functions/auth-email-hook/index.ts` (replaced by scaffold)
- `supabase/functions/_shared/email-templates/*.tsx` (re-branded after scaffold)

