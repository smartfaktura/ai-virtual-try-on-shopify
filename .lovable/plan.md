

# Fix: Camera Control Not Supported by Kling Model

## Problem
Kling's `image2video` endpoint returns "Camera control is not supported by the current model" when we pass the `camera_control` parameter. The `kling-v3` model doesn't support structured camera control for image-to-video generation.

## Solution
Remove structured `camera_control` from the pipeline entirely. Rely on prompt-based camera instructions (which already exist in the prompt builder).

### Changes

**1. `src/lib/videoStrategyResolver.ts`**
- Make `resolveCameraControlConfig` always return `undefined`
- Keep the function signature so nothing breaks, but it never produces a config

**2. `supabase/functions/generate-video/index.ts`**  
- Remove the `camera_control` extraction and injection into `klingBody`

**3. `src/hooks/useGenerateVideo.ts`**
- Stop passing `camera_control` in the queue payload

**4. `src/hooks/useVideoProject.ts`**
- Stop passing `cameraControlConfig` to `startGeneration`

All camera motion will continue to work via prompt text (e.g., "smooth orbiting camera movement around the subject") which is already built by the strategy's prompt layer.

### Files Modified
- `src/lib/videoStrategyResolver.ts`
- `supabase/functions/generate-video/index.ts`
- `src/hooks/useGenerateVideo.ts`
- `src/hooks/useVideoProject.ts`

