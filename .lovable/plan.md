

# Catalog Cleanup — Delete Old Steps & Update Summary

## Files to Delete
1. `src/components/app/catalog/CatalogStepPoses.tsx`
2. `src/components/app/catalog/CatalogStepExpression.tsx`
3. `src/components/app/catalog/CatalogStepStyleShots.tsx`
4. `src/components/app/catalog/CatalogStepStyle.tsx`
5. `src/components/app/catalog/CatalogStepProductsModels.tsx`

## File to Update
**`src/components/app/CatalogMatrixSummary.tsx`** — Replace the old Products × Models × Poses × Backgrounds matrix display with the new flow: Products × Shots = N images. Remove pose/background count chips and show a simpler summary matching the 5-step Seedream pipeline.

## Verification
- Confirm no remaining imports reference the 5 deleted files anywhere in the codebase.
- Ensure `CatalogGenerate.tsx` and any other consumers only use the new V2 step components.

