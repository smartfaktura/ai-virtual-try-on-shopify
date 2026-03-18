

## Fix Email Sender Domain: `notify.vovv.ai` → `vovv.ai`

Your Resend account only has `vovv.ai` verified (not `notify.vovv.ai`). That's why all emails fail with a 403. Simple fix — change the sender address in two files.

### Changes

1. **`supabase/functions/send-email/index.ts`** (line 344)
   - Change `from: "VOVV.AI <notifications@notify.vovv.ai>"` → `from: "VOVV.AI <notifications@vovv.ai>"`

2. **`supabase/functions/auth-email-hook/index.ts`** (lines 39-41)
   - Change `SENDER_DOMAIN` and `FROM_DOMAIN` from `notify.vovv.ai` → `vovv.ai`

3. **Redeploy** both edge functions so the changes take effect.

