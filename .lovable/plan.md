

## Plan: Add loading state to PlanChangeDialog confirm button

The confirm button in `PlanChangeDialog` has no loading feedback — after clicking, the user waits with no visual indicator while the Stripe checkout/portal session is being created.

### Changes

**1. `src/components/app/PlanChangeDialog.tsx`**
- Add a `loading` boolean prop to the component interface
- When `loading` is true, show a spinner (Loader2 icon with `animate-spin`) on the confirm button and disable it
- Also disable the "Go Back" button while loading

**2. `src/pages/Settings.tsx`**
- Add a `checkoutLoading` state (boolean)
- Set it to `true` at the start of `handleDialogConfirm`, before calling `openCustomerPortal()` or `startCheckout()`
- Remove `setDialogOpen(false)` from `handleDialogConfirm` — instead, let the redirect happen naturally (the dialog stays open with the spinner until the page navigates away)
- Pass `loading={checkoutLoading}` to `PlanChangeDialog`
- Reset loading on error or if the dialog is closed manually

**3. `src/components/app/BuyCreditsModal.tsx`**
- Same pattern: add `checkoutLoading` state, set before async calls, pass `loading` prop to `PlanChangeDialog`
- Remove the immediate `setDialogOpen(false)` / `closeBuyModal()` calls — let the spinner show until redirect

### Result
User clicks "Continue to Checkout" → button shows a spinning loader and becomes disabled → Stripe page loads → user is redirected. Clean, clear feedback.

