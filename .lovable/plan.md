

# Fix Camera Orbit — Send Structured `camera_control` to Kling API

## Root Cause

The code currently has a comment "Structured camera_control is not supported by kling-v3 image2video" and returns `undefined` for all camera control configs. This means **all camera motion (including orbit) is driven only via prompt text** like "smooth orbiting camera movement around the subject."

However, according to the official Kling API documentation:

1. The `camera_control` parameter **IS documented** on the image2video endpoint (lines 392-460 of the official docs)
2. It supports `type: "simple"` with 6 axes: `horizontal`, `vertical`, `pan`, `tilt`, `roll`, `zoom` (range -10 to 10)
3. It also supports preset types: `down_back`, `forward_up`, `right_turn_forward`, `left_turn_forward`
4. The kling-v3 capability map lists "motion control ✅" for image2video

The result: when users select "Orbit," the prompt says "orbiting camera" but Kling interprets this as **rotating the subject in place** rather than moving the camera around it. Structured `camera_control` with a `pan` value would produce true camera rotation.

## Fix

### 1. `src/lib/videoStrategyResolver.ts` — Enable `camera_control` config

Replace the `resolveCameraControlConfig` function (currently returns `undefined`) with actual mappings:

```text
static       → no camera_control (let model decide)
slow_push_in → { type: "simple", config: { zoom: -3 } }
gentle_pan   → { type: "simple", config: { pan: 4 } }
camera_drift → { type: "simple", config: { horizontal: 2 } }
premium_handheld → no structured control (prompt-only is fine)
orbit        → { type: "simple", config: { pan: 8 } }
```

For `orbit`, a high `pan` value (8 out of 10) rotates the camera around the Y-axis — this is true camera orbiting, not subject rotation.

### 2. `supabase/functions/generate-video/index.ts` — Pass `camera_control` to Kling

In `handleWorkerMode`, read `camera_control_config` from the payload and add it to the Kling API request body:

```typescript
const cameraControlConfig = body.camera_control_config as { type: string; config: Record<string, number> } | undefined;
if (cameraControlConfig) {
  klingBody.camera_control = cameraControlConfig;
}
```

Remove the comment that says camera_control is disabled.

### 3. `src/hooks/useGenerateVideo.ts` — Forward config to payload

In `startGeneration`, pass the `cameraControlConfig` through to the queue payload so the edge function receives it.

### 4. `src/lib/videoPromptTemplates.ts` — Soften prompt camera instructions when structured control is active

When structured `camera_control` is being sent, reduce the prompt camera clause to avoid conflicting with the API parameter. Change `buildCameraClause` to return a lighter hint when structured control handles it (e.g., just omit the clause for orbit/push-in/pan).

## Files Modified
- `src/lib/videoStrategyResolver.ts` — enable camera_control_config mapping
- `supabase/functions/generate-video/index.ts` — pass camera_control to Kling API
- `src/hooks/useGenerateVideo.ts` — forward cameraControlConfig in payload
- `src/lib/videoPromptTemplates.ts` — soften prompt when structured control is active

