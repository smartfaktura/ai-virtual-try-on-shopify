

# Add Scene Thumbnail to "Recreating look from Discover" Banner

## Problem
The banner already supports showing scene thumbnails (the `img` tag is there), but the `sceneImage` URL param is often empty because:
1. Scene-type items store their image as `previewUrl`, not `scene_image_url`
2. Navigation paths from Discover don't always resolve and pass the scene image

## Changes

### 1. `src/components/app/DiscoverDetailModal.tsx` — Pass scene image for scene-type items
In the "Recreate this" button click handler (~line 628), when the item is a scene-type, also set `sceneImage` from `item.data.previewUrl`:

```typescript
// For scene-type items, use previewUrl as sceneImage
if (item.type === 'scene') {
  params.set('sceneImage', (item.data as any).previewUrl || '');
  params.set('scene', (item.data as any).name || '');
}
```

### 2. `src/pages/Discover.tsx` — Same fix in `handleUseItem`
For scene-type items navigating to freestyle (~line 430), pass `sceneImage` from `previewUrl`:
```typescript
if (item.type === 'scene') {
  params.set('sceneImage', item.data.previewUrl || '');
  params.set('fromDiscover', '1');
}
```

### 3. `src/pages/PublicDiscover.tsx` — Same fix in `handleUseItem`
Mirror the same logic for the public page's scene navigation (~line 315).

### 4. `src/components/app/PublicDiscoverDetailModal.tsx` — Pass scene image
In the CTA click handler (~line 179), add `sceneImage` from `previewUrl` for scene-type items.

All four files need the same small change: when navigating from a scene-type Discover item, include `sceneImage={previewUrl}` in the URL params. The banner rendering code in Generate.tsx and Freestyle.tsx already handles displaying the thumbnail — no changes needed there.

