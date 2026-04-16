

## Goal

Make the "Upgrade" button in the sidebar credits indicator open a modal (instead of navigating to `/app/settings`). "Top up" behavior stays the same (opens the existing buy modal).

## Exploration needed

Need to confirm whether a plan-change/upgrade modal already exists I can reuse, or if I should open the existing `PlanChangeDialog` directly, or build a lightweight upgrade modal.

From context I already have:
- `PlanChangeDialog.tsx` exists and supports `mode="upgrade"` with a `targetPlan`. It's the proper upgrade confirmation dialog used in settings.
- `useCredits()` exposes `plan`, `planConfig`, and `planConfig.nextPlanId`.

Best approach: open a small **"Upgrade your plan" modal** from the sidebar that previews the next plan tier and triggers the existing checkout flow — rather than dropping the user into Settings.

## Plan

### 1. New component: `UpgradePlanModal`
Location: `src/components/app/UpgradePlanModal.tsx`

- Built on existing `Dialog` primitives (matches `PlanChangeDialog` styling).
- Shows:
  - Title: "Upgrade your plan"
  - Current plan → next plan summary (name, monthly credits, price)
  - One primary CTA: "Continue to checkout" → triggers the same upgrade flow used in Settings (calls the existing `create-checkout` edge function via the same hook Settings uses).
  - Secondary: "See all plans" → navigates to `/app/settings` for users who want to compare.
  - "Go back" close button.
- If `planConfig.nextPlanId` is missing (already on top plan), don't render — sidebar would show "Top up" instead anyway.

### 2. Wire it into `CreditIndicator.tsx`
- Add local `useState` `upgradeOpen`.
- `handleCta`:
  - if `canUpgrade` → `setUpgradeOpen(true)` (instead of `navigate('/app/settings')`)
  - else → `openBuyModal()` (unchanged)
- Render `<UpgradePlanModal open={upgradeOpen} onClose={…} />` at the bottom of the component.

### 3. Reuse existing checkout logic
Inspect Settings page to find the exact hook/handler used for upgrade checkout (likely a `useCheckout` hook or inline `supabase.functions.invoke('create-checkout', …)`). Reuse the same call inside `UpgradePlanModal` so behavior, pricing, and Stripe flow stay identical.

### 4. No other changes
- No styling/logic changes to the credits card itself beyond the button handler.
- `PlanChangeDialog` stays untouched (still used in Settings for full upgrade/downgrade/cancel flows).

## Expected result

Clicking "Upgrade" in the sidebar opens a focused modal previewing the next tier with a single click to checkout — no full page navigation. "Top up" continues to open the existing credit pack modal.

