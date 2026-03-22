

# Add Scene/Model Metadata to Freestyle Library Items for Discover Publishing

## Problem
Freestyle Discover items like "City Chic" show no scene/model thumbnails because:
1. `freestyle_generations` stores only `model_id` and `scene_id` (IDs like "zara" or "custom-xxx"), not names or image URLs
2. `useLibraryItems.ts` doesn't resolve these IDs when building freestyle library items
3. So when publishing via AddToDiscoverModal, `sceneName`, `modelName`, and image URLs are all null

Workflow items work fine because `generation_jobs` already stores `scene_name`, `model_name`, `scene_image_url`, `model_image_url` directly.

## Changes

### 1. `src/hooks/useLibraryItems.ts` — Resolve model/scene from IDs for freestyle items

Update the freestyle item mapping (lines 116-138) to:
- Read `model_id` and `scene_id` from `freestyle_generations` (already selected but not used)
- Resolve model name + image from `mockModels` (by matching `modelId`) and `custom_models` table
- Resolve scene name + image from `mockTryOnPoses` (by matching `poseId`) and `custom_scenes` table
- Add `sceneName`, `modelName`, `sceneImageUrl`, `modelImageUrl` to the freestyle library item

Since we need to resolve IDs to names, we'll batch-fetch custom models and scenes once per page load (only if any freestyle items reference them), then do local lookups.

```ts
// After fetching fsData, collect unique model/scene IDs that start with "custom-"
const customModelIds = fsData.map(f => f.model_id).filter(id => id?.startsWith('custom-')).map(id => id.replace('custom-', ''));
const customSceneIds = fsData.map(f => f.scene_id).filter(id => id?.startsWith('custom-')).map(id => id.replace('custom-', ''));

// Batch fetch custom models/scenes if needed
const [customModelsData, customScenesData] = await Promise.all([
  customModelIds.length ? supabase.from('custom_models').select('id, name, image_url').in('id', customModelIds) : { data: [] },
  customSceneIds.length ? supabase.from('custom_scenes').select('id, name, image_url').in('id', customSceneIds) : { data: [] },
]);

// Build lookup maps
// For each freestyle item, resolve modelId/sceneId → name + imageUrl
```

For mock models/scenes, use existing `mockModels` and `mockTryOnPoses` arrays with local `.find()`.

### 2. `src/hooks/useLibraryItems.ts` — Add imports

Add imports for `mockModels` and `mockTryOnPoses` from mock data.

### 3. `freestyle_generations` select — Add `model_id, scene_id, product_id`

Update the freestyle query (line 42) to also select `model_id, scene_id, product_id`:
```ts
.select('id, image_url, prompt, user_prompt, aspect_ratio, quality, created_at, workflow_label, model_id, scene_id, product_id')
```

## Files

| File | Change |
|------|--------|
| `src/hooks/useLibraryItems.ts` | Select model_id/scene_id, resolve to names/URLs, pass through to library items |

This is the only code change needed. Once freestyle library items carry scene/model metadata, the existing AddToDiscoverModal publish flow will store them in `discover_presets`, and the detail modal will render the thumbnails.

