
Goal: Make the /contact form reliably send support tickets to hello@vovv.ai every time (and keep a ticket record), including for non-logged-in visitors.

What I found
- The /contact page currently writes directly to `contact_submissions` and shows success.
- Submissions are being saved in the database (recent rows exist), so the form submit itself is working.
- No active trigger exists on `contact_submissions` right now, so inserts are not forwarding emails.
- `send-contact` exists, but it currently requires a logged-in token; unauthenticated calls return 401.

Implementation plan
1. Make `send-contact` the single source of truth for support tickets
- File: `supabase/functions/send-contact/index.ts`
- Update it to support public submissions (no required login), with optional user context if a token is present.
- Add strict server-side validation for:
  - `name` (required, max 100)
  - `email` (required, valid, max 255)
  - `message` (required, max 2000)
  - `inquiryType` (enum: general/billing/technical/feature/enterprise/partnership, default general)
- In the function:
  - Insert ticket into `contact_submissions`
  - Send email to `hello@vovv.ai` via existing `send-email` backend function (`type: contact_form`)
  - Return clear success/error payload to frontend

2. Wire /contact form to backend function instead of direct table insert
- File: `src/pages/Contact.tsx`
- Replace `supabase.from('contact_submissions').insert(...)` with `supabase.functions.invoke('send-contact', { body: ... })`.
- Pass `subject` as `inquiryType`.
- Keep existing success UX, but show specific error text from function response when available.

3. Fix chat contact flows to use the same endpoint and work for logged-out users
- Files:
  - `src/components/app/ContactFormDialog.tsx`
  - `src/components/app/ChatContactForm.tsx`
- Replace raw `fetch(.../send-contact)` + manual token handling with `supabase.functions.invoke('send-contact', ...)`.
- Remove hard failure “Please sign in first” for contact messages.
- Keep current success/error UI behavior.

4. Prevent duplicate-send risk and remove dead dependency on DB triggers
- Add a small migration that safely drops any old `contact_submissions` email trigger if present (idempotent), so emailing is owned by `send-contact` only.
- This avoids future “double email” if a trigger is recreated accidentally.

5. Validate end-to-end after implementation
- Test 1: Submit from `/contact` while logged out → success toast + email received.
- Test 2: Submit from chat contact modal while logged out → success state + email received.
- Test 3: Submit while logged in → still succeeds and includes user context.
- Check backend function logs for `send-contact` and `send-email` success entries.

Technical details
- Main root cause is architectural split: UI writes DB rows, but email depended on a trigger that is currently absent.
- Consolidating storage + email dispatch into one backend function gives deterministic behavior, better validation, and clearer error handling.
- No RLS policy changes are required for this fix.
