
Fix plan for “Freestyle Discover cards still missing Scene/Model details”

1) Confirmed root cause (from current code + data)
- `src/pages/Freestyle.tsx` enqueue payload sends `sceneId` but does not send `modelId` (or `productId`), so new `freestyle_generations.model_id` is being stored as `NULL`.
- `src/components/app/freestyle/FreestyleGallery.tsx` currently resolves Add-to-Discover metadata using only `mockModels`/`mockTryOnPoses`; custom IDs are not fully resolved.
- Latest `discover_presets` rows for freestyle are getting inserted with `model_name/scene_name/model_image_url/scene_image_url = NULL`, so Discover hover/detail has nothing to render.

2) Implementation changes

A. Persist model/scene/product IDs at generation time
- File: `src/pages/Freestyle.tsx`
- In `queuePayload`, add:
  - `modelId: selectedModel?.modelId || undefined`
  - `productId: selectedProduct?.id || undefined`
  - keep existing `sceneId`.
- Result: future freestyle rows will have correct IDs for downstream publishing.

B. Make Add-to-Discover metadata resolution robust (single source of truth)
- File: `src/components/app/AddToDiscoverModal.tsx`
- Extend props to accept `modelId?: string`, `sceneId?: string`, and `sourceGenerationId?: string`.
- Before insert, resolve missing metadata in this order:
  1) Use passed names/images if present.
  2) Resolve by IDs:
     - mock IDs → `mockModels` / `mockTryOnPoses`
     - `custom-*` IDs → query `custom_models` / `custom_scenes` by ID.
  3) Legacy fallback for already-generated freestyle rows:
     - if IDs are missing, use `sourceGenerationId` (or image URL match) to read related freestyle queue/generation metadata and recover scene/model image refs where possible.
- Use resolved values for `model_name`, `scene_name`, `model_image_url`, `scene_image_url` in `discover_presets` insert/update.

C. Pass full metadata context from Freestyle gallery
- File: `src/components/app/freestyle/FreestyleGallery.tsx`
- Include `id` in `addToDiscoverImg` state.
- Pass `modelId`, `sceneId`, and `sourceGenerationId={img.id}` to `AddToDiscoverModal`.
- Keep existing mock quick lookup as optional UI helper only; final DB values come from modal resolver.

D. Prevent duplicate broken entries when re-publishing same image
- File: `src/components/app/AddToDiscoverModal.tsx`
- If a preset with same `image_url` already exists and lacks scene/model metadata, update that row instead of inserting another duplicate.
- This gives a clean way to repair “last freestyle generation” without cluttering Discover.

3) Expected outcome
- New freestyle publishes will show Scene/Model on Discover hover and in detail modal exactly like workflow cards.
- Existing broken freestyle items can be repaired by re-publishing the same image once (it will patch metadata instead of duplicating).

Technical details (concise)
- Main bug is metadata loss at source (`modelId` not persisted) plus partial resolver logic at publish time.
- No schema migration required for this fix path.
- A true automatic backfill for all historic rows can be added later, but this plan fixes forward flow + immediate repair path.

4) Verification checklist (end-to-end)
- Generate freestyle with:
  - mock model + custom scene,
  - custom model + custom scene.
- Publish to Discover from Freestyle gallery.
- Verify on `/app/discover` hover:
  - scene/model mini thumbnails visible,
  - scene/model names visible,
  - “Recreate this” still works.
- Re-publish one existing broken freestyle image and confirm metadata is patched (not duplicated).
