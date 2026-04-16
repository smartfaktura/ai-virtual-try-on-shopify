

# Replace NoCreditsModal (Free User) with BuyCreditsModal

## Problem
When a free user runs out of credits, they see a custom `NoCreditsModal` with a flat, duplicated plan grid (screenshot 1). But the app already has a polished `BuyCreditsModal` with a proper Plans tab (screenshot 2) — monthly/annual toggle, feature lists, current plan badge, and full checkout flow. The NoCreditsModal is redundant and worse.

## Solution
For free users, instead of rendering the custom plan cards in `NoCreditsModal`, simply open the existing `BuyCreditsModal` (which defaults to the "Plans" tab for free users already — line 22 of BuyCreditsModal.tsx). This eliminates the duplicate UI entirely.

## Changes

### `src/components/app/NoCreditsModal.tsx`
- **Free user path**: When `isFree` is true and the modal opens, call `openBuyModal()` from CreditContext, then immediately call `onClose()` to dismiss the NoCreditsModal itself. The free user never sees the NoCreditsModal — they go straight to the full BuyCreditsModal Plans tab.
- **Paid user path**: No change — paid users still see the credit top-up packs in the NoCreditsModal as before.
- Remove the entire `SUBSCRIPTION_PLANS` grid section (the free user branch, lines 70–116) since it will never render.
- Remove unused imports: `Badge`, `ArrowUpRight`.

### No other files change
The `BuyCreditsModal` is already mounted globally in `App.tsx` and already defaults to the "upgrade" tab for free users.

## Result
Free users who hit the credit wall get the full, polished Plans experience (with billing toggle, feature comparison, proper CTAs) instead of a flat custom modal. One less custom UI to maintain.

