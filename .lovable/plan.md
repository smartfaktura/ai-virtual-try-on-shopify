
Fix Short Film: progress UX, black final player, broken audio mix, wrong shot timing, and weak model/scene fidelity

What I found
- The latest short film already has a real final video plus saved music, SFX, and voiceover files in the backend. So generation is mostly succeeding; the main failures are in playback/UI and prompt/reference mapping.
- There is no elapsed time, ETA, or “safe to close” guidance because `ShortFilmProgressPanel.tsx` only shows a pulsing bar and rotating copy.
- The success state uses a raw `<video>` with no poster, no loading/error state, and no combined-film preview handling. That makes a finished film look like a black empty box.
- Audio is not actually missing from generation data; `SingleVideoPlayer` ignores `audioAssets`, so the combined-film path never plays music/SFX/voiceover.
- Manual audio buttons still call `generateAudio()` without explicitly passing `projectId`.
- Shot timing is still being flattened in `ai-shot-planner/index.ts` because it overwrites AI durations with `Number(shotDuration) || 5`, so the storyboard/breakdown can still show fake 5s shots.
- Model/scene fidelity is too weak: text-only scene presets are not injected into prompts, and human shots are not strongly constrained against hanger/mannequin/product-only outputs.

Implementation plan

1. Add real generation progress UX
- In `useShortFilmProject.ts`, track generation start time and restore processing projects when reopened.
- In `ShortFilmProgressPanel.tsx`, show:
  - elapsed time
  - estimated time range
  - clearer current phase text
  - “You can close this page — your film will keep rendering in the background”
- Keep the storyboard visible, but make it clearly informational rather than fake per-shot completion.

2. Fix the final result player
- Replace the plain success `<video>` block in `ShortFilm.tsx` with a proper single-film result card:
  - loading state
  - metadata/error fallback
  - explicit retry/open-video fallback
  - poster support when available
- Make all short-film CTAs say `Download`, not `Download All`.
- If needed, also patch `generate-video/index.ts` so omni jobs save/use a preview image when available.

3. Make audio work on the combined final film
- Refactor `ShortFilmVideoPlayer.tsx` so `SingleVideoPlayer` accepts shot metadata and reuses the mixer behavior.
- Add:
  - background music sync
  - per-shot voiceover/SFX triggering from cumulative shot offsets
  - seek / pause / resume handling
  - mixer controls for Music / SFX / Voice
- In `ShortFilm.tsx`, pass shots metadata into the player.
- Fix manual audio buttons to call `generateAudio(projectId)` explicitly.

4. Make timing truthful everywhere
- In `supabase/functions/ai-shot-planner/index.ts`, stop replacing AI durations with the stale global `shotDuration`.
- Remove remaining stale `5s per shot` assumptions from the short-film flow and always derive totals from live `duration_sec`.
- Recheck review/progress/success labels so they always reflect actual shot durations and total film length.

5. Strengthen scene + human fidelity
- In `shortFilmPromptBuilder.ts`, inject selected scene preset text into prompts when the scene reference has no image URL.
- For `character_visible` shots, add stronger directives and negatives so the model must appear and hanger/mannequin substitutions are discouraged.
- Improve reference mapping so human + product shots can carry both model and product intent instead of relying on a single fallback image.

6. Make audio/storyboard decisions visible to the user
- In `ShotCard.tsx` / review UI, show which references each shot is using.
- Surface the exact voiceover line per shot in review/success so users can see what will be spoken and where.

Files to update
- `src/components/app/video/short-film/ShortFilmProgressPanel.tsx`
- `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx`
- `src/pages/video/ShortFilm.tsx`
- `src/hooks/useShortFilmProject.ts`
- `src/components/app/video/short-film/ShortFilmStickyBar.tsx`
- `src/lib/shortFilmPromptBuilder.ts`
- `src/components/app/video/short-film/ShotCard.tsx`
- `src/components/app/video/short-film/ShortFilmReviewSummary.tsx`
- `supabase/functions/ai-shot-planner/index.ts`
- possibly `supabase/functions/generate-video/index.ts` for omni poster/preview support

Expected result
- Users see elapsed time, ETA, and safe-to-close messaging.
- Finished films display as one real playable result instead of a black-looking blank player.
- Download points to the actual final film.
- Music, SFX, and voiceover play in sync on the combined-film preview.
- Shot breakdown uses real durations.
- Human/model shots follow the selected references more reliably.
