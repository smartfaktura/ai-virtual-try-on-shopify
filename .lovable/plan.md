

# Pass Model/Scene Metadata from Freestyle Gallery to Discover Publishing

## Problem
When admin publishes a freestyle image to Discover via the gallery's "Add to Discover" button, `modelId` and `sceneId` are available on the image but are not passed through to `AddToDiscoverModal`. So all freestyle Discover items end up with null scene/model metadata — no thumbnails on hover, no "Recreate this" pre-fill.

## Changes

### 1. `src/components/app/freestyle/FreestyleGallery.tsx`

**Extend `GalleryImage` interface** (line 56-62): Add `modelId?: string | null` and `sceneId?: string | null`.

**Extend `addToDiscoverImg` state** (line 493): Add `modelId` and `sceneId` fields.

**Extend `addToDiscoverHandler`** (line 516): Pass `modelId` and `sceneId` from the image.

**Resolve IDs to names/URLs and pass to `AddToDiscoverModal`** (lines 580-587): Import `mockModels` and `mockTryOnPoses` from mockData. Before rendering the modal, look up the model/scene by ID and pass `sceneName`, `modelName`, `sceneImageUrl`, `modelImageUrl` props.

### 2. `src/pages/Freestyle.tsx`

**Extend `galleryImages` mapping** (line 660-666): Include `modelId: img.modelId` and `sceneId: img.sceneId`.

Two files, ~15 lines changed. After this, newly published freestyle items will carry full scene/model metadata and show thumbnails on Discover card hover.

