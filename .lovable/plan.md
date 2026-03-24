

# Apply Sort Order and Category Overrides to Preset Scenes

## Problem
`Freestyle.tsx` passes the combined scene list to `FreestyleQuickPresets` without applying `sortScenes` or `applyCategoryOverrides` from `useSceneSortOrder`. This means:
1. Custom scenes with admin-assigned category overrides keep their original category, so the category-based filtering in `buildPersonalizedScenes` may exclude or misplace them
2. The admin-curated sort order (which puts the best scenes first per category) is ignored, so the presets pick scenes in arbitrary order instead of showing the top-ranked ones

## Changes

### `src/pages/Freestyle.tsx`
- Import `useSceneSortOrder` hook
- Call `sortScenes` and `applyCategoryOverrides` on the combined scene list before passing to `FreestyleQuickPresets`
- Change line 960 from:
  ```
  allScenes={[...filterVisible(mockTryOnPoses), ...filterVisible(customScenePoses)]}
  ```
  to:
  ```
  allScenes={sortScenes(applyCategoryOverrides([...filterVisible(mockTryOnPoses), ...filterVisible(customScenePoses)]))}
  ```

This ensures presets use the same curated, correctly-categorized scene list as the scene picker, so the best admin-ranked scenes appear first in each category.

### Files
- `src/pages/Freestyle.tsx` — import `useSceneSortOrder`, apply sort + category overrides to allScenes prop

