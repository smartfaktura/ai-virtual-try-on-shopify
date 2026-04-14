

# Fix Short Film — Playback, Download, Audio, Script & Thumbnails

## Issues Found

### 1. Download/Play not working on completed films
**Root cause**: `loadDraft()` (line 153) restores shots, settings, and audio, but **never queries `video_shots` for `result_url`** to populate `shotStatuses`. So `completedClips` is always empty on reload, making Preview Film and Download All non-functional.

### 2. "Generate Audio" button showing after audio was already generated
**Root cause**: After `startGeneration()` completes all shots (line 875), it calls `generateAudio()` automatically. But the UI at line 240 shows the "Generate Audio" button when `allSucceeded && !isGeneratingAudio && audioMode !== 'silent|ambient'`. Since audio was already generated in the pipeline, the button should say "Regenerate Audio" — but the label check (`audioAssets.backgroundTrackUrl || perShotAudio.length > 0`) depends on state that may not be set yet due to async timing. Additionally, on draft reload, audio assets are restored but `audioPhase` is set to `'done'` without the UI knowing audio already ran.

**Fix**: Hide the standalone "Generate Audio" button entirely when `audioPhase === 'done'` and audio assets exist. Only show "Regenerate Audio" in that case.

### 3. No AI script lines (random film)
**Root cause**: When `planMode === 'auto'`, `generateShotPlan()` creates shots from `ROLE_DEFAULTS` which have no `script_line`. Only the AI Director mode generates script lines. The auto plan produces "random" feeling shots without narrative.

**Fix**: Add default `script_line` values to `ROLE_DEFAULTS` in `shortFilmPlanner.ts` so every auto-generated shot has a suggested voiceover line. These serve as starting points that users can edit.

### 4. Scene references not suitable for Kling video
**Root cause**: The scene library pulls from `product_image_scenes` which are designed for still image generation, not video. The user wants text-described scene presets instead.

**Fix**: Replace the scene picker library with 12 built-in text-described scene presets (e.g., "Minimalist studio with soft shadows", "Golden hour outdoor terrace"). Each has a description and optional mood tag. Users can also type custom scene descriptions or upload their own reference images. Remove the dependency on `useProductImageScenes` from the short film flow.

### 5. Thumbnail stripes for selected references
**Root cause**: Selected reference chips (line 243) use `object-contain` inside 64x64 boxes. When source images are very tall/narrow (e.g., product catalog photos), they render as thin vertical stripes. These small chips should use `object-cover` to fill the box, while the full picker dialogs keep `object-contain`.

## Plan

### File: `src/hooks/useShortFilmProject.ts`

**A. Restore shot statuses on draft load**
In `loadDraft()`, after restoring shots, query `video_shots` for `result_url` and `status`, then populate `shotStatuses` so completed clips are available for playback/download.

**B. Fix audio button visibility**
Track whether audio was auto-generated during the pipeline. When `audioPhase === 'done'` and assets exist, don't show the "Generate Audio" button (only "Regenerate Audio").

### File: `src/lib/shortFilmPlanner.ts`

**C. Add default script lines to ROLE_DEFAULTS**
Add `script_line` to each role default, e.g.:
- hook: "Every great story begins with a single frame."
- product_reveal: "Introducing something extraordinary."
- detail_closeup: "Crafted with precision, down to every detail."
- brand_finish: "This is more than a product. This is a statement."
- etc. for all roles

### File: `src/components/app/video/short-film/ReferenceUploadPanel.tsx`

**D. Replace scene library with text-described presets**
- Remove `useProductImageScenes` import and usage
- Add 12 built-in scene description presets as a constant array (title + description + mood)
- Scene picker shows these as selectable text cards (no images needed)
- When selected, store as a scene reference with the description as the name
- Keep the upload dropzone for custom scene images

**E. Fix selected reference thumbnail stripes**
- Change `object-contain` to `object-cover` on the selected reference chips (line 243-246) — these are small 64x64 previews where filling the box is more important than showing the full image

### File: `src/pages/video/ShortFilm.tsx`

**F. Fix Generate Audio button logic**
- Only show "Generate Audio" if audio hasn't been generated yet (`audioPhase !== 'done'`)
- Show "Regenerate Audio" only when audio assets already exist

### Files to change

| File | Changes |
|------|---------|
| `src/hooks/useShortFilmProject.ts` | Restore shotStatuses from video_shots on draft load; fix audio state |
| `src/lib/shortFilmPlanner.ts` | Add default script_line to all ROLE_DEFAULTS |
| `src/components/app/video/short-film/ReferenceUploadPanel.tsx` | Replace scene library with 12 text presets; fix selected ref thumbnails to object-cover |
| `src/pages/video/ShortFilm.tsx` | Fix Generate Audio button conditional |

