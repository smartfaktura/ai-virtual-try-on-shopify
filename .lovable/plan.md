# Grant 100 credits to alpha@pugandbulldog.com

## Target account
- Email: alpha@pugandbulldog.com
- user_id: `15c1a8fe-41ed-4aec-836c-e682ff9224b7`
- Plan: Growth (active)
- Current balance: 1,278 → after grant: **1,378**

## Action
Call the existing `add_purchased_credits` RPC (same one Stripe credit-pack fulfillment uses):

```sql
SELECT public.add_purchased_credits(
  '15c1a8fe-41ed-4aec-836c-e682ff9224b7'::uuid,
  100
);
```

## Why this RPC
- Atomic balance update (no race conditions)
- Treated as **purchased credits** → do NOT expire on monthly billing cycle rollover (use-it-or-lose-it only resets plan credits)
- Same code path as Stripe top-ups, so audit/accounting stays consistent

## Verification
After execution, re-read `profiles.credits_balance` for the user and confirm it shows 1,378.

## Out of scope
- No schema changes
- No code changes
- No effect on subscription, plan, or billing cycle
- Webhook plan stays untouched — resume after this
