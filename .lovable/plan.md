
# Fix why /app/freestyle only generates 1 image

## What I found
This is not a UI selection bug anymore. The `/app/freestyle` page is already sending the selected variation count correctly.

The real issue is in the backend worker for freestyle jobs:

- `src/pages/Freestyle.tsx`
  - sends `imageCount: variationCount` in the queue payload
  - sends `imageCount: variationCount` to `enqueue(...)`
- `src/components/app/freestyle/FreestylePromptPanel.tsx`
  - correctly stores and displays the selected count (1–4)

But in `supabase/functions/generate-freestyle/index.ts` the queue path forces everything back to 1:

- it sets:
  `const effectiveImageCount = isQueueInternal ? 1 : Math.min(body.imageCount || 1, 4);`
- and later it has an “early finalize” block that completes the queued job immediately after the first successful image

So even if the user selects 2, 3, or 4 in `/app/freestyle`, queued freestyle jobs are intentionally truncated to one output.

## Implementation plan

### 1. Fix queue image count handling in `generate-freestyle`
Update `supabase/functions/generate-freestyle/index.ts` so queued freestyle jobs respect the requested count:

- change the `effectiveImageCount` logic to use `body.imageCount` for queue jobs too, capped at 4
- keep the existing fallback to 1 if no count is provided

Target behavior:
```text
requested imageCount 1 -> generate 1
requested imageCount 2 -> generate 2
requested imageCount 3 -> generate 3
requested imageCount 4 -> generate 4
```

### 2. Remove the premature queue completion
In the same file, remove or guard the “early finalize” path that completes the queue job after the first saved image.

Instead:
- keep heartbeat updates after each generated image
- save each image to `freestyle_generations`
- only mark the queue job complete after the loop finishes or ends with partial success/failure

### 3. Preserve partial-success behavior
Keep the current resilience behavior:

- if 2 were requested and only 1 succeeds, the job should finish with:
  - `images.length = 1`
  - `requestedCount = 2`
  - `partialSuccess = true`
- credits/refund behavior should stay consistent with the existing completion logic

### 4. Verify related frontend behavior stays aligned
No UI redesign is needed, but after the backend fix I would verify these areas still line up:

- `src/pages/Freestyle.tsx`
  - selected `variationCount`
  - `creditCost = perImageCost * variationCount`
  - enqueue payload includes `imageCount`
- `src/hooks/useGenerationQueue.ts`
  - queue polling handles multi-image `result.images`
- `src/hooks/useFreestyleImages.ts`
  - gallery can already show multiple saved records, one per generated image

### 5. Validate end-to-end
After implementation, verify:

1. Select 2 images in `/app/freestyle`
2. Generate
3. Confirm queue result ends with 2 image URLs
4. Confirm 2 records are saved in `freestyle_generations`
5. Confirm gallery shows 2 new outputs
6. Confirm credits charged match the selected count

## Technical details
Root-cause lines are in `supabase/functions/generate-freestyle/index.ts`:

```text
effectiveImageCount = isQueueInternal ? 1 : ...
```

and the later block:

```text
Early finalize: completing queue job ... with 1 images
```

Those two pieces are why the app always ends at one generated image even when `/app/freestyle` shows 2, 3, or 4 selected.

## Expected outcome
After this fix, the Freestyle variation selector will work end-to-end through the queue, and selecting 2 images in `/app/freestyle` will actually produce 2 outputs instead of 1.
