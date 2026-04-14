

# Fix Short Film Audio Matching & Control

## Root Problem

Audio feels random because:
1. **Music prompt** ignores the user's selected Style/Mood presets — it builds a generic "cinematic ambient" prompt
2. **SFX prompts** are hardcoded by shot role — no user control, no connection to selected scene/style presets
3. **No per-shot SFX editing** — users can't customize what sound effect plays for each shot
4. The music and SFX don't reflect the actual visual content the user configured

## Solution

### 1. Add `sfx_prompt` field to `ShotPlanItem` type
Allow per-shot custom SFX text so users can control exactly what sound plays.

**File: `src/types/shortFilm.ts`**
- Add `sfx_prompt?: string` to `ShotPlanItem`

### 2. Surface SFX prompt editing in ShotCard + ShotPlanEditor
Next to the existing "Script Line" input, add a "Sound Effect" input per shot. Auto-filled by `buildContextualSfxPrompt` but fully editable.

**Files: `src/components/app/video/short-film/ShotCard.tsx`, `ShotPlanEditor.tsx`**
- Add SFX prompt input field in the shot editor (with the 🔊 icon)
- Show current SFX prompt in collapsed card view
- Auto-populate default SFX prompts when generating the shot plan

### 3. Connect Style/Mood presets to music prompt generation
Currently `buildContextualMusicPrompt` ignores the selected style presets. Feed the user's selected style keywords into the music prompt.

**File: `src/hooks/useShortFilmProject.ts`**
- Pass `references` to `buildContextualMusicPrompt` 
- Extract selected style preset keywords from `references.filter(r => r.role === 'style')`
- Inject style keywords into the music prompt (e.g., "cinematic noir, deep blacks, dramatic" → "dark cinematic noir ambient music with dramatic tension")

### 4. Use `sfx_prompt` in audio generation instead of hardcoded function
When generating SFX, prefer `shot.sfx_prompt` if set, falling back to `buildContextualSfxPrompt`.

**File: `src/hooks/useShortFilmProject.ts`**
- Change line ~497: `const sfxPrompt = shot.sfx_prompt || buildContextualSfxPrompt(shot);`

### 5. Auto-populate `sfx_prompt` in shot plan generation
When the AI Director or preset planner creates shots, pre-fill `sfx_prompt` with the contextual default so users see what will be generated and can edit it.

**File: `src/lib/shortFilmPlanner.ts`** — add `sfx_prompt` to generated shot plans
**File: `supabase/functions/ai-shot-planner/index.ts`** — add `sfx_prompt` to the AI prompt schema

### 6. Connect scene presets to SFX context
If scene presets are selected (e.g., "Neon Rain Street"), incorporate environment keywords into SFX prompts automatically.

**File: `src/hooks/useShortFilmProject.ts`**
- Update `buildContextualSfxPrompt` to accept `references` parameter
- Extract scene preset names and blend into the SFX prompt

## Files to Change

| File | Change |
|------|--------|
| `src/types/shortFilm.ts` | Add `sfx_prompt?: string` to `ShotPlanItem` |
| `src/components/app/video/short-film/ShotCard.tsx` | Add SFX prompt input in editor, show in collapsed view |
| `src/components/app/video/short-film/ShotPlanEditor.tsx` | Add inline SFX prompt field next to script_line |
| `src/hooks/useShortFilmProject.ts` | Use `shot.sfx_prompt` for SFX gen; pass style/scene refs into music & SFX prompt builders |
| `src/lib/shortFilmPlanner.ts` | Pre-fill `sfx_prompt` on generated shots |
| `supabase/functions/ai-shot-planner/index.ts` | Add `sfx_prompt` to AI schema |

