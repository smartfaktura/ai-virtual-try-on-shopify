

## Fix contact form email sending error

**Root cause:** The `send-email` edge function sends contact form emails from `"VOVV.AI <hello@vovv.ai>"`, but the verified email domain is `notify.vovv.ai`. Resend rejects sends from unverified domains, causing a 502 error that surfaces as "Something went wrong" in the chat contact form.

### Fix in `supabase/functions/send-email/index.ts`

Change the `from` address on line 344 from:
```
from: type === "contact_form" ? "VOVV.AI <hello@vovv.ai>" : "VOVV.AI <notifications@vovv.ai>"
```
to:
```
from: "VOVV.AI <notifications@notify.vovv.ai>"
```

Use the same verified `notify.vovv.ai` sender for all email types, including contact form. The `to` address (`hello@vovv.ai`) stays as-is — that's the recipient, not the sender.

Also update the non-contact-form sender on the same line — currently `notifications@vovv.ai` should be `notifications@notify.vovv.ai` (matching the verified subdomain).

### Redeploy
Deploy `send-email` edge function after the change.

### Files
- **Edit:** `supabase/functions/send-email/index.ts` — line 344, fix `from` address
- **Deploy:** `send-email`

