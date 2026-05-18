## Goal
Upgrade single user `leskauskaite@gmail.com` (id `32153738-b8e9-472e-b355-a86fb3f5ffcc`, currently `free` / 0 credits) to **Pro plan** with **10,000 credits** — safely, without touching billing-protected fields directly.

## Why this is safe
- No schema changes, no code changes.
- Uses existing `SECURITY DEFINER` RPCs designed exactly for this:
  - `change_user_plan(user_id, 'pro', 4500)` — sets plan to `pro` (validated against allowed plans) and lifts balance up to plan allotment.
  - `add_purchased_credits(user_id, delta)` — atomic positive credit add via the same path Stripe uses for credit pack fulfillment.
- Both bypass `protect_billing_fields` correctly (service_role / definer), so no trigger errors and no risk of corrupting Stripe-synced fields.
- Scoped to one `user_id` — zero blast radius.
- Does NOT touch `stripe_customer_id`, `stripe_subscription_id`, `current_period_end`, or `billing_interval`. Stripe stays the source of truth; if the user later subscribes, `check-subscription` will reconcile cleanly.

## Caveat to confirm
Because we are not creating a real Stripe subscription, `subscription_status` will stay `none` and `current_period_end` will be `null`. This means the **use-it-or-lose-it monthly reset will NOT fire** for this user — the 10,000 credits persist until spent. That is the desired behavior for a manual grant. Confirm this is acceptable.

## Steps (executed via Supabase insert tool on approval)
1. `SELECT change_user_plan('32153738-b8e9-472e-b355-a86fb3f5ffcc', 'pro', 4500);`
   → Plan becomes `pro`, balance becomes at least 4500.
2. `SELECT add_purchased_credits('32153738-b8e9-472e-b355-a86fb3f5ffcc', 10000 - <new_balance>);`
   → Top up to exactly 10,000. (Or simpler: a single guarded UPDATE through the same definer path — see alternative below.)
3. Verify: `SELECT plan, credits_balance FROM profiles WHERE user_id = '...'` → expect `pro`, `10000`.

### Simpler alternative (preferred)
Run both effects in one statement using the existing functions:
```sql
SELECT change_user_plan('32153738-...'::uuid, 'pro', 0);  -- set plan, no balance bump
SELECT add_purchased_credits('32153738-...'::uuid, 10000 - (SELECT credits_balance FROM profiles WHERE user_id='32153738-...'));
```
Final state: `plan='pro'`, `credits_balance=10000`.

## Rollback
If needed: `SELECT change_user_plan('<id>', 'free', 0);` and adjust balance via `add_purchased_credits` with a negative-equivalent (would require a tiny one-off; easier: just leave credits and downgrade plan).

Approve to execute.