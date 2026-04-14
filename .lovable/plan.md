

# Short Film — Audio Layer with ElevenLabs Integration

## Overview
Add a full audio production layer to the Short Film workflow using ElevenLabs for AI Music, Sound Effects, and Voiceover generation. All audio plays client-side via `<audio>` sync with the existing `ShortFilmVideoPlayer` — no server-side stitching.

## Prerequisites
- Connect the **ElevenLabs connector** to the project (no ElevenLabs connection exists yet). This provides `ELEVENLABS_API_KEY` as a secret for edge functions.

## What gets built

### 1. Three Edge Functions for ElevenLabs

**`elevenlabs-music`** — Generate a background music track from a text prompt (e.g. "cinematic ambient for luxury fashion film, 30 seconds"). The prompt is auto-composed from film type + tone on the backend. Returns binary MP3.

**`elevenlabs-sfx`** — Generate per-shot sound effects from text descriptions (e.g. "wind through fabric", "footsteps on marble"). Up to 22s per effect. Returns binary MP3.

**`elevenlabs-tts`** — Convert `script_line` text per shot into spoken voiceover using a selected ElevenLabs voice. Returns binary MP3.

All three functions validate input with Zod, verify JWT, and include proper CORS headers.

### 2. Updated Audio Mode UI

Expand `audioMode` in settings from 3 options to 5:
- **Silent** — no audio (existing)
- **Ambient** — passed to Kling during generation (existing)
- **Music** — AI-generated background track via ElevenLabs
- **Voiceover** — AI narration from script lines via ElevenLabs TTS
- **Full Mix** — Music + SFX + Voiceover layered together

When "Music" or "Full Mix" is selected, show a text input for music mood/style prompt (auto-filled from film type + tone, editable).

When "Voiceover" or "Full Mix" is selected, show a voice picker dropdown (preset list of ~10 ElevenLabs voices with labels like "Roger — warm male", "Sarah — clear female").

### 3. Audio Generation Step

After video generation completes, if audioMode is music/voiceover/full_mix, trigger audio generation:
- **Music**: One API call to `elevenlabs-music` with a prompt derived from film type + tone + total duration
- **SFX**: One call per shot to `elevenlabs-sfx` using shot purpose/scene_type as prompt
- **Voiceover**: One call per shot (that has a `script_line`) to `elevenlabs-tts`

Store generated audio as blob URLs in state. Show a small progress indicator ("Generating audio...").

### 4. Audio-Synced Preview Player

Upgrade `ShortFilmVideoPlayer` to accept optional audio tracks:
- `backgroundTrackUrl` — plays continuously across all clips (music)
- `perShotAudio` — array of `{ shotIndex, url, type: 'sfx' | 'voiceover' }` that play/pause in sync with each clip

Use an `<audio>` element ref for the background track. On play/pause/skip, sync audio playback position. Per-shot audio starts when the matching clip begins and pauses when it ends.

Add a simple volume mixer UI below the player: sliders for Music, SFX, and Voice volume levels.

### 5. Type Updates

```text
ShortFilmSettings.audioMode: 'silent' | 'ambient' | 'music' | 'voiceover' | 'full_mix'
ShortFilmSettings.musicPrompt?: string
ShortFilmSettings.voiceId?: string

New interface AudioAssets {
  backgroundTrackUrl?: string;
  perShotAudio: { shotIndex: number; url: string; type: 'sfx' | 'voiceover' }[];
}
```

## Files to create/change

| File | Action |
|------|--------|
| `supabase/functions/elevenlabs-music/index.ts` | New — music generation edge function |
| `supabase/functions/elevenlabs-sfx/index.ts` | New — SFX generation edge function |
| `supabase/functions/elevenlabs-tts/index.ts` | New — TTS voiceover edge function |
| `src/types/shortFilm.ts` | Add new audio modes, `musicPrompt`, `voiceId`, `AudioAssets` |
| `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx` | Expand audio options, add music prompt input + voice picker |
| `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx` | Add audio sync, background track, per-shot audio, volume mixer |
| `src/hooks/useShortFilmProject.ts` | Add `generateAudio()` logic, store audio assets in state |
| `src/pages/video/ShortFilm.tsx` | Wire audio generation after video completes, pass audio to player |

## Implementation order
1. Connect ElevenLabs connector
2. Create three edge functions (music, sfx, tts)
3. Update types and settings UI
4. Add audio generation logic in hook
5. Upgrade preview player with audio sync + volume mixer

