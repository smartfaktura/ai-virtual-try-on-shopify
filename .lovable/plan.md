

## Stripe Setup Audit & Mobile Fix

### Current Status: What's Working

The Stripe integration is fully set up:
- **Subscriptions**: `create-checkout` edge function handles both subscription and one-time payment checkout sessions
- **Subscription sync**: `check-subscription` runs on login and every 60 seconds, syncs plan/credits from Stripe to database
- **Cancellation/Management**: `customer-portal` edge function creates a Stripe billing portal session where users can cancel, change payment method, or switch plans
- **Credit packs**: One-time purchases with fulfillment tracking via checkout session metadata
- **UI**: Settings page has plan selection, billing period toggle (monthly/annual), credit pack purchase, and `PlanChangeDialog` that routes to checkout or portal

Everything is properly wired. No missing pieces for subscription lifecycle.

### Problem: Mobile Popup Blocking

The checkout and customer portal both use `window.open(data.url, '_blank')`. On mobile browsers (Safari, Chrome), popup blockers prevent `window.open` when it's not in the **direct synchronous call stack** of a user gesture. Since the flow is:

1. User taps button (gesture)
2. `await supabase.functions.invoke(...)` (async network call -- gesture context lost)
3. `window.open(url, '_blank')` -- **BLOCKED** by mobile browser

### Fix

Replace `window.open(url, '_blank')` with `window.location.href = url` for both `startCheckout` and `openCustomerPortal` in `CreditContext.tsx`. This navigates the current tab instead of opening a new one, which is never blocked by popup blockers and is actually a better UX on mobile (no tab juggling). Stripe's success/cancel URLs already redirect back to the app.

### Files changed -- 1

**`src/contexts/CreditContext.tsx`**
- Line 149: Change `window.open(data.url, '_blank')` to `window.location.href = data.url` (startCheckout)
- Line 162: Change `window.open(data.url, '_blank')` to `window.location.href = data.url` (openCustomerPortal)

