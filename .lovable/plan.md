

# Fix "Created with Freestyle" — Store & Display Scene/Model Metadata

## Problem

When publishing a Virtual Try-On generation to Discover, it shows "Created with Freestyle" because:
1. `generation_jobs` table has no columns for scene name, model name, or workflow slug
2. The edge functions (`generate-tryon`, `generate-workflow`) don't save this metadata even though it's available in the payload
3. The Library item type (`LibraryItem`) doesn't carry scene/model data
4. `AddToDiscoverModal` only receives `workflowName` — no scene, model, or image URLs

The payload sent to the edge function already contains `model.name`, `pose.name`, `workflow_name`, `workflow_slug` — we just need to persist and surface it.

## Changes

### 1. Database Migration — Add metadata columns to `generation_jobs`

```sql
ALTER TABLE public.generation_jobs
  ADD COLUMN scene_name text,
  ADD COLUMN model_name text,
  ADD COLUMN scene_image_url text,
  ADD COLUMN model_image_url text,
  ADD COLUMN workflow_slug text;
```

### 2. Edge Functions — Save metadata on insert

**`supabase/functions/generate-tryon/index.ts`** (line ~467-481):
Add to the `generation_jobs` insert:
- `scene_name: payload.pose?.name || null`
- `model_name: payload.model?.name || null`
- `workflow_slug: payload.workflow_slug || null`
- Scene/model image URLs from the payload (original URLs, not base64)

**`supabase/functions/generate-workflow/index.ts`** (line ~726-740):
Same additions where applicable (workflow jobs may have model/scene in payload).

### 3. `src/components/app/LibraryImageCard.tsx` — Extend `LibraryItem` interface

Add optional fields:
```ts
sceneName?: string;
modelName?: string;
sceneImageUrl?: string;
modelImageUrl?: string;
workflowSlug?: string;
```

### 4. `src/hooks/useLibraryItems.ts` — Fetch new columns

Update the jobs query select to include the new columns and map them into `LibraryItem`.

### 5. `src/components/app/LibraryDetailModal.tsx` — Pass full metadata to AddToDiscoverModal

Pass `sceneName`, `modelName`, `sceneImageUrl`, `modelImageUrl`, `workflowSlug` from the library item.

### 6. Handle image URLs for scene/model

The tryon payload sends base64 images (not URLs). We need to store the original URLs instead. The frontend (`Generate.tsx` line 1288-1289) sends `model.imageUrl` as base64 and `pose.imageUrl` as base64. We need to also send the original URLs in the payload:
- Add `model.originalImageUrl` and `pose.originalImageUrl` to the enqueue payload in `Generate.tsx`
- Store those in `generation_jobs` (not the base64 versions)

## Files Changed

| File | Change |
|------|--------|
| **Migration** | Add 5 columns to `generation_jobs` |
| `supabase/functions/generate-tryon/index.ts` | Save scene/model/workflow metadata on insert |
| `supabase/functions/generate-workflow/index.ts` | Save workflow metadata on insert |
| `src/components/app/LibraryImageCard.tsx` | Extend `LibraryItem` interface |
| `src/hooks/useLibraryItems.ts` | Select + map new columns |
| `src/components/app/LibraryDetailModal.tsx` | Pass full metadata to AddToDiscoverModal |
| `src/pages/Generate.tsx` | Add original image URLs to enqueue payload |

## Note
Existing `generation_jobs` rows will have null metadata (they'll correctly show "Freestyle" fallback). All future generations will preserve the full context chain.

