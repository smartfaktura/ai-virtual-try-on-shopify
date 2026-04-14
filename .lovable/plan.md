

# Fix Shot Duration Bug in Short Film

## Problem

Kling's omni-video multi-shot endpoint has strict constraints:
- **Max total duration**: 15 seconds
- **Per-shot duration**: must be "5" or "10" (not arbitrary values like 3 or 4)
- **Min 2 shots** for multi-shot mode

The current code caps total duration to 15s but then `distributeShotDurations()` divides it evenly, producing invalid per-shot values (e.g., 4 shots × 10s = 40s → capped to 15s → distributed as 4,4,4,3 → Kling rejects these). Even with 5s selected, 4 shots = 20s → capped to 15s → distributed as 4,4,4,3 — still invalid.

## Fix

**Enforce "5s per shot" as the only multi-shot option** and **cap shot count to 3** (3×5=15s max). The "10s" option only works with 1 shot (which falls back to single-shot mode anyway).

### Changes

**1. `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx`**
- Remove the "10s per shot" button entirely, or show it as disabled with a tooltip explaining the 15s limit
- Simpler: just remove it — short films are always 5s per shot

**2. `src/lib/shortFilmPromptBuilder.ts`**
- `calculateTotalDuration`: remove the generic cap logic; just return `shotCount * 5`, capped at 15
- `distributeShotDurations`: always return `5` for each shot (no fractional distribution)
- Guard: max 3 shots (15s / 5s)

**3. `src/hooks/useShortFilmProject.ts`**
- When building `multishotPayload`, set each shot's duration to `5` (hardcoded safe value)
- If shot plan has >3 shots, truncate to 3 before sending

**4. `src/lib/shortFilmPlanner.ts`**
- Cap `defaultShotCount` values to max 3 for all film types (currently some are 4-5)

**5. `supabase/functions/ai-shot-planner/index.ts`**
- Update the system prompt to say "Generate 2-3 shots" instead of "4-8 shots"

**6. `src/types/shortFilm.ts`**
- Change `shotDuration` type from `'5' | '10'` to just `'5'` (or keep for backwards compat but ignore)

### Summary

| File | Change |
|------|--------|
| `ShortFilmSettingsPanel.tsx` | Remove 10s option from UI |
| `shortFilmPromptBuilder.ts` | Hardcode 5s per shot, cap at 3 shots |
| `useShortFilmProject.ts` | Force duration=5 per shot, truncate to 3 shots max |
| `shortFilmPlanner.ts` | Cap defaultShotCount to 3 |
| `ai-shot-planner/index.ts` | Change prompt to "2-3 shots" |
| `shortFilm.ts` | Update type (optional) |
| `videoCreditPricing.ts` | Remove `basePerShot10s` references |

