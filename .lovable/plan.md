

# Fix: Step 3 Refine & Step 4 Review Crash After Scene Migration

## Root Cause

Both `ProductImagesStep3Refine.tsx` and `ProductImagesStep4Review.tsx` still import the **static** `ALL_SCENES` from `sceneData.ts`. These static scenes have **no `triggerBlocks` property**. When `getBlocksByScene()` iterates `scene.triggerBlocks` (line 82 of `detailBlockConfig.ts`), it throws a TypeError on `undefined`, crashing the app into the ErrorBoundary.

## Fix

### `src/components/app/product-images/ProductImagesStep3Refine.tsx`
- Remove `import { ALL_SCENES } from './sceneData'`
- Add `import { useProductImageScenes } from '@/hooks/useProductImageScenes'`
- Call `const { allScenes } = useProductImageScenes()` inside the component
- Replace all 3 uses of `ALL_SCENES` (lines 329, 1570) with `allScenes`

### `src/components/app/product-images/ProductImagesStep4Review.tsx`
- Remove `import { ALL_SCENES } from './sceneData'`
- Add `import { useProductImageScenes } from '@/hooks/useProductImageScenes'`
- Call `const { allScenes } = useProductImageScenes()` inside the component
- Replace `ALL_SCENES.filter(...)` (line 75) with `allScenes.filter(...)`

### `src/components/app/product-images/detailBlockConfig.ts`
- Add null-safety: change `scene.triggerBlocks` to `(scene.triggerBlocks || [])` on lines 82 and 89 to prevent crashes if any scene is missing the field

This ensures both components use database-backed scenes with proper `triggerBlocks`, and adds a safety net in the shared utility.

