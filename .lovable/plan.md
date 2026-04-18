

## Issue 1 — Films land at 12s instead of 15s

**Root cause:** The AI Director picks shot durations freely (e.g. 2+4+3+3=12s). The edge function `ai-shot-planner` only *scales down* when total > 15 — there is no logic to *expand up* to the target. Worse, the system prompt actively says *"social/teaser ~6–10s, showcase/PDP ~8–12s, brand mood/editorial ~10–15s. Do NOT force exactly 15s"*. So the model is being told NOT to hit 15.

**Fix in `supabase/functions/ai-shot-planner/index.ts`:**
1. Update the DURATION instruction in the system prompt to: *"Total duration MUST be exactly 15 seconds across all shots. Use cinematic, role-weighted pacing (NOT equal splits) — but the sum must equal 15."*
2. Add an **expand-up** branch in the post-processing: when `total < cap`, distribute the remaining seconds onto the longest-fitting shots (priority: `product_reveal`/`product_moment`/`brand_finish`) so the final film always hits 15s.
3. Redeploy the function.

## Issue 2 — Player progress bar desyncs from time display

**Root cause:** In `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx`, the rAF `onFrame` does `(t / (video.duration || 1)) * 100`. If `video.duration` is transiently `NaN`/`0` after seek/source-swap, the formula returns e.g. `5 * 100 = 500%` which CSS clamps to 100% — so the bar pins to the end while the time clock still ticks correctly. Also `loadedmetadata` only updates the `duration` state once and there's no `durationchange` listener.

**Fix in `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx`:**
1. In `onFrame`, guard: only update progress when `video.duration > 0 && isFinite(video.duration)`.
2. Add a `durationchange` listener alongside `loadedmetadata` so duration state stays in sync if it updates after first load.
3. Use the `duration` state (not raw `video.duration`) as the source of truth in `onFrame`, falling back to skipping the update if invalid.
4. Bonus: also fix the React warning *"Function components cannot be given refs"* by removing the unused `bgAudioRef` ref-on-component pattern or wrapping with `forwardRef` if needed (will inspect during edit).

## Files to edit

- `supabase/functions/ai-shot-planner/index.ts` (then redeploy)
- `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx`

## Result

- Every AI Director film totals exactly **15 seconds**.
- The progress bar moves linearly with the time counter — no more "bar at end while clock says 0:05".

