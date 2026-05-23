# Make saved brand scenes visible

Your save flow works end-to-end — the row, preview, and RLS are all correct. The missing piece is **UI surfaces** to see and use saved scenes.

## 1. Replace "Coming soon" with a real listing on `/app/brand-scenes`

Rewrite `src/pages/BrandScenes.tsx` to show the current user's saved brand scenes.

- Query:
  ```ts
  supabase
    .from('product_image_scenes')
    .select('id, scene_id, title, description, preview_image_url, created_at, brand_scene_module, brand_scene_answers')
    .eq('is_brand_scene', true)
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false });
  ```
- Empty state → keep current "Coming soon" copy + "Create your first brand scene" CTA → `/app/brand-scenes/new`.
- Populated state → grid of cards (preview image, title, created date, module badge) with actions:
  - **Use in Product Images** → navigate to `/app/generate/product-images?scene={scene_id}` (deep link already supported by the picker).
  - **Rename** → inline edit `title` (RLS already allows owner update).
  - **Delete** → soft confirm, then `delete` (RLS already allows owner delete on brand scenes).
- Keep the existing admin "Open wizard" button; also show a primary "New brand scene" button for all users (admin gating for the wizard can be relaxed later — out of scope here).

## 2. Capture a name on save (so it isn't "Untitled scene")

In `Step6PreviewAndPick.tsx`, before calling `saveBrandScene`:
- Add a small required `Input` for **Scene name** above the Save button (defaults to a smart suggestion from `answers`, e.g. module + first descriptive answer).
- Pass `name` to the `save-brand-scene` edge function (already accepted by the function — it's currently sending an empty/undefined value).
- Disable Save until the name is non-empty.

## 3. Show saved brand scenes inside the Product Images scene picker

In `src/hooks/useSceneCatalog.ts`, add a dedicated "Your brand scenes" rail that bypasses the family/category filters:

- New exported hook `useUserBrandScenesRail(enabled)`:
  ```ts
  supabase
    .from('product_image_scenes')
    .select(SLIM_COLUMNS)
    .eq('is_active', true)
    .eq('is_brand_scene', true)
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(24);
  ```
- In `ProductImages.tsx`, render this rail at the top of the scene picker (above the default rails) with header "Your brand scenes", only when results > 0.
- No changes needed to `applyFilters` — brand scenes stay out of the global catalog because they lack `category_collection`.

## 4. Sidebar entry (tiny)

`AppShell.tsx` already references `/brand-scenes`; just confirm the label reads "Brand Scenes" and isn't admin-gated, so users can reach the listing.

## Out of scope
- No schema changes (table, columns, RLS are already in place).
- No edge function changes (`save-brand-scene` already accepts `name`).
- No changes to generation flow, credit logic, or admin scene management.
- No public sharing of brand scenes across users.

## Files
- **Rewrite**: `src/pages/BrandScenes.tsx`
- **Edit**: `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx` (name input + pass to save)
- **Edit**: `src/hooks/useSceneCatalog.ts` (new `useUserBrandScenesRail`)
- **Edit**: `src/pages/ProductImages.tsx` (render the new rail)
- **Verify**: `src/components/app/AppShell.tsx` (sidebar label/visibility)
