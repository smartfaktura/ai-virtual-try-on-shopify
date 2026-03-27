

# Fix: Scene not selected in Freestyle after "Recreate" from Discover

## Problem
When clicking "Recreate" on a Discover preset that uses a custom scene (e.g., "Skyline Laundry"), the scene is not selected in Freestyle because:

1. **Discover passes `scene_name`** (e.g., "Skyline Laundry") as the `scene` URL param
2. **Freestyle line 264** tries to match by name, but only searches `mockTryOnPoses` (built-in scenes) — custom scenes are not checked
3. **Freestyle line 317** (deferred custom scene matching) only matches by `poseId` and only if the param starts with `custom-` — but the param is a name, not a poseId

Custom scenes load asynchronously, so they aren't available during the initial matching on line 264.

## Fix

### `src/pages/Freestyle.tsx` — Expand deferred custom scene matching (~line 314-326)

Update the deferred custom scene effect to also match by **name** (not just poseId starting with `custom-`):

```typescript
// Deferred custom scene matching (custom scenes load async)
useEffect(() => {
  const sceneParam = initialSceneParam.current;
  if (!sceneParam || customScenePoses.length === 0) return;
  // Already matched by the initial effect
  if (selectedScene) return;
  
  const matched = customScenePoses.find(
    (s) => s.poseId === sceneParam || s.name === sceneParam
  );
  if (matched) {
    setSelectedScene(matched);
    initialSceneParam.current = null;
    if (!localStorage.getItem('hideSceneAppliedHint')) {
      setShowSceneHint(true);
    }
  }
}, [customScenePoses]);
```

Key changes:
- Remove the `sceneParam.startsWith('custom-')` gate — allow name-based matching
- Add `s.name === sceneParam` as a fallback match
- Add `if (selectedScene) return` guard to skip if already matched by the initial effect

Single file, ~3 lines changed. No other files affected.

