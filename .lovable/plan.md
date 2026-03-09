

## Show Current Plan Dynamically on Pricing for Logged-In Users

### Problem
When a logged-in user views the pricing section (on landing or `/pricing`), all plans show generic CTAs like "Get Starter →" with no indication of which plan they're currently on. This can mislead users.

### Solution
Import `useCredits` in `LandingPricing.tsx` to get the user's current `plan` and `subscriptionStatus`. For each plan card:

1. **Highlight current plan** — show a "Current Plan" badge and disable the CTA button
2. **Dynamic CTA text** — "Current Plan" for active plan, "Upgrade to X" for higher tiers, "Downgrade to X" for lower tiers
3. **For logged-in users on paid plans** — route upgrade/downgrade clicks to `/app/settings` (where Stripe portal handles it) instead of `/app`

### Changes

**`src/components/landing/LandingPricing.tsx`**

- Import `useCredits` from `@/contexts/CreditContext`
- Get `{ plan: currentPlan, subscriptionStatus }` from `useCredits()`
- Define plan order array: `['free', 'starter', 'growth', 'pro']`
- For each plan card:
  - Compute `isCurrentPlan = user && plan.planId === currentPlan`
  - Compute CTA label: "Current Plan" / "Upgrade to X" / "Downgrade to X" / original `ctaText` (when logged out)
  - Add a small "Current Plan" badge next to plan name when active
  - Disable button when `isCurrentPlan && subscriptionStatus !== 'canceling'`
  - Route logged-in upgrade/downgrade clicks to `/app/settings`

No new files. Single file change.

