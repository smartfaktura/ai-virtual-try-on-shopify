
# Bundle Visuals — Fix Progress Banner Integration

## Bugs Found

### 1. Product chips never update (Critical UX)
`MultiProductProgressBanner` expects `multiProductJobIds` and `multiProductResults` to be **keyed by product ID**. But in the bundle flow, `jobMap` is keyed by scene-based keys (`bundle_${scene.id}_r${ratio}`). This means:
- Product chips never show "processing" spinner
- Product chips never show "done" checkmark

### 2. `multiProductResults` constructed incorrectly
Current code: `new Map(Array.from(jobMap.entries()).slice(0, completedJobs)...)` — this slices scene-keyed entries and maps them to fake results. None of them match product IDs.

### 3. Progress percentage jumps
The progress starts at 0% and jumps to e.g. 33% when the first job completes. No smooth ramp during generation phase.

## Fix

Since Bundle Visuals is **not** a per-product workflow (it generates per-scene, not per-product), the product chips feature of `MultiProductProgressBanner` doesn't semantically apply. Instead:

- Pass `productQueue` with the selected products (for display context)
- Create a **scene-keyed** results map where done job keys map to entries, so the overall progress bar and count work correctly
- For the product chips to show correctly, **don't use them** — pass `productQueue` as a single-item array (the bundle as one "product") so the chips section is skipped (`totalProducts > 1` check), and rely on the progress bar + team messages + time estimates instead

OR better: adapt the props so the progress banner shows per-**scene** progress instead of per-product:
- `productQueue` = selected scenes (as pseudo-products with scene thumbnails)
- `multiProductJobIds` = Map keyed by scene ID → job ID
- `multiProductResults` = Map of completed scene IDs

This gives the user visual feedback on which scenes are done.

## Implementation

In `BundleVisuals.tsx` Step 5 generating section, change how we wire `MultiProductProgressBanner`:

```tsx
// Build scene-based maps for the progress banner
const sceneProgressQueue = selectedScenes.map(s => ({
  id: s.id,
  title: s.title,
  images: s.previewUrl ? [{ url: s.previewUrl }] : [],
}));

// jobMap: key → jobId. We need scene.id → jobId for chips
const sceneJobIds = new Map<string, string>();
const sceneResults = new Map<string, { images: string[]; labels: string[] }>();
for (const [key, jobId] of jobMap.entries()) {
  const sceneId = key.replace(/^bundle_/, '').replace(/_r.*$/, '');
  sceneJobIds.set(sceneId, jobId);
}
// Mark completed scenes
let doneCount = 0;
for (const [sceneId] of sceneJobIds) {
  if (doneCount < completedJobs) {
    sceneResults.set(sceneId, { images: [], labels: [] });
    doneCount++;
  }
}
```

Then pass these to the banner. This shows scene thumbnails with spinners/checkmarks as they complete.

Also remove stale `navigate` from the `handleGenerate` dependency array.

## Files to modify
- `src/pages/BundleVisuals.tsx` — Fix Step 5 progress banner wiring
