

# Fix Missing Scene/Model/Product Thumbnails in Discover Detail Modal

## Root Cause

The edge functions (`generate-tryon`, `generate-workflow`) have the correct code to save `scene_image_url`, `model_image_url`, `product_name`, `product_image_url` into `generation_jobs`, but the data is still null for recent jobs. The functions need to be **redeployed**. Additionally, existing `discover_presets` entries like "Date Night Glow" have names but no image URLs — they need backfilling.

Even after redeployment, there's a gap: if a user publishes an older library item (created before deployment), the image URLs will be null. The `AddToDiscoverModal` should have a fallback that resolves image URLs from known scene/model data.

## Changes

### 1. Redeploy edge functions
Redeploy `generate-tryon` and `generate-workflow` so future generations correctly persist all metadata columns.

### 2. `src/components/app/AddToDiscoverModal.tsx` — Resolve missing image URLs at publish time

Add logic that, when `sceneImageUrl` or `modelImageUrl` are null but names exist, looks them up:
- **Scene**: Query `custom_scenes` table by name, or match against `mockTryOnPoses` from mock data
- **Model**: Match against `mockModels` by name to get `previewUrl`, or query `custom_models` table
- **Product**: Already passed from Generate.tsx — just ensure it flows through

This ensures even old library items get proper thumbnails when published to Discover.

### 3. Backfill existing discover presets via SQL

Update "Date Night Glow" (and any other presets with names but no image URLs) with the correct URLs from `custom_scenes` and known model data:

```sql
-- Scene: Canon G7X @Dining → custom_scenes table
-- Model: Zara → known URL from mock data
UPDATE discover_presets dp
SET scene_image_url = cs.image_url
FROM custom_scenes cs
WHERE dp.scene_name = cs.name AND dp.scene_image_url IS NULL;

UPDATE discover_presets
SET model_image_url = '<zara-model-url>'
WHERE model_name = 'Zara' AND model_image_url IS NULL;
```

### 4. `src/components/app/DiscoverDetailModal.tsx` — No code changes needed

The modal already renders thumbnails when URLs exist. Once data is populated, thumbnails will appear.

## Files

| File | Change |
|------|--------|
| Edge functions | Redeploy `generate-tryon` and `generate-workflow` |
| `src/components/app/AddToDiscoverModal.tsx` | Add fallback URL resolution from scene/model lookups (~15 lines) |
| Migration | Backfill existing presets with image URLs from `custom_scenes` + mock model data |

