

# Fix Presets to Use the Same Scene Sources as the Scene Picker

## Problem
The preset carousel only pulls from `mockTryOnPoses` (hardcoded mock data), but the actual scene picker combines **mock scenes + custom database scenes** (`custom_scenes` table) filtered through `filterVisible` and sorted by `sortScenes`. Scenes like "Urban NYC Street", "Floating Studio", "Golden Radiance Product", "Rooftop Cityscape Glow" are custom scenes in the database — they don't exist in `mockTryOnPoses` at all, so the presets never show them.

## Solution
Pass the **full combined scene list** (mock + custom, filtered + sorted) into `FreestyleQuickPresets` instead of having the component import `mockTryOnPoses` directly.

## Changes

### 1. `src/components/app/freestyle/FreestyleQuickPresets.tsx`
- Remove the `mockTryOnPoses` import — stop pulling scenes internally
- Add a new required prop `allScenes: TryOnPose[]` that receives the full combined scene list from the parent
- Update `buildPersonalizedScenes` to use `allScenes` instead of the hardcoded mock array

### 2. `src/pages/Freestyle.tsx`
- Build the full scene list the same way the scene picker does: `[...filterVisible(mockTryOnPoses), ...filterVisible(customScenePoses)]` with sort order applied
- Pass this combined list as `allScenes` to `FreestyleQuickPresets`

### Files
- `src/components/app/freestyle/FreestyleQuickPresets.tsx` — accept `allScenes` prop, remove direct mock import
- `src/pages/Freestyle.tsx` — build and pass combined scene list

