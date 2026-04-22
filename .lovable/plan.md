

## Safe fix — Product Images scene tracking (no risk to generation)

### Goal

Make `/app/admin/scene-performance` show Product Images generations, without touching the generation pipeline itself.

### Why it's safe

- **No change to how images are generated.** We only fix how `scene_id` is *recorded* into `generation_jobs`.
- **No change to `process-queue`, no change to AI calls, no change to credits/refunds.**
- **No schema changes.** Just a small, defensive read of `payload.scene_id` in one edge function.
- **No frontend changes** (the previous fix already sends `scene_id` in the payload — confirmed in `generation_queue` rows).
- **Backfill is a pure UPDATE** that only writes `scene_id` where it is currently `NULL` — it cannot break existing rows or affect images.

### What changes (minimal)

1. **`supabase/functions/generate-workflow/index.ts`** — one defensive line right before the `generation_jobs` insert:

   ```ts
   const sceneIdForJob =
     (payload as any)?.scene_id ??
     (payload as any)?.pose?.id ??
     (payload as any)?.scene?.id ??
     null;
   ```

   Then use `scene_id: sceneIdForJob` in the insert. This guarantees the value from `generation_queue.payload.scene_id` is persisted.

2. **One-time backfill (data only)** — match `generation_jobs.scene_name` → `product_image_scenes.title` to recover today's missed Product Images rows:

   ```sql
   UPDATE public.generation_jobs gj
   SET scene_id = pis.scene_id
   FROM public.product_image_scenes pis
   WHERE gj.scene_id IS NULL
     AND gj.scene_name IS NOT NULL
     AND lower(gj.scene_name) = lower(pis.title);
   ```

   Only fills NULLs. Cannot overwrite existing data. Cannot affect images, credits, or generation.

### What is NOT touched

- `process-queue`, `enqueue-generation`, `generate-tryon`, `generate-freestyle`, `generate-catalog` — untouched.
- `generation_queue` rows — untouched.
- `freestyle_generations` — untouched (already works).
- Credits, RLS, triggers, cron, frontend — untouched.

### Rollback plan (if anything looks off)

- Edge function: revert the single `sceneIdForJob` line — generation continues working exactly as before.
- Backfill: re-run `UPDATE generation_jobs SET scene_id = NULL WHERE …` for the same window if you want a clean slate again.

### Validation

1. Generate 1 image via `/app/generate/product-images`.
2. Confirm new `generation_jobs` row has non-null `scene_id`.
3. Reload `/app/admin/scene-performance` → scene appears with name + thumbnail.
4. Today's previously-missed Product Images rows also appear (from backfill).

