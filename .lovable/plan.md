## Migrate all emails to Resend via vovv.ai

Google sign-in is unaffected — it uses OAuth redirects, not emails.

### 1. Disable Lovable Emails
Already done. Auth emails currently fall back to default Lovable templates until the hook is redeployed with Resend.

### 2. Rewrite `auth-email-hook/index.ts` — send via Resend directly
- Remove Lovable queue logic (`enqueue_email` RPC)
- Send rendered HTML directly via Resend API (`https://api.resend.com/emails`)
- From address: `VOVV.AI <noreply@vovv.ai>` (root domain)
- Keep all 6 React Email templates, branded subjects, and preview endpoint
- Still log to `email_send_log` for audit trail (pending → sent/failed)

### 3. Fix "VOVV.AI" auto-linking in all 6 email templates
Email clients detect `.AI` as a TLD and auto-hyperlink it. Fix: insert a zero-width non-joiner (`\u200C`) in the brand `<Text>` — renders identically but breaks auto-link detection.

Templates updated:
- `signup.tsx` — brand text + Preview text
- `recovery.tsx` — brand text + Preview text
- `magic-link.tsx` — brand text + Preview text
- `invite.tsx` — brand text + Preview text
- `email-change.tsx` — brand text + Preview text
- `reauthentication.tsx` — brand text + Preview text

### 4. Update From addresses in other email functions
- `send-email/index.ts`: change `notifications@vovv.ai` → `noreply@vovv.ai`
- `_shared/email-render.ts`: change `RESEND_FROM` → `VOVV.AI <noreply@vovv.ai>`

### 5. Deploy
Redeploy `auth-email-hook` and `send-email` edge functions.

### What stays unchanged
- Google OAuth sign-in (completely separate)
- Resend audience functions (`sync-resend-contact`, `track-resend-event`)
- `email_send_log` table (still used for audit)
- All template designs, subjects, and copy
- `RESEND_API_KEY` secret (already configured)
