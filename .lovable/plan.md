# Export: Active free users for Resend re-engagement

## Goal
Generate a `.csv` file listing users who:
- Generated at least one image/video in the **last 30 days**
- Have **never subscribed or purchased** (free plan, no Stripe customer, no purchased credits)
- Are **email-subscribed** (not on the Resend suppression list / not unsubscribed)

Output saved to `/mnt/documents/` and presented as a downloadable artifact, formatted for direct Resend audience import.

## CSV columns (Resend-compatible)
- `email`
- `first_name`
- `last_name`
- `plan` (always `free`)
- `credits_balance`
- `signup_date`
- `last_generation_at`
- `total_generations_30d`
- `primary_category` (first item from `product_categories`)

## Query logic
1. **Active users (last 30d)**: UNION across `generation_jobs`, `freestyle_generations`, `generation_queue` (status = completed) where `created_at >= now() - interval '30 days'`. Aggregate per `user_id` → count + max(created_at).
2. **Join `profiles`** on `user_id` and filter:
   - `plan = 'free'`
   - `stripe_customer_id IS NULL`
   - `stripe_subscription_id IS NULL`
3. **Filter out unsubscribed users**: left-join `resend_event_log` (or check `unsubscribed_at` column on profiles if present) — exclude any email that appears with `unsubscribed = true` in the most recent contact sync, OR where the user explicitly opted out.
4. **Filter out anyone who ever purchased credits**: exclude users that appear in `resend_event_log` with `event_type = 'credits.purchased'` (since `add_purchased_credits` fires that event), as a belt-and-suspenders check beyond the `stripe_customer_id IS NULL` filter.
5. Order by `last_generation_at DESC`.

## Steps
1. Inspect `profiles` schema to confirm columns for unsubscribe state (`unsubscribed`, `marketing_opted_in`, or similar) and confirm `stripe_customer_id` semantics.
2. Run the aggregation SQL via `psql` (read-only).
3. Pipe results to `/mnt/documents/free-active-users-30d.csv` via `COPY ... TO STDOUT WITH CSV HEADER`.
4. Print row count + sample preview, then emit a `<presentation-artifact>` for download.

## Open question
Resend's unsubscribe state lives in their audience (synced via `sync-resend-contact`), not necessarily in our DB. I'll exclude users we know unsubscribed locally; if you also want me to cross-check against Resend's live audience via API before exporting, say so and I'll add that step (adds ~1 API call per user, slower).
