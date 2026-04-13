
## What I found

- I checked the current `/app/admin/models` image-replace flow.
- The upload is failing before the model record is updated.
- The failing request is the storage upload itself: it sends `x-upsert: true` and returns `new row violates row-level security policy`.
- In `src/pages/AdminModels.tsx`, the upload uses `scratch-uploads` with `upsert: true`.
- The current storage rules for that bucket allow authenticated inserts, but `upsert` needs extra permissions. Since the path is already unique, `upsert` is unnecessary.
- I also confirmed that built-in image overrides are only being applied on the admin page right now. So even after the upload bug is fixed, the new image would not consistently show in the rest of the app unless the override is applied in shared model consumers too.

**Do I know what the issue is? Yes.**

## Plan

### 1. Fix the actual upload bug in `src/pages/AdminModels.tsx`
- Remove `upsert: true`
- Reuse the safer upload pattern already used in `AddModelModal`
- Keep unique filenames so uploads never need overwrite behavior
- Add basic file validation and clearer error toasts

### 2. Keep the current persistence model, but make it reliable
- **Built-in models:** keep saving the new image URL into `model_sort_order.image_override_url`
- **Custom models:** keep updating `custom_models.image_url` and `optimized_image_url`
- Also update `updated_by` when saving a built-in override

### 3. Make the changed image show everywhere, not only in admin
Extend `src/hooks/useModelSortOrder.ts` with a shared helper such as `applyImageOverrides(models)` and use it anywhere model lists are built from `mockModels`.

At minimum, patch:
- `src/pages/AdminModels.tsx`
- `src/pages/Generate.tsx`
- `src/components/app/freestyle/ModelSelectorChip.tsx`
- `src/components/app/CreativeDropWizard.tsx`
- `src/pages/ProductImages.tsx`

Also audit remaining `mockModels` consumers and apply the same helper where model thumbnails are shown.

### 4. Clean the admin console warning while touching the page
- Fix the `AlertDialog` markup in `src/pages/AdminModels.tsx` so the ref warning disappears

### 5. QA
After implementation, verify:
- built-in model image replacement succeeds with no RLS error
- replacing the same model image twice still works
- the updated image appears immediately on `/app/admin/models`
- the same updated image appears in the main model pickers and generation flows
- custom model image replacement still works

## Technical notes
- No database migration is needed for this image-fix pass
- The existing `model_sort_order.image_override_url` column is enough
- Built-in **text/metadata** editing is still a separate feature; this fix is specifically for making model image replacement work end-to-end
