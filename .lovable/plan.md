

# Fix: Orbit Camera Motion Not Working in Video Generation

## Root Cause

Two issues combine to make "orbit" produce only slight movement:

1. **`camera_control` is never sent to Kling API**: The strategy resolver builds a `camera_control_config` object for orbit, but the `generate-video` edge function ignores it entirely — it never adds `camera_control` to the Kling API request body.

2. **Prompt-only orbit doesn't work**: The prompt says "smooth orbiting camera movement around the subject," but video generation models interpret prompts as continuous single-shot action. They cannot execute a true orbit path from text alone. The Kling API has a structured `camera_control` parameter specifically for this.

## Solution

### 1. Pass `camera_control` to the Kling API (`supabase/functions/generate-video/index.ts`)

In the worker mode, read `camera_control` from the payload and add it to the Kling API request body:

```typescript
// After existing klingBody construction
const cameraControl = body.camera_control as Record<string, unknown> | undefined;
if (cameraControl) {
  klingBody.camera_control = cameraControl;
}
```

### 2. Pass `camera_control` through the queue payload (`src/hooks/useGenerateVideo.ts`)

When calling `enqueue-generation`, include the camera control config from the strategy:

- Add `camera_control` to the payload sent to the queue
- Source it from the strategy's `camera_control_config`

### 3. Wire camera control from pipeline to hook (`src/hooks/useVideoProject.ts`)

Pass the resolved `camera_control_config` from the strategy through to `generateVideo.startGeneration()`.

### 4. Increase orbit strength (`src/lib/videoStrategyResolver.ts`)

The current orbit config uses `horizontal: 10` which is the minimum. Increase to a meaningful value:

```typescript
case 'orbit':
  return { type: 'simple', config: { horizontal: 30, vertical: 0, zoom: 0, tilt: 0, pan: 0, roll: 0 } };
```

Also add camera control configs for other motion types that benefit from structured params:
- `slow_push_in`: `zoom: 5`  
- `gentle_pan`: `pan: 20`

### Files Modified
- `supabase/functions/generate-video/index.ts` — pass `camera_control` to Kling API
- `src/hooks/useGenerateVideo.ts` — include `camera_control` in queue payload
- `src/hooks/useVideoProject.ts` — wire strategy's camera control config through
- `src/lib/videoStrategyResolver.ts` — increase orbit strength, add more structured configs

