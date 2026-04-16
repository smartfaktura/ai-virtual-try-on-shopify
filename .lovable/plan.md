

## Problem

Looking at the screenshot: sidebar shows `8,571 / 4,500` credits with an "Upgrade" button. Clicking it does nothing.

The user is over their plan's max credits (8,571 > 4,500), which means they're on a paid plan (likely `pro` or admin override). `UpgradePlanModal` returns `null` when there's no higher tier — so the modal mounts but renders nothing. Same root cause as the admin showroom issue we just fixed, but now hitting it in production sidebar.

Let me verify by checking `CreditIndicator.tsx` to confirm how Upgrade is wired.

## Likely fix

In `src/components/app/CreditIndicator.tsx`:
- If user's plan has no higher tier (e.g. `pro`), the "Upgrade" button shouldn't render at all — OR it should open `BuyCreditsModal` (top-up tab) instead, since they can still buy credit packs.

Best UX: **swap the button label/action based on tier**:
- Has higher tier → "Upgrade" → opens `UpgradePlanModal` (current behavior)
- Top tier (pro) → "Top up" → opens `BuyCreditsModal` on the credits tab
- This way the button is never dead.

I need to read `CreditIndicator.tsx` to confirm the exact wiring before finalizing.

