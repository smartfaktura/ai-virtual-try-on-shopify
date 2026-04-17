

## QA Report: Plans & Upgrade Flow (Bug-Focused, Round 3)

I traced the full flow end-to-end against current code. Result: **the upgrade flow is functional for new users**. No blockers, no broken interactions, no checkout issues. Found **1 logic inconsistency, 2 minor issues**, and one cosmetic dead code path.

---

### A. Critical Bugs (Must Fix)
**None.** New users can:
- Trigger upgrade (limit reached → `NoCreditsModal` → `UpgradePlanModal variant="no-credits"`) ✅
- Open upgrade modal from sticky bar, table CTA, or 0-credits trigger ✅
- Toggle monthly ↔ annual (price + savings update correctly) ✅
- Select a plan (radio state updates, Growth preselected) ✅
- Click "Continue to checkout" → `startCheckout` → Stripe redirect ✅
- All buttons fire correct handlers; no dead clicks; no infinite loading (fixed last round with `finally`).

---

### B. Functional Issues
**None.** Verified:
- Plan selection responds correctly (sticky bar popover, modal radio rows, table buttons all wired).
- Monthly/annual toggle in `BillingToggle` updates `billingPeriod` state, propagates to displayPrice everywhere.
- Modal close (X / Esc / backdrop) cleanly resets via `onOpenChange={onClose}` — no stuck state.
- Reopening the modal preserves the user's preselected plan correctly (Growth default).
- Switching plans repeatedly: `selectedPlanId` updates cleanly on each click.
- Switching monthly↔annual repeatedly: pricing recalculates each render; no stale display.
- `PlanChangeDialog` correctly receives `currentBalance` + formatted `periodEnd` + `hasActiveSubscription` (lines 818–820).

---

### C. Logic Errors

**C1. Dead code path in `getPlanCta` (line 330) — minor inconsistency**
After last round's edit, line 329 returns `Upgrade to ${p.name}` for any plan above current. The fallback on line 330 (`Choose ${p.name}`) is now **unreachable** because every plan is either current, free, lower (downgrade), or higher (upgrade) — the only case left would be `targetIdx === currentIdx && !isCurrent`, which is impossible since `PLAN_ORDER` indices are unique per planId.

Impact: zero (just dead code) — but also means the mobile sticky-bar shortener `if (label.startsWith('Choose '))` (line 770) is dead. Not a bug, just confusing for future maintenance.

**C2. Mobile sticky bar shortener still references obsolete `'Continue with Growth'` label (line 768)**
We removed the special-case Growth label from `getPlanCta` last round. So `label === 'Continue with Growth'` will never be true. Mobile users on free, viewing Growth in the sticky bar, now see `"Upgrade"` (from line 769) instead of the intended `"Get Growth"`. Conversion regression vs. last round's intent. Cosmetic, not a blocker — they still proceed correctly.

---

### D. Minor Issues

**D1. `PlanChangeDialog` "downgrade" mode has no `displayPrice` line in body** — purely cosmetic, dialog still confirms correctly.

**D2. `handleDialogConfirm` for cancel/reactivate routes through `openCustomerPortal()` — correct, but a brand-new free user (no Stripe customer) cannot trigger this path because Free row shows "Cancel plan" only when not on Free. ✅ no bug.

**D3. `current_period_end` formatting falls back to `'your next billing date'` if null — already handled in `PlanChangeDialog` line 95. Not a bug.

---

### E. Final Verdict

**Yes — the upgrade flow is functional.** A new user can go from "out of credits" → modal → plan selection → annual/monthly toggle → checkout redirect without any blocker. No critical bugs, no broken interactions, no missing functionality.

The only items worth fixing are **C1 + C2** (cleanup of obsolete label logic from last round). Both are 2-line edits, neither blocks conversion.

---

## Proposed Fixes (Optional Cleanup — Approve to Apply)

**`src/pages/AppPricing.tsx`**
1. **Line 768–771 (mobile sticky shortener)** — Add `Upgrade to Growth` → `Get Growth` mapping so free users see momentum-driving label:
   ```tsx
   if (label === 'Upgrade to Growth') return 'Get Growth';
   if (label.startsWith('Upgrade to ')) return 'Upgrade';
   ```
   Remove obsolete `'Continue with Growth'` line.

2. **Line 330 (dead code)** — Remove the unreachable `Choose ${p.name}` fallback in `getPlanCta`. Keep only the four real cases: current, canceling-current, free, downgrade, upgrade.

## Out of scope
- Pricing values, credit allocations, Stripe price IDs.
- Modal layout, table layout, sticky bar layout.
- Edge functions, RPCs, webhooks.

## Result
- Mobile sticky-bar CTA reflects intended "Get Growth" momentum copy for free users selecting Growth.
- `getPlanCta` no longer contains dead branches; codebase easier to maintain.
- No functional change to checkout, plan selection, or pricing logic.

