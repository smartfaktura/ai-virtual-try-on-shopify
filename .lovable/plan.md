

## Problem

The "Manage Subscription" button only renders when `subscriptionStatus === 'active' || subscriptionStatus === 'canceling'` (line 163). If the user's subscription status is `'none'` (e.g., free plan, or status not yet synced), the button is invisible. Additionally, there's no way for customers to access invoices — which Stripe Customer Portal provides natively.

## Plan

### 1. Always show a "Manage Billing & Invoices" button for paid users

Change the condition from checking `subscriptionStatus` to checking `plan !== 'free'`. This covers users whose status might not be synced yet but are on a paid plan.

Also add a fallback: show the button for **any** user (even free) with a softer label like "Billing & Invoices" — if they were ever a Stripe customer, the portal will work; if not, we catch the error gracefully (already handled in `openCustomerPortal` with a toast).

### 2. Restructure the Current Plan card

- Move the button to be more prominent — full-width below the credits bar, not tucked into a corner
- Label it **"Manage Billing & Invoices"** so it's clear invoices are accessible
- Use a secondary/default variant instead of `outline` so it stands out
- For free users, show it as a subtle link instead

### Changes — `src/pages/Settings.tsx`

**Current Plan card (lines 150-180):**

- Remove the conditional `subscriptionStatus` check on the button
- Add a prominent "Manage Billing & Invoices" button below the credits progress bar for any user on a paid plan (`plan !== 'free'`)
- For free plan users who might have past invoices, add a subtle text link "View past invoices" that also calls `openCustomerPortal()`

The button layout becomes:
```
[Current Plan card]
  Plan name + badge + renewal date
  ─────────────────────────────
  Credits: 450 / 4500  [progress bar]
  Resets on the 1st of each month
  
  [ Manage Billing & Invoices ]   ← prominent button, always visible for paid users
```

