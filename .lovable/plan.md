## Goal

Let users save the fabric/colour swatches they upload on `/app/material-swap` so they can reuse them in future generations, without bloating the page or leaking files between accounts.

## Is it hard?

No — it's a small, well-contained feature. Storage + a tiny `user_materials` table + a "Saved" tab in the existing swatch picker. No changes to the swap pipeline.

## Risks and how we handle each

1. **Storage cost / abuse** — users could upload hundreds of swatches.
   - Cap at **50 saved swatches per user**, max **5 MB per file**, image types only.
   - Show count + cap in the UI; block uploads past the cap with a clear message.
2. **Privacy / cross-account leakage** — one user must never see another's swatches.
   - Dedicated bucket path `user-materials/{user_id}/...` with storage RLS limiting read/write/delete to `auth.uid() = owner`.
   - `user_materials` table with RLS: owner-only `SELECT/INSERT/UPDATE/DELETE`. `service_role` full access. No `anon` grant.
3. **Orphaned files** — DB row deleted but storage object remains (or vice versa).
   - Delete the storage object first, then the DB row, inside the same handler. Tolerate "object not found" so retries succeed.
4. **Bad uploads** — non-image files, oversized files, EXIF rotation issues.
   - Validate MIME + size client-side before upload; reuse the existing `upload()` helper which already handles signed URLs.
5. **Duplicate uploads** — same fabric uploaded twice.
   - Soft-dedupe by filename + size hint; not strict (cheap, users can rename).
6. **UX regression** — adds clutter to an already dense screen.
   - Reuse the existing material card row. Add one small "Save" star icon on each freshly uploaded swatch + a "Saved swatches" strip above the upload dropzone that users can click to add back into the current batch.

## Plan

### Backend (one migration)

`supabase/migrations/<ts>_user_materials.sql`:

- Create `public.user_materials` with `id uuid pk`, `user_id uuid references auth.users on delete cascade`, `label text`, `image_path text not null` (storage path), `image_url text` (cached signed URL — optional), `created_at timestamptz default now()`.
- `GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_materials TO authenticated;`
- `GRANT ALL ON public.user_materials TO service_role;`
- Enable RLS; policies: owner-only on all four verbs using `auth.uid() = user_id`.
- Index on `(user_id, created_at DESC)`.
- Create storage bucket `user-materials` (private) with RLS:
  - `SELECT`/`INSERT`/`UPDATE`/`DELETE` allowed only when `bucket_id = 'user-materials' AND (storage.foldername(name))[1] = auth.uid()::text`.

### Frontend (`src/pages/MaterialSwap.tsx` + one small hook)

1. New hook `src/hooks/useSavedMaterials.ts`:
   - `list()` — react-query fetch from `user_materials` (signed URLs via existing helper).
   - `save(material)` — copy uploaded file from current temp path into `user-materials/{uid}/{uuid}.{ext}`, insert row, return record. Reject when count ≥ 50.
   - `remove(id)` — delete storage object then row.
2. On Step 2 ("Add fabric / colour references"):
   - Above the existing dropzone, render a **"Your saved swatches"** strip (horizontal scroll, only visible when count > 0). Click a tile to add it to `materials` for this batch (no re-upload).
   - On each item already in the `materials` list, show a small star/bookmark icon. Toggling it calls `save()` or `remove()`. Saved state is reflected with a filled star.
   - Show `n / 50 saved` next to the strip header.
3. Empty state: tiny one-liner under the dropzone — "Tip: star a swatch to save it for next time".

### Out of scope

- No changes to `useMaterialSwap.ts`, generation prompt, edge functions, or pricing.
- No sharing between users, no folders/tags, no admin moderation — can be added later if needed.

## Total surface

- 1 migration
- 1 new hook (~80 lines)
- ~60 lines added to `MaterialSwap.tsx` (saved-strip + star toggle)

Simple, low-risk, fully isolated per user.
