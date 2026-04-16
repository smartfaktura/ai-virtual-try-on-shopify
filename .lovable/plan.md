

# Add Product Limit Bullets to Growth & Pro Cards

## Changes

### All 3 files: `BuyCreditsModal.tsx`, `NoCreditsModal.tsx`, `UpgradeValueDrawer.tsx`

Add one extra bullet to Growth and Pro in `PLAN_DIFFERENTIATORS` / `DRAWER_PLAN_FEATURES`:

| Plan | New bullet |
|------|-----------|
| Growth | `Up to 250 products` |
| Pro | `Unlimited products` |

**BuyCreditsModal.tsx (lines 392-399):**
```
growth: [
  { text: 'Faster generation' },
  { text: 'Up to 250 products' },
  { text: 'Brand Models', badge: 'NEW' },
],
pro: [
  { text: 'Fastest generation' },
  { text: 'Unlimited products' },
  { text: 'Brand Models', badge: 'NEW' },
],
```

Same change in `NoCreditsModal.tsx` (lines 40-47) and `UpgradeValueDrawer.tsx` (lines 34-41).

## Files Changed

| File | Change |
|------|--------|
| `BuyCreditsModal.tsx` | Add product limit bullets to Growth & Pro |
| `NoCreditsModal.tsx` | Same |
| `UpgradeValueDrawer.tsx` | Same |

