

# Add Missing Kling V3 API Parameters to Video Generator

## Current State
**Parameters we send:** `model_name`, `image`, `duration`, `mode`, `prompt`, `aspect_ratio`, `image_tail`

**Parameters we're missing** (supported by Kling I2V API):

| Parameter | Type | Description |
|-----------|------|-------------|
| `negative_prompt` | string | What to avoid in the video |
| `cfg_scale` | float 0–1 | Creativity vs fidelity (lower = more creative, higher = closer to prompt/image) |
| `camera_control` | object | Camera movement presets (zoom in/out, pan left/right, tilt up/down, etc.) |
| `mode` | `std` / `pro` | Already supported but only toggled via Loop Mode — should be an independent control |

**Not recommended to add** (too advanced / niche):
- `static_mask` / `dynamic_mask` — requires mask image upload, complex UX
- `callback_url` — webhook-based, we use polling

## Plan

### 1. Edge Function — `supabase/functions/generate-video/index.ts`
- Accept new optional params: `negative_prompt`, `cfg_scale`, `camera_control`
- Pass them to Kling body when present
- Store `cfg_scale` and camera type in DB for history display

### 2. Database — Add columns to `generated_videos`
- `negative_prompt` (text, nullable)
- `cfg_scale` (numeric, nullable)
- `camera_type` (text, nullable) — stores the camera preset name

### 3. Client Hook — `src/hooks/useGenerateVideo.ts`
- Extend `startGeneration` params interface with `negativePrompt`, `cfgScale`, `cameraControl`
- Pass new fields to the edge function

### 4. UI — `src/pages/VideoGenerate.tsx`
Add these controls to the Configuration panel:

- **Mode toggle** (Standard / Professional) — independent from Loop Mode. Pro mode = higher quality, slower, more credits
- **CFG Scale slider** — 0 to 1, step 0.05, default 0.5. Label: "Prompt Adherence"
- **Negative Prompt** — collapsible text input: "What to avoid"
- **Camera Control** — chip selector with presets:
  - None (default)
  - Zoom In / Zoom Out
  - Pan Left / Pan Right
  - Tilt Up / Tilt Down
  - Roll Clockwise / Roll Counter-clockwise

### Files Changed
- `supabase/functions/generate-video/index.ts` — accept & forward new params
- `src/hooks/useGenerateVideo.ts` — extend params interface
- `src/pages/VideoGenerate.tsx` — add UI controls
- New migration — add columns to `generated_videos`

