

## Fix: Upscale Loading Indicators and Stuck Workflow

Two separate bugs need to be fixed:

### Bug 1: No upscale loading indicator on Freestyle page

The Freestyle page (`FreestyleGallery`) never tracks upscale jobs. The Jobs (Library) page has a `useQuery` that polls `generation_queue` for active upscale jobs and passes `isUpscaling` to each `LibraryImageCard`. The Freestyle page doesn't do this at all.

**Fix in `src/pages/Freestyle.tsx`:**
- Add the same upscale job tracking query (poll `generation_queue` for `job_type='upscale'` with `status in (queued, processing)` every 4s)
- Extract `upscalingSourceIds` set
- Pass `isUpscaling` prop through to `FreestyleGallery` and down to the image cards
- Also pass it to `LibraryDetailModal` when it opens

**Fix in `src/components/app/freestyle/FreestyleGallery.tsx`:**
- Accept an `upscalingSourceIds` prop (or `isUpscaling` callback)
- Pass `isUpscaling` to each image card rendered in the gallery (the gallery renders its own cards, not `LibraryImageCard`, so the overlay effect needs to be added to the freestyle image cards as well, or the existing card overlay pattern needs to be reused)

### Bug 2: Upscale workflow stuck on "Enhancing" screen

**Root cause:** In `src/pages/Generate.tsx`, the `multiProductJobIds` polling effect (line 1376) aggregates results by iterating over `productQueue` (line 1436). For single-image upscale (especially scratch uploads), `productQueue` is empty, so the aggregation loop finds no matching entries. When all jobs are terminal, `allImages` is empty and the code shows "All products failed" then resets to settings -- but the user may not see this correctly, or for non-scratch single product the `productQueue` has entries but the key mismatch (`product.id` vs `src.sourceId`) causes the same problem.

**Fix in `src/pages/Generate.tsx` (~line 1426-1462):**
- Instead of iterating `productQueue` to aggregate results, iterate `multiProductJobIds` directly. The `completedResults` map is keyed by the same keys used in `multiProductJobIds` (e.g. `'scratch'`, or `product.id`), so iterate the map's entries:

```tsx
// Replace productQueue iteration with multiProductJobIds iteration
const allImages: string[] = [];
const allLabels: string[] = [];
for (const [key] of multiProductJobIds) {
  const r = completedResults.get(key);
  if (r) {
    allImages.push(...r.images);
    allLabels.push(...r.labels);
  }
}
```

This ensures single-image scratch uploads and any key format work correctly. The upscale job will complete, show results, and transition away from the "Enhancing" screen.

### Technical details

- The `multiProductJobIds` map uses `src.sourceId` as keys (line 812: `jobMap.set(src.sourceId, result.jobId)`), which is `'scratch'` for scratch uploads or `product.id` for selected products
- The polling at line 1400-1411 correctly maps results back using the same `multiProductJobIds.entries()` keys
- Only the aggregation at line 1436 incorrectly uses `productQueue` instead of `multiProductJobIds`
- For Freestyle upscale indicators, we replicate the pattern from `src/pages/Jobs.tsx` lines 100-122

