# Pass plan name to startCheckout for accurate GTM payload

## Problem
`startCheckout(priceId, mode, planName?)` in `CreditContext` accepts an optional 3rd arg used as the `plan_name` field on the `checkout_started` dataLayer event. Two callsites currently omit it, so GTM falls back to the user's *current* plan instead of the plan being purchased — inaccurate attribution in Google Ads / GA4.

## Changes

### 1. `src/components/app/UpgradePlanModal.tsx` (line 175)
```ts
await startCheckout(priceId, 'subscription', selectedPlan.name);
```

### 2. `src/components/app/BuyCreditsModal.tsx` (line 99)
```ts
await startCheckout(priceId, 'subscription', selectedPlan.name);
```

(`selectedPlan` is already in scope in both files — `upgradePlans.find(...)` in UpgradePlanModal, and the destructured `selectedPlan` in BuyCreditsModal.)

## Out of scope
- No changes to `startCheckout` signature, GTM helper, or edge functions.
- Top-up/credit-pack `handleTopUp` already passes pack name correctly (verified previously).
- No other callsites of `startCheckout` need updating.

## Verification
1. Open GTM Preview.
2. From `/app` open Upgrade Plan modal → select Growth (annual) → Confirm.
3. Expect `checkout_started` event with `plan_name: "Growth"` (not the user's current plan).
4. Repeat from BuyCreditsModal upgrade path — same expectation.
5. Refresh: event should not re-fire (Stripe session dedup key unchanged).
