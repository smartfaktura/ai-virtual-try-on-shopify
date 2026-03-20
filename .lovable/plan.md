

# Fix: Banner Disappearing + Add Image Loading Shimmer

## Two Issues

### 1. Banner disappears / shows "Generation complete!" mid-batch
The `MultiProductProgressBanner` receives `activeJob` from the `useGenerationQueue` hook, which only tracks the **last enqueued job**. When that single job completes, `activeJob.status` becomes `'completed'`. The current suppression on line 141 checks `completedCount < totalJobCount`, but the `activeJob` completed state still leaks through when there's a timing gap between completion and the next poll cycle. Additionally, when `activeJob` becomes `null` after reset, the banner falls to the rotating team member fallback — which looks like the banner "disappeared."

**Fix in `MultiProductProgressBanner.tsx`:**
- Completely hide the `QueuePositionIndicator` when `completedCount < totalJobCount` (the batch is still running). The banner itself already shows progress ("13 of 16 images done") — the `QueuePositionIndicator` is redundant and causes confusion.
- Only show `QueuePositionIndicator` when `completedCount >= totalJobCount` (all done) for the final "complete" state.
- Always show the rotating team member during active generation instead of only when `!activeJob`.

### 2. Generated images appear in parts (laggy/piecemeal)
The results grid (line 4089) uses raw `<img>` tags. When 16 images load from CDN, they pop in at different times creating a jarring experience.

**Fix in `Generate.tsx` results grid:**
- Replace raw `<img>` with the existing `ShimmerImage` component (already in the project at `src/components/ui/shimmer-image.tsx`)
- Each image slot shows an animated shimmer gradient until the image loads, then crossfades in

## Technical Details

### File 1: `src/components/app/MultiProductProgressBanner.tsx`
- Lines 140-156: Replace the `activeJob` logic. During active generation (`completedCount < totalJobCount`), always show the rotating team member and never show `QueuePositionIndicator`. Only show `QueuePositionIndicator` when batch is fully complete.

### File 2: `src/pages/Generate.tsx`
- Line 4092: Replace `<img src={url} ...>` with `<ShimmerImage src={url} aspectRatio="3/4" ...>` and add the import
- The `ShimmerImage` component handles cache detection, shimmer animation, and crossfade automatically

### Also fix line 88 text
- Change `Generating X images for 0 products` to omit product count when `totalProducts <= 1` (from approved but unimplemented previous plan)

