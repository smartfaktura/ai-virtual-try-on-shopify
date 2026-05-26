Unify the upgrade CTA on `/app/brand-scenes` to match `/app/brand-models`.

**Current state**
- Brand Models (`src/pages/BrandModels.tsx`, `UpgradeHero`) uses: `Upgrade to Growth` with a `Crown` icon on the left.
- Brand Scenes (`src/pages/BrandScenes.tsx`, `UpgradeBanner` and `UpgradeState`) uses: `Upgrade plan` with an `ArrowRight` icon on the right.

**Change**
In `src/pages/BrandScenes.tsx`, update both upgrade buttons to match Brand Models:
- Label: `Upgrade to Growth`
- Icon: `Crown` on the left (`w-4 h-4`)
- Keep existing `rounded-full font-semibold gap-2` classes
- Remove the trailing `ArrowRight` icon
- Add `Crown` to the lucide-react import; remove `ArrowRight` if no longer used elsewhere in the file (it is — keep it).

**Scope**
- One file: `src/pages/BrandScenes.tsx`
- Affects `UpgradeBanner` and `UpgradeState` button visuals only. No behavior change.