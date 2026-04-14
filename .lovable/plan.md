

# Fix Short Film: Support Variable Shot Durations and Up to 6 Shots

## What's Wrong

The previous fix was overly restrictive. Kling's official omni-video API actually supports:
- **1-6 shots** per multi-shot request
- **Per-shot duration**: any integer from **1 to total duration** (not just 5 or 10)
- **Total duration**: 3-15 seconds (v3-omni)
- **Constraint**: sum of all shot durations must equal total duration

The current code hardcodes 3 shots max, 5s each — throwing away the ability to have 4-5 shots with cinematically varied pacing (e.g., a 2s hook, 4s reveal, 5s hero, 4s closing = 15s total).

## Plan

### 1. Restore 4-role story structures (`shortFilmPlanner.ts`)
- Add back the 4th role to structures that were truncated (e.g., `hook_reveal_detail_closing` → `['hook', 'product_reveal', 'detail_closeup', 'brand_finish']`)
- Remove the `slice(0, 3)` cap in `generateShotPlan`
- Instead cap at 6 shots max
- Assign **cinematic default durations** per role instead of flat 5s:
  - `hook`/`tease`: 2s (short, punchy)
  - `reveal`/`product_reveal`/`highlight`: 4s (hero moment)
  - `detail_closeup`/`product_focus`: 3s
  - `brand_finish`/`resolve`/`end_frame`: 3s
  - `intro`/`atmosphere`: 3s
  - `lifestyle`/`human_interaction`: 3s
  - `build`: 2s
- Ensure default durations sum to ≤15s per structure

### 2. Update duration helpers (`shortFilmPromptBuilder.ts`)
- `calculateTotalDuration`: sum actual `duration_sec` from shots (cap at 15)
- `distributeShotDurations`: return each shot's own `duration_sec` (no longer force 5s)
- Keep max 15s total validation

### 3. Update generation payload (`useShortFilmProject.ts`)
- Remove `slice(0, 3)` — cap at 6 shots instead
- Use each shot's `duration_sec` directly in the payload
- Validate total ≤ 15s before sending; if over, proportionally scale down
- Pass correct `totalDuration` as sum of per-shot durations

### 4. Update settings panel (`ShortFilmSettingsPanel.tsx`)
- Replace the static "5s per shot" label with dynamic info: e.g., "4 shots · 15s total (platform limit: 15s)"
- No duration picker needed since each shot's duration is set in the shot plan editor

### 5. Update ShotCard duration input (`ShotCard.tsx`)
- Change `max={10}` to `max={15}` (a single shot could be up to 15s if it's the only one)
- Keep `min={1}` (Kling minimum per shot is 1s) — currently it's 3, needs to be 1

### 6. Update AI planner prompt (`ai-shot-planner/index.ts`)
- Update system prompt to say "2-6 shots" with variable durations summing to exactly 15s
- Instruct it to use cinematic pacing (shorter hooks, longer hero shots)

### 7. Update custom structure description (`shortFilmPlanner.ts`)
- Change "max 3" to "max 6" in the custom structure description

## Files to Change

| File | Change |
|------|--------|
| `src/lib/shortFilmPlanner.ts` | Restore 4-role structures, add per-role default durations, cap at 6 |
| `src/lib/shortFilmPromptBuilder.ts` | Use actual per-shot durations, validate total ≤ 15 |
| `src/hooks/useShortFilmProject.ts` | Remove slice(0,3), use per-shot duration_sec, validate total |
| `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx` | Dynamic duration info |
| `src/components/app/video/short-film/ShotCard.tsx` | min=1, max=15 for duration input |
| `supabase/functions/ai-shot-planner/index.ts` | 2-6 shots, variable durations, cinematic pacing |

