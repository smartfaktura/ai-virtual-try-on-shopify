

# Sort Results by Admin Scene Order

## What
Images on the "Your visuals are ready" step (Step 6) currently appear in random job-completion order. This change sorts them to match the admin scene sort order from the `scene_sort_order` table.

## Changes

### 1. Add `sceneId` to result metadata — `ProductImages.tsx`
In `startPolling`, include `sceneId` alongside `sceneName` in the `productMap`. In `finishWithResults`, pass `sceneId` through to each `ResultImage`.

### 2. Extend `ResultImage` interface — `ProductImagesStep6Results.tsx`
Add optional `sceneId?: string` field.

### 3. Sort images by scene sort order — `ProductImagesStep6Results.tsx`
Import `useSceneSortOrder` hook. Before rendering each product's images, sort them using the `sortMap` — images with lower sort values appear first, unranked scenes fall to the end.

### 4. Pass `sceneId` in recovery path — `ProductImages.tsx`
The session recovery polling path (around line 960-970) also builds a `productMap` — add `sceneId` there too for consistency.

## Files modified
1. `src/pages/ProductImages.tsx` — pass `sceneId` through productMap → finishWithResults
2. `src/components/app/product-images/ProductImagesStep6Results.tsx` — add `sceneId` to interface, sort images by admin order

