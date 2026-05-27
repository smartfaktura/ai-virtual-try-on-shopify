## Test property sync for info@tsimkus.lt

Trigger the updated `sync-resend-contact` edge function for this single contact to verify properties (plan, product_categories, signup_date, credits_balance) now persist in Resend.

### Steps
1. Look up the user_id for `info@tsimkus.lt` in the database.
2. Invoke `sync-resend-contact` with that user's email/id and `action: "upsert"`.
3. Check `resend_event_log` for the new `contact.property_sync` row:
   - `status: "ok"` → properties endpoint works, safe to run full backfill next.
   - `status: "failed"` → inspect error, adjust endpoint (likely needs `/contacts/{email}` v2 path), redeploy, retry.
   - `status: "skipped"` → no properties built (shouldn't happen for an active user).
4. Confirm in Resend dashboard that the contact now shows plan / categories / signup_date / credits_balance.

### Out of scope
- Full backfill of all contacts (only after this single test passes).
- Any code changes unless the test returns a 4xx from Resend.

### Rollback
None needed — read-only test of already-deployed code.
