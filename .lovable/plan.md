

# Short Film — Next Steps Plan

## What's built (Phase 1 scaffold)
- 6-step UI flow with stepper navigation
- Film type selector (8 presets)
- Story structure selector (4 presets + custom)
- Shot plan engine generating cards from presets
- Shot plan editor with drag-to-reorder
- Settings panel (aspect ratio, audio, duration)
- Progress panel with simulated per-shot generation

## What's missing — prioritized next steps

### 1. Real Reference Uploads (replace blob URLs)
The ReferenceUploadPanel currently uses `URL.createObjectURL` — files never leave the browser. Wire it to:
- **Product refs**: use existing `useFileUpload` hook to upload to storage
- **Scene refs**: add a "Pick from Scene Library" button using `useProductImageScenes`
- **Model refs**: add a "Pick from Model Library" button using `useCustomModels`
- **Style/Logo**: upload via `useFileUpload`

Each uploaded file gets stored as a `video_inputs` record with the correct `input_role`.

### 2. Database Persistence
Wire `useShortFilmProject` to actually create records:
- On "Generate": create a `video_projects` row with `workflow_type: 'short_film'` and `settings_json` containing film type, structure, tone
- Create `video_inputs` rows for each reference (product_ref, scene_ref, model_ref, logo, style_ref)
- Create `video_shots` rows for each shot in the plan with `shot_role`, `shot_index`, `strategy_json`, `prompt_text`, `duration_sec`

### 3. Real Generation (replace setTimeout simulation)
Replace the simulated 3-second delay with actual calls to the `generate-video` edge function:
- Build a prompt per shot using the shot plan item + references + tone
- Call `generate-video` sequentially for each shot
- Poll `generation_queue` for status per shot
- Store result URLs back on `video_shots`

### 4. Shot Prompt Builder
Create `src/lib/shortFilmPromptBuilder.ts` — converts a `ShotPlanItem` + references + tone into a structured prompt string for the video generation API. This is the "AI director" logic that makes each shot contextual.

### 5. Credit Check + Deduction
Before generation, validate the user has enough credits (shots x per-shot cost + planning fee). Deduct credits as each shot completes, using the existing credit system.

### 6. Results Display
After generation completes, show the generated video clips in the review step — each shot card displays its output video with playback controls. Link to the Video Hub for the full project view.

---

## Files changed

| File | Action |
|------|--------|
| `src/components/app/video/short-film/ReferenceUploadPanel.tsx` | Integrate Scene Library, Model Library, real uploads |
| `src/hooks/useShortFilmProject.ts` | Add DB persistence, real generation calls, credit checks |
| `src/lib/shortFilmPromptBuilder.ts` | New — build per-shot prompts from plan + refs |
| `src/pages/video/ShortFilm.tsx` | Add results display after generation |
| `src/components/app/video/short-film/ShortFilmProgressPanel.tsx` | Wire to real shot statuses from DB |

## Suggested order
1. Reference uploads + library integration (most user-visible improvement)
2. DB persistence + prompt builder
3. Real generation wiring
4. Credit checks + results display

