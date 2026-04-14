

# Fix Short Film Audio Timing & Quality

## Problems Found

From the console logs, the ElevenLabs calls are succeeding (all 200s). The issues are:

1. **Voiceover text doesn't fit shot duration** — "In the shadows of the city, true refinement finds its light." takes ~4s to speak naturally, but may be assigned to a 2s shot. The TTS generates full-length speech with no awareness of the shot's duration, so words get cut off or overlap the next shot.

2. **SFX prompts are too vague** — Currently just `"scene_type ambient sound, purpose"` (e.g., "atmosphere mood ambient sound, Leave a lasting impression of the brand's premium noir aesthetic."). These produce random ambient noise instead of targeted effects like "soft fabric swoosh" or "camera shutter click".

3. **Player shot-tracking is imprecise** — Uses `timeupdate` event (~4Hz / every 250ms), which is too slow for 2-second shots. Audio can start 250ms late, and very short shots can be missed entirely.

4. **No TTS speed parameter** — ElevenLabs supports a `speed` parameter (0.7–1.2) but it's not being passed, so speech can't be compressed to fit shorter shots.

## Implementation Plan

### 1. Duration-aware voiceover text (useShortFilmProject.ts)
- Before sending to TTS, calculate a word budget based on shot duration (~2.5 words/second for natural speech)
- If `script_line` exceeds the budget, use Lovable AI to rewrite it to fit the duration
- Pass `speed` parameter to the TTS edge function (up to 1.2x for slightly long lines)

### 2. Update TTS edge function to accept `speed` (elevenlabs-tts/index.ts)
- Accept optional `speed` param from request body
- Pass it through to ElevenLabs API as `voice_settings.speed`

### 3. Contextual SFX prompts (useShortFilmProject.ts)
- Build specific SFX prompts based on shot role + scene_type:
  - `hook` → "dramatic cinematic whoosh impact"
  - `product_reveal` → "elegant reveal shimmer"
  - `detail_closeup` → "soft mechanical focus click"
  - `brand_finish` → "deep cinematic bass hit"
  - etc.
- Include shot context (camera_motion, subject_motion) for more precise results

### 4. Precise audio scheduling in player (ShortFilmVideoPlayer.tsx)
- Replace `timeupdate` listener with `requestAnimationFrame` loop for ~60Hz precision
- Pre-load all per-shot audio elements on mount to eliminate playback delay
- Schedule SFX with a small offset (0.1s) from shot start for cinematic feel

### 5. Script line word-count validation in planner (shortFilmPlanner.ts)
- Add duration-aware default `script_line` values — shorter lines for 2s shots, longer for 5s shots
- Cap at ~2.5 words per second of shot duration

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/elevenlabs-tts/index.ts` | Accept & pass `speed` parameter |
| `src/hooks/useShortFilmProject.ts` | Duration-aware text trimming, contextual SFX prompts, speed calculation |
| `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx` | Replace `timeupdate` with `requestAnimationFrame`, preload audio |
| `src/lib/shortFilmPlanner.ts` | Duration-aware default script lines |

