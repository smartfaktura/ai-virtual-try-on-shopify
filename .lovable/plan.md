Fix: feature-gate "Upgrade plan" buttons (Brand Scenes, Brand Models) currently open the top-up packs modal instead of the plan upgrade picker for Starter users — they need to move to Growth/Pro, not buy credit packs.

**Root cause**

The earlier change made `GlobalUpgradeModal` always show `variant='topup'` for any paid plan. That works for the sidebar "Get credits" CTA, but breaks gated-feature CTAs that share the same `openBuyModal()` trigger.

Affected call sites (already pass distinguishable source strings):
- `src/pages/BrandScenes.tsx` → `openBuyModal('brand-scenes-gate')` (×2)
- `src/pages/BrandModels.tsx` `UpgradeHero` → `openBuyModal()` — needs source

**Change**

1. `src/components/app/GlobalUpgradeModal.tsx`: read `buyModalSource` from `useCredits()` and treat any source ending with `-gate` as a feature-unlock trigger → force `variant='auto'` (upgrade picker) regardless of current plan. Other sources keep current rule (free → upgrade, paid → top-up).
2. `src/pages/BrandModels.tsx`: pass `openBuyModal('brand-models-gate')` so the gate matches the rule.

No DB, Stripe, or pricing changes.