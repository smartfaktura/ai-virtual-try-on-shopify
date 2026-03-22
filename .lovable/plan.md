

# Add Thumbnail Images to "Recreating look from Discover" Banner

## Problem
The banner on the Generate page shows "Recreating look from Discover" with text-only badges for model/scene names (e.g. "Zara", "Canon G7X @Dining"). User wants small thumbnail images next to each name, matching the style used in the Discover detail modal.

## Changes

### 1. `src/components/app/DiscoverDetailModal.tsx` — Pass image URLs in navigation params

When navigating to the workflow on "Recreate this" click, also pass `modelImage` and `sceneImage` as URL params:
```
params.set('modelImage', item.data.model_image_url)
params.set('sceneImage', item.data.scene_image_url)
```

### 2. `src/pages/Generate.tsx` — Read image URLs + show thumbnails in banner

**Extend `recreateSource` state** to include `modelImageUrl` and `sceneImageUrl`:
```ts
const prefillModelImage = searchParams.get('modelImage');
const prefillSceneImage = searchParams.get('sceneImage');
```

**Update the banner** (lines 1962-1967): Add small `w-5 h-5 rounded object-cover` thumbnail images inside each Badge, before the text name:
```tsx
{recreateSource.modelName && (
  <Badge variant="secondary" className="text-xs gap-1.5 pl-1">
    {recreateSource.modelImageUrl && (
      <img src={recreateSource.modelImageUrl} className="w-5 h-5 rounded object-cover" />
    )}
    {recreateSource.modelName}
  </Badge>
)}
```
Same pattern for scene badge.

## Files

| File | Change |
|------|--------|
| `src/components/app/DiscoverDetailModal.tsx` | Add `modelImage`/`sceneImage` URL params to navigation |
| `src/pages/Generate.tsx` | Read image URL params, extend state, render thumbnails in badges |

