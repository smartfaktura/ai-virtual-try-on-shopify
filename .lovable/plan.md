

# Fix: Discover Presets Missing Metadata + "Recreate This" Going to Freestyle

## Root Cause

The edge functions (`generate-tryon`, `generate-workflow`) had the correct code to save `scene_name`, `model_name`, `scene_image_url`, `model_image_url`, `workflow_slug` into `generation_jobs`, but **they were never redeployed** after the code was added. I've now deployed them — future generations will correctly store metadata.

However, existing presets (like "Effortless Chic" and "City Chic") already have null metadata in the `discover_presets` table. The "Recreate this" button checks `workflow_slug` — since it's null, it falls through to the freestyle/scene fallback instead of navigating to the workflow.

## What Was Already Fixed

- Edge functions `generate-tryon` and `generate-workflow` have been **redeployed** just now. New generations will store all metadata correctly.

## Remaining Changes

### 1. Manual Backfill — Update existing presets via migration

For the "Effortless Chic" preset (`c82f0cc0`), update it with the correct metadata:

```sql
UPDATE discover_presets 
SET workflow_slug = 'virtual-try-on-set',
    scene_name = (known scene name if available),
    model_name = (known model name if available)
WHERE id = 'c82f0cc0-ec27-4127-aa87-77806f637d5e';
```

Since we can't automatically determine which scene/model were used for old presets, we should at minimum set `workflow_slug` so "Recreate this" routes correctly to the Virtual Try-On workflow.

### 2. `AddToDiscoverModal.tsx` — Derive `workflow_slug` from `workflow_name` as fallback

Currently if the library item has `workflowName` but no `workflowSlug` (because the generation_job was created before the column existed), the slug is null. Add a simple fallback that derives the slug from the name:

```ts
const effectiveSlug = workflowSlug || (workflowName ? workflowName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : null);
```

This ensures even old items published from the library get a working slug.

### 3. Verify the full pipeline works for new generations

After these changes:
- Generate a new Virtual Try-On image → verify `generation_jobs` row has `scene_name`, `model_name`, `workflow_slug` populated
- Open it in Library → publish to Discover → verify the preset has all metadata
- Open it in Discover → "Recreate this" → should navigate to `/app/generate/virtual-try-on-set?model=X&scene=Y`

## Files Changed

| File | Change |
|------|--------|
| **Migration** | Backfill `workflow_slug` for existing presets that have `workflow_name` but null slug |
| `src/components/app/AddToDiscoverModal.tsx` | Derive `workflow_slug` from `workflow_name` as fallback (~2 lines) |

