
## Status: partially fixed

✅ Step 2 priority fetch loads only the relevant category first (swimwear in your test).
❌ The "rest" background fetch still pulls all ~3000 rows with `select=*` including heavy `prompt_template` (multi-MB).
❌ `generation_queue` polls every 4s even when idle.

## Two remaining fixes

### Fix A — Make the "rest" background fetch lazy + slim
In `useProductImageScenes.ts`:
1. **Defer the rest fetch** until the user actually navigates past Step 2 (or after a 3s idle delay). Currently it kicks off immediately after priority resolves, racing the wizard's own work.
2. **Drop `prompt_template` from the rest fetch**. The wizard only needs prompts for the *selected* scenes at generation time — those are already in the priority cache. For the "rest" (scenes the user hasn't picked), we only need title/preview/category for the picker UI. Add a `slim` mode to `fetchScenesExcludingCategories` that omits `prompt_template`, `created_at`, `updated_at`.
3. If the user later switches to a scene from the "rest" set, fetch its full row on demand (single-row query, instant).

### Fix B — Back off `generation_queue` polling when idle
In the queue polling hook:
- Poll every **4s** while jobs are active.
- Back off to **20s** when the last 3 polls returned empty.
- Reset to 4s the moment a new job is enqueued (already covered by the optimistic update path).

## Files to edit
- `src/hooks/useProductImageScenes.ts` — defer + slim the rest fetch, add on-demand single-row lookup helper.
- `src/hooks/useGenerationQueue.ts` (or whichever hook owns the queue poll) — adaptive interval.

## Result
- After Step 2 paints, network goes quiet instead of downloading another 5–10 MB.
- Idle pages stop hammering `generation_queue` every 4s.
- No behavior change for the user — selecting any scene still works because either (a) it's in the priority cache, or (b) it triggers a tiny single-row fetch.
