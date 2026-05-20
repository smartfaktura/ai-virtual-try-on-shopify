## Problem

You updated the preview images on scenes (in the scene library), but `/ai-product-photography/bags` still shows the old previews.

## Root cause

When an admin picks a scene in `/app/admin/seo-page-visuals`, the override row snapshots the scene's `preview_image_url` at that moment into `seo_page_visuals.preview_image_url`. The public page reads that snapshot directly via `resolveSlotImageUrl`, so later updates to the scene's preview don't propagate — the snapshot is frozen until somebody re-picks the scene in admin.

Same pattern that caused the hover-label bug last round: the override row carries stale denormalized data.

## Fix

Resolve the slot image the same way we now resolve the label: prefer the live scene's current `preview_image_url` from the public scene library, fall back to the override snapshot, then to the hardcoded fallback.

### Changes

1. **`src/lib/resolveSlotImage.ts`**
   - Extend `resolveSlotImageUrl` with an optional `scenePreviewById?: Map<string, string>` parameter.
   - Resolution order:
     1. `scenePreviewById.get(override.scene_id)` (live scene preview)
     2. `override.preview_image_url` (snapshot, in case the scene is hidden/removed)
     3. `fallbackUrl` (hardcoded BUILT_FOR image)

2. **`src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx`**
   - Build `scenePreviewById` alongside the existing `sceneTitleById` in the same `useMemo` over `scenes`.
   - Pass it into `resolveSlotImageUrl(...)`.

3. **All other call sites of `resolveSlotImageUrl`** — keep working unchanged because the new param is optional. We add the map only where `usePublicSceneLibrary` is already available, so no extra queries. Will sweep for other call sites and add the map opportunistically where the hook is already in scope; otherwise leave them on snapshot behaviour (safe default).

## Out of scope

- No DB migration / backfill of `seo_page_visuals.preview_image_url`. The snapshot stays as a fallback for hidden scenes.
- No change to admin UI behaviour — picking a scene still snapshots, that's fine.
- Hover-label fix from earlier already follows this same pattern; nothing to redo.

## Verification

- Reload `/ai-product-photography/bags`: tiles whose scenes you updated now show the new preview images.
- Tiles where the underlying scene was deleted/hidden still render the snapshot (no broken images).
- Other category pages keep rendering as before.
