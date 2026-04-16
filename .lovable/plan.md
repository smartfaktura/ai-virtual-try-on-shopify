

## Goal

Make `UpgradePlanModal` the single source of truth for all "buy/upgrade/top-up/out-of-credits" surfaces, with polished copy, Recommended badge, mobile centering with rounded edges and side spacing.

## Discovery (during implementation)

Grep all callers of `openBuyModal`, `BuyCreditsModal`, `NoCreditsModal` and redirect them to `UpgradePlanModal`.

## A. `UpgradePlanModal.tsx` polish

**Dynamic title/subtitle** based on `effectivePlan` + `balance` + `variant`:

| State | Title | Subtitle |
|---|---|---|
| Free, balance ≥ 4 | Choose a plan to keep creating with VOVV | Create more visuals, faster — with better value on larger plans |
| Free, balance 1–3 | Only {balance} credits left | Pick a plan to keep your visuals flowing |
| Free, balance 0 | You've used all your credits | Choose a plan to keep creating with VOVV |
| Paid upgrading (starter/growth) | Upgrade your plan | Unlock more credits and faster output each month |
| Pro top-up variant | Top up your credits | Add credits instantly — no plan change needed |

**Recommended badge**
- Find Growth in `upgradePlans` → render **"Recommended for You"** pill with `bg-primary text-primary-foreground` instead of the existing `MOST POPULAR` badge.
- Preselect Growth by default (currently picks first/Starter).

**Copy cleanup**
- Remove: `Estimates based on ~5 credits per standard image.`
- Add centered below cards: `Cancel anytime · No commitment` (`text-xs text-muted-foreground`).
- Keep the lock/redirect line.

**Top-up variant** (new `variant="topup"` prop)
- Reuses same modal shell (header, footer, trust line) but renders **credit pack cards** from `BuyCreditsModal`'s topup tab instead of plan cards.
- So Pro users see the same compact, centered, rounded modal — just with credit packs.

## B. Mobile + centering fixes (applies via `dialog.tsx` since it's the shared shell)

Current `DialogContent` (line 41 of `dialog.tsx`):
- Mobile: `top-[5%]` + full-width + no rounding → looks like a sheet stuck to top.

**Fix in `dialog.tsx`** (affects all modals consistently — your stated goal):
- Center vertically on all sizes: `top-[50%] translate-y-[-50%]`.
- Add side spacing on mobile: `w-[calc(100%-2rem)]` + `mx-auto` so the modal floats with ~1rem gap each side.
- Always rounded: `rounded-2xl` (matches platform elements).
- Cap max-height: `max-h-[calc(100vh-2rem)]` with `overflow-y-auto`.

This single change unifies modal behavior across the app.

## C. Wire all entry points to `UpgradePlanModal`

1. **`CreditIndicator.tsx`** Pro path → open `UpgradePlanModal` with `variant="topup"` instead of `openBuyModal()`.
2. **`Dashboard.tsx`** "Get Credits" banner → open `UpgradePlanModal` instead of `openBuyModal()`.
3. **`CreditContext.tsx`** → repoint global `openBuyModal()` to control `UpgradePlanModal` (keep API name for backward compat).
4. **`App.tsx`** → mount `<UpgradePlanModal />` globally; remove (or stop using) global `<BuyCreditsModal />`.
5. **`NoCreditsModal.tsx`** → delegate body to `<UpgradePlanModal variant="no-credits" />`. Keep the post-gen trigger logic intact.
6. Grep for any remaining `BuyCreditsModal` / `openBuyModal` callers and redirect.

`BuyCreditsModal.tsx` file stays in place (not deleted) but becomes unused — safe cleanup later.

## Files to edit

- `src/components/ui/dialog.tsx` (mobile centering, rounded edges, side spacing — global)
- `src/components/app/UpgradePlanModal.tsx` (copy logic, badge, topup variant, trust line, preselect Growth)
- `src/components/app/CreditIndicator.tsx`
- `src/contexts/CreditContext.tsx`
- `src/App.tsx`
- `src/pages/Dashboard.tsx`
- `src/components/app/NoCreditsModal.tsx`
- Any other call sites discovered via grep

## What stays unchanged

- `pricingPlans` data, Stripe checkout flow, credit pack data, sidebar layout, RLS, edge functions.
- `UpgradePlanModal` width stays compact (`max-w-lg`).

## Expected result

Every "buy/upgrade/top up/out of credits" surface opens the **same compact, centered, rounded UpgradePlanModal** with state-aware title/subtitle, Growth preselected with a primary "Recommended for You" badge, and "Cancel anytime · No commitment" reassurance. Mobile modals are centered with side spacing and rounded corners, matching the rest of the platform.

