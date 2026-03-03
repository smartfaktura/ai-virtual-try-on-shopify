

## Fix: Sidebar Shows "Free Plan" Despite Pro Account

### Root Cause

The user's database profile has `plan: "pro"` with 4306 credits, but `stripe_customer_id: null` and `subscription_status: "none"` — the plan was set manually without a Stripe subscription.

The `check-subscription` edge function runs every 60 seconds. When it finds **no Stripe customer** for the user's email, it returns `{ plan: "free" }` in the response (line 92). The frontend `CreditContext.checkSubscription` then calls `setPlan("free")`, overriding the correct "pro" value that `fetchCredits` initially loaded from the database.

**Timeline every minute:**
1. `fetchCredits` reads DB → `plan = "pro"` ✓ (correct)
2. `checkSubscription` calls edge function → no Stripe customer found → returns `plan: "free"` → `setPlan("free")` ✗ (overrides to wrong value)

### Fix

**File: `supabase/functions/check-subscription/index.ts`** — When no Stripe customer is found, read the current DB plan and return it instead of hardcoding `"free"`. Same for when a Stripe customer exists but has no active subscription.

```typescript
// Line 82-98: No Stripe customer case
// BEFORE: returns { plan: "free" } unconditionally
// AFTER: reads current profile.plan from DB and returns that

const { data: profile } = await supabaseAdmin.from("profiles")
  .select("credits_balance, plan")
  .eq("user_id", userId)
  .single();

const currentPlan = profile?.plan || "free";

return new Response(JSON.stringify({
  plan: currentPlan,
  subscription_status: "none",
  credits_balance: profile?.credits_balance ?? 0,
  current_period_end: null,
}), ...);
```

Same pattern for lines 154-174: when a Stripe customer exists but has no active subscription, use the DB plan as fallback instead of defaulting to `"free"`.

Also remove the DB update that clears `stripe_customer_id` / `stripe_subscription_id` when there's no customer — these fields are already null and don't need to be written.

### Files changed — 1
- `supabase/functions/check-subscription/index.ts` — Respect DB plan when Stripe has no subscription data

