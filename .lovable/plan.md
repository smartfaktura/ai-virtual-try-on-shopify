

# Show Scene Preview Image in "Recreating look from Discover" Banner for Prompt-Only Scenes

## Problem
When navigating from Discover to a workflow (e.g. Product Listing Set) with a prompt-only scene like "Skyline Laundry", the `sceneImage` URL param is never set because `scene_image_url` is null in the discover_presets data and the fallback only triggers for `item.type === 'scene'`. The banner shows the scene name but no thumbnail.

## Fix

### `src/components/app/DiscoverDetailModal.tsx` (~line 650)
In the workflow navigation block, after checking `d.scene_image_url` and the scene-type fallback, add a final fallback that uses the item's own `image_url` (the discover card image) when no scene image is available:

```typescript
if (!d.scene_image_url && item.type === 'scene' && (item.data as any).previewUrl) {
  params.set('sceneImage', (item.data as any).previewUrl);
  ...
}
// NEW: fallback to item's own image_url for presets with no scene_image_url
if (!params.get('sceneImage') && d.image_url) {
  params.set('sceneImage', d.image_url);
}
```

Apply the same fallback to the freestyle navigation block (~line 665) as well.

Two small additions in one file. The banner in Generate.tsx and Freestyle.tsx already renders the image when the param exists — no changes needed there.

