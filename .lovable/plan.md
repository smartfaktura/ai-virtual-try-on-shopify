

# Fix: Audio Mashing in Short Film Player

## Root Cause

The video has **two competing audio sources playing simultaneously**:

1. **Kling native audio** — baked into the MP4 file because `sound: "on"` is hardcoded on line 309 of `generate-video/index.ts` for multishot. The client sends `with_audio: false` but it's ignored.
2. **ElevenLabs layers** — music, SFX, and voiceover played via separate `<audio>` elements in the player

Both play at the same time = mashed, overlapping audio chaos.

## Fixes

### 1. `supabase/functions/generate-video/index.ts` — Respect `with_audio` flag for multishot
Line 309: Change `sound: "on"` to use the `withAudio` variable (line 214) just like single-shot does on line 133:
```typescript
sound: withAudio ? "on" : "off",
```
This ensures future generations respect the client's `with_audio: false` setting.

### 2. `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx` — Mute video when audio layers exist
When ElevenLabs audio is present, mute the `<video>` element so Kling's native audio doesn't clash:
```html
<video ... muted={hasAudio} />
```
This fixes playback for **existing** videos that already have Kling audio baked in.

### 3. `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx` — Fix `forwardRef` warning
Wrap both `ShortFilmVideoPlayer` and `SingleVideoPlayer` in `React.forwardRef` or remove the ref passing that's causing the console error.

## Summary

| File | Change |
|------|--------|
| `generate-video/index.ts` | Use `withAudio` flag instead of hardcoded `sound: "on"` for multishot |
| `ShortFilmVideoPlayer.tsx` | Mute `<video>` when ElevenLabs audio layers are active; fix forwardRef warning |

