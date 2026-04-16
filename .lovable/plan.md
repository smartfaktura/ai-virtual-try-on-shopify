

## Problem

`UpgradePlanModal` returns `null` when the logged-in user has no higher tier available (line 41: `if (!upgradePlans.length) return null;`). On the admin showroom, you're likely on the top tier (or admin), so the dialog mounts but renders nothing — looks like the button is broken.

The admin page already has a "Preview as plan" selector but it's not wired into `UpgradePlanModal` (which reads `plan` from `useCredits()` directly).

## Fix

Add an optional `previewPlan` prop to `UpgradePlanModal` that overrides the user's real plan **for display only** — checkout still uses the real Stripe price IDs.

### 1. `src/components/app/UpgradePlanModal.tsx`
- Add prop: `previewPlan?: string`.
- Use `const effectivePlan = previewPlan ?? plan;` in the `upgradePlans` memo.
- Everything else stays identical (real checkout, real `startCheckout`).

### 2. `src/pages/AdminPlanPopups.tsx`
- Pass `previewPlan={previewPlan}` to the mounted `<UpgradePlanModal />`.
- Update the card's meta line from "Lists plans above current user's plan" to `Lists plans above previewPlan=${previewPlan}` so it's clear the global control drives it.

### 3. Same fix for `BuyCreditsModal` opening (optional, low effort)
Out of scope — `BuyCreditsModal` already shows all plans via tabs, so it works regardless of current plan.

## Expected result

- On admin page with "Preview as plan" = `free` → clicking Open shows Starter / Growth / Pro options.
- On admin page with "Preview as plan" = `pro` → clicking Open still shows nothing (correct — there's nothing above Pro). I'll add a small toast/note in that case so it's not silently dead: render a tiny dialog saying "No higher tier available for previewPlan=pro" instead of `null` when in admin preview mode.
- Production sidebar behavior is unchanged (no `previewPlan` passed → real plan used).

