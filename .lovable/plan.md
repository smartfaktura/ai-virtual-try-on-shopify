

## Fix: Credits and Plan Not Updating After Stripe Payment

### Root Cause (from edge function logs)

The `check-subscription` function crashes with **"Invalid time value"** for user `tsimkus@inbox.lt` every time it runs. The Stripe customer (`cus_UAHnYye2Id2e12`) and active Starter subscription ARE found, but the function crashes at line 177 when converting `current_period_end` to a Date — before it can update the plan or credits in the database.

Log sequence:
```
User authenticated → Found Stripe customer → ERROR: "Invalid time value"
```

There is also a second bug: even without the crash, the function updates the `plan` column but **never grants subscription credits**. A `change_user_plan` DB function exists that does this, but the code doesn't call it.

### Fixes in `supabase/functions/check-subscription/index.ts`

**1. Fix the crash — safe date conversion:**
- Wrap `new Date(activeSub.current_period_end * 1000)` in a try-catch or validate the value first
- The basil API version may return `current_period_end` differently; handle both number and string formats

**2. Grant credits when plan changes:**
- When the detected plan differs from the current DB plan (e.g. free → starter), call the existing `change_user_plan` RPC instead of a raw profile update
- `change_user_plan` does `GREATEST(credits_balance, p_new_credits)`, ensuring the user gets their subscription credits

**3. Better error resilience:**
- Ensure the profile sync (`plan`, `stripe_customer_id`, etc.) still happens even if the date conversion fails
- Add more granular logging around the subscription period end value

### Code Changes

```typescript
// Safe date conversion helper
function safeISODate(value: any): string | null {
  if (!value) return null;
  try {
    const ts = typeof value === 'number' ? value * 1000 : Date.parse(value);
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch { return null; }
}

// When plan changes, use change_user_plan RPC to grant credits
if (plan !== currentProfile?.plan && plan !== 'free') {
  const planCredits = planInfo?.credits || 0;
  await supabaseAdmin.rpc("change_user_plan", {
    p_user_id: userId,
    p_new_plan: plan,
    p_new_credits: planCredits,
  });
}
```

### File
- `supabase/functions/check-subscription/index.ts`

### Immediate Fix for This User
After deploying, the next `check-subscription` call (automatic every 60s) will detect the active Starter subscription, update the plan from whatever it currently is to "starter", and grant 500 credits.

