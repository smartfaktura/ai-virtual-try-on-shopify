

# Fix "Recreating look from Discover" Banner — Show Images for Model & Scene

## Problem
The banner shows model and scene names but no thumbnail images when the `modelImage`/`sceneImage` URL params are missing. This happens when the Discover preset's `model_image_url` or `scene_image_url` fields are null in the database — only the names are passed.

## Solution
In `Generate.tsx`, when initializing `recreateSource`, resolve missing image URLs by looking up the model/scene name against the existing mock data (models array, poses array) and custom scenes. This ensures images always appear regardless of how the navigation happened.

### Changes to `src/pages/Generate.tsx`

1. **After models/poses data is available**, enhance `recreateSource` with resolved image URLs:
   - If `recreateSource.modelImageUrl` is missing but `modelName` exists → find model in `models` array by name, use its `previewUrl`
   - If `recreateSource.sceneImageUrl` is missing but `sceneName` exists → find pose in `poses` array or custom scenes by name, use its `previewUrl`

2. **Add a `useEffect`** that runs when `recreateSource`, `models`, and `poses` are available:
```typescript
useEffect(() => {
  if (!recreateSource) return;
  let updated = false;
  const patch = { ...recreateSource };
  
  if (!patch.modelImageUrl && patch.modelName) {
    const found = models.find(m => m.name === patch.modelName);
    if (found) { patch.modelImageUrl = found.previewUrl; updated = true; }
  }
  
  if (!patch.sceneImageUrl && patch.sceneName) {
    const found = poses.find(p => p.name === patch.sceneName);
    if (found) { patch.sceneImageUrl = found.previewUrl; updated = true; }
  }
  
  if (updated) setRecreateSource(patch);
}, [models, poses]); // run once when data loads
```

This is ~15 lines added, single file change. The same pattern should also be applied to **`src/pages/Freestyle.tsx`** for consistency.

### Files Modified
- `src/pages/Generate.tsx` — add useEffect to resolve missing image URLs
- `src/pages/Freestyle.tsx` — same resolution logic for the Freestyle recreate banner

