Remove the dashed "New brand model" placeholder tile from the model grid on `/app/models` (BrandModels page).

**Context**
- The Brand Models page (`src/pages/BrandModels.tsx`) currently shows a dashed-border tile as the first item in the model grid with a "+" icon and "New brand model" label (lines ~1360–1369).
- There is already a primary "New brand model" button in the top-right page header action area (lines ~1285–1291).
- The duplicate tile adds clutter since the primary CTA is already visible.

**Change**
- In `src/pages/BrandModels.tsx`, remove the dashed `<Link>` tile that renders before the `models.map()` list inside the grid.
- Keep the top-right header button and all other UI unchanged.

**Scope**
- One file: `src/pages/BrandModels.tsx`
- No backend, no other pages touched.