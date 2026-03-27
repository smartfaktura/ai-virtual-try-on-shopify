
Goal: restore strict workflow behavior so:
1) Mirror Selfie Set shows only its built-in workflow scenes
2) Product Listing Set shows only product-scene library items (including custom admin scenes like Skyline Laundry)

What I found
- The dynamic scene injection in `src/pages/Generate.tsx` currently runs for almost all scene workflows except a few name checks.
- Mirror Selfie is currently getting injected because it has `uses_tryon: false`, so it does not hit the skip condition.
- Product Listing currently injects all custom scenes, including on-model ones, which causes unrelated scenes to appear.

Implementation plan

1) Make scene injection workflow-specific (whitelist, not broad rules)
- File: `src/pages/Generate.tsx`
- Change the merge gate so dynamic library injection runs only for `Product Listing Set` (prefer slug check: `product-listing-set`).
- For every other workflow (including `mirror-selfie-set`), return DB `variation_strategy` unchanged.

2) Enforce product-only filtering for injected scenes
- File: `src/pages/Generate.tsx`
- Keep a single predicate for “product scene” = category not in on-model set (`studio`, `lifestyle`, `editorial`, `streetwear`).
- Apply this predicate to both built-in library scenes and custom admin scenes before merge.
- Keep dedupe against existing DB variation labels so built-in workflow scenes are not duplicated.

3) Preserve existing behavior everywhere else
- Do not change Freestyle picker logic or Creative Drop wizard in this pass (your report says only workflow scene lists are wrong now).
- No database or backend function changes required.

Technical details
- Primary edit area: the `variationStrategy` `useMemo` in `Generate.tsx` (around current merge logic near lines ~430-458).
- Replace current condition:
  - from: broad exclusion checks (`Flat Lay`, `Interior`, `uses_tryon`)
  - to: explicit inclusion check (`activeWorkflow?.slug === 'product-listing-set'`)
- Build injected list with:
  - `allLibraryScenes = sortScenes(applyCategoryOverrides([...filterVisible(mockTryOnPoses), ...customPoses]))`
  - `productLibraryScenes = allLibraryScenes.filter(isProductScene)`
  - merge only these into Product Listing Set.

Validation checklist (after implementation)
1) `/app/generate/product-listing-set`:
- Skyline Laundry is visible
- only product-scene categories appear (no on-model scenes)

2) `/app/generate/mirror-selfie-set`:
- only workflow’s built-in mirror environments appear
- no injected product library scenes

3) Quick regression:
- Selfie / UGC Set unchanged
- Flat Lay Set unchanged
- Interior / Exterior Staging unchanged
