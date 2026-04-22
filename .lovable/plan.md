

## Fix sub-category scene reordering + add "Move to top" button

### Why reorder feels broken in Apparel → Creative Shots

The arrow click *does* swap `sort_order` in the database, but two things make it look like nothing happened:

1. **The whole category card jumps to the top of the page** after every click. `groupedEntries` (in `src/pages/AdminProductImageScenes.tsx`, ~line 262) sorts categories by `latestUpdatedAt DESC`. Each move bumps `updated_at`, so Clothing & Apparel re-sorts to position #1 and the page scrolls/repaints around the user — it looks like the move was reverted.
2. **All 14 Creative Shots scenes share `sub_category_sort_order = 0`** and have sequential `sort_order` (999–1012). The swap works, but only adjacent scenes ever change — there's no way to send a scene from #14 to #1 without 13 clicks.

### Changes (single file: `src/pages/AdminProductImageScenes.tsx`)

**1. Stop categories from jumping on every edit**  
In `groupedEntries` sort, drop `latestUpdatedAt` as the primary key. Sort categories by `categorySortOrder` only (stable position). The "recently edited" behavior is what makes reorder feel reverted.

**2. Sort scenes inside each sub-group explicitly by `sort_order`**  
In `groupBySubCategory` (line 154), sort each sub-group's `scenes` array by `sort_order` ascending before returning. This guarantees the rendered order always matches what `handleMove` operates on, even if upstream order changes.

**3. Add a "Move to top of sub-category" arrow per scene row**  
Add a third icon button (double-up arrow, `ChevronsUp` from lucide) next to the existing ↑ ↓ in `SceneRow` (line 730 area). Clicking it calls a new `handleMoveToTop(scene)`:
- Compute the current sub-group sorted by `sort_order`.
- Set the clicked scene's `sort_order` to `min(sort_order) - 1` (or re-index the whole sub-group sequentially with the clicked scene at index 0 if values overlap).
- Single `updateScene.mutateAsync` call → React Query invalidates → list re-renders with the scene at the top.
- Disabled when already at index 0.

### Validation
- `/app/admin/product-image-scenes` → Clothing & Apparel → Creative Shots → click ↑ on `Urban NYC Street`: it swaps with `Fisheye Portrait`, the **category stays in place** (no jump to top of page).
- Click the new double-up arrow on `Skatepark Golden Hour` (last item): it moves to position #1 of Creative Shots in one click.
- Other categories' positions are unchanged across edits.

### Out of scope
- Sub-category-level reordering (already works via the existing arrows next to the sub-category label).
- Drag-and-drop UI.
- Schema changes — `sort_order` column already exists.

