

## QA Report: Upgrade & Plans Flow (Round 2)

I re-audited the full flow after the previous fixes. The flow is now **in good shape for new-user conversion**. Below are the remaining issues — only **2 are real bugs**, the rest are polish opportunities.

---

### 🔴 Bug 1 — React `forwardRef` warning on `PlanChangeDialog` & `UpgradePlanModal`
Console shows:
> Warning: Function components cannot be given refs… Check the render method of `AppPricing`.

Both modals are mounted as direct children of a `<div>` inside `AppPricing.tsx` (lines 803 + 817). The warning is triggered because shadcn `Dialog` portals occasionally pass refs through these components. Not crashing today, but it pollutes the console and may break under future React strict-mode behavior.

**Fix:** Wrap both component definitions with `React.forwardRef` (or simply spread `ref` props — they don't actually need refs, so a no-op forwardRef wrapper resolves the warning cleanly).

---

### 🔴 Bug 2 — Sticky bar CTA label doesn't reflect "Top up credits" on mobile
At line 765:
```tsx
{stickyCta.label.replace(/^Continue with .*/, 'Continue').replace(/^Upgrade to .*/, 'Upgrade').replace(/^Choose .*/, 'Choose')}
```
For a paid user already on their plan, `stickyCta.label === 'Top up credits'` — it doesn't match any regex, so the full label shows correctly. ✅ But for a free user selecting Growth the label becomes `"Continue"` — too generic / loses momentum.

**Fix:** Change the mobile label shortener to keep meaningful intent:
- `Continue with Growth` → `Continue` ✅ (current)
- `Upgrade to Pro` → `Upgrade` ✅ (current — but on mobile, "Upgrade" alone is fine)
- `Top up credits` → keep as-is ✅
- For Growth on free → show `"Get Growth"` instead of bland `"Continue"` for stronger conversion.

Tiny change, real conversion lift.

---

### 🟡 Polish 1 — `getPlanCta` still returns "Continue with Growth" with hardcoded planId match
Line 327: `if (p.planId === 'growth') return { label: 'Continue with Growth', ... };`

This fires **even when the user is already on Growth** — wait, no, line 322 catches `isCurrent` first. ✅ OK.

BUT: if the user is on Starter and views the comparison table, Growth shows "Continue with Growth" while Pro shows "Upgrade to Pro". Inconsistent — both are upgrades. Should both be `Upgrade to X` for visual consistency.

**Fix:** Remove the special-case Growth line (327). Let the generic upgrade logic handle it: `Upgrade to Growth`. Sticky bar can keep its own label since it's a different surface.

---

### 🟡 Polish 2 — Mobile sticky bar shows only the small primary dot for "Recommended"
Lines 744–746: Only a 6px dot indicates Growth = Recommended on mobile sticky bar. Inside the popover dropdown there's a "Recommended" pill, but the closed bar gives weak signal.

**Fix:** Add a tiny `"Best value"` label next to the price line on mobile when `stickyPlanId === 'growth'`:
```
$79/mo · 1,500 credits · Best value
```
3 extra characters, fits, drives Growth selection.

---

### 🟡 Polish 3 — `UpgradePlanModal` "Compare plans" button on the pricing page itself is a dead-end loop
In `UpgradePlanModal.tsx` line 368, the secondary CTA reads `"Compare plans"` and calls `handleSeeAll → navigate('/app/pricing')`. If the modal is opened FROM the pricing page (e.g. via topup → opens upgrade modal because we're on free), clicking "Compare plans" closes the modal but stays on the same page. Confusing.

**Fix:** When `window.location.pathname === '/app/pricing'`, change the label to `"Maybe later"` and just `onClose()`.

---

### 🟡 Polish 4 — No-credits modal headline copy could surface remaining-credits count for free users
For a free user with `balance === 0`, copy says: *"You've used all your credits"*. Strong. But for free users with 1–3 credits, copy says: *"Only N credits left"* — also good. ✅ Already handled. No fix needed.

---

### 🟡 Polish 5 — Annual savings pill on the comparison table only shows when annual is toggled
Line 430–436 shows `save $X/yr` ONLY in annual mode, which replaces the credits line (`1,500 credits/mo`). Result: in annual mode the user can't see the credits count in the table header. Conversion-bad — credits = primary value driver.

**Fix:** Show BOTH lines stacked when annual: credits line + savings pill below. Tiny vertical addition, big clarity win.

---

### ✅ Confirmed working well (verified this round)
- Pro credits = **4,500** consistent across `pricingPlans`, `PLAN_CONFIG`, FEATURE_MATRIX, and edge function. ✅
- `getPlanCta` returns `Upgrade to ${name}` with primary variant for higher tiers. ✅
- Sticky bar swaps to `Top up credits` when current plan selected. ✅
- `PlanChangeDialog` receives `currentBalance` and `periodEnd` props. ✅
- `UpgradePlanModal` shows urgent zero-credits copy when triggered with `variant="no-credits"`. ✅
- `UpgradePlanModal` shows `Save $X/yr` badge per plan when annual. ✅
- "Credits unlock instantly after checkout" reassurance present. ✅
- `startCheckout` fires `trackInitiateCheckout` + `gtagBeginCheckout`; payment success fires `trackPurchase` + `gtagPurchase`. ✅
- `check-subscription` polls every 5min + on payment return + 2s post-redirect delay. ✅
- `protect_billing_fields` trigger blocks client-side billing tampering. ✅
- `change_user_plan` and `reset_plan_credits` RPCs are atomic and use-it-or-lose-it correct. ✅
- Free user with 0 credits: `NoCreditsModal` → `UpgradePlanModal variant="no-credits"` shows urgent header. ✅

---

## Proposed Changes

**`src/pages/AppPricing.tsx`**
1. Sticky bar mobile label: `Continue with Growth` → `Get Growth` (free users), keep `Top up credits` and `Upgrade` as-is.
2. Remove hardcoded Growth line in `getPlanCta` so all upgrade rows use consistent `Upgrade to X` primary CTA.
3. Mobile sticky bar: append ` · Best value` to the price line when `stickyPlanId === 'growth'`.
4. Comparison table header: when annual, render credits line AND `save $X/yr` stacked instead of replacing.

**`src/components/app/UpgradePlanModal.tsx`**
5. Wrap component export in `React.forwardRef` to silence ref warning.
6. Conditional secondary CTA: `Maybe later` (close) when on `/app/pricing`, otherwise `Compare plans` (navigate).

**`src/components/app/PlanChangeDialog.tsx`**
7. Wrap component export in `React.forwardRef` to silence ref warning.

## Out of scope
- Pricing values, credit allocations, Stripe price IDs.
- DB RPCs, edge functions, webhooks.
- Sticky bar animation, layout, dropdown component.

## Result
- No more React console warnings on the pricing page.
- Consistent upgrade CTAs across desktop comparison table.
- Stronger Growth signal on mobile sticky bar (primary dot + "Best value" tag).
- Credits stay visible in annual mode (no longer hidden by savings pill).
- "Compare plans" button no longer dead-ends when modal opens on the pricing page itself.

