

## Final safe plan: stop scene metadata leak, backfill history, add UI fallback

Three small, isolated changes. No RLS or schema changes. Fully idempotent.

### 1. Stop the leak (edge functions)

In `generate-workflow`, `generate-tryon`, and `generate-catalog`: snapshot scene/model/product/workflow metadata into a frozen const **immediately after** parsing the queue `body`, before any variation/fallback logic runs. Use that frozen object in the `generation_jobs` insert instead of re-reading `body.*` / `payload.*`.

```ts
const sceneSnapshot = {
  scene_name:      (body.pose as any)?.name ?? body.scene_name ?? null,
  scene_id:        (body as any).scene_id ?? (body.pose as any)?.id ?? (body.scene as any)?.id ?? null,
  scene_image_url: (body.pose as any)?.originalImageUrl ?? null,
  model_name:      body.model?.name ?? body.model_name ?? null,
  model_image_url: body.model?.originalImageUrl ?? null,
  workflow_slug:   body.workflow_slug ?? null,
  product_name:    body.product_name ?? body.product?.title ?? null,
  product_image_url: body.product_image_url ?? null,
};
```

Thread it into `completeQueueJob(...)` and use those frozen values at the insert site (replacing the current `payload.pose?.name || payload.scene_name || null` style lookups).

### 2. Backfill historical NULLs (one-shot SQL migration)

Recover data from `generation_queue.payload` by matching the queue UUID embedded in the result image URL. `COALESCE` ensures existing good data is never overwritten — safe to re-run.

```sql
UPDATE generation_jobs gj
SET
  scene_name        = COALESCE(gj.scene_name,        gq.payload->>'scene_name'),
  scene_id          = COALESCE(gj.scene_id,          gq.payload->>'scene_id'),
  scene_image_url   = COALESCE(gj.scene_image_url,   gq.payload->>'scene_image_url'),
  model_name        = COALESCE(gj.model_name,        gq.payload->>'model_name'),
  model_image_url   = COALESCE(gj.model_image_url,   gq.payload->>'model_image_url'),
  product_image_url = COALESCE(gj.product_image_url, gq.payload->>'product_image_url'),
  workflow_slug     = COALESCE(gj.workflow_slug,     gq.payload->>'workflow_slug')
FROM generation_queue gq
WHERE gj.scene_name IS NULL
  AND gq.payload->>'scene_name' IS NOT NULL
  AND (gj.results->>0) ILIKE '%/' || gq.id::text || '/%';
```

### 3. UI safety net (`AddToDiscoverModal.tsx`)

When `sceneName` prop is missing but `sourceGenerationId` is present, do a single indexed lookup against `generation_jobs` before falling back to AI suggestion. ~5ms, primary-key indexed.

```ts
if (!sceneName && sourceGenerationId) {
  const { data } = await supabase
    .from('generation_jobs')
    .select('scene_name, scene_id, scene_image_url')
    .eq('id', sourceGenerationId)
    .maybeSingle();
  if (data?.scene_name) {
    // hydrate scene picker from DB, skip AI describe
  }
}
```

### Files touched

```text
EDIT  supabase/functions/generate-workflow/index.ts   (snapshot pattern)
EDIT  supabase/functions/generate-tryon/index.ts      (snapshot pattern)
EDIT  supabase/functions/generate-catalog/index.ts    (snapshot pattern)
NEW   supabase/migrations/<ts>_backfill_generation_jobs_scene_metadata.sql
EDIT  src/components/app/AddToDiscoverModal.tsx       (DB fallback before AI)
```

### Why this is safe

- Edge function changes are purely additive — worst case a field stays NULL like today.
- Backfill is `WHERE … IS NULL` + `COALESCE` — idempotent, never overwrites good data, only touches broken rows where matching queue payload still exists.
- UI fallback is a single `.maybeSingle()` on an indexed PK, wrapped in the existing async open effect.
- No RLS, schema, type, or breaking changes.

### Validation

1. Generate a fresh batch from `/app/generate/product-images` → every new `generation_jobs` row has `scene_name`, `scene_id`, `scene_image_url`, `model_name`, `product_image_url` populated.
2. After backfill: `SELECT count(*) FILTER (WHERE scene_name IS NULL) FROM generation_jobs WHERE workflow_slug='product-images'` drops dramatically.
3. Open an older library item that previously said "No scene detected" → scene picker now preselects the real scene from DB (no AI fallback, no warning).
4. Open a brand-new generation → scene picker hydrates from props instantly (no DB roundtrip).
5. Recreate from Discover after publishing → lands on the correct scene preselected.

