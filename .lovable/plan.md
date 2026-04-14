

# Use Kling Native Audio for Dialog/SFX + ElevenLabs Music Only

## Approach

Kling v3's multishot endpoint generates lip-synced speech and sound effects natively when `sound: "on"` is set. Instead of fighting to sync external audio, we let Kling handle dialog and SFX, and only layer ElevenLabs background music on top.

## Changes

### 1. Enable Kling native audio (`useShortFilmProject.ts`)
- Line 1009: Change `with_audio: false` to `with_audio: true` — this tells Kling to generate speech/SFX natively with lip-sync
- Line 441 (single-shot path): Same change — `with_audio: true`

### 2. Skip ElevenLabs SFX + Voiceover generation (`useShortFilmProject.ts`)
- In `generateAudio()` (lines 601-698): Skip the SFX and Voiceover blocks entirely. Only generate the **music** track via ElevenLabs.
- Remove the lip-sync post-processing block (lines 1090-1133) — no longer needed since Kling handles it natively.

### 3. Update player to unmute video but keep music overlay (`ShortFilmVideoPlayer.tsx`)
- Change `muted={!!hasAudio}` logic: the video should only be muted if there is NO Kling native audio. Since we now always have Kling audio, set `muted={false}` (or more precisely, only mute when there's no video audio at all).
- Simplify: `muted` should be `false` because Kling audio is baked in. The only external layer is background music via `<audio>` element.
- Remove the SFX/voiceover playback logic from the RAF loop — the player only needs to sync background music now.

### 4. Update audio layer settings UI
- The SFX and Voiceover toggles in settings should still exist (they control what Kling generates via prompt hints), but they no longer trigger separate ElevenLabs API calls.
- Update `getEffectiveLayers()` usage: only `music` triggers ElevenLabs; `sfx` and `voiceover` are communicated to Kling through prompt content (already handled by `ROLE_AUDIO_CUES` in the prompt engine).

## Result

| Layer | Provider | How |
|-------|----------|-----|
| Dialog/Voice | Kling native | `sound: "on"`, lip-synced automatically |
| Sound Effects | Kling native | Generated from prompt audio cues |
| Background Music | ElevenLabs | Separate `<audio>` element, synced to video timeline |

## Files Modified

| File | Change |
|------|--------|
| `src/hooks/useShortFilmProject.ts` | Set `with_audio: true`, remove ElevenLabs SFX/VO generation, remove lip-sync block |
| `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx` | Unmute video, simplify to only sync background music overlay |
| `supabase/functions/generate-video/index.ts` | Already correct — uses `withAudio` flag, no changes needed |

