

## Fix: Scene Selector Doesn't Reflect Saved Category Order

### Root Cause
Two issues in `SceneSelectorChip.tsx`:
1. **Line 96**: `visibleCategories` is derived from `Object.keys(poseCategoryLabels)` — always the hardcoded default order, ignoring saved category sequence
2. **Line 95**: `categoryMap` (category overrides) is fetched by the hook but never applied to scenes — scenes with overridden categories still appear under their original category

### Solution

**`src/hooks/useSceneSortOrder.ts`**
- Add a `deriveCategoryOrder` helper function that computes category display order from `sortMap` + scene data (min sort_order per category group)
- Export it alongside `sortScenes`

**`src/components/app/freestyle/SceneSelectorChip.tsx`**
1. Apply `categoryMap` overrides to scenes before filtering/displaying (change scene's `category` if an override exists)
2. Derive category order from the sorted scenes instead of using hardcoded `Object.keys(poseCategoryLabels)`
3. Replace `allCategories` with the derived order so categories render in the admin-configured sequence

### Files
| File | Change |
|---|---|
| `src/hooks/useSceneSortOrder.ts` | Add `applyCategoryOverrides` helper that maps category overrides onto poses; add `deriveCategoryOrder` that extracts category sequence from sorted poses |
| `src/components/app/freestyle/SceneSelectorChip.tsx` | Apply category overrides to `allPoses`, derive `allCategories` from actual sorted pose order instead of hardcoded keys |

