

# Use Kling v3 Native Multi-Shot for Single Combined Video

## Problem
The short film generator sends each shot as a separate Kling `image2video` API call, resulting in 4 individual `.mp4` files. Kling v3 natively supports multi-shot generation — 2-6 shots with per-shot prompts and durations — outputting **one combined video** with smooth transitions.

## What Changes

### 1. Update Edge Function (`supabase/functions/generate-video/index.ts`)

Add a new action/mode for multi-shot generation that:
- Accepts an array of shots (each with `prompt`, `duration`, and optional image reference)
- Builds the Kling request with `multi_shot: true` and `shot_N_prompt` / `shot_N_duration` parameters (up to 6 shots)
- Total duration must be 3-15 seconds, so we validate and adjust shot durations to fit
- Submits one task to Kling, returns one `task_id`
- Polls/status check works the same — one task, one result video

Kling multi-shot parameters (for `image2video` or `omni` endpoint):
```
multi_shot: true
shot_1_prompt: "..."
shot_1_duration: 3
shot_2_prompt: "..."
shot_2_duration: 4
...
```

### 2. Update Short Film Hook (`src/hooks/useShortFilmProject.ts`)

Instead of looping through shots and enqueuing each one separately:
- Build a single payload containing all shots' prompts and durations
- Enqueue **one** queue job with `job_type: 'video_multishot'`
- Poll one job for completion
- Store the result as a single video URL on the project
- Update `video_projects` with the final video URL
- Simplify `shotStatuses` — all shots succeed or fail together

### 3. Update Player (`src/components/app/video/short-film/ShortFilmVideoPlayer.tsx`)

- When a single combined video URL exists, play it directly (no sequential clip chaining)
- Remove shot-by-shot navigation for combined videos
- Keep the volume mixer for audio tracks

### 4. Adjust Duration Constraints

Kling multi-shot total duration: 3-15 seconds max. Current default is 4 shots x 5s = 20s which exceeds 15s. Options:
- Cap at 3 shots x 5s = 15s max
- Or use shorter per-shot durations (e.g., 3-4s each)
- Show user the 15s total limit in settings

### 5. Credits & Download

- One video = one credit charge (instead of N separate charges)
- Download button downloads the single combined video directly
- No stitching edge function needed

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/generate-video/index.ts` | Add multi-shot worker mode with `shot_N_prompt`/`shot_N_duration` params |
| `src/hooks/useShortFilmProject.ts` | Single enqueue with all shots bundled; single poll; single result URL |
| `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx` | Single-video playback mode |
| `src/pages/video/ShortFilm.tsx` | Update download to use single video URL |
| `src/lib/shortFilmPlanner.ts` | Enforce 15s total duration limit across shots |
| `src/components/app/video/short-film/SettingsPanel.tsx` | Show 15s total limit in UI |

## Technical Notes

- Kling multi-shot requires v3 model with `multi_shot: true`
- Max 6 shots, min 2 shots, total duration 3-15 seconds
- Each shot prompt max 2500 chars
- The first shot can reference the source image; subsequent shots maintain visual coherence automatically
- Audio (`sound: "on"`) works with multi-shot — Kling generates native audio for the combined video

