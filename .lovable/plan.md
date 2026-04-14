

# Short Film Audio Integration — Current State & What's Next

## Current State (Complete)

The audio layer is fully wired end-to-end:

**Backend (3 Edge Functions):**
- `elevenlabs-music` — generates background tracks from text prompts (up to 120s)
- `elevenlabs-sfx` — generates per-shot sound effects (up to 22s)
- `elevenlabs-tts` — generates voiceover from script lines using selectable voices

**Frontend:**
- Settings panel has 5 audio modes: Silent, Ambient, Music, Voiceover, Full Mix
- Music style prompt input and voice picker (10 ElevenLabs voices) appear contextually
- `generateAudio()` in the hook fires after video generation completes
- `ShortFilmVideoPlayer` syncs background track + per-shot audio with a volume mixer (Music / SFX / Voice sliders)

**What works today:**
- Audio generation triggers automatically after all video shots complete
- Blob URLs are created client-side for playback
- Player handles play/pause/skip sync across all audio layers

## Gaps & Issues to Address

### 1. Audio is Lost on Page Refresh
Audio blob URLs only exist in memory. If the user refreshes or returns later, all generated audio is gone. Need to persist audio files to storage and save URLs in the database.

### 2. No Audio Preview Before Full Generation
Users can't hear what their music/voice will sound like until after the entire film generates. Add a "Preview Audio" button in the Settings step to generate a short sample.

### 3. No Per-Shot Audio Progress
During audio generation, only a generic "Generating audio layer..." message shows. No indication of which shot's SFX/voiceover is being generated or individual failures.

### 4. Missing Audio Retry
If a single SFX or voiceover call fails, there's no way to retry just that one — the user would need to regenerate all audio.

### 5. Edge Function Auth Uses getClaims (may not exist)
All three functions use `supabase.auth.getClaims()` which may not be available in all Supabase JS versions. Should use `supabase.auth.getUser()` instead for reliable JWT validation.

## Recommended Next Steps

### Phase A: Persistence & Reliability (high priority)
1. **Persist audio to storage** — upload generated audio blobs to a `generated-audio` storage bucket, save URLs in `video_shots` (new `audio_url` and `sfx_url` columns) and `video_projects` (new `music_track_url` column)
2. **Fix auth in edge functions** — replace `getClaims` with `getUser` for reliable JWT validation
3. **Per-shot audio progress** — show which shot is generating SFX/voiceover with status indicators
4. **Individual audio retry** — retry failed SFX/voiceover per shot

### Phase B: UX Polish (medium priority)
5. **Audio preview in Settings** — "Preview" button generates a 10s music sample and reads one script line so users can tune settings before committing
6. **Audio regeneration** — "Regenerate Audio" button on completed projects to re-run audio with different settings without re-generating video
7. **Waveform visualization** — replace plain sliders with mini waveform bars in the mixer

## Files to create/change

| File | Change |
|------|--------|
| DB migration | Add `music_track_url` to `video_projects`, add `audio_url`/`sfx_url` to `video_shots` |
| Migration | Create `generated-audio` storage bucket (private) |
| `supabase/functions/elevenlabs-music/index.ts` | Replace `getClaims` with `getUser` |
| `supabase/functions/elevenlabs-sfx/index.ts` | Replace `getClaims` with `getUser` |
| `supabase/functions/elevenlabs-tts/index.ts` | Replace `getClaims` with `getUser` |
| `src/hooks/useShortFilmProject.ts` | Upload audio to storage, save URLs to DB, per-shot progress, retry logic |
| `src/pages/video/ShortFilm.tsx` | Per-shot audio progress UI, regenerate audio button |
| `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx` | Audio preview button |
| `src/components/app/video/short-film/ShortFilmProgressPanel.tsx` | Audio generation status per shot |

## Implementation order
1. Fix edge function auth (quick win, prevents runtime errors)
2. DB migration + storage bucket for audio persistence
3. Upload & persist audio in hook
4. Per-shot audio progress + retry UI
5. Audio preview in settings
6. Regenerate audio button

