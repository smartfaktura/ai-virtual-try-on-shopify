

# Slim Down Plan Feature Checklists

## Problem
3 checklist lines per plan card makes the drawer too tall to fit on one page. "3 Brand Profiles" and "Up to 100 products" aren't compelling differentiators.

## Solution
Reduce to **2 lines per plan** in both `UpgradeValueDrawer.tsx` and `NoCreditsModal.tsx`:

| Plan | Line 1 | Line 2 |
|------|--------|--------|
| Starter | 7.8¢ per credit | Up to 100 products |
| Growth | 5.3¢ per credit | Brand Models · NEW |
| Pro | 4.0¢ per credit | Unlimited products & profiles |

Removes "3 Brand Profiles" entirely and "Priority generation queue" from Growth/Pro (since the credits pill + savings badge already distinguish tiers).

### Files
- `src/components/app/UpgradeValueDrawer.tsx` — trim `DRAWER_PLAN_FEATURES`
- `src/components/app/NoCreditsModal.tsx` — trim `MODAL_PLAN_FEATURES`

