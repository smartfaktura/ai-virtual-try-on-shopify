

# Multi Camera Motion Selection (Paid Only)

## Concept
Allow paid users to select **multiple camera motions** for the same image. Each selected motion generates a separate video job — so selecting 3 camera motions = 3 videos from 1 image.

## Changes

### 1. `MotionRefinementPanel.tsx` — Multi-select camera motion chips
- Add `multiSelect?: boolean` and `onMultiCameraMotionChange?: (ids: string[]) => void` props
- When `multiSelect` is true, the Camera Motion `ChipRow` becomes a toggle — clicking a chip adds/removes it from a `string[]` instead of replacing a single value
- Selected chips show checkmark or filled style; minimum 1 must stay selected
- Show count badge like "3 motions × N credits each"

### 2. `AnimateVideo.tsx` — Wire multi-motion to generation
- Add `selectedCameraMotions: string[]` state (defaults to `[cameraMotion]`), synced when single `cameraMotion` changes
- Pass `multiSelect={isPaidUser}` to `MotionRefinementPanel`
- On generate: if multiple motions selected, loop through each motion and call `runAnimatePipeline` sequentially (reusing the same image + settings but swapping `cameraMotion`)
- Update credit estimate: multiply per-video cost × number of selected motions (× bulk images if in batch mode)
- Free users: single-select only (current behavior unchanged)

### 3. `useVideoProject.ts` — No changes needed
The existing `runAnimatePipeline` already accepts `cameraMotion` as a param and names projects with the motion label. Each call with a different motion will create a separate project with the correct name.

### 4. Credit display update
- Show "N camera motions selected → N videos" messaging near the credit estimate
- In batch mode: total = images × motions × per-video cost

## Files
- **Update**: `src/components/app/video/MotionRefinementPanel.tsx`
- **Update**: `src/pages/video/AnimateVideo.tsx`

