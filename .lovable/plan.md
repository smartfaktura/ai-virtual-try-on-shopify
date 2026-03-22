

# Fix Discover Detail Modal: Close Issue + "Freestyle" Fallback + Category Mismatch

## Problems

1. **Modal can't close**: Clicking the left image area doesn't close because the entire inner flex container (line 142) has `stopPropagation()`. The backdrop click never fires. The close button (X) should work but may be visually obscured or unresponsive on certain viewports.

2. **Shows "Created with Freestyle" for items that have workflow/scene/model data**: The `AddToDiscoverModal` doesn't pass `workflow_name`, `workflow_slug`, `scene_name`, `model_name`, `scene_image_url`, or `model_image_url` when inserting into `discover_presets`. So newly published items have all those fields as null, triggering the "Freestyle" fallback in the detail modal.

3. **DISCOVER_CATEGORIES in detail modal still uses old list**: Line 14 of `DiscoverDetailModal.tsx` still has `editorial, commercial, lifestyle, fashion, campaign` — not the updated product-based categories.

## Changes

### 1. `src/components/app/DiscoverDetailModal.tsx`

**Fix close behavior:**
- Move `onClick={onClose}` from the outer wrapper to the backdrop div directly
- Remove `stopPropagation` from the inner flex container
- Add `stopPropagation` only to the right panel (the controls area) so clicking the image area closes the modal

**Fix categories:**
- Update `DISCOVER_CATEGORIES` on line 14 to match: `fashion, beauty, fragrances, jewelry, accessories, home, food, electronics, sports, supplements`

### 2. `src/components/app/AddToDiscoverModal.tsx`

**Pass workflow/scene/model metadata when publishing:**
- Add optional props: `workflowSlug?`, `workflowName?`, `sceneName?`, `modelName?`, `sceneImageUrl?`, `modelImageUrl?`
- Include these fields in the `insert` call on line 92-101

### 3. `src/components/app/LibraryDetailModal.tsx`

**Pass metadata to AddToDiscoverModal:**
- Library items from `generation_jobs` already join `workflows(name)` — extract and pass `workflowName`
- Library items don't currently carry scene/model names. The `generation_jobs` table needs checking for those columns.
- For now, pass what's available (`workflowName` from `item.label` if source is `generation`)

### 4. `src/components/app/freestyle/FreestyleGallery.tsx`

**Pass metadata to AddToDiscoverModal:**
- Freestyle items have `workflow_label` — pass as `workflowName`
- Scene/model data isn't stored in `freestyle_generations` currently, so those remain null (correctly showing "Freestyle")

## Technical Details

The `generation_jobs` table stores results but doesn't directly expose scene/model names as columns accessible from the library query. A future enhancement would add `scene_name`, `model_name`, `scene_image_url`, `model_image_url` columns to `generation_jobs` so the full metadata chain flows from generation → library → discover publish. For now, workflow name can be passed through.

## Files

| File | Change |
|------|--------|
| `src/components/app/DiscoverDetailModal.tsx` | Fix close behavior, update categories |
| `src/components/app/AddToDiscoverModal.tsx` | Accept + insert workflow/scene/model metadata |
| `src/components/app/LibraryDetailModal.tsx` | Pass available metadata to AddToDiscoverModal |
| `src/components/app/freestyle/FreestyleGallery.tsx` | Pass workflow_label to AddToDiscoverModal |

