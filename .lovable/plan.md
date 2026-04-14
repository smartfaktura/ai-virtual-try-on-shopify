

# Fix Kling Logic Issues + Expand Scene & Style Presets

## Logic Problems Found

### 1. ROLE_CINEMATICS key mismatch with actual system roles
The `ROLE_CINEMATICS` map in `shortFilmPromptBuilder.ts` uses **old shorthand keys** (`hero`, `detail`, `closing`, `reveal`, `transition`) that don't match the **actual system roles** used in shot plans (`product_reveal`, `detail_closeup`, `brand_finish`, etc.). When `buildShotPrompt` looks up `ROLE_CINEMATICS[shot.role]` for a role like `product_reveal`, it falls back to `DEFAULT_CINEMATIC` — losing all the rich lighting/lens/directive instructions.

**Fix**: Rename keys to match system roles AND add aliases so both work.

### 2. `addShot()` uses invalid enum values
Line 1074-1076: `role: 'detail'`, `scene_type: 'product_closeup'`, `camera_motion: 'slow_push'` — none of these are valid system values. Should be `role: 'detail_closeup'`, `scene_type: 'macro_closeup'`, `camera_motion: 'slow_push_in'`.

### 3. `retryShotGeneration` uses single-shot fallback with wrong model
Line 415: Uses `model_name: 'kling-v3'` and `with_audio: settings.audioMode === 'ambient'` — should check `audioLayers` not deprecated `audioMode`. Also the retry enqueues as `video` job type (single shot) when the original was `video_multishot` — this won't produce matching output.

### 4. `settings_json` persists deprecated `audioMode` instead of `audioLayers`
Lines 844-846 and 862-864 in `startGeneration` save `audioMode` to `settings_json` but never save `audioLayers`.

### 5. Music timing cues not reaching SFX generation
SFX offset is computed correctly in `generateAudio` but `retryAudioForShot` (line 751) doesn't include `offset_sec` when re-adding to `perShotAudio`.

### 6. Scene/Style presets are limited (16 each)
User wants more trending options.

## Changes

### File: `src/lib/shortFilmPromptBuilder.ts`
- **Rename all `ROLE_CINEMATICS` keys** to match system roles: `hook`→keep, `reveal`→`product_reveal`, `detail`→`detail_closeup`, `closing`→`brand_finish`, `product`→`product_moment`, `lifestyle`→`lifestyle_moment`, `focus`→`product_focus`, `human`→`human_interaction`, `finish`→`end_frame`, `hero`→`highlight`
- Add a lookup function that tries the exact role key first, then falls back to a shortened alias (for custom roles)
- Keep the rich cinematic directives, just fix the keys

### File: `src/hooks/useShortFilmProject.ts`
- Fix `addShot()`: use valid role/scene_type/camera_motion values
- Fix `retryShotGeneration`: use `audioLayers` instead of `audioMode` for `with_audio`
- Fix `startGeneration` settings_json: persist `audioLayers` alongside `audioMode`
- Fix `retryAudioForShot`: compute and pass `offset_sec` from timing manifest

### File: `src/components/app/video/short-film/ReferenceUploadPanel.tsx`
- **Expand `STYLE_MOOD_PRESETS`** from 16 to 24 — add 8 trending styles:
  - "ASMR Tactile" (satisfying texture sounds, close-up fingertip contact)
  - "Y2K Chrome" (reflective metallic, iridescent, early-2000s aesthetic)
  - "Wes Anderson Pastel" (symmetrical framing, pastel palette, whimsical)
  - "Film Noir Revival" (deep contrast, venetian blind shadows, moody)
  - "Analog Warmth" (VHS scanlines, warm halation, retro handheld)
  - "Brutalist Clean" (raw concrete, geometric shadow, minimal)
  - "Dreamy Vaseline" (soft lens diffusion, halation glow, romantic)
  - "High-Speed Freeze" (frozen motion, splash/shatter mid-air, ultra-sharp)

- **Expand `VIDEO_SCENE_PRESETS`** from 16 to 24 — add 8 trending scenes:
  - "Japanese Zen Garden" (raked sand, moss stones, soft natural light)
  - "Parisian Cafe" (warm interior, vintage furniture, soft morning light)
  - "Snow-Covered Alps" (cold blue light, fresh powder, vast mountain scale)
  - "Underground Parking" (fluorescent overhead, concrete pillars, gritty urban)
  - "Art Gallery White Cube" (track-lit walls, polished floor, curated space)
  - "Tropical Pool Villa" (turquoise water, palm shadows, warm golden hour)
  - "Industrial Workshop" (metal sparks, heavy machinery, raw textures)
  - "Cherry Blossom Path" (pink petals falling, soft overcast light, Japanese aesthetic)

### File: `supabase/functions/ai-shot-planner/index.ts`
- No changes needed — the edge function already uses correct system roles

## Technical Summary

| File | Change |
|------|--------|
| `src/lib/shortFilmPromptBuilder.ts` | Fix ROLE_CINEMATICS keys to match system roles |
| `src/hooks/useShortFilmProject.ts` | Fix addShot invalid values, audioMode→audioLayers in persist/retry, offset_sec in retryAudio |
| `src/components/app/video/short-film/ReferenceUploadPanel.tsx` | Add 8 new style presets + 8 new scene presets (16→24 each) |

