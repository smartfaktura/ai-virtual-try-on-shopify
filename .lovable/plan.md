

## Problem: Downgrade Creates a New Subscription Instead of Modifying the Existing One

### Current Behavior

When a user confirms a **downgrade** (e.g., Pro -> Growth, or Pro -> Free), `handleDialogConfirm` in Settings.tsx (line 138-141) calls `startCheckout(priceId, 'subscription')`. This creates a **brand new Stripe Checkout session** — meaning the user would end up with **two active subscriptions** instead of having their existing one modified.

The same issue exists in `BuyCreditsModal.tsx` (line 54-58).

Only `cancel` and `reactivate` correctly route to `openCustomerPortal()`.

### What Should Happen

- **Upgrade**: Should also modify the existing subscription, not create a new one. Stripe Customer Portal handles this, or a dedicated edge function can use `stripe.subscriptions.update()`.
- **Downgrade**: Same — modify existing subscription, not create new.
- **Cancel / Reactivate**: Already correct — uses Customer Portal.
- **New subscription** (from Free): `startCheckout` is correct here since there's no existing subscription to modify.

### Fix

**Simplest approach**: Route upgrade/downgrade for users who already have an active subscription through `openCustomerPortal()`, which natively handles plan changes, proration, and downgrades. Only use `startCheckout` when the user has no existing subscription (i.e., going from Free to a paid plan).

### Changes — 2 files

**`src/pages/Settings.tsx`** — Update `handleDialogConfirm`:
```typescript
const handleDialogConfirm = () => {
  if (selectedPlan && (dialogMode === 'upgrade' || dialogMode === 'downgrade')) {
    if (subscriptionStatus === 'active' || subscriptionStatus === 'canceling') {
      // User already has a subscription — use portal to change plan
      openCustomerPortal();
    } else {
      // No existing subscription — create new checkout
      const priceId = billingPeriod === 'annual' ? selectedPlan.stripePriceIdAnnual : selectedPlan.stripePriceIdMonthly;
      if (priceId) {
        startCheckout(priceId, 'subscription');
      }
    }
  } else if (dialogMode === 'cancel' || dialogMode === 'reactivate') {
    openCustomerPortal();
  }
  setDialogOpen(false);
};
```

**`src/components/app/BuyCreditsModal.tsx`** — Apply the same logic to `handleDialogConfirm` there.

### Why This Works

The Stripe Customer Portal already supports:
- Switching between plans (upgrade/downgrade)
- Proration handling
- Schedule downgrades at period end
- Cancellation and reactivation

This avoids creating duplicate subscriptions and ensures Stripe handles all the billing logic correctly.

### Prerequisite

The Stripe Customer Portal must be configured in the Stripe Dashboard to allow plan switching. The user should verify this is enabled at [Stripe Portal settings](https://dashboard.stripe.com/settings/billing/portal).

