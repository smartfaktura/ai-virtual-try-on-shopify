## Goal
Fix the duplicate "Vanity Nook" render and make admin-saved public scenes carry the same metadata as the editorial siblings (reference flag, triggers, description).

## Root causes (verified)
1. **Duplicate render**: `product_image_scenes` has 1,939 active rows and 139 share `sort_order = 999`. The three fetchers in `src/hooks/useProductImageScenes.ts` paginate 1000 rows at a time ordered only by `sort_order` — with that many ties, Postgres can return the same row on two pages, dropping another. DB has exactly 1 `brand-vanity-nook-092b4d82` row; the badge "8" and the visible second card are pure render duplication.
2. **Empty fields on save**: `supabase/functions/save-brand-scene-as-public/index.ts` only writes `title`, `prompt_template`, `category_collection`, `sub_category`, `scene_type`, `preview_image_url`. It never sets `use_scene_reference`, `trigger_blocks`, or `description`, so those default to `false / {} / ''`.

## Changes

### 1. Stable pagination — `src/hooks/useProductImageScenes.ts`
Add `id` as a secondary sort tiebreaker in all three fetchers (`fetchAllScenes`, `fetchScenesByCategories`, `fetchScenesExcludingCategories`):
```ts
.order('sort_order', { ascending: true })
.order('id', { ascending: true })   // ← tiebreaker
```
`id` is the UUID primary key, so pagination becomes fully deterministic. Visible order only changes for rows that already tied — one-time, then locked in. No schema, no RLS, no writes touched.

### 2. Render-side safety net — `src/pages/AdminProductImageScenes.tsx`
In the `filtered` memo, dedupe by `id` with a `Set` before returning. Cheap, defensive — even if a future fetcher hiccups, the same row can never render twice.

### 3. Populate missing fields on save — `supabase/functions/save-brand-scene-as-public/index.ts`
Extend the insert payload:
- `use_scene_reference: true` — admin is publishing a hand-picked preview as the canonical reference image
- `trigger_blocks`: derived from wizard answers
  - always `["productDetails"]`
  - add `"personDetails"` when `answers.cast?.model_ref` is present or `cast.preset` is in `CAST_PRESETS_WITH_PEOPLE`
  - add `"sceneEnvironment"` when `base.scene_type` is a non-studio lifestyle/outdoor type
- `description`: keep `base.notes` when present (current behaviour); otherwise auto-derive `"{name} — {sub_category} editorial brand scene"`, capped at 280 chars

No client UI change required — wizard answers already contain everything needed.

### 4. Backfill the existing Vanity Nook row (one-shot migration)
```sql
UPDATE public.product_image_scenes
SET use_scene_reference = true,
    trigger_blocks = ARRAY['productDetails']::text[],
    description = 'Vanity Nook — Editorial Wellness Routine editorial brand scene'
WHERE scene_id = 'brand-vanity-nook-092b4d82'
  AND (description IS NULL OR description = '')
  AND (trigger_blocks IS NULL OR cardinality(trigger_blocks) = 0);
```
Idempotent — won't touch the row if it already has values.

## Safety notes
- All changes are additive: no column drops, no policy changes, no writes broadened.
- Edge function still admin-gated via `has_role` (unchanged).
- Dedupe + stable sort are pure read-path improvements; if either is removed, behaviour reverts to today's.
- Other scenes at `sort_order = 999` may swap positions once after deploy, then stay deterministic.

## Out of scope
- No changes to the SaveToPublicScenesDialog UI.
- No changes to brand-scenes wizard flow.
- No batch backfill of other admin-saved brand scenes (only the one row the user flagged).
