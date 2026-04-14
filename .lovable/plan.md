

# AI Director Pre-Select Music Style + Dropdown in Settings

## Problem
The Music Style field is a blank text input — users have to type from scratch. The AI Director already generates `music_direction` and we have `FILM_MUSIC_PRESETS` per film type, but neither pre-populates a selectable option. Users should get a curated dropdown with the AI's suggestion pre-selected, plus the ability to customize.

## Changes

### 1. Add music style presets as a dropdown + custom option
**File: `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx`**
- Replace the plain `<Input>` for Music Style with a `<Select>` dropdown containing preset options:
  - "Cinematic Orchestral" (product_launch)
  - "Warm Piano & Strings" (brand_story)
  - "Minimal Deep House" (fashion_campaign)
  - "Ethereal Ambient" (beauty_film)
  - "Minimal Piano & Pads" (luxury_mood)
  - "Driving Electronic" (sports_campaign)
  - "Warm Acoustic" (lifestyle_teaser)
  - "AI Director Suggestion" (when `music_direction` exists from AI planner)
  - "Custom" — reveals a text input for free-form entry
- Pre-select the preset matching the current film type, or "AI Director Suggestion" if `music_direction` is set

### 2. Pass film type + music_direction to settings panel
**File: `src/pages/video/ShortFilm.tsx`**
- Pass `filmType` and `project.music_direction` as props to `ShortFilmSettingsPanel`

### 3. AI Director auto-sets music style on plan generation
**File: `src/hooks/useShortFilmProject.ts`**
- Already stores `music_direction` into `settings.musicPrompt` — ensure this maps to the correct dropdown preset or shows as "AI Director Suggestion"

### 4. Wire preset values to generation
**File: `src/hooks/useShortFilmProject.ts`**
- When a preset is selected (not custom), resolve the full `FILM_MUSIC_PRESETS` text for that key during music generation
- When "AI Director Suggestion" is selected, use the stored `music_direction` value
- When "Custom" is selected, use the user's free-text input

## Files to Change

| File | Change |
|------|--------|
| `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx` | Replace music Input with Select dropdown + presets + Custom option with text input |
| `src/pages/video/ShortFilm.tsx` | Pass `filmType` and `music_direction` props to settings panel |
| `src/types/shortFilm.ts` | Add `musicPresetKey?: string` to `ShortFilmSettings` for tracking selected preset |
| `src/hooks/useShortFilmProject.ts` | Resolve preset key to full prompt text during generation |

