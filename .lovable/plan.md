

# Fix Short Film Audio Generation

## Root Causes Found

1. **Silent error swallowing**: `generateAudio()` catches ALL ElevenLabs errors silently (lines 452-454, 489-494). If music/SFX/voiceover calls fail (rate limit, timeout, API error), the function still sets `audioPhase = 'done'` and `audioAssets = newAssets` (empty), so the user sees no error and no retry prompt.

2. **No audio status tracking in DB**: When audio generation fails, there's nothing in the DB to indicate it. On page reload via `loadDraft`, the code checks `sfx_url`/`audio_url`/`music_track_url` — all NULL — so no audio loads, but there's no indication it was attempted and failed.

3. **Audio generation depends on stale `shots` closure**: `generateAudio` is called at line 876 with `shots` from the `startGeneration` closure. If the AI planner updated shots with `script_line` values but the closure captured the old shots, voiceover generation skips all shots.

4. **"Generate Audio" button visibility logic is wrong**: Line 260 shows the manual button only when `audioPhase !== 'done'`. But `audioPhase` is always set to `'done'` even when everything failed, hiding the retry option.

## Implementation Plan

### 1. Fix `generateAudio` error handling (`useShortFilmProject.ts`)

- Track success/failure counts for music, SFX, voiceover
- If any track fails, set `audioPhase` to `'partial'` instead of `'done'`
- Show a toast with specifics: "Music generated, 2/4 SFX failed"
- Add `'partial'` to the `AudioPhase` type

### 2. Fix stale shots closure (`useShortFilmProject.ts`)

- Pass `shots` as a parameter to `generateAudio()` instead of relying on closure
- In `startGeneration`, call `generateAudio(currentProjectId, shots)` so it uses the actual shots array with `script_line` values

### 3. Fix "Generate Audio" button visibility (`ShortFilm.tsx`)

- Show "Generate Audio" button when:
  - `allSucceeded && !isGeneratingAudio && audioPhase !== 'done'` (current)
  - OR `allSucceeded && !isGeneratingAudio && audioPhase === 'done' && audioAssets has no tracks` (new: failed silently)
  - OR `audioPhase === 'partial'` (new: partial failure)
- Show error banner when audio generation produced partial results

### 4. Add audio generation status logging (`useShortFilmProject.ts`)

- After `generateAudio` completes, update `video_projects.settings_json` with audio generation status (succeeded/failed counts)
- On `loadDraft`, check if audio was expected but not generated, and auto-show the "Generate Audio" button

### Files to Update

| File | Change |
|------|--------|
| `src/hooks/useShortFilmProject.ts` | Fix `generateAudio` signature to accept shots param, add error tracking, add `'partial'` phase, log audio status to DB |
| `src/pages/video/ShortFilm.tsx` | Fix button visibility logic for audio retry |
| `src/types/shortFilm.ts` | (if AudioPhase type is defined here) Add `'partial'` value |

