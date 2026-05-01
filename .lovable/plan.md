## Change email sender to hello@vovv.ai

Two one-line changes + redeploy:

1. **`supabase/functions/auth-email-hook/index.ts` line 39** — change `noreply@` to `hello@`
2. **`supabase/functions/send-email/index.ts` line 355** — change `noreply@` to `hello@`
3. Redeploy both functions

All auth and transactional emails will send from `VOVV.AI <hello@vovv.ai>`, allowing users to reply directly.