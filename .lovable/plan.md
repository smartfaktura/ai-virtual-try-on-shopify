

# Phase 3: Pose + Background Selection Steps

## What gets built
Add Steps 3 (Poses) and 4 (Backgrounds) to the CatalogGenerate page, with multi-select grids and live matrix/credit calculation.

## Approach
Reuse the existing `mockTryOnPoses` data which already contains both **fashion poses** (poseId `pose_*`, categories: studio/lifestyle/editorial/streetwear) and **product scenes/backgrounds** (poseId `scene_*`, categories: clean-studio/surface/flat-lay/etc.). Split them into two lists:
- **Poses** = entries where `poseId` starts with `pose_` (fashion model poses)
- **Backgrounds** = entries where `poseId` starts with `scene_` (product environment scenes)

This avoids creating new data — we reuse the existing 30 poses and 30+ scenes with their preview images and prompt hints.

## Files to modify

### 1. `src/pages/CatalogGenerate.tsx`
- Add state: `selectedPoseIds: Set<string>`, `selectedBackgroundIds: Set<string>` (max 6 each)
- Add Steps 3 and 4 to the stepper array (icons: `Move`, `Image`)
- **Step 3 — Poses**: Filter `mockTryOnPoses` to `pose_*` entries, group by category, render using existing `PoseCategorySection` + `PoseSelectorCard` with multi-select (pass `selectedPoseIds` set). Show selection order numbers on cards.
- **Step 4 — Backgrounds**: Filter `mockTryOnPoses` to `scene_*` entries, group by category, render same `PoseCategorySection` + `PoseSelectorCard` pattern with multi-select.
- Update stepper navigation: Step 2 "Continue to Poses", Step 3 "Continue to Backgrounds", Step 4 shows a disabled "Generate" button (Phase 4)
- Pass `poseCount` and `backgroundCount` to `CatalogMatrixSummary`
- Also merge in custom scenes from `useCustomScenes` hook (user-uploaded scenes from DB)

### 2. `src/components/app/PoseCategorySection.tsx`
- Already supports `selectedPoseIds` (multi-select Set) and `selectionIndex` — no changes needed.

### 3. `src/components/app/PoseSelectorCard.tsx`
- Already supports `selectionIndex` prop — no changes needed.

## Key decisions
- **Max 6 poses, max 6 backgrounds** — keeps matrix manageable (50 products × 5 models × 6 poses × 6 backgrounds = 9000 max, but typical use is ~2-3 each)
- **Reuse existing pose/scene data** — no new data files, just filter by poseId prefix
- **Category grouping** — poses grouped by studio/lifestyle/editorial/streetwear; backgrounds grouped by clean-studio/surface/botanical/etc.

## Test checkpoint
1. Navigate to `/app/catalog`, select products → models → verify Steps 3 and 4 appear
2. Multi-select poses with selection order numbers
3. Multi-select backgrounds with selection order numbers  
4. Matrix summary updates live: "20 × 2 × 3 × 2 = 240 images (960 credits)"
5. Can navigate back and forth between all 4 steps

