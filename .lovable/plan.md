

## Show Total Image Count in Multi-Product Progress Banner

### Problem
When generating Virtual Try-On with multiple products and multiple scenes, the banner only shows "0 of 2 products complete" — it doesn't indicate how many total images are being generated (e.g., 2 products × 3 scenes = 6 images). This is misleading.

### Changes

**`src/components/app/MultiProductProgressBanner.tsx`**
- Add a new prop `totalExpectedImages?: number` to the component
- Display it in the header area: "0 of 2 products complete · 6 images generating"
- Update the estimate calculation to use total images instead of just product count (more accurate)

**`src/pages/Generate.tsx`**
- Pass `totalExpectedImages` to `MultiProductProgressBanner`:
  ```tsx
  totalExpectedImages={productQueue.length * tryOnSceneCount}
  ```
  (where `tryOnSceneCount = Math.max(1, selectedPoses.size)` is already computed)

### Result
The banner will show something like:
- "0 of 2 products · 6 images generating" with elapsed timer
- "Est. ~X-Y min for 6 images"

This clearly communicates the total output expected from the batch.

