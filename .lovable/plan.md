

# Short Film — Phase 3 Next Steps

## Current Status
The scaffold is solid: 6-step UI, film type + story structure selectors, shot plan generation/editing, settings panel, real DB persistence (video_projects/shots/inputs), real generation via `generate-video` edge function with polling, credit check, Model Library picker, and results display with video playback.

## What's still missing

### 1. Scene Library picker for references
The Model Library picker exists, but there is no "Pick from Scene Library" button for scene references. The `useProductImageScenes` hook is not used. Add a Scene Library dialog (similar to the Model picker) so users can pick scenes from existing admin-curated scenes.

### 2. Editable shot plan (drag-to-reorder + inline edit)
`ShotPlanEditor` renders `ShotCard` as read-only. The plan doc mentions drag-to-reorder, but no drag library is wired. Add:
- Drag-to-reorder using `@dnd-kit` (already likely in deps) or a simple move-up/move-down button approach
- Inline editing of shot purpose, camera motion, and duration
- Delete shot and add custom shot buttons

### 3. Script / voiceover input
The `ShotPlanItem` type has `script_line` but there's no UI to input script lines per shot, or a bulk script textarea. Add an optional script mode toggle in the story step or shot plan step where users can type voiceover lines per shot.

### 4. Tone / style customization
The prompt builder uses `TONE_MAP` based on film type but there's no user-facing tone input. Add a tone/mood text input or tag picker in the settings step so users can override or refine the tone directive.

### 5. AI-powered shot plan generation
Currently `generateShotPlan()` is a deterministic preset-based function. Enhance it to optionally call an AI model (Lovable AI Gateway) to generate a more creative, context-aware shot plan based on the film type, references, and any script input.

### 6. Polish & UX
- Credit estimate badge visible throughout the flow (not just review)
- Ability to "Start Over" / reset the flow
- Save draft project (persist partial state to DB before generation)
- Better error recovery (retry individual failed shots)

## Recommended implementation order

**Phase 3A** (immediate, high-impact UX):
1. Scene Library picker in references step
2. Editable shot plan (reorder + inline edit + add/remove shots)
3. Script input per shot

**Phase 3B** (refinement):
4. Tone customization UI
5. Credits badge throughout flow
6. Start over / reset

**Phase 3C** (advanced):
7. AI-powered shot plan generation via Lovable AI
8. Save draft projects
9. Retry failed shots individually

## Files to change

| File | Change |
|------|--------|
| `src/components/app/video/short-film/ReferenceUploadPanel.tsx` | Add Scene Library picker dialog |
| `src/components/app/video/short-film/ShotPlanEditor.tsx` | Add reorder, inline edit, add/delete shot |
| `src/components/app/video/short-film/ShotCard.tsx` | Add edit mode with inputs for purpose, camera, duration |
| `src/hooks/useShortFilmProject.ts` | Add `updateShot`, `removeShot`, `addShot`, `reorderShots` methods; expose `setShots` |
| `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx` | Add tone/mood input field |
| `src/types/shortFilm.ts` | Add `tone` to `ShortFilmSettings` |
| `src/pages/video/ShortFilm.tsx` | Pass new handlers to editors, add credits badge |

