## Fix runaway credit refill in `check-subscription`

### The bug (confirmed in production)
`supabase/functions/check-subscription/index.ts` line 284 detects new billing cycles with a **string comparison**:

```ts
periodEnd !== currentProfile?.current_period_end
```

- Postgres returns: `2026-06-01 20:56:46+00`
- Stripe (re-serialized): `2026-06-01T20:56:46.000Z`

Same moment, different text format → comparison is **always true** → `reset_plan_credits` fires on every call to `check-subscription` (login, page load, Stripe poll). Paid users get refilled to the full plan allotment many times per day.

Live evidence:
- Logs: `"oldPeriodEnd":"2026-06-15T21:51:15+00:00","newPeriodEnd":"2026-06-15T21:51:15.000Z"` → "Billing cycle rolled over" fires repeatedly within the same second
- lvsa0902@gmail.com (Growth, 1,500/mo): spent ~14,000 credits in 18 days, `credits_renewed_at` keeps resetting to "today"

### The correct rule
**Refill credits ONLY when Stripe has successfully charged a new invoice and advanced the billing period.**

That single source of truth is Stripe's `current_period_end` moving **strictly forward**. Stripe only advances that field after a successful payment of the renewal invoice — if a charge fails, the subscription goes to `past_due` and `current_period_end` stays put. So the right gate is:

1. Subscription status is **active or trialing** (NOT `past_due`, `unpaid`, `incomplete`)
2. Plan is unchanged
3. `new current_period_end` > `old current_period_end` (compared as timestamps, not strings)

No timers, no 25-day windows — just "did Stripe actually renew?".

### The fix
**One file, one condition:** `supabase/functions/check-subscription/index.ts`, around lines 277–296. Replace the string check with:

```ts
const oldPeriodMs = currentProfile?.current_period_end
  ? new Date(currentProfile.current_period_end).getTime()
  : 0;
const newPeriodMs = periodEnd ? new Date(periodEnd).getTime() : 0;

// Only refill when Stripe has CHARGED a new cycle:
//  - same plan (plan changes handled separately)
//  - subscription is paid (active/trialing — NOT past_due/unpaid)
//  - Stripe moved current_period_end strictly forward
const isPaidStatus =
  subscriptionStatus === "active" ||
  subscriptionStatus === "trialing" ||
  subscriptionStatus === "canceling"; // canceling = still paid through period end

if (
  plan === currentProfile?.plan &&
  plan !== "free" &&
  planInfo.credits > 0 &&
  isPaidStatus &&
  newPeriodMs > oldPeriodMs        // ← real renewal, not string-format noise
) {
  logStep("Billing cycle rolled over — resetting credits", {
    plan,
    oldPeriodEnd: currentProfile?.current_period_end,
    newPeriodEnd: periodEnd,
    allotment: planInfo.credits,
  });
  await supabaseAdmin.rpc("reset_plan_credits", {
    p_user_id: userId,
    p_plan_credits: planInfo.credits,
  });
}
```

Behavior after fix:
- Same instant, different format → numerically equal → **no reset** ✅
- Failed charge / `past_due` → period_end doesn't advance → **no reset** ✅
- Stripe successfully renewed → period_end advances → reset fires **exactly once** per cycle ✅
- Plan upgrades/downgrades → handled by the existing separate branch, unaffected ✅
- First-time sync (DB has `null`) → `oldPeriodMs = 0`, fresh paid subscription initializes once ✅

### Scope (what is NOT touched)
- No DB migration, no RPC changes
- No changes to Stripe checkout, webhooks, top-up flow (`add_purchased_credits` is correct)
- No retroactive clawback of credits already given to users
- No 25-day timer (you correctly rejected that — semantics should be "Stripe charged", not "time passed")

### Rollout
1. Edit `supabase/functions/check-subscription/index.ts` — auto-deploys
2. Verify in edge function logs: "Billing cycle rolled over" should only appear for users whose period actually advanced (it should essentially **stop appearing** for the next several days, then reappear once per user on their real renewal date)
3. Spot-check lvsa0902, teleportwatches, haleigh.james accounts — `credits_renewed_at` should stop moving until their actual `current_period_end`

### Open question for you
lvsa0902@gmail.com currently sits at exactly 1,500 (their Growth allotment). The fix stops future over-refills immediately. Leave their balance as-is (goodwill), or reset to a lower number? I'd recommend leaving it — the bug was on us.