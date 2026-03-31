

# Simplify Style Shots — Remove Customize, Keep Only Extra Products

## What changes

1. **Delete `CatalogShotStyler.tsx`** — the "Customize Shot" dialog (override pose/background/framing/custom instructions) is removed entirely.

2. **Remove `shotOverrides` state** from `CatalogGenerate.tsx` and the `ShotOverride` type references from `useCatalogGenerate.ts`. The generation hook will no longer apply per-combo overrides.

3. **Simplify `CatalogStepStyleShots.tsx`**:
   - Remove all `shotOverrides` props and the "Customize" button from each combo row
   - Remove `CatalogShotStyler` import and dialog rendering
   - Keep: "Apply to All" bar + per-combo "+ Add" product picker
   - Make the "+ Add" button more visible (larger, with icon)

4. **Clean up `CatalogStepStyle.tsx`** — remove its `shotOverrides` props and the matrix override icons since that component also references `CatalogShotStyler`.

5. **Clean up `useCatalogGenerate.ts`** — remove the `override` logic (pose/background/framing/customPrompt per combo). Keep `extraItems` logic.

## Files to modify

| Action | File |
|--------|------|
| Delete | `src/components/app/catalog/CatalogShotStyler.tsx` |
| Update | `src/components/app/catalog/CatalogStepStyleShots.tsx` — remove override props/UI, keep extras only |
| Update | `src/components/app/catalog/CatalogStepStyle.tsx` — remove override props/UI |
| Update | `src/pages/CatalogGenerate.tsx` — remove `shotOverrides` state and props |
| Update | `src/hooks/useCatalogGenerate.ts` — remove `ShotOverride` import and override logic |

