

## Fix: Show All Images from Each Job in Recent Creations

### Problem

In `src/components/app/RecentCreationsGallery.tsx` line 46, there's a hard-coded `results.slice(0, 2)` that limits each generation job to only 2 images in the Recent Creations carousel -- even when a job produced 4 images.

### Solution

Change `results.slice(0, 2)` to iterate over all results in the array. The overall display is already capped to the first 5 items (line 86: `items.slice(0, 5)`), but we should increase that to ~10 so a full 4-image try-on batch plus other recent items can all appear in the horizontally scrollable carousel.

### File Change

**`src/components/app/RecentCreationsGallery.tsx`**

- Line 46: Change `results.slice(0, 2)` to `results` (iterate all images from the job)
- Line 86: Change `items.slice(0, 5)` to `items.slice(0, 10)` so the carousel can show more items

This is a two-line fix.
