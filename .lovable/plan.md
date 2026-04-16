

# Replace Redundant Credit Counts with Price-Per-Credit

## Problem
Both the modal and drawer already show credit counts prominently (in the credits pill / badge). The first checklist item ("500 credits every month") repeats this info. Better to show **price per credit** as the first differentiator — it's the actual value signal.

## Changes

### Both files: `NoCreditsModal.tsx` + `UpgradeValueDrawer.tsx`

Update `MODAL_PLAN_FEATURES` / `DRAWER_PLAN_FEATURES` — replace the first item in each plan:

| Plan | Old | New |
|------|-----|-----|
| Starter | 500 credits every month | 7.8¢ per credit |
| Growth | 1,500 credits every month | 5.3¢ per credit |
| Pro | 4,500 credits every month | 4.0¢ per credit |

The remaining 2 items stay unchanged:
- **Starter**: 3 Brand Profiles, Up to 100 products
- **Growth**: Priority generation queue, Brand Models · NEW
- **Pro**: Priority generation queue, Unlimited products & profiles

### Files changed
- `src/components/app/NoCreditsModal.tsx` — lines 30, 35, 40
- `src/components/app/UpgradeValueDrawer.tsx` — lines 29, 34, 39

