

## Show Selected Scenes in Results Summary

### What's Missing
The results summary card shows Product and Model thumbnails, but does **not** show the selected workflow scene thumbnails. Scenes selected via the variation grid (e.g., "Shadow Place") only appear as text labels in the "Variations" section below — no preview images.

### Fix — `src/pages/Generate.tsx` (lines ~2940-2950)

**Add workflow scene thumbnails** after the `selectedPose` block and before the settings chips:

- After the existing `selectedPose` thumbnail (line 2949), add a new block that iterates over `selectedVariationIndices` and renders each selected variation as a thumbnail — using `variationStrategy.variations[i].preview_url` for the image and `.label` for the name.
- Only render these when `variationStrategy?.type === 'scene'` and there are selected indices, to avoid duplicating with the existing `selectedPose` thumbnail (used for non-workflow generation).
- Each thumbnail follows the same 48×48 rounded card format already used for Product and Model, labeled "Scene" with the variation label below.

### Result
The summary card will display: **Product → Model (if any) → Scene(s)** as a horizontal row of thumbnails, giving users full visibility into what was used for their generation.

### 1 file changed
`src/pages/Generate.tsx`

