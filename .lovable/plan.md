## Annual plans grant 12 months of credits upfront

### Changes

**1. `supabase/functions/check-subscription/index.ts`** — update `PRICE_TO_PLAN` annual entries to 12× monthly:
- `price_1T26pAC8WPO5rhKrvWHK7Lvb` (starter annual): `500` → `6000`
- `price_1T26pcC8WPO5rhKr4w4koC4C` (growth annual): `1500` → `18000`
- `price_1T26qCC8WPO5rhKrKubiCvsd` (pro annual): `4500` → `54000`

Existing rollover logic (lines 277–312) already refills `planInfo.credits` when Stripe advances `current_period_end` — on annual subs that fires once a year, dropping another 12 months in one go. No other code changes needed.

**2. One-time backfill** — for existing annual subscribers whose `credits_renewed_at` is within their current billing period, top up balance to the new annual allotment using `add_purchased_credits` (bypasses billing-protect trigger).

Spencer (`6d565be0-397a-4910-bbb1-050796441040`, starter annual): 500 → **6000** (+5500).

Query identifies eligible users:
```sql
select user_id, plan, credits_balance, current_period_end
from profiles
where billing_interval = 'annual'
  and subscription_status = 'active'
  and credits_renewed_at >= (current_period_end - interval '1 year' - interval '1 day');
```

**3. Memory** — update `mem://features/credit-renewal-logic`: annual subs grant 12× monthly credits upfront, refilled once per Stripe yearly period rollover. Use-it-or-lose-it within the year still applies on rollover (matches monthly behavior).

### Out of scope

- Pricing page copy ("500 credits / month") stays — 12×500 = 6000/year is consistent.
- No monthly plan changes.
- No cron / webhook work — Stripe's natural period advance handles renewal.
- No proration on mid-year cancel (Stripe handles refund of unused time; credits already granted stay until period end).
