

# Enhance Copy Button to Restore Full Generation Context

## What
Currently the copy button on freestyle gallery images only copies the text prompt to the editor. The user wants it to also restore the model, scene, and product selections — effectively "reloading" the full generation settings.

## Changes

### 1. `src/components/app/freestyle/FreestyleGallery.tsx`

**Extend the callback signature:**
- Change `onCopyPrompt` from `(prompt: string) => void` to a new `onCopySettings` callback that passes the full image metadata:
  ```ts
  onCopySettings?: (settings: { prompt: string; modelId?: string | null; sceneId?: string | null; productId?: string | null; aspectRatio?: string }) => void;
  ```
- Add `productId` to `GalleryImage` interface (it's already available in the data, just not passed through).
- Update the copy button click handler to call `onCopySettings` with all fields from the image.
- Update toast message to "Settings copied to editor".

### 2. `src/pages/Freestyle.tsx`

**Add `productId` to `galleryImages` mapping** (line 662-670):
```ts
productId: img.productId,
```

**Replace `onCopyPrompt={setPrompt}` with a new handler** that resolves IDs to objects:
```ts
const handleCopySettings = useCallback((settings) => {
  setPrompt(settings.prompt || '');
  
  // Resolve model
  if (settings.modelId) {
    const model = mockModels.find(m => m.id === settings.modelId);
    if (model) setSelectedModel(model);
  } else { setSelectedModel(null); }
  
  // Resolve scene (mock + custom)
  if (settings.sceneId) {
    const scene = filterVisible(mockTryOnPoses).find(s => s.poseId === settings.sceneId)
      || customScenePoses.find(s => s.poseId === settings.sceneId);
    if (scene) setSelectedScene(scene);
  } else { setSelectedScene(null); }
  
  // Resolve product
  if (settings.productId) {
    const product = products.find(p => p.id === settings.productId);
    if (product) setSelectedProduct(product);
  } else { setSelectedProduct(null); }
  
  // Restore aspect ratio
  if (settings.aspectRatio) setAspectRatio(settings.aspectRatio);
}, [products, customScenePoses, filterVisible]);
```

Pass `onCopySettings={handleCopySettings}` to `FreestyleGallery`.

### Result
Clicking the copy button restores prompt + model + scene + product + aspect ratio in one click. Toast says "Settings copied to editor".

