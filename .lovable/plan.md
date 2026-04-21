

## New admin tool: Bulk UGC Scene Preview Upload

Mirror of the existing `/app/admin/bulk-preview-upload` flow, but targeting the **Selfie/UGC scene previews** stored as a JSONB array on `workflows.generation_config`.

### Route
`/app/admin/ugc-bulk-upload` → new page `AdminUgcBulkPreviewUpload.tsx`. Lazy-loaded in `src/App.tsx`. Admin-only (uses `useIsAdmin`).

### Why a new page (vs reusing the existing one)
The existing tool writes to `product_image_scenes` rows. UGC scenes live inside `workflows.generation_config.variation_strategy.variations` JSONB array, keyed by `label`. Same UX, different write path.

### UX (identical 3-step flow as the original)
1. **Header** — title "UGC Scene Bulk Previews" + back link to `/app/generate/selfie-ugc-set`. A short note: "Updates preview thumbnails for the 16 scenes of the Selfie/UGC workflow."
2. **Drop zone** — drag-drop or click-to-select multiple images (no category step needed; scope is fixed to the Selfie/UGC workflow).
3. **Review matches** — auto-matches each filename to the closest scene `label` using the same longest-suffix-match scoring helper (`normalize`, `extractCandidates`, `matchFileToScene`). Shows green check for matches, red alert for unmatched, with a manual reassign dropdown listing all 16 labels.
4. **Upload all** — uploads each image to `product-uploads/{user_id}/ugc-scene-previews/{ts}-{rand}.{ext}`, gets the public URL, then atomically updates the corresponding scene's `preview_url` field inside the JSONB array.

Filename hints surfaced in the drop-zone helper text: *"Use names like `modern-luxury-business-center.jpg`, `beach-walk.png`, `luxury-hotel-room.webp`."*

### Backend write path
Workflow JSONB updates are admin-only and currently performed via direct table updates. The cleanest, race-safe approach is a small **`SECURITY DEFINER` SQL function** added in a migration:

```sql
create or replace function public.update_ugc_scene_preview(
  p_label text,
  p_preview_url text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_idx int;
begin
  if not has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Admin only';
  end if;

  select i - 1 into v_idx
  from workflows w,
       jsonb_array_elements(w.generation_config->'variation_strategy'->'variations')
         with ordinality as t(elem, i)
  where w.slug = 'selfie-ugc-set'
    and elem->>'label' = p_label;

  if v_idx is null then raise exception 'Scene label not found: %', p_label; end if;

  update workflows
  set generation_config = jsonb_set(
    generation_config,
    array['variation_strategy','variations',v_idx::text,'preview_url'],
    to_jsonb(p_preview_url),
    true
  )
  where slug = 'selfie-ugc-set';
end;
$$;
```

The page calls `supabase.rpc('update_ugc_scene_preview', { p_label, p_preview_url })` per uploaded image. Using a function (rather than client-side jsonb manipulation) avoids race conditions when uploading many images in parallel.

### Files touched
1. **New** `src/pages/AdminUgcBulkPreviewUpload.tsx` — the page (drop zone, matcher UI, upload loop).
2. **Edit** `src/App.tsx` — lazy import + new route at `/admin/ugc-bulk-upload`.
3. **Edit** `src/pages/Generate.tsx` (Selfie/UGC settings step) — add a small admin-only "Bulk upload previews" link next to the scene grid (only visible if `useIsAdmin().isAdmin`), pointing to `/app/admin/ugc-bulk-upload`. Quality-of-life entry point so you don't have to remember the URL.
4. **New migration** — adds the `update_ugc_scene_preview(text,text)` SECURITY DEFINER function with admin role check.

### Storage
Reuses the existing public `product-uploads` bucket under prefix `{user_id}/ugc-scene-previews/`. No new bucket, no schema change beyond the helper function.

### Validation
- Visit `/app/admin/ugc-bulk-upload` → drop the 6 newly named images (e.g. `beach-walk.jpg`, `luxury-hotel-room.jpg`).
- Each card shows green check + matched scene label.
- Click "Upload N previews" → progress bar → success toast.
- Refresh `/app/generate/selfie-ugc-set` Settings step → the 6 previously thumbnail-less scenes now show your custom images.
- Re-uploading the same label overwrites the `preview_url` (idempotent).

### Out of scope
No changes to the matching algorithm, no edits to other workflows, no new buckets.

