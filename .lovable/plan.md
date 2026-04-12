

# Change Zap Button to Navigate to Settings/Subscription

## Problem
The Zap icon button currently opens the "Buy Credits" modal, but the user wants it to relate to upgrading/subscriptions instead.

## Change
**`src/components/app/CreditIndicator.tsx`** — one edit:

- Change the Zap button's `onClick` from `openBuyModal` to `() => navigate('/app/settings')` — the same destination as the "Upgrade" link
- Update the `title` attribute from `"Buy credits"` to `"Manage plan"`
- This makes the Zap button a quick shortcut to the subscription/plan settings page, which is where users upgrade, manage billing, and buy credit packs

No other files need changes. The "Upgrade" text link and the Zap button will both go to settings, giving users two intuitive tap targets for plan management.

