

## Problem

Your account (`info@tsimkus.lt`) has `plan: pro` but `billing_interval: null`, `subscription_status: none`, and no Stripe customer ID. This means the plan was manually assigned — so the billing interval badges, the "Switch to annual" nudge, and the "billed monthly/annually" text under prices all show nothing.

The UI code is already in place but is gated behind `billingInterval` and `subscriptionStatus` checks that are null/none for your account.

## Plan

### 1. PlanCard — show "billed monthly" under price for all paid current plans (not just when billingInterval is set)

Currently the "billed monthly/annually" text only appears when `billingInterval` is truthy. Change it to:
- If `billingInterval` is set → show "billed monthly" or "billed annually"
- If `billingInterval` is null but the card is the current paid plan → show "billed monthly" as default (since monthly is the default billing cycle)

Also: when the user's billing is already annual, auto-switch the toggle to "Annual" and hide the "Switch to annual" nudge.

### 2. Settings "Current Plan" card — same fallback logic

The badge that says "Billed monthly" / "Billed annually" currently requires `billingInterval` to be set. Update it to:
- Show "Billed monthly" as default for paid plans when `billingInterval` is null
- Keep showing actual value when it's set

The "Switch to annual & save 20%" link currently requires `billingInterval === 'monthly'`. Update to also show when `billingInterval` is null (for paid plans).

### 3. BuyCreditsModal — same treatment

Default the toggle to the user's actual billing interval, or `'monthly'` if null.

### 4. When billing is annual — auto-select annual toggle

In both Settings and BuyCreditsModal, if `billingInterval === 'annual'`, default `billingPeriod` to `'annual'` so the user sees their actual pricing. The toggle init already does this (`billingInterval || 'monthly'`), which is correct.

### Files changed

- **`src/pages/Settings.tsx`** (~lines 212-228): Change the billing badge and nudge conditions from `billingInterval` to `billingInterval || (plan !== 'free' ? 'monthly' : null)` — i.e., treat null as monthly for paid plans
- **`src/components/app/PlanCard.tsx`** (~lines 69-73): Same fallback — show "Monthly" badge when `billingInterval` is null but it's the current paid plan
- **`src/components/app/BuyCreditsModal.tsx`**: No changes needed — toggle default already handles null correctly

### Result

For your Pro account with no Stripe data:
- Current Plan card shows **"Billed monthly"** badge + **"Switch to annual & save 20% →"** link
- Pro PlanCard shows **"Monthly"** badge next to "Current"
- When user clicks "Switch to annual" → goes to billing portal (or checkout if no Stripe customer)

