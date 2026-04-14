

# Simplify End Screen + Audio Preferences Before AI Director

## Problem Summary
1. The end screen has separate "Download" and "Download with Music" buttons — confusing since Kling now handles dialog/SFX natively and only music comes from ElevenLabs
2. Voice settings still show ElevenLabs voice options (irrelevant now — Kling handles voice natively)
3. No audio preference prompt before AI Director starts — user should choose what they want upfront

## Changes

### 1. Simplified End Screen (`ShortFilm.tsx` + `ShortFilmVideoPlayer.tsx`)

**Current**: Two download buttons — "Download" (raw video) and "Download with Music" (muxed via FFmpeg).

**New**: Single "Download" button that:
- If music track exists → auto-mux video + music via `mux-video-audio` edge function, then download the combined file
- If no music track → download the raw video directly (which already has Kling dialog/SFX baked in)

Remove the separate "Download with Music" button. The player stays the same (unmuted video + background music `<audio>` element for preview).

Also remove the stale audio generation UI (SFX/VO retry buttons, audio phase indicators for sfx/voiceover) since those are no longer generated via ElevenLabs.

### 2. Remove ElevenLabs Voice Picker from Settings (`ShortFilmSettingsPanel.tsx`)

Remove the `VOICE_OPTIONS` list and the voice picker dropdown — voice is now handled by Kling natively via the prompt. The settings panel keeps: Quality, Aspect Ratio, Duration, Music Style, Preservation Level, and Tone.

Update the Audio info section to say something like: "Dialog & sound effects are generated natively with the video. Background music is added separately."

### 3. Audio Preferences Step — Before AI Director (`ShortFilm.tsx` + `FilmTypeSelector.tsx`)

Add an "Audio Preferences" section to the **Film Type** step (step 1), shown after the user selects a film type. Three toggle cards:
- **Background Music** — "Add a music track on top of your film" (default: ON)
- **Dialog / Speech** — "Characters speak in the video" (default: OFF)  
- **Sound Effects** — "Ambient sounds, impacts, transitions" (default: ON)

These map to the existing `audioLayers` in settings (`music`, `voiceover`, `sfx`). The AI Director will use these preferences when building the shot plan (e.g., generating `script_line` fields only when Dialog is ON, adding `sfx_prompt` only when SFX is ON).

Move the `audioLayers` state initialization from the Shot Plan step to Film Type selection so it's set before AI planning begins.

### 4. Clean Up Stale Retry/Audio UI (`ShortFilm.tsx`)

Remove:
- The per-shot SFX/VO retry buttons (lines 277-294) — no longer applicable
- The audio phase indicators for `sfx` and `voiceover` phases (lines 253-254) — only `music` phase matters
- The `retryAudioForShot` usage for sfx/voiceover

Keep:
- Music generation status indicator
- "Regenerate Audio" button (for music only)

## Files Modified

| File | Change |
|------|--------|
| `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx` | Single download button (auto-mux if music exists), remove `onDownloadWithAudio` prop |
| `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx` | Remove ElevenLabs voice picker, update audio info text |
| `src/components/app/video/short-film/FilmTypeSelector.tsx` | Add Audio Preferences toggles below film type selection |
| `src/pages/video/ShortFilm.tsx` | Pass audioLayers to FilmTypeSelector, simplify end screen (single download), remove stale SFX/VO retry UI |

