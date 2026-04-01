

# Show More Metadata in Video Detail Modal

## Current State
The VideoDetailModal shows only: prompt, duration, aspect ratio. The `generated_videos` table has `camera_type` and `project_id` (FK to `video_projects`). The `video_projects.settings_json` contains all generation settings: category, sceneType, motionGoalId, cameraMotion, subjectMotion, realismLevel, loopStyle, motionIntensity, audioMode, etc.

## Changes

### 1. `src/hooks/useGenerateVideo.ts` — Fetch project settings alongside video

- Expand `GeneratedVideo` interface to include `workflow_type` and `settings_json` (from the joined `video_projects` table)
- Update the history query to join `video_projects` via `project_id`:
  ```
  .select('*, video_projects(settings_json, workflow_type)')
  ```
- Flatten the joined data into the `GeneratedVideo` object

### 2. `src/components/app/video/VideoDetailModal.tsx` — Display metadata section

Add a "Settings" section between the prompt and action buttons showing:
- **Camera Motion** — from `camera_type` or `settings_json.cameraMotion`, formatted (e.g. "Slow Push-in")
- **Style / Category** — from `settings_json.category` (e.g. "Editorial", "Product Hero")
- **Scene Type** — from `settings_json.sceneType`
- **Motion Goal** — from `settings_json.motionGoalId`
- **Subject Motion** — from `settings_json.subjectMotion`
- **Realism** — from `settings_json.realismLevel`
- **Loop Style** — from `settings_json.loopStyle`
- **Audio** — from `settings_json.audioMode`

Display as a compact two-column grid of label/value pairs, same style as the existing duration/aspect ratio chips but in a structured list. Only show fields that have values.

Also update the download filename to use `camera_type` instead of generic hash (matching the ZIP naming fix).

### Files
- **Update**: `src/hooks/useGenerateVideo.ts` — expand interface + join query
- **Update**: `src/components/app/video/VideoDetailModal.tsx` — render metadata grid

