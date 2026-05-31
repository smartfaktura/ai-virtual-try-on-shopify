## What’s wrong

The worker completed the jobs, but bulk upscale polling is looking for `row.result.images`. The upscale worker saves completed rows as:

```ts
result: { imageUrl: newImageUrl, resolution }
```

So the frontend sees the jobs as completed but never adds any images to `completedResults`, leaving `allImages.length === 0` and preventing the Results view from showing the completed output correctly.

## Fix

### 1. Support upscale result shape in bulk polling

In `src/pages/Generate.tsx`, update the multi-job polling result type and completion parser:

- Accept both:
  - normal workflow shape: `result.images: string[]`
  - upscale shape: `result.imageUrl: string`
- Convert upscale result into the same image array pipeline:

```ts
const resultImages = row.result?.images || (row.result?.imageUrl ? [row.result.imageUrl] : []);
```

Then use `resultImages.length > 0` instead of only `row.result?.images`.

### 2. Keep only title + subtitle for upscale loading

In `src/pages/Generate.tsx`:

- Keep:
  - `Enhancing to 4K...`
  - `Upscaling N images`
- Hide the duplicate `MultiProductProgressBanner` only for `isUpscale`, so the third line `Generating N images for Image Upscaling...` disappears.

The progress bar/status chips are part of that banner too, but the main page still has title/subtitle and generation state. If needed later, we can make a smaller upscale-only progress bar, but I’ll keep this change minimal.

## Backend status

Latest `upscale-worker` logs show the 3 Topaz jobs completed successfully. This is a frontend result-shape mismatch, not a backend failure.