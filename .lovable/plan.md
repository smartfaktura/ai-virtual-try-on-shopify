

## Use vovv.ai Domain for Auth Confirmation Emails

### Current Situation
- Transactional emails (welcome, generation complete, etc.) already send via Resend from `notifications@vovv.ai` and `hello@vovv.ai` through the `send-email` edge function
- Auth emails (signup confirmation, password reset) still use the default Lovable system (`no-reply@auth.lovable.cloud`)
- The project has `www.vovv.ai` as a custom domain and `RESEND_API_KEY` is already configured

### Solution
Set up `vovv.ai` as the email sender domain through the Lovable email setup flow, then scaffold branded auth email templates that match the existing VOVV.AI email design (navy text, stone accents, Inter font, same footer).

### Steps

1. **Set up email domain** — configure `vovv.ai` as the sender domain (may require adding DNS records at your registrar)
2. **Scaffold auth email templates** — creates the `auth-email-hook` edge function with templates for signup confirmation, password reset, magic link, etc.
3. **Brand the templates** — apply the same VOVV.AI design system used in `send-email/index.ts`: navy `#0f172a` headings, muted `#64748b` body text, stone `#f5f5f4` accent panels, navy `#1e293b` CTA buttons, Inter font, "VOVV.AI" wordmark header, "A product by 123Presets" footer
4. **Deploy** — deploy the `auth-email-hook` edge function; once DNS verifies, all auth emails send from `vovv.ai` automatically

### What You Need To Do
Click the button below to start the email domain setup. You'll need to add a few DNS records at your domain registrar for `vovv.ai` — this verifies ownership so emails can be sent from your domain.

