# Wire 3 new Resend events

Add three event triggers that flow into the existing `track-resend-event` edge function (which already PATCHes `last_event` + `last_event_at` on the Resend contact, enabling Resend automations).

All three are **fire-and-forget** via `pg_net.http_post` or in-handler `fetch` — they cannot delay Stripe webhooks, credit purchases, or generations. Failures are logged but never block the user flow.

## 1. `subscription.cancelled`

**File:** `supabase/functions/stripe-webhook/index.ts`

- In the `customer.subscription.deleted` handler, after the profile update, call `track-resend-event` with:
  - `event: 'subscription.cancelled'`
  - `attributes: { plan, cancelled_at, reason: 'deleted' }`
- In `customer.subscription.updated`, fire the same event when `cancel_at_period_end` flips from `false` → `true` (reason: `'scheduled'`).
- Uses existing service-role fetch pattern in the webhook — no new helpers.

## 2. `credits.purchased`

**File:** new migration updating `add_purchased_credits` RPC

- Look up the user's email inside the function.
- After balance update, call `_invoke_edge_function('track-resend-event', ...)` (same async pattern already in `deduct_credits` and `enqueue_generation`).
- Payload: `event: 'credits.purchased'`, `attributes: { amount, new_balance }`.

## 3. `generation.milestone` (1, 10, 50, 100)

**File:** new migration adding AFTER UPDATE trigger on `generation_jobs`

- Trigger fires when `status` transitions to `completed`.
- Counts the user's completed jobs; if count is exactly 1, 10, 50, or 100, calls `_invoke_edge_function('track-resend-event', ...)`.
- Payload: `event: 'generation.milestone'`, `attributes: { milestone, total }`.
- Idempotency: add a partial unique index on `resend_event_log (user_id, event_type, (attributes->>'milestone'))` where `event_type = 'generation.milestone'` so duplicates from rare race conditions are harmless.

## Technical details

```text
Stripe webhook  ──► track-resend-event ──► Resend /events/send
                                       └─► Resend PATCH last_event

add_purchased_credits RPC ──► _invoke_edge_function (async via pg_net)
                                       └─► track-resend-event

generation_jobs UPDATE → completed ──► trigger ──► milestone check
                                       └─► track-resend-event (if 1/10/50/100)
```

- No new tables, no new secrets, no schema changes beyond one partial index.
- Reuses existing throttle (220 ms gap) inside `track-resend-event`.
- All Resend calls remain best-effort; an outage at Resend cannot affect Stripe, billing, or generation.

## Files touched

- `supabase/functions/stripe-webhook/index.ts` — add 2 event calls
- new SQL migration — update `add_purchased_credits`, add trigger function + trigger on `generation_jobs`, add unique index on `resend_event_log`

## Out of scope

- `marketing.opted_out` event
- Step 5 (auto re-sync of `sync-resend-contact` on profile field changes)
