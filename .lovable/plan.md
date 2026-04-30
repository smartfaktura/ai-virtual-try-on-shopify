## What's broken

I checked the contact `nin3liv3s2025@gmail.com` directly against the Resend API. Two real bugs:

**Bug 1 — wrong field naming.** Our `sync-resend-contact` Edge Function sends `firstName`/`lastName` (camelCase). The deprecated `/audiences/{id}/contacts` REST endpoint we use expects `first_name`/`last_name` (snake_case). Resend silently accepts the request (returns `200 OK` with the contact ID) but ignores the unknown camelCase fields, so every contact since this change has empty First/Last name in the Resend dashboard.

I verified this by PATCHing the contact with `first_name`/`last_name` — the dashboard now shows Ruth / Hawkinson correctly.

**Bug 2 — custom properties never sent.** We collect rich data (`plan`, `product_categories`, `families`, `subtypes`, `signup_date`, `credits_balance`, etc.) and log them in `resend_event_log`, but the request body to Resend only includes `email + name + unsubscribed`. The `properties: {}` field on every Resend contact is empty, so segments and automations can't filter by plan, category, or signup date.

## Fix

### 1. `supabase/functions/sync-resend-contact/index.ts`
Switch field names back to snake_case and add the `properties` payload.

```text
POST/PATCH body sent to Resend:
{
  email,
  first_name,           // was firstName  ← FIX
  last_name,            // was lastName   ← FIX
  unsubscribed,
  properties: {         // ← NEW
    plan, primary_family, primary_subtype,
    families, subtypes, product_categories,
    signup_date, has_generated, credits_balance
  }
}
```

Property values must be strings per Resend's API — arrays/numbers get JSON-stringified before sending. Pull values with the same priority chain already in place (body.properties → profile fields).

### 2. Backfill existing broken contacts
~100s of contacts created since the camelCase change have empty names. Re-use the existing `resync-resend-audience` (or `backfill-resend-audience`) function, which iterates all opted-in profiles and PATCHes Resend. After the code fix, trigger one resync from the Email Marketing admin page (the "Resync all contacts" button already there) — every existing contact will be repaired with correct names AND properties in one pass.

### 3. Apply the same fix to the backfill function
`supabase/functions/backfill-resend-audience/index.ts` also sends `first_name` (which is actually correct there) but doesn't include `last_name` or `properties`. Update it to use the same payload shape as `sync-resend-contact` so resyncs hydrate everything.

### 4. Verification after deploy
- Hit the live `sync-resend-contact` for one test email and curl Resend directly to confirm `first_name`, `last_name`, and `properties` all populate.
- Run "Resync all contacts" from `/admin/email-marketing`.
- Spot-check 2–3 contacts in the Resend dashboard.

## Why it broke

A prior change assumed Resend's REST API uses camelCase (because the Node SDK does). The SDK does internal snake_case conversion; the raw REST audiences endpoint does not. The misleading symptom: Resend returned `200 OK + contact ID`, so our logs showed `status: ok` and we never noticed.

## Files changed
- `supabase/functions/sync-resend-contact/index.ts` — snake_case + properties
- `supabase/functions/backfill-resend-audience/index.ts` — same payload shape
- Deploy both functions
- Run resync once from admin UI (no code change needed there)

No DB migrations, no new secrets, no UI changes.
