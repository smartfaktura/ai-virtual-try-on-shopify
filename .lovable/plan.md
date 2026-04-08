

# Add Aspect Ratio Labels to Results Grid

## Problem
When generating multiple aspect ratios per scene, all result thumbnails display at `aspect-square` with the same scene name label — there's no way to tell which ratio each image was generated at.

## Solution
Two changes: (1) extract the aspect ratio from the job key and pass it through to results, (2) show a small badge on each result card and render the thumbnail container at the actual aspect ratio.

## Technical Changes

### 1. Add `aspectRatio` to `ResultImage` interface (Step6Results)
Add an optional `aspectRatio?: string` field to the `ResultImage` type.

### 2. Extract ratio from job key in `ProductImages.tsx` polling
The job key format is `productId_sceneId_vIdx_rRATIO_imgIdx`. In `startPolling` (line 530-534), extract the ratio from `parts[3]` (strip the `r` prefix) and store it in `productMap`. Then in `finishWithResults` (line 511), pass it into each result image.

### 3. Show ratio badge + use actual aspect ratio in Step6Results
- Replace `aspect-square` with a dynamic aspect ratio style based on the ratio string (e.g., `1:1` → `1/1`, `4:5` → `4/5`, `9:16` → `9/16`)
- Add a small semi-transparent badge in the bottom-right corner of each thumbnail showing the ratio (e.g., "4:5") — only when multiple ratios exist in the result set
- In the footer label, append the ratio after the scene name when mixed ratios are present

## Files Modified
1. `src/pages/ProductImages.tsx` — pass `aspectRatio` through productMap → finishWithResults → ResultImage
2. `src/components/app/product-images/ProductImagesStep6Results.tsx` — add ratio badge, use CSS `aspect-ratio` for thumbnails

