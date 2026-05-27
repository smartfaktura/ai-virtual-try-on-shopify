# Safely enable Resend contact properties

Goal: make the contact properties we already build (`plan`, `primary_family`, `primary_subtype`, `families`, `subtypes`, `product_categories`, `product_subcategories`, `signup_date`, `has_generated`, `credits_balance`, `marketing_opted_in`) actually persist on Resend contacts so we can use them as segment/personalisation data — without changing anything in the current working sync, signup, unsubscribe, or broadcast flows.

## Safety principles

- Never remove or restructure the existing `/audiences/{id}/contacts` POST/PATCH path. That's what keeps contacts subscribed/unsubscribed and what powers current broadcasts.
- Properties are added as an **additive, best-effort second step** wrapped in `try/catch`. If the property call fails for any reason, we log it but still return `ok: true` from the main sync — so signup, unsubscribe, and broadcasts keep working exactly as today.
- No DB schema changes. No changes to `handle_new_user`, `deduct_credits`, `enqueue_generation`, or any RPC that calls these functions.
- No frontend changes.
- No new secrets — reuses existing `RESEND_API_KEY` and `RESEND_AUDIENCE_ID`.

## Step 1 — Add additive property sync in `sync-resend-contact`

After the existing audience POST/PATCH completes successfully (action `created` or `updated`), make one extra best-effort call to Resend's contact-update endpoint that does accept `properties`:

```
PATCH /audiences/{RESEND_AUDIENCE_ID}/contacts/{email}
body: { properties: { plan, primary_family, ... } }
```

Rules:
- Wrap in its own `try/catch`. Any failure is logged to `resend_event_log` with `event_type: 'contact.property_sync'` and `status: 'failed'`, but does NOT change the outer function's success response.
- Skip entirely if `Object.keys(properties).length === 0`.
- Skip if the parent contact action was `failed` (no contact to attach to).
- Continue writing `properties` into the existing `resend_event_log` payload exactly as today, so we keep the local audit trail intact.
- Remove the misleading "silently dropped" comment only after Step 3 verifies persistence.

## Step 2 — Same additive pattern in `backfill-resend-audience`

Mirror the same best-effort property push after each successful POST/PATCH inside the loop, so a one-time admin run backfills property values onto all currently opted-in contacts.

- Per-contact property failures are counted separately as `property_failed` and do NOT increment the existing `failed` counter.
- Function still returns the same shape today plus a new `property_failed` field for visibility.

## Step 3 — Verify, then backfill

1. Deploy the two edge functions.
2. Trigger one test sync (e.g., re-run the signup event for an internal test account) and confirm:
   - Audience contact still created/updated (no regression).
   - `resend_event_log` shows a second `contact.property_sync` row with `status: 'ok'`.
   - The property values are visible on that contact's profile in the Resend dashboard.
3. If the property endpoint returns a 4xx (Resend plan/feature mismatch), the change has zero user impact — we adjust to whichever endpoint Resend expects on our account (newer top-level `/contacts` API) and redeploy.
4. Once verified on one contact, run `backfill-resend-audience` from admin to populate properties on all existing opted-in contacts.

## Out of scope

- Switching off the legacy `/audiences/{id}/contacts` endpoint.
- New property names beyond what's already built today.
- UI inside VOVV.AI for managing properties or Resend segments.
- Multi-audience segmentation (separate plan for that).

## Rollback

If the property call causes any unexpected behavior, revert the two edge function files — no DB, schema, or auth state is touched, so rollback is just a redeploy.
