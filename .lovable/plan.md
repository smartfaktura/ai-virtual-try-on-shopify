

# Brand Models Plan Gate & Cross-App Audit

## Current State

Brand models (`user_models` table) are used in:
1. **BrandModels page** (`src/pages/BrandModels.tsx`) — creation + management, gated behind `isPaid` check
2. **ModelSelectorChip** (`src/components/app/freestyle/ModelSelectorChip.tsx`) — freestyle prompt bar model picker, shows user models with "Brand" badge
3. **GenerateModelModal** (`src/components/app/GenerateModelModal.tsx`) — upload-based model creation (older flow)

**Gap identified**: When a user downgrades from Pro/Growth to Free, their brand models still appear fully clickable in the ModelSelectorChip (freestyle). The BrandModels page shows the upgrade hero, but the models remain selectable elsewhere.

## Plan

### 1. Lock Brand Models in ModelSelectorChip When Not on Paid Plan

In `ModelSelectorChip.tsx`:
- When `isPaidPlan` is `false`, render user model cards with a greyed-out overlay (`opacity-50 grayscale`) and make them non-clickable
- On click, show a toast: "Upgrade to Growth or Pro to use your Brand Models"
- Keep the models visible so users see what they had (incentive to re-subscribe)

### 2. Lock Brand Models in Workflow/TryOn Model Selectors

Search for any other model selector usage (workflow settings panel, try-on settings) and apply the same lock pattern — grey out + upgrade message when not on a paid plan.

### 3. BrandModels Page — Show Locked Model Grid for Downgraded Users

Currently if `!isPaid`, the page shows only `UpgradeHero` and hides all models. Instead:
- Always show the models grid below `UpgradeHero` when models exist
- Render each model card greyed out with a lock overlay and "Upgrade to unlock" text
- This reminds users what they built and motivates re-subscription

## Files Changed

| File | Change |
|------|--------|
| `src/components/app/freestyle/ModelSelectorChip.tsx` | Grey out + disable user model cards when `!isPaidPlan`, show upgrade toast on click |
| `src/pages/BrandModels.tsx` | Show locked model grid below UpgradeHero for downgraded users who have existing models |

No database or edge function changes needed.

