

# Fix BuyCreditsModal — Tab Reset + Pro User Experience

## Problem
The `activeTab` state persists across modal open/close cycles (React `useState` only initializes once). A Pro user who was previously on the "Plans" tab gets stuck there when reopening — they see only their own Pro card with a disabled button. No top-up packs, no enterprise CTA, and no tab switcher (hidden for Pro users by design).

## Root Cause
Line 26: `useState<'topup' | 'upgrade'>(() => defaultTab)` — the initializer runs once on mount, not on every modal open.

## Fix

### File: `src/components/app/BuyCreditsModal.tsx`

**1. Reset activeTab when modal opens**
Add a `useEffect` that watches `buyModalOpen` and resets `activeTab` to the correct default:
```typescript
useEffect(() => {
  if (buyModalOpen) {
    setActiveTab(isFreeUser(plan) ? 'upgrade' : 'topup');
  }
}, [buyModalOpen, plan]);
```

**2. Force topup for Pro users**
Even if somehow `activeTab` is 'upgrade' for a Pro user, add a guard: if `isPro(plan)` and `activeTab === 'upgrade'`, force it to 'topup'. Or simpler — the useEffect above handles it since Pro defaults to 'topup'.

**3. Add "Compare all features" link to the topup tab footer (for Pro users)**
Below the Enterprise CTA, add a link to `/app/pricing` so Pro users can still browse plans if curious.

This is a small targeted fix — no layout redesign needed.

## Files Changed

| File | Change |
|------|--------|
| `src/components/app/BuyCreditsModal.tsx` | Add `useEffect` to reset `activeTab` on modal open; add footer link for Pro topup view |

