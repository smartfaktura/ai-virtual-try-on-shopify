

# Fix: Audio Mode Not Applied to Video Generation

## Problem

The `AudioModeSelector` lets users pick Silent/Ambient, but the selection is never sent to the Kling API. It's stored in `video_shots.audio_mode` and `video_projects.settings_json` but has zero effect on the actual generation.

The pipeline chain is broken at two points:
1. `useVideoProject.ts` line 147-155 — `startGeneration()` does not pass any audio parameter
2. `generate-video/index.ts` — the Kling API request body never includes audio configuration

## How Kling V3 Audio Works

Kling V3/Omni supports a `with_audio` boolean parameter on image-to-video requests. When `true`, Kling generates ambient sound matching the video content. Voice/lip-sync requires a separate audio input which is not yet supported in our pipeline.

## Fix Plan

### 1. Pass audio mode through the generation chain

**`src/hooks/useVideoProject.ts`** — Add audio param to `startGeneration()` call:
- Map `audioMode: 'ambient'` → pass `withAudio: true`
- Map `audioMode: 'silent'` → pass `withAudio: false`

**`src/hooks/useGenerateVideo.ts`** — Accept `withAudio?: boolean` in `startGeneration` params, forward it to the edge function body.

**`supabase/functions/generate-video/index.ts`** — When `with_audio` is truthy, add it to the Kling API request body as `with_audio: true`.

### 2. Files to modify
- `src/hooks/useVideoProject.ts` — 1 line change (add `withAudio` to startGeneration call)
- `src/hooks/useGenerateVideo.ts` — accept + forward `withAudio` param
- `supabase/functions/generate-video/index.ts` — add `with_audio` to Kling request body

### 3. Also fix: forwardRef console warning
The console shows a `forwardRef` warning from `VideoResultsPanel`. Wrap it with `React.forwardRef` to suppress the error.

