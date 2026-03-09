

## Change Contact Form Email Sender to hello@vovv.ai

### Problem
Contact form emails are sent `from: notifications@vovv.ai` but the user wants them sent `from: hello@vovv.ai`. This may also help with delivery since the recipient address matches the sender domain.

### Change

**`supabase/functions/send-email/index.ts`** — Update the `from` field for `contact_form` type emails to use `hello@vovv.ai` instead of `notifications@vovv.ai`. Keep `notifications@vovv.ai` for automated notifications (welcome, generation complete, etc.).

In the Resend API call section (~line 224), change from a single `from` to a conditional:
- `contact_form` type → `from: "VOVV.AI <hello@vovv.ai>"`
- All other types → `from: "VOVV.AI <notifications@vovv.ai>"` (unchanged)

### Important Note
For this to work, `hello@vovv.ai` must be on a verified domain in Resend. Since `notifications@vovv.ai` already works (Resend returns success IDs), the `vovv.ai` domain should already be verified — meaning `hello@vovv.ai` should work too.

