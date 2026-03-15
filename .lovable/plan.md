

## Fix: Category Order Not Persisting After Save

### Root Cause
The `categoryOrder` state is always initialized from `defaultCategoryOrder` (hardcoded from `poseCategoryLabels` keys). After saving, the query invalidates, `allPoses` recomputes, and the `useEffect` resets `orderedPoses` — but `categoryOrder` is never derived from the saved data. It always resets to the default order.

### Solution
Derive category order from the saved `sortMap` data on load. Since scenes are saved with a global `sort_order` that respects category grouping, we can extract the implicit category order by looking at the first scene in each category and ordering categories by their minimum sort_order value.

### Changes

**`src/hooks/useSceneSortOrder.ts`**
- In the query result, also compute and return a `categoryOrder: string[]` array derived from the sorted scene data (group by category, order by min sort_order of each group).

**`src/pages/AdminScenes.tsx`**
- On initialization, if a `categoryOrder` is returned from the hook (i.e., sort data exists in DB), use it instead of `defaultCategoryOrder`.
- Update the `useEffect` that syncs `allPoses` → `orderedPoses` to also set `categoryOrder` from the derived order.

### Files
| File | Change |
|---|---|
| `src/hooks/useSceneSortOrder.ts` | Compute `categoryOrder` from sorted scene data |
| `src/pages/AdminScenes.tsx` | Initialize `categoryOrder` from hook data instead of hardcoded default |

