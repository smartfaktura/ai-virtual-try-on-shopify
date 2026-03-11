

## Multi-Scene Selection for Virtual Try-On Workflow

Currently, the Virtual Try-On workflow only allows selecting one scene (`selectedPose`). Other workflows already support multi-scene selection via `selectedVariationIndices` with limits (`FREE_SCENE_LIMIT=1`, `PAID_SCENE_LIMIT=3`). This plan brings the same multi-select capability to the try-on pose step.

### Changes

**1. `src/pages/Generate.tsx`** (core logic)
- Add `selectedPoses` state (`Set<string>` of pose IDs) alongside existing `selectedPose` (keep for backward compat in single-scene contexts)
- Add `selectedPoseMap` (`Map<string, TryOnPose>`) to store full pose objects by ID
- Update `handleSelectPose` to toggle poses in/out of the set, enforcing `FREE_SCENE_LIMIT` / `PAID_SCENE_LIMIT`
- Update the "Continue" button to require at least 1 selected pose
- Update `handleTryOnConfirmGenerate` and `enqueueTryOnForProduct` to loop through all selected poses, enqueuing one job per scene per product (same pattern as workflow batch generation)
- Update credit cost calculation to multiply by number of selected scenes
- Update the TryOnPreview and summary sections to show all selected scenes
- Set `selectedPose` to the first selected pose for preview display

**2. `src/components/app/PoseCategorySection.tsx`**
- Change `selectedPoseId: string | null` to `selectedPoseIds: Set<string>`
- Update `PoseSelectorCard` rendering to check membership in the set
- Add optional `maxSelectable` prop to show selection count badges

**3. `src/components/app/PoseSelectorCard.tsx`**
- Add multi-select visual: show a numbered badge or checkmark when selected in multi-mode

**4. `src/components/app/TryOnPreview.tsx`**
- Accept `poses: TryOnPose[]` (array) instead of single `pose`
- Show thumbnails of all selected scenes in the preview strip

**5. Credit & Summary Updates**
- The settings step summary already shows scene count for workflow variations; replicate this for try-on: `"{n} scenes x {credits} credits"`
- Free users remain locked to 1 scene; paid users can select up to 3

### Generation Flow (Multi-Scene Try-On)
Each selected scene becomes an independent queue job (same as workflow variation batching). For multi-product + multi-scene, jobs = products x scenes. The existing burst rate limits and concurrency guards in `enqueue_generation` RPC handle throttling.

