

## Remove "Freestyle Originals" merge from the Scene modal

The admin-curated `custom_scenes` rows are already represented inside the main catalog (`product_image_scenes`), so prepending them caused duplicates. Drop the merge entirely.

### Change

File: `src/components/app/freestyle/SceneCatalogModal.tsx`

- Remove the `originalScenes` adaptation from `useCustomScenes()`.
- Remove the logic that prepends `originalScenes` to the first page of the grid (the `canMergeOriginals` branch).
- Render `grid.data?.pages` directly — the catalog returns its own ordered results for both Recommended and Newest sorts.
- Keep `useCustomScenes` available only where it's still needed for resolving `cs-` selection IDs (if used elsewhere). If the import becomes unused after the merge logic is removed, drop it from this file.

### Untouched

- "Recommended for you" carousel (per-onboarding-category) stays as-is above the grid in the default view.
- Subject chip mutual exclusion, sort options, filter sidebar, admin pages, generation pipeline, DB — all unchanged.

### Validation

- Open Scenes modal → only **Recommended for you** rail + **Freestyle Scenes** grid. No duplicated admin-curated tiles at the top of the grid.
- Switching sort to **Newest** shows pure `created_at DESC` (already correct, now verifiably clean).
- Picking any scene still generates correctly (catalog rows route through the standard pipeline).

