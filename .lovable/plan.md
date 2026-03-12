

## Plan: Fix all missing loading states in checkout flows

### Problems Found

1. **Top Up tab (BuyCreditsModal)**: `handlePurchase` calls `startCheckout()` then immediately `closeBuyModal()` — modal vanishes with no loading feedback while the edge function creates the Stripe session.

2. **Switch to Annual button (BuyCreditsModal)**: `handleSwitchToAnnual` calls `openCustomerPortal()` or `startCheckout()` then immediately `closeBuyModal()` — same problem.

3. **PlanChangeDialog in BuyCreditsModal**: `handleDialogConfirm` only handles `upgrade`/`downgrade` modes but not `cancel`/`reactivate` — if a user tries to cancel or reactivate from the modal, nothing happens and loading never resets.

4. **Settings PlanChangeDialog**: Already handles all modes correctly. No issues here.

### Changes

**1. `src/components/app/BuyCreditsModal.tsx`**

- **Top Up buttons**: Add a `topUpLoading` state. Set it to `true` before calling `startCheckout()`. Do NOT call `closeBuyModal()` — let the redirect happen naturally. Show a spinner on the clicked button and disable all Top Up buttons while loading.

- **Switch to Annual button**: Add a `switchLoading` state. Set it to `true` before calling `openCustomerPortal()`/`startCheckout()`. Do NOT call `closeBuyModal()`. Show spinner on the Switch button.

- **PlanChangeDialog confirm handler**: Add `cancel` and `reactivate` handling (call `openCustomerPortal()`), matching what Settings.tsx already does. This ensures all 4 dialog modes work.

- **Prevent modal close while any checkout is loading**: In the `onOpenChange` handler, check if any loading state is active and block closing.

**2. `src/components/app/PlanChangeDialog.tsx`**

- Already has the `loading` prop implemented correctly. No changes needed.

### Result

Every checkout button across the entire app (Top Up packs, Plan upgrade/downgrade/cancel/reactivate, Switch to Annual) will show a loading spinner and disable interaction until the Stripe redirect happens.

