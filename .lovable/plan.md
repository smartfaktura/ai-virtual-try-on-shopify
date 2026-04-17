

## Goal
Fix the 2 critical bugs (A1, A2) and 2 should-fix issues (B2, C2) identified in the QA. All other findings are minor polish / out of scope.

## Files
- `src/pages/AppPricing.tsx`
- `src/components/app/UpgradePlanModal.tsx`

## Changes

### 1. `AppPricing.tsx` — Fix A2: stuck "Redirecting…" loading state
Change `handleDialogConfirm` from `catch { setLoading(false) }` to `finally { setLoading(false) }`. Both portal and checkout redirect via `window.location.href` — resetting on success is harmless because the page is already navigating away.

### 2. `AppPricing.tsx` — Fix A1: Enterprise users see broken sticky bar
Update `defaultStickyPlanId`:
```tsx
const defaultStickyPlanId = useMemo(() => {
  if (isFreeUser) return 'growth';
  // If current plan isn't in the picker (e.g. enterprise), fall back to Pro
  if (!mainPlans.find(p => p.planId === plan)) return 'pro';
  return plan;
}, [plan, isFreeUser, mainPlans]);
```

### 3. `AppPricing.tsx` — Fix B2: Fragment key warnings inside `<tbody>`
Replace `<>...</>` with `<React.Fragment key={group.title}>...</React.Fragment>` in the FEATURE_MATRIX map (line 452–473). Add `import { Fragment } from 'react'`.

### 4. `UpgradePlanModal.tsx` — Fix C2: Annual toggle not syncing with user's actual billing interval
Add a `useEffect` to keep `isAnnual` in sync with `billingInterval` when it loads:
```tsx
useEffect(() => {
  if (billingInterval) setIsAnnual(billingInterval === 'annual');
}, [billingInterval]);
```

## Out of scope (per QA)
- C1, D1–D4 — minor polish items deferred.
- Dashboard `DiscoverCard` forwardRef warning (separate from pricing flow).

## Result
- No more stuck "Redirecting…" loops on dialog confirm.
- Enterprise users see a usable sticky bar with Pro preselected.
- Console no longer warns about missing keys on `<tbody>` fragments.
- Annual subscribers see the annual toggle preselected when reopening the upgrade modal.

