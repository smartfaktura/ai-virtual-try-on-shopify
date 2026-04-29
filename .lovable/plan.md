## Diagnosis (confirmed from logs + official Resend docs)

I queried `resend_event_log` and pulled the official Resend API reference. Two distinct bugs are confirmed:

### Bug 1 — First Name / Last Name empty in Resend
Our `sync-resend-contact` sends snake_case to Resend's REST API:
```json
{ "email": "...", "first_name": "Tomas", "last_name": "Simkus" }
```
But Resend's REST contact endpoint expects **camelCase**: `firstName`, `lastName`. (Verified in [docs](https://resend.com/docs/api-reference/contacts/create-contact).) Resend silently ignores unknown snake_case fields, returns `201 Created`, and stores no name. That's why the screenshot shows `FIRST NAME: -` even though our log says `status: ok` with `first_name: Tomas`.

### Bug 2 — Custom Events return 405 Method Not Allowed
Our `track-resend-event` POSTs to:
```
POST /audiences/{id}/contacts/{email}/events
```
This URL **does not exist** in Resend's API. The log shows `event_status: 405, name: method_not_allowed`. The actual endpoint (verified in [docs](https://resend.com/docs/api-reference/events/send-event)) is:
```
POST /events/send
Body: { event: "user.signup", email: "x@y.z", payload: {...} }
```
Returns `202 Accepted`. This means **zero** custom events have ever reached Resend — the Activity tab is correctly empty.

---

## Fix plan (2 edge function edits, zero schema changes, zero client changes)

### File 1: `supabase/functions/sync-resend-contact/index.ts`
Rename the JSON body fields sent to Resend from `first_name`/`last_name` → `firstName`/`lastName` for **both** the POST (create) and PATCH (update) calls. Keep our internal variable names and our `resend_event_log` payload unchanged. Five-line diff.

### File 2: `supabase/functions/track-resend-event/index.ts`
Replace the broken endpoint with the correct one:
```ts
// OLD (returns 405):
POST /audiences/{AUDIENCE_ID}/contacts/{email}/events
   body: { name, data }

// NEW (correct):
POST /events/send
   body: { event, email, payload }
```
Also drop the unnecessary "ensure contact exists" pre-call — the docs explicitly state: *"If no contact with this email exists in your Audience, one will be created automatically when the automation runs."* Simpler, fewer failure points.

Keep all existing safety: outer try/catch, always-200 responses, full logging to `resend_event_log` with `event_status` and Resend response body.

---

## Safety guarantees

- **No DB migrations**, no schema changes, no trigger changes
- **No client/UI changes** — `Auth.tsx`, `Onboarding.tsx`, `Settings.tsx` stay exactly as they are
- **No new files**, no new env vars
- Edge functions remain `200 OK` even on Resend failures → app cannot crash
- Backwards compatible payload contract — callers send the same body
- Rollback = revert the two files (Lovable auto-versions edge functions)

---

## Expected result after deploy

1. Next signup → `hello@xyz.com` contact appears in Resend with **First Name: Tomas, Last Name: Simkus** populated
2. Activity tab shows **`Custom event: user.signup`** and **`user.signup_completed`** entries
3. `resend_event_log` rows for events flip from `status: failed (405)` → `status: ok (202)`
4. Your "Sign Up – Welcome Email" automation in Resend (with trigger "Custom event: user.signup") will actually fire

---

## Test steps (you run after deploy)

1. Sign up a fresh test email → complete onboarding
2. Resend → Audience → open the new contact → confirm First/Last Name filled
3. Same contact → Activity tab → confirm `user.signup_completed` appears
4. (Optional) Run this in your DB to confirm 202s:
   ```sql
   SELECT created_at, event_type, status, payload->'event_status'
   FROM resend_event_log ORDER BY created_at DESC LIMIT 5;
   ```

Approve and I'll deploy both edge function fixes immediately.