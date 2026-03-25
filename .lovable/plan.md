

# Video Tab V1-A — What's Built vs What's Missing

## What IS built and working

1. **Video Hub page** (`/app/video`) — 3 workflow cards, recent videos gallery
2. **Animate Image page** (`/app/video/animate`) — upload, style presets, motion recipes, settings (aspect ratio, duration, audio, motion intensity, preserve scene), credit estimate, generate button, results panel
3. **Shared components** — all 7 created: VideoWorkflowCard, MotionPresetSelector, StylePresetSelector, AudioModeSelector, CreditEstimateBox, ValidationWarnings, VideoResultsPanel
4. **Database tables** — video_projects, video_inputs, video_shots with RLS
5. **Edge function** — `analyze-video-input` exists and is deployed
6. **Strategy resolver** — `src/lib/videoStrategyResolver.ts` exists
7. **Prompt builder** — `src/lib/videoPromptTemplates.ts` exists
8. **Credit pricing config** — `src/config/videoCreditPricing.ts` exists
9. **Routing** — `/app/video` and `/app/video/animate` wired in App.tsx

## What is NOT wired up (the gaps)

### Gap 1: No `useVideoProject` hook
The plan called for a hook that manages the full lifecycle: create project -> upload inputs -> run analysis -> resolve strategy -> build prompt -> submit to Kling -> poll -> save results. This was never created. Instead, AnimateVideo calls `useGenerateVideo` directly with raw params.

### Gap 2: AnimateVideo does NOT use the three-layer pipeline
The generate handler (line 89-95) passes `imageUrl`, `prompt`, `duration`, `aspectRatio`, and `mode` directly to `useGenerateVideo.startGeneration()`. It completely bypasses:
- The AI analysis edge function (`analyze-video-input`)
- The strategy resolver (`resolveVideoStrategy`)
- The prompt builder (`buildVideoPrompt`)

The style preset, motion recipe, motion intensity, preserve scene toggle, and audio mode selections are all **captured in state but never used in generation**. They are purely decorative right now.

### Gap 3: No video_projects/video_inputs/video_shots records created
The Animate workflow does not create a `video_projects` row, does not insert into `video_inputs`, and does not create `video_shots` records. The new tables are unused.

### Gap 4: generate-video edge function not extended
The `generate-video` edge function was not updated to accept `workflow_type` or `project_id` params as planned.

---

## Implementation plan to close the gaps

### 1. Create `src/hooks/useVideoProject.ts`
New hook that orchestrates the full pipeline:
- `createProject(workflowType, settings)` — inserts into `video_projects`
- `addInput(projectId, imageUrl, role)` — inserts into `video_inputs`
- `runAnalysis(projectId)` — calls `analyze-video-input` edge function, stores result in `video_inputs.analysis_json`
- `generateAnimateVideo(projectId, userSelections)` — reads analysis from DB, runs `resolveVideoStrategy()`, runs `buildVideoPrompt()`, creates a `video_shots` row, then calls `startGeneration` from `useGenerateVideo` with the built prompt/settings
- Exposes the project state, analysis status, and generation status

### 2. Wire AnimateVideo.tsx to use the pipeline
Replace the current `handleGenerate` to:
1. Create a video_project
2. Insert video_input with the uploaded image
3. Call analyze-video-input (show "Analyzing image..." state)
4. Run resolveVideoStrategy with analysis + user selections (style, motion recipe, intensity, preserveScene, audio)
5. Run buildVideoPrompt with strategy + analysis
6. Create video_shot record
7. Call generate-video with the built prompt, cfg_scale, camera control from prompt builder output
8. Poll and update video_shots.result_url on completion

### 3. Update generate-video edge function
Add optional `project_id` and `workflow_type` params. When present, store them in the `generated_videos` row. Backward compatible — existing direct calls still work.

### Files to create
- `src/hooks/useVideoProject.ts`

### Files to modify
- `src/pages/video/AnimateVideo.tsx` — use useVideoProject instead of direct useGenerateVideo
- `supabase/functions/generate-video/index.ts` — accept project_id + workflow_type

