

## Monthly Credit Reset for Paid Plans

### Problem
Credits are only granted on plan *change* (e.g. free → growth). When Stripe renews the subscription each month, `check-subscription` sees the plan is unchanged and skips credit granting. Paid users never get fresh credits after their first month.

### Solution
Detect billing cycle rollover in `check-subscription` by comparing the new `current_period_end` from Stripe against the stored value in the database. When it differs → new billing cycle → reset credits.

### Changes

**1. Database migration**
- Add `credits_renewed_at` column to `profiles` (default `now()`)
- Create `reset_plan_credits(p_user_id uuid, p_plan_credits int)` function that sets `credits_balance = p_plan_credits` and updates `credits_renewed_at = now()`

**2. `supabase/functions/check-subscription/index.ts`**
- Fetch `current_period_end` from DB profile (already fetched as `currentProfile`)
- After resolving `activeSub` from Stripe, compare new `periodEnd` vs stored `currentProfile.current_period_end`
- If plan is unchanged AND `periodEnd` differs (new cycle): call `reset_plan_credits` with the plan's monthly allotment (e.g. 1500 for growth)
- This resets credits to the plan amount — old unused credits expire

### Flow after fix

```text
Day 1:  free → growth  →  change_user_plan → 1,500 credits
Day 30: growth → growth, period_end changed → reset_plan_credits → 1,500 credits
Day 60: growth → growth, period_end changed → reset_plan_credits → 1,500 credits
```

### What stays the same
- Free plan: 20 credits at signup, no renewal (as you requested)
- Plan upgrades/downgrades: handled by existing `change_user_plan`
- Purchased credit packs: added on top, but reset at next cycle (use-it-or-lose-it)
- Dismiss (X) button for failed notifications still works

