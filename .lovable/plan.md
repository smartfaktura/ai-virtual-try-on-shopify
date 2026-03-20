

# Fix Contact Form Reply-To Address

## Problem
When a contact form email arrives at hello@vovv.ai, clicking "Reply" addresses the reply to `notifications@vovv.ai` (the sender) instead of the person who filled out the form.

## Fix
In `supabase/functions/send-email/index.ts`, add `reply_to` to the Resend API payload when the email type is `contact_form`. The submitter's email is already available in `data.email`.

### File: `supabase/functions/send-email/index.ts` (lines 346-358)
- Extract `reply_to` from `data.email` when `type === 'contact_form'`
- Add `reply_to` field to the Resend API request body
- Only include it when it has a value (so other email types are unaffected)

```typescript
// Before sending, determine reply_to for contact forms
const replyTo = type === "contact_form" && data?.email ? data.email : undefined;

body: JSON.stringify({
  from: "VOVV.AI <notifications@vovv.ai>",
  to: [to],
  reply_to: replyTo,  // ← new field
  subject,
  html,
}),
```

After editing, redeploy the `send-email` edge function.

