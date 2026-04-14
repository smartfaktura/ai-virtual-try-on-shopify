

# Final Audit: Short Film → Kling Pipeline Alignment

## Issues Found

### 1. `scene_type` never injected into Kling prompt
`buildShotPrompt` in `shortFilmPromptBuilder.ts` never mentions the shot's `scene_type` (e.g., `macro_closeup`, `product_hero`, `establishing_wide`). The AI Director carefully picks scene types but they are completely lost — Kling has no idea what framing or shot scale to use.

**Fix**: Inject `scene_type` as a P1 framing directive after the role cinematic directive.

### 2. `generateShotPlanFromRoles` still uses invalid enums
Line 1379-1380: `scene_type: 'general'`, `camera_motion: 'slow_push'` — neither exists in the valid system enums. Should be `'product_hero'` and `'slow_push_in'`.

### 3. Single-shot fallback uses old model `kling-v2-master`
Line 226 in `generate-video/index.ts`: When there's only 1 shot, the multishot handler falls back to `kling-v2-master` instead of `kling-v3` (the current best single-shot model). The prompt is engineered for v3-grade output but generates on v2.

### 4. `image_fidelity` hardcoded to 0.65, ignores preservation_strength
Line 236: Single-shot fallback sets `image_fidelity: 0.65` regardless of the user's preservation level. Should map: `high` → 0.85, `medium` → 0.65, `low` → 0.45.

### 5. No `cfg_scale` sent for short film
The animate pipeline uses `cfg_scale` from strategy (typically 0.5-0.7) to control prompt adherence, but multi-shot and single-shot short film payloads never include it. This means Kling uses its default, which may not match the cinematic intent.

### 6. `sound` parameter not preservation-aware
Kling's native `sound: "on"` generates ambient audio. Currently tied to SFX layer, but when the user has ElevenLabs SFX enabled, having Kling also generate its own audio creates conflicts. Should only enable Kling native sound when NO ElevenLabs audio layers are active (as a fallback ambient).

## Changes

### File: `src/lib/shortFilmPromptBuilder.ts`
- Add scene_type framing map (`SCENE_TYPE_FRAMING`) mapping each scene_type to a short framing directive (e.g., `macro_closeup` → "Extreme macro close-up framing", `establishing_wide` → "Wide establishing shot")
- Inject scene_type framing as P1 element in `buildShotPrompt`, right after role directive

### File: `src/hooks/useShortFilmProject.ts`
- Fix `generateShotPlanFromRoles`: change `scene_type: 'general'` → `'product_hero'`, `camera_motion: 'slow_push'` → `'slow_push_in'`
- Add `cfg_scale: 0.5` to multishot payload
- Add `preservation_strength` to multishot payload so backend can resolve `image_fidelity`
- Fix `with_audio`: only enable Kling native sound when ALL ElevenLabs layers are off (true fallback ambient)

### File: `supabase/functions/generate-video/index.ts`
- Single-shot fallback: change `kling-v2-master` → `kling-v3`
- Single-shot fallback: read `preservation_strength` from payload and map to `image_fidelity` (high=0.85, medium=0.65, low=0.45)
- Multi-shot: add `cfg_scale` from payload (default 0.5) to Kling omni-video request

## Summary

| File | Change |
|------|--------|
| `src/lib/shortFilmPromptBuilder.ts` | Add scene_type framing directives to prompt P1 |
| `src/hooks/useShortFilmProject.ts` | Fix custom role enums, add cfg_scale + preservation_strength to payload, fix with_audio logic |
| `supabase/functions/generate-video/index.ts` | Upgrade fallback model to v3, dynamic image_fidelity, add cfg_scale |

