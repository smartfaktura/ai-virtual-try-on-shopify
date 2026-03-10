

## Fix: Downgrade to Free should behave as Cancel Subscription

### Problem
When a user with an active paid plan (e.g., Pro) clicks "Downgrade to Free," the dialog treats it as a generic downgrade. But downgrading to Free is effectively **canceling the subscription** — there's no Free subscription to create. The dialog should use the `cancel` mode with appropriate messaging ("Cancel Subscription") instead of showing "Downgrade Plan" with checkout/portal language.

### Changes

#### `src/pages/Settings.tsx` (handlePlanSelect, ~line 120-129)
- Add a check: if `targetPlan.planId === 'free'`, set `dialogMode` to `'cancel'` instead of `'downgrade'`
- This routes the confirm action through `openCustomerPortal()` via the cancel path

#### `src/components/app/BuyCreditsModal.tsx` (handlePlanSelect, ~line 34-51)
- Same logic: if `planId === 'free'`, set `dialogMode` to `'cancel'` instead of `'downgrade'`

#### `src/components/app/PlanChangeDialog.tsx` (getConfirmLabel, ~line 78-86)
- No changes needed — the `cancel` mode already correctly shows "Continue to Billing Portal"

### What stays the same
- All styling, layout, and functional behavior unchanged
- The cancel mode dialog already has the right copy ("Your subscription will end on...") and destructive button style
- The confirm action for cancel already calls `openCustomerPortal()`

