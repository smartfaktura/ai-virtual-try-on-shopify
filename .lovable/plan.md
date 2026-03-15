

## Fix Admin Scenes: Arrows, Category Change, Category Reorder

### Problem 1: Arrows not working
The `movePose` function works correctly, but the `allPoses` useMemo depends on `filterVisible` — a function recreated every render. This causes `allPoses` to recompute on every render, triggering the `useEffect` that resets `orderedPoses` back, wiping out the swap immediately.

**Fix**: Remove `filterVisible` and `mockTryOnPoses` from useMemo deps (they're stable references or module-level constants). Use a ref-based approach or stabilize with `useCallback` in the hook side. Simplest fix: compute `allPoses` once using a ref to track initialization, and only reset when `sortMap`, `hiddenIds`, or `customPoses` actually change (use their serialized values as deps).

### Problem 2: Change a scene's category
Add a category dropdown (Select) to each scene row. When changed, update the local `orderedPoses` state with the new category. For custom scenes, this will be persisted on save. For built-in scenes, store category overrides in a new column on `scene_sort_order` (add `category_override TEXT` column).

### Problem 3: Reorder categories themselves
Add up/down arrows next to each category header so admins can change the display order of entire category sections. Store category order in localStorage or a simple DB approach. Simplest: maintain a local `categoryOrder` state array and persist it alongside the scene sort order.

### Changes

**`src/pages/AdminScenes.tsx`**

1. **Fix arrow swap bug**: Replace unstable `filterVisible` dep — compute visible poses directly using `hiddenIds` array as the dependency instead of the function reference.
2. **Add category selector per scene**: Add a small `<Select>` dropdown showing all categories. On change, update the pose's category in `orderedPoses` state and mark dirty. Store category overrides in sort order save.
3. **Add category section reorder**: Add up/down arrows on each category header. Maintain a `categoryOrder` state array. Swap categories on arrow click. Persist order to `scene_sort_order` or localStorage.

**`src/hooks/useSceneSortOrder.ts`**

- Update save mutation to also store `category_override` if provided.

**Database migration**

- Add `category_override TEXT` nullable column to `scene_sort_order` table for scenes moved to a different category.

### Files modified
| File | Change |
|---|---|
| `src/pages/AdminScenes.tsx` | Fix deps bug, add category selector per scene, add category reorder arrows |
| `src/hooks/useSceneSortOrder.ts` | Support category override in save/fetch |
| Migration | Add `category_override` column to `scene_sort_order` |

