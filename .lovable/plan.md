## Fix: Starter (and any paid plan) sidebar CTA hides Top Up

### Problem
Sidebar `CreditIndicator` shows **"Upgrade"** for any plan with a `nextPlanId` (Free, Starter, Growth). Clicking opens `UpgradePlanModal` — a plan picker only, no credit packs. Starter users have no obvious way to top up from the sidebar.

### Change
File: `src/components/app/CreditIndicator.tsx`

- Pull `plan` from `useCredits()`.
- New CTA logic:
  - `plan === 'free'` → label **"Upgrade"**, opens `UpgradePlanModal` (unchanged behavior).
  - Any paid plan (Starter / Growth / Pro / Enterprise) → label **"Get credits"**, calls `openBuyModal('sidebar_cta')`. The unified `BuyCreditsModal` already shows **Top Up** (default tab for paid users) and **Plans** tabs, so Starter can either buy a top-up pack or switch tabs to upgrade to Growth/Pro.
- Drop the dead `canUpgrade` branching and the `UpgradePlanModal` import (no longer needed here — free users still get plan picker through `openBuyModal` defaulting to Upgrade tab for them; verify and keep `UpgradePlanModal` only if Free flow specifically requires the plan picker UI rather than the unified modal).

### Verification
- Confirm `BuyCreditsModal` opened via `openBuyModal` defaults to **Top Up** tab when plan is Starter (already verified: `defaultTab = isFreeUser(plan) ? 'upgrade' : 'topup'`).
- Free users still land on Upgrade tab in the same modal — acceptable, single consistent surface.

### Out of scope
- No Stripe / pricing / `creditPacks` changes.
- No styling changes to the credit pill, progress bar, or collapsed-sidebar variant.
- No change to the `/settings` "Top up credits" button added previously.
- No change to no-credits modal flow.
