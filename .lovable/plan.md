

## Make "Upgrade to Growth" open the plan modal instead of navigating away

### Change

**File: `src/pages/BrandModels.tsx`** (line 63)

Replace the current button that navigates to `/pricing`:
```tsx
<Button size="lg" className="gap-2 px-8" onClick={() => window.location.href = '/pricing'}>
```

With one that opens the existing BuyCreditsModal via `useCredits().openBuyModal()`:
```tsx
const { openBuyModal } = useCredits();
// ...
<Button size="lg" className="gap-2 px-8" onClick={openBuyModal}>
```

This reuses the existing modal which already has the upgrade tab with plan cards, billing toggle, and PlanChangeDialog confirmation — no new components needed.

### Files to edit
- `src/pages/BrandModels.tsx` — Import `useCredits`, call `openBuyModal` in the `UpgradeHero` component

