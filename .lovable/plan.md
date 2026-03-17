

## Increase Flat Lay Surface Limit and Adjust Credit Scaling

### Problem
1. **Only 1 image generated** — The user selected multiple *products* but only 1 *surface*, so only 1 image was created. The number of images = number of surfaces selected, not number of products.
2. **Max 3 surfaces** — `PAID_SCENE_LIMIT = 3` caps all paid workflows at 3 surfaces/scenes per generation. The user wants more for flat lay.
3. **Credit scaling** — Currently there's a +2 credits per extra product per image. The user wants this to be clearer and scale properly.

### Changes

**File: `src/components/app/generate/WorkflowSettingsPanel.tsx`**

- Add a new constant `FLAT_LAY_SURFACE_LIMIT = 6` (or similar) to allow flat lay to select more surfaces than the standard `PAID_SCENE_LIMIT = 3`.
- In the surface selection click handler (line ~362-369), use `FLAT_LAY_SURFACE_LIMIT` when `isFlatLay` instead of `PAID_SCENE_LIMIT`.
- Update the "Select All" / "Deselect All" button (line ~280) to use the flat lay limit when applicable.

**File: `src/pages/Generate.tsx`**

- Update the credit calculation (lines 1559-1567) to make flat lay credits scale more clearly:
  - Base: `workflowImageCount × 8` (per surface)
  - Extra products: `extraProductCount × 2 × workflowImageCount` (already exists, keeps working)
- The credit display in the generate button should show the breakdown (e.g., "24 credits — 3 surfaces × 2 products").

### Credit Example
- 1 product, 1 surface = 8 credits
- 2 products, 1 surface = 8 + 2 = 10 credits  
- 2 products, 3 surfaces = 24 + 6 = 30 credits
- 3 products, 6 surfaces = 48 + 24 = 72 credits

### Summary
Single constant change + selection logic update in WorkflowSettingsPanel, no changes to edge functions or credit deduction logic (the extra product credit calc already works correctly).

