
## Answer to your questions

### 1. New contacts — auto-sync? ✅ Already works
Every signup goes through:
- `handle_new_user` trigger creates the profile row
- → calls `_invoke_edge_function('sync-resend-contact', …)`
- → `sync-resend-contact` PATCHes Resend with **all 12 properties** (plan, signup_date, credits_balance=20, lifecycle_stage=lead, …)

So every new user lands in Resend with full properties from day one. No backfill needed for them.

**Caveat:** the function only re-syncs when something *calls* it. A profile field change (e.g. user buys a plan) won't reach Resend unless we explicitly trigger a sync. That's what step 2 below covers.

### 2. Custom events for Resend automations — partially works, needs hardening

`track-resend-event` already exists and is wired into:
- `enqueue_generation` → fires `user.first_generation`
- `deduct_credits` → fires `credits.low`

It hits Resend's `POST /events/send`. **But** that endpoint is undocumented/beta and we have no confirmation automations actually fire from it. Resend's *documented* automation trigger is **contact property changed** — much more reliable.

## Plan

### Step 1 — Verify `/events/send` works today
- Query `resend_event_log` for last 50 rows where `event_type` ≠ `contact.sync`
- Check status + Resend response. If 404/202-but-no-fire → fall back to property-trigger pattern.

### Step 2 — Add "trigger property" pattern as the reliable path
Extend `track-resend-event` so each event also writes two properties to the contact:
- `last_event` = event name (e.g. `subscription.started`)
- `last_event_at` = ISO timestamp

That gives you a **guaranteed** Resend automation trigger:
> "When contact property `last_event` changes to `subscription.started` → send email X"

Both paths run side-by-side: the `/events/send` call stays (in case Resend's automation engine reads it), and the property write guarantees the automation fires regardless.

### Step 3 — Register the 2 new properties
Add to `register-resend-properties`:
- `last_event` (string)
- `last_event_at` (string)

Re-run the registration endpoint once. Existing 12 stay, these 2 get created.

### Step 4 — Wire up the events you care about
Currently fired: `user.first_generation`, `credits.low`.

I'll add (you pick which — see Open Questions):
- `subscription.started` — in `check-subscription` / Stripe webhook after `metadata.fulfilled`
- `subscription.cancelled` — Stripe webhook on `customer.subscription.deleted`
- `credits.purchased` — after `add_purchased_credits` RPC
- `generation.milestone` — fired at total_generations = 1, 10, 50, 100
- `marketing.opted_out` — when user toggles off

Each fire = one `track-resend-event` call, one row in `resend_event_log`, one property update on the contact in Resend.

### Step 5 — Keep `sync-resend-contact` in sync on profile changes
Add lightweight trigger / call sites so property drift is minimised:
- After Stripe webhook updates plan/subscription_status → call `sync-resend-contact`
- After referral_source is set → call `sync-resend-contact`
- After product_categories change → call `sync-resend-contact`

(No new function — just call sites for the existing one.)

## Technical notes

- All Resend calls remain throttled (sequential, 220ms gap) so we never hit 5 req/sec.
- `track-resend-event` already returns 200 even on Resend failure — callers never break.
- `resend_event_log` remains the source of truth for debugging.
- No DB schema changes. No RLS changes. No new secrets.

## Open questions for you

1. Which events from Step 4 do you want first? (Pick any combo — `subscription.started` is the highest-value one for automations.)
2. Step 5 sync points — should I wire them all, or only Stripe webhook for now?
