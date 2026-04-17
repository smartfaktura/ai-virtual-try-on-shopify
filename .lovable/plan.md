

## QA Report: Upgrade & Plans Flow

I audited the full subscription flow end-to-end: pricing page, comparison table, sticky bar, upgrade modal, no-credits modal, top-up flow, plan-change dialog, checkout edge function, and credit/subscription syncing. Overall the flow is **solid and conversion-ready**, but there are **5 real bugs and 3 UX gaps** that will hurt new-user conversion. Listing in priority order.

---

### 🔴 Bug 1 — Mismatched credit count for "Pro" (data integrity)
- `pricingPlans` (mockData.ts:1493) and `check-subscription` (line 29) both say Pro = **4,500 credits**.
- `PLAN_CONFIG` in `CreditContext.tsx:21` says Pro = **4,500** ✅ (matches now)
- BUT the comparison table feature matrix (`AppPricing.tsx:79`) displays Pro = **"5,000"**.
- And Free row says **"20"** which matches data, but the FAQ + "How credits work" copy implies different costs.

**Fix:** Change FEATURE_MATRIX "Monthly credits" Pro cell from `'5,000'` → `'4,500'`.

---

### 🔴 Bug 2 — `getPlanCta` returns wrong CTA when user is on a paid plan looking at a HIGHER plan that isn't Growth
At `AppPricing.tsx:320–329`, for paid users (e.g. Starter user looking at Pro), the CTA returns `Choose Pro` with `variant: 'outline'`. It should show **`Upgrade to Pro`** with `variant: 'default'` (primary) so the upgrade path is visually obvious. Currently the upgrade button looks identical to a downgrade button — terrible for conversion.

**Fix:** When `targetIdx > currentIdx`, return `{ label: 'Upgrade to ${name}', variant: 'default' }`.

---

### 🔴 Bug 3 — Sticky bar CTA on a free user shows "Continue with Growth" even after they pick Starter or Pro
The sticky bar uses `getPlanCta(stickyPlan)` which hardcodes `'Continue with Growth'` only for the Growth planId (line 327). For Starter/Pro it falls through to `'Choose Starter'` / `'Choose Pro'` which is fine, BUT for a Pro current user looking at the sticky bar, it shows `'Current plan'` disabled — bar becomes useless. The bar should auto-skip to a top-up CTA in that case.

**Fix:** When `stickyPlan.planId === plan` (current), swap CTA to **"Top up credits"** that opens the topup modal.

---

### 🟡 Bug 4 — `PlanChangeDialog` "downgrade to Free" path is broken
In `handlePlanSelect` (line 336): `if (p.planId === 'free') setDialogMode('cancel')` — good. But then `handleDialogConfirm` (line 305) calls `openCustomerPortal()` which requires an existing Stripe customer. For a user who already churned and is back on Free, clicking "Cancel plan" on the Free row (which would be disabled by `isCurrent` so this is fine actually) — but for a Starter user clicking Free, it sends them to portal correctly. ✅ Actually OK on re-read.

**Real issue:** The `PlanChangeDialog` 'cancel' mode shows `currentBalance` and `periodEnd` but `AppPricing.tsx` doesn't pass either prop (lines ~750+ I didn't fully view, but no `currentBalance=` / `periodEnd=` in the search results). The dialog will display "your remaining 0 credits" and "your next billing date" placeholder. Cosmetic but unprofessional.

**Fix:** Pass `currentBalance={balance}` and `periodEnd={currentPeriodEnd?.toLocaleDateString()}` to `PlanChangeDialog`.

---

### 🟡 Bug 5 — `UpgradePlanModal` "no-credits" variant for a Pro user falls through silently
`UpgradePlanModal.tsx:106` — if `!isTopup && !upgradePlans.length` and no `previewPlan`, returns `null`. For a Pro user who hits zero credits, `variant='no-credits'` is passed; `isTopup` becomes `true` (line 90, because `upgradePlans.length === 0`), so it DOES show top-up. ✅ Actually works.

But the **header copy** for that case still says `"Top up your credits"` instead of something more urgent like `"You've used all your credits — top up to keep going"`. Conversion miss.

**Fix:** In `getCopy`, if `variant === 'no-credits' && isTopup`, return urgent copy with the user's plan name.

---

### 🟡 UX Gap 1 — No visible "What happens after I pay?" reassurance
The `UpgradePlanModal` shows "Cancel anytime · No commitment" + lock icon. Good. But a new user has no idea **when credits arrive** after Stripe. The flow does work (check-subscription polls + 2s delay + toast on `?payment=success`), but the modal doesn't tell them. Add: *"Credits unlock instantly after checkout"*.

---

### 🟡 UX Gap 2 — Annual savings math is shown only on monthly toggle for upgrade modal
The `UpgradePlanModal` price display shows `${displayPrice}/mo` whether monthly or annual. When annual is selected, no "save $X/yr" badge appears next to the plan (only the global `−20%` toggle hint). The pricing page itself shows `save $X/yr` per plan — the modal should mirror this so annual feels like a deal.

**Fix:** Add `save $X/yr` badge on plan rows when `isAnnual`.

---

### 🟡 UX Gap 3 — `create-checkout` edge function doesn't pass `client_reference_id`
Currently passes `metadata: { user_id }` ✅. But Stripe webhooks/manual reconciliation are easier with `client_reference_id: userId`. Optional polish — not blocking.

---

### ✅ What's working well
- Polling fulfillment via `check-subscription` (5-min interval + on payment return) is robust.
- `change_user_plan` + `reset_plan_credits` RPCs handle plan changes and rollover correctly.
- `protect_billing_fields` trigger prevents client tampering with credits/plan/subscription.
- `PlanChangeDialog` correctly routes upgrades to checkout vs portal based on `subscriptionStatus`.
- `GlobalUpgradeModal` auto-switches between upgrade and topup based on plan.
- Pixel tracking (`trackInitiateCheckout` / `trackPurchase`) fires on the right events.
- Sticky bar, plan picker popover, and comparison table are well structured and responsive.

---

## Proposed Changes (5 files)

1. **`src/pages/AppPricing.tsx`**
   - Fix FEATURE_MATRIX Pro credits row: `'5,000'` → `'4,500'`.
   - Update `getPlanCta`: paid user looking at higher plan → `Upgrade to ${name}` + `variant: 'default'`.
   - Update sticky bar CTA logic: when selected plan === current plan, swap to "Top up credits" → opens `topupOpen` modal (existing state).
   - Pass `currentBalance={balance}` and `periodEnd={currentPeriodEnd?.toLocaleDateString()}` to `PlanChangeDialog`.

2. **`src/components/app/UpgradePlanModal.tsx`**
   - In `getCopy`, when `variant === 'no-credits' && isTopup`, return urgent zero-credits copy.
   - Add `save $X/yr` badge per plan row when `isAnnual` is true.
   - Add reassurance line under trust block: *"Credits unlock instantly after checkout."*

## Out of scope
- Changing pricing amounts, credit allocations, or Stripe price IDs.
- Refactoring `check-subscription` or DB RPCs.
- Adding webhooks (current polling pattern is intentional per memory).

## Result
- Data consistency restored (Pro = 4,500 everywhere).
- Visually obvious upgrade CTAs (no more outline-style "Choose Pro" hiding the conversion path).
- Sticky bar always actionable, even for top-tier users.
- Plan-change dialog shows accurate balance + billing date.
- Zero-credits modal copy creates urgency instead of feeling like a generic top-up nudge.
- Annual feels like a real deal in the upgrade modal.

