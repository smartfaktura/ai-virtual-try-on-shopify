

# Short Film Audio Integration — Current Audit & Next Steps

## Current State: What's Built

**Backend — 3 Edge Functions (deployed):**
- `elevenlabs-music` — generates background tracks (up to 120s) from text prompts
- `elevenlabs-sfx` — generates per-shot sound effects (up to 22s) from descriptions
- `elevenlabs-tts` — generates voiceover from script lines with selectable voices

**Frontend — Fully wired:**
- Settings panel: 5 audio modes (Silent, Ambient, Music, Voiceover, Full Mix), music prompt input, voice picker (10 voices), preview audio button
- `generateAudio()` fires after video generation; uploads blobs to `generated-audio` storage bucket and persists URLs to DB
- Per-shot audio progress with status chips (generating/done/failed)
- Individual retry buttons for failed SFX/voiceover per shot
- Regenerate Audio button on completed projects
- `ShortFilmVideoPlayer` syncs background track + per-shot audio with volume mixer (Music/SFX/Voice sliders)

**Database & Storage:**
- `video_projects.music_track_url` column exists
- `video_shots.audio_url` and `video_shots.sfx_url` columns exist
- `generated-audio` private bucket with owner-based RLS policies

**Auth:** All three edge functions use `getUser()` (fixed from `getClaims`)

## Issues Found

### 1. Broken CORS Import (Critical)
All three edge functions import CORS headers from a non-existent path:
```
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
```
This module does not exist in the Supabase JS SDK. Other edge functions in this project (e.g. `generate-video`) define `corsHeaders` inline as a constant. This will cause a runtime import error and **break all three audio edge functions**.

### 2. Signed URLs Expire After 1 Hour
Audio URLs persisted to DB use `createSignedUrl(path, 3600)` — a 1-hour expiry. If the user returns to a project after an hour, all audio links are dead. Should either use longer-lived signed URLs or generate fresh signed URLs on load.

### 3. No Audio Reload from DB
When a user returns to a completed project (via `loadDraft`), persisted audio URLs are not loaded back into `audioAssets` state. The player will show no audio even though URLs exist in the database.

### 4. SFX Only Generates in `full_mix` Mode
The `generateAudio` function only generates SFX when `mode === 'full_mix'`. There is no standalone "SFX only" audio mode — users who want ambient SFX without music/voiceover have no option.

### 5. Preview Button State Bug
The preview button uses `isPreviewing` for both the loading state and the stop action, but never properly toggles to a "stop" state — once audio starts playing, clicking again tries to pause `previewAudioRef.current`, but `isPreviewing` is still true so the button shows "Generating preview..." and is disabled.

## Recommended Next Steps

### Phase 1: Fix Critical Bugs (must-do)

| # | Task | Files |
|---|------|-------|
| 1 | **Fix CORS import** — replace the broken import with an inline `corsHeaders` constant in all 3 edge functions | `supabase/functions/elevenlabs-{music,sfx,tts}/index.ts` |
| 2 | **Fix signed URL expiry** — use 7-day signed URLs (604800s) or regenerate on load | `src/hooks/useShortFilmProject.ts` |
| 3 | **Load persisted audio on draft resume** — when `loadDraft` restores a completed project, query `video_projects.music_track_url` and `video_shots.audio_url`/`sfx_url`, regenerate signed URLs, and populate `audioAssets` state | `src/hooks/useShortFilmProject.ts` |

### Phase 2: UX Polish (should-do)

| # | Task | Files |
|---|------|-------|
| 4 | **Fix preview button state** — separate `isLoadingPreview` from `isPlayingPreview` so the button correctly shows "Stop" while audio plays and "Preview" when idle | `ShortFilmSettingsPanel.tsx` |
| 5 | **Add "SFX only" audio mode** or generate SFX in `music` mode too, so users can get ambient sounds without needing full_mix | `useShortFilmProject.ts`, `ShortFilmSettingsPanel.tsx` |

### Phase 3: Future Enhancements (nice-to-have)

| # | Task |
|---|------|
| 6 | Waveform visualization in the volume mixer |
| 7 | Audio download/export (zip all tracks) |
| 8 | Per-shot audio preview in the shot editor |

## Implementation Order
1. Fix CORS import in all 3 edge functions (critical — nothing works without this)
2. Fix signed URL expiry
3. Load persisted audio on draft resume
4. Fix preview button state
5. Add SFX-only mode option

