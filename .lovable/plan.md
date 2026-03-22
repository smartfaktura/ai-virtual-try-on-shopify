

# Fix Discover Card & Detail Modal Issues

## Problems from Screenshot

1. **"Virtual Try-On Set" label in top-left corner of card** — user doesn't want it
2. **Scene/model thumbnails not showing on hover** — data exists but `scene_image_url`/`model_image_url` are null for recently created presets (metadata wasn't populated when publishing)
3. **Detail modal "Recreate this" button** — should navigate to the workflow with pre-selected model/scene (and show the banner), but the primary CTA currently goes to freestyle for non-workflow items. The workflow CTA exists as a *separate secondary button* — should be the *primary* one when workflow data exists.
4. **Detail modal not showing scene/model thumbnails** — same null data issue as hover

## Changes

### 1. `src/components/app/DiscoverCard.tsx` — Remove workflow badge from top-left

Delete lines 119-124 (the `{!isScene && !hideLabels && item.data.workflow_name && ...}` block that renders the workflow name badge in the top-left corner). The workflow name is already shown in the hover overlay as the generation type label at the bottom.

### 2. `src/components/app/DiscoverDetailModal.tsx` — Merge workflow CTA into primary

When `workflow_slug` exists, make the primary "Recreate this" button navigate to the Generate page with model/scene params (currently done by the secondary "Try Workflow" button). Remove the separate secondary workflow button to avoid duplication.

Change lines 325-331: If `isPreset && item.data.workflow_slug`, onClick navigates to `/app/generate/${workflow_slug}?model=X&scene=Y`. Otherwise keep current behavior (freestyle or use scene).

Delete lines 333-350 (the separate "Try Workflow" button) since it's now merged into the primary CTA.

### 3. `src/components/app/AddToDiscoverModal.tsx` — Verify metadata is being passed

The modal already accepts `sceneName`, `modelName`, `sceneImageUrl`, `modelImageUrl` props and inserts them. The issue is the *callers* may not be passing image URLs. Check `LibraryDetailModal.tsx` — it passes `sceneName` and `modelName` from library item but may not pass `sceneImageUrl`/`modelImageUrl`.

### 4. `src/components/app/LibraryDetailModal.tsx` — Pass image URLs

Add `sceneImageUrl={item.sceneImageUrl}` and `modelImageUrl={item.modelImageUrl}` to the `AddToDiscoverModal` props. These fields were added to `LibraryItem` but may not be wired to the modal.

## Files

| File | Change |
|------|--------|
| `src/components/app/DiscoverCard.tsx` | Remove workflow badge from top-left (lines 119-124) |
| `src/components/app/DiscoverDetailModal.tsx` | Merge workflow CTA into primary button, remove separate secondary |
| `src/components/app/LibraryDetailModal.tsx` | Pass `sceneImageUrl`/`modelImageUrl` to AddToDiscoverModal |

