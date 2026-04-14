

# Fix Short Film: Multiple Issues

## Issues Found

1. **Review summary shows "4 shots x 5s"** — uses `settings.shotDuration` instead of actual per-shot duration sum (e.g., "4 shots · 11s")
2. **Voiceover not generated** — `generateShotPlan()` omits `script_line` from ROLE_DEFAULTS, so when audio mode is "voiceover", every shot has no `script_line` and the TTS loop skips them all (`if (!shot.script_line) continue`)
3. **No scene_type selector in ShotCard** — edit mode lets you change camera motion, duration, and script line, but not the scene type
4. **No user instructions field per shot** — users can't add custom notes/instructions to influence the prompt
5. **AI Director should be default** — the difference between "Auto" (deterministic templates) and "AI Director" (LLM-generated creative plan) is confusing; default to AI Director since it produces better, context-aware results
6. **No film quality/model setting** — no way to control generation quality (standard vs pro)
7. **Need more scene type presets** — limited variety for the scene_type dropdown

## Plan

### 1. Fix review summary (`ShortFilmReviewSummary.tsx`)
- Replace `{shots.length} shots x {settings.shotDuration}s` with `{shots.length} shots · {totalDuration}s` where totalDuration = sum of all shot `duration_sec`

### 2. Include script_line in auto-generated shots (`shortFilmPlanner.ts`)
- Add `script_line: defaults.script_line` to the return object in `generateShotPlan()` (line ~340)
- Same for `generateShotPlanFromRoles()` in `useShortFilmProject.ts`

### 3. Add scene_type selector to ShotCard edit mode (`ShotCard.tsx`)
- Add a `<Select>` dropdown for `scene_type` with preset options:
  `product_hero`, `product_closeup`, `macro_closeup`, `studio_reveal`, `lifestyle_context`, `lifestyle_interaction`, `establishing_wide`, `mood_abstract`, `hero_spotlight`, `dynamic_sequence`, `end_card`, `atmosphere_mood`, `environment_pan`, `human_interaction`, `fashion_runway`, `beauty_macro`, `sports_action`, `food_detail`, `architecture_wide`, `nature_ambient`
- Also add `subject_motion` and `preservation_strength` selectors in edit mode

### 4. Add user instructions field per shot
- Add optional `user_notes` field to `ShotPlanItem` type in `shortFilm.ts`
- Add text input in ShotCard edit mode labeled "Custom Instructions"
- Append `user_notes` to the prompt in `buildShotPrompt()` (P2 priority, before truncation)

### 5. Default to AI Director (`useShortFilmProject.ts`)
- Change `useState<'auto' | 'ai'>('auto')` → `useState<'auto' | 'ai'>('ai')` (line 82)
- Update reset to also default to `'ai'`

### 6. Add quality setting (`ShortFilmSettingsPanel.tsx`, `shortFilm.ts`)
- Add `quality: 'standard' | 'pro'` to `ShortFilmSettings` (default: `'pro'`)
- Add quality toggle in settings panel (Standard = faster/cheaper, Pro = highest quality)
- Pass quality through to the generation payload in `useShortFilmProject.ts`

### 7. Expand scene type presets
- Already covered in point 3 — the dropdown will include 20 scene types covering fashion, beauty, sports, food, architecture, and nature categories

## Files to Change

| File | Change |
|------|--------|
| `src/types/shortFilm.ts` | Add `user_notes?: string` to ShotPlanItem, add `quality` to ShortFilmSettings |
| `src/lib/shortFilmPlanner.ts` | Include `script_line` in generateShotPlan output |
| `src/components/app/video/short-film/ShotCard.tsx` | Add scene_type dropdown, subject_motion, preservation_strength, user_notes field in edit mode |
| `src/components/app/video/short-film/ShortFilmReviewSummary.tsx` | Fix duration display to use actual shot durations sum |
| `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx` | Add quality toggle |
| `src/hooks/useShortFilmProject.ts` | Default planMode to 'ai', pass quality to payload, include script_line in generateShotPlanFromRoles |
| `src/lib/shortFilmPromptBuilder.ts` | Append user_notes to prompt |

