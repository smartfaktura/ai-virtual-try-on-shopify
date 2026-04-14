

# Audit: Short Film Prompt Engineering Pipeline — Issues & Fixes

## Issues Found

### Critical Bug 1: `with_audio` still uses deprecated `audioMode` in main generation
**Line 980** in `useShortFilmProject.ts`: `with_audio: settings.audioMode === 'ambient'` — this was fixed for `retryShotGeneration` but NOT for the main `startGeneration` multi-shot payload. Since `audioMode` is deprecated in favor of `audioLayers`, this always evaluates to `false` (Kling native audio is never requested).

### Critical Bug 2: `tonePresetText` never sent to AI Director
The edge function accepts `tonePresetText` (line 140) to give the AI rich cinematographic guidance per film type (e.g., "sleek commercial film, premium product reveal..."), but the hook never passes it. The `TONE_PRESETS` map exists in `shortFilmPromptBuilder.ts` but is only used during Kling prompt building — the AI Director never receives it, so its creative decisions lack film-type-specific visual direction.

### Issue 3: Scene reference descriptions not injected into `buildShotPrompt`
The prompt builder reads style preset keywords from references (`role === 'style'`), but completely ignores scene references (`role === 'scene'`). A user selecting "Japanese Zen Garden" or "Parisian Cafe" gets zero injection into the Kling prompt. Only the scene_type enum label (e.g., "product hero") is added — which is generic, not the rich description from the preset.

### Issue 4: `audio_mode` persisted in `video_shots` instead of `audioLayers`
Line 912: `audio_mode: settings.audioMode` — still using the deprecated field. Should persist the layer info.

### Issue 5: Style/scene keywords truncated too aggressively
In `buildShotPrompt`, scene and style keywords are in priority tier P2 — they get dropped quickly when prompt approaches 510 chars. For a system that depends on these for visual accuracy, they should be P1 (after image reference and role directive).

### Issue 6: No scene description in prompt for text-only scene presets
Line 250-253 only adds `Scene style: macro closeup.` (the raw scene_type enum). It doesn't inject the actual scene preset description like "Raked sand patterns, moss-covered stones, soft natural overcast light, bamboo accents." The rich description data exists in references but is never pulled into the prompt.

## Changes

### File: `src/hooks/useShortFilmProject.ts`
1. **Fix `with_audio`** (line 980): Change from `settings.audioMode === 'ambient'` to `!!(getEffectiveLayers(settings).sfx)` — consistent with retry logic
2. **Send `tonePresetText`** to AI Director: Look up `TONE_PRESETS[filmType]` and pass it in the `ai-shot-planner` invoke body
3. **Fix `audio_mode` in shot rows** (line 912): Persist `audioLayers` object instead of deprecated string
4. Import `TONE_PRESETS` from `shortFilmPromptBuilder.ts` (needs to be exported)

### File: `src/lib/shortFilmPromptBuilder.ts`
1. **Export `TONE_PRESETS`** so the hook can send it to AI Director
2. **Inject scene preset description into prompt**: Look for `role === 'scene'` references and extract the full description (after `:` separator), inject as P1.5 (between P1 and P2) — ensuring the Kling prompt matches the user's chosen environment
3. **Promote style keywords to P1**: Move style preset injection from P2 to immediately after role directive — these are user-selected creative choices and should not be truncated
4. **Add scene mood context**: When scene reference has a description, append environmental lighting/atmosphere cues to complement the role cinematics

### File: `supabase/functions/ai-shot-planner/index.ts`
No changes needed — it already accepts `tonePresetText` and uses it correctly when provided.

## Technical Summary

| File | Change |
|------|--------|
| `src/hooks/useShortFilmProject.ts` | Fix `with_audio` in main generation; send `tonePresetText` to AI Director; fix `audio_mode` persistence |
| `src/lib/shortFilmPromptBuilder.ts` | Export `TONE_PRESETS`; inject scene preset descriptions into Kling prompts; promote style/scene to higher priority tier |

