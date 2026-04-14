

# Fix Voiceover Duration & Music Prompt Precision

## Problems

1. **Voiceover too long for short shots**: The AI Director generates 5-15 word script lines regardless of shot duration. A 2-second hook gets "The silence before the sweat. Precision in every single stitch." (10 words = ~4 seconds of speech). `fitTextToDuration` trims post-hoc, but trimmed text loses meaning. The AI should generate duration-appropriate text from the start.

2. **Music prompt too generic**: `buildContextualMusicPrompt` produces vague prompts like "cinematic premium background music for a product launch film". ElevenLabs needs specific instrumentation, tempo, and arc descriptions to produce matching audio.

## Solution

### 1. Add word budget to AI Director prompt schema
Tell the AI the exact word budget per shot so it writes script lines that fit naturally.

**File: `supabase/functions/ai-shot-planner/index.ts`**
- Change the `script_line` instruction from "5-15 words" to a duration-aware rule:
  - "script_line word count MUST match shot duration: ~2 words per second. A 2s shot = max 4 words. A 4s shot = max 8 words. A 3s shot = max 6 words."
- Add a `music_direction` field to the AI output: a 1-sentence description of the musical feel for the overall film (tempo, instruments, energy arc)
- For shots with `duration_sec <= 2`, instruct: "script_line should be 2-4 words maximum — a punchy tagline, not a sentence"

### 2. Add `music_direction` to AI output and use it
**File: `supabase/functions/ai-shot-planner/index.ts`**
- Ask the AI to also return a top-level `music_direction` string alongside the shots array, describing specific instrumentation, BPM range, and energy arc (e.g., "Slow minimal piano with deep sub-bass, 70 BPM, building from sparse to layered strings at the resolve")

**File: `src/hooks/useShortFilmProject.ts`**
- Store `music_direction` from AI response and use it as the music prompt (preferred over `buildContextualMusicPrompt`)
- Update `buildContextualMusicPrompt` to include specific tempo/instrumentation guidance based on film type

### 3. Improve `fitTextToDuration` as a safety net
**File: `src/hooks/useShortFilmProject.ts`**
- Reduce `WORDS_PER_SEC` from 2.5 to 2.0 (more realistic for cinematic pacing)
- For shots ≤ 2s: skip voiceover entirely (return empty text) — 2 seconds is too short for natural speech
- Add a `MIN_VO_DURATION = 3` constant — shots shorter than this get no voiceover

### 4. Improve `buildContextualMusicPrompt` with specific details
**File: `src/hooks/useShortFilmProject.ts`**
- Add film-type-specific instrumentation defaults:
  - `product_launch` → "cinematic orchestral with deep bass hits, 80-90 BPM"
  - `luxury_mood` → "minimal piano with ambient pads, 60-70 BPM, no percussion"
  - `sports_campaign` → "driving electronic beats with punchy drums, 120-140 BPM"
  - etc.
- Include total duration in the prompt so ElevenLabs can shape the arc
- Add energy arc description based on shot roles (e.g., "starts sparse, builds to powerful at shot 3, resolves softly")

### 5. Update preset planner to match
**File: `src/lib/shortFilmPlanner.ts`**
- Update `ROLE_DEFAULTS` script_lines to respect duration budgets (e.g., hook at 2s gets 3-4 words max)
- Skip `script_line` for roles with duration ≤ 2s

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/ai-shot-planner/index.ts` | Duration-aware word budget rule for script_line; add `music_direction` output field |
| `src/hooks/useShortFilmProject.ts` | Use AI's `music_direction`; improve `fitTextToDuration` with MIN_VO_DURATION=3; richer `buildContextualMusicPrompt` with instrumentation/BPM per film type |
| `src/lib/shortFilmPlanner.ts` | Shorten preset script_lines to match role durations; skip VO for ≤2s shots |
| `src/types/shortFilm.ts` | Add `music_direction?: string` to `ShortFilmProject` |

