

## Fix Email Sending + Mobile OTP Layout

### Issue 1: Auth Emails Not Sending

**Root cause:** The `auth-email-hook` uses the old direct-send pattern (`@lovable.dev/email-js` + `callback_url`) and has `SENDER_DOMAIN = "vovv.ai"` (root domain). The verified sender domain is `notify.vovv.ai`. The email API rejects sends because no verified domain matches `vovv.ai`.

**Fix:** Re-scaffold the auth email templates using the managed tool (auto-detects `notify.vovv.ai` as sender domain and upgrades to the queue-based pattern with retry safety). Then re-apply the existing VOVV.AI brand styling (Inter font, slate colors, `notifications@vovv.ai` as from address) and redeploy.

The from address will be `VOVV.AI <notifications@vovv.ai>` as requested.

### Issue 2: Mobile OTP Still Clipping

The 8 OTP slots at `w-10` (40px) + gaps + separator dash still exceed ~360px viewports.

**Fix:**
- `src/components/ui/input-otp.tsx` — Reduce mobile slots to `h-9 w-9` (36px)
- `src/pages/Auth.tsx` — Reduce separator padding from `px-2` to `px-1` on mobile

### Steps
1. Re-scaffold auth email templates (auto-fixes sender domain + queue upgrade)
2. Apply VOVV.AI brand styling to all 6 templates (Inter font, slate-900 headings, slate-500 body text, slate-800 buttons, "notifications@vovv.ai" from address)
3. Deploy `auth-email-hook`
4. Reduce OTP slot size and separator padding for mobile

### Files affected
- `supabase/functions/auth-email-hook/index.ts` (re-scaffolded)
- `supabase/functions/_shared/email-templates/*.tsx` (re-scaffolded + branded)
- `src/components/ui/input-otp.tsx` — smaller mobile slots
- `src/pages/Auth.tsx` — tighter separator

