# Brand Scenes

Turn the `/app/brand-scenes` placeholder into a real feature mirroring Brand Models: users create, save, and reuse their own scenes that show up inside Visual Studio's scene picker for the right category.

## User flow

1. **List page** `/app/brand-scenes` — grid of the user's saved scenes (thumbnail, name, category badge), with "+ New scene" CTA. Empty state explains the concept.
2. **New scene** `/app/brand-scenes/new` — three creation modes (tabs):
   - **Upload** a reference image (jpg/png).
   - **Generate from prompt** (text → image via Lovable AI, same provider chain as freestyle).
   - **Pick from my Library** (reuse a previous generation as a scene reference).
3. **Configure step** (always shown after image is ready):
   - **Category** (required, picked first as user requested) — drives where the scene appears in Visual Studio. Uses the existing scene taxonomy (`useSceneCategories` → lifestyle / editorial / studio / flatlay / macro / streetwear / surface / etc.) plus the user's own custom categories.
   - **Sub-category / product type fit** (optional multi-select: apparel, eyewear, footwear, fragrance, bags…) so the scene only surfaces for relevant products.
   - **Name** + short description (auto-filled by AI vision via existing `create-scene-from-image` edge function).
   - **Prompt hint** — the directive that gets injected when this scene is used. Pre-filled from AI analysis, editable.
   - **Prompt-only toggle** — if on, the image is just a thumbnail and the generator uses the prompt only (no scene reference image sent to the model). If off, the image is used as a visual scene reference.
   - **Aspect ratio hint** (1:1 / 4:5 / 3:4 / 16:9) — default the scene renders at.
   - **Allow people in scene** toggle — lets the picker know if this scene is on-model compatible.
4. **Save** → returns to list. Scene is immediately usable in:
   - Product Images / Visual Studio scene picker (filtered under "My scenes" + its category tab).
   - Freestyle scene chip.
   - Creative Drops scene pool.
5. **Manage**: edit name/category/prompt hint, toggle active, delete. Soft-delete (`is_active=false`) so existing generations keep working.

## What I'm deliberately covering that's easy to miss

- **Per-user ownership & RLS**: today `custom_scenes` is admin-only. Brand Scenes need a `user_id`-scoped owner path so a user only sees their own scenes (plus admin-published public ones).
- **Category-first ordering** in the wizard (you flagged this) — category is step 1, not buried at the bottom.
- **Auto-thumbnail optimization** — reuse `buildOptimizedUrl` so the grid is fast.
- **AI vision pre-fill** — `create-scene-from-image` already analyzes uploads and suggests name/description/category, so users barely have to type.
- **Storage path** — uploads go to `product-uploads/{user_id}/brand-scenes/…` to match existing RLS prefix rules.
- **Quota / safety** — soft cap (e.g. 50 brand scenes per user, configurable) so a user can't flood the picker.
- **Where it shows up in Visual Studio** — the existing scene picker hooks (`useCustomScenes`, `usePublicSceneLibrary`) need to merge owned scenes into the category tab the user chose. Without that, the scene "exists" but never surfaces.
- **Product-category fit filter** — if the user tags a scene as "footwear only", it's hidden when generating for a fragrance product (prevents mismatched outputs).
- **Edit vs re-create** — editing prompt/category is allowed; the reference image is immutable (changing it would silently change every future generation).
- **Tracks the same `prompt_only` flag** the admin custom scenes use, so the generation pipeline already handles it — no new branching logic.
- **No Discover exposure** by default — brand scenes are private; admins can later promote a scene to Discover (out of scope here).

## Technical details

- **DB migration**
  - Extend `custom_scenes` with `owner_scope text default 'admin'` (values: `admin` | `user`), an optional `product_categories text[]`, `aspect_ratio text`, `allow_people boolean`.
  - Add RLS:
    - `SELECT`: `auth.uid() = created_by AND owner_scope = 'user'` (own scenes), plus existing admin/public paths kept intact.
    - `INSERT`: authenticated users when `owner_scope = 'user' AND created_by = auth.uid()`.
    - `UPDATE` / `DELETE`: owner-only for their own user-scope rows; admin policy unchanged.
  - Update `get_public_custom_scenes` to keep returning admin scenes only; add new RPC `get_my_brand_scenes()` for the owner.
- **Hooks**
  - New `useBrandScenes()` — list/insert/update/delete for `owner_scope='user'` rows.
  - Extend `useCustomScenes` consumer hooks in the scene picker to merge in `useBrandScenes()` results behind a "My scenes" group.
- **Pages / components**
  - Replace `src/pages/BrandScenes.tsx` placeholder with the list view.
  - New `src/pages/BrandSceneNew.tsx` (mirrors `BrandModelNew.tsx`) hosting a new `BrandSceneWizard` component with the three modes.
  - New `src/components/app/BrandSceneCard.tsx` for the grid item with edit/delete menu.
  - Route: add `/app/brand-scenes/new` and `/app/brand-scenes/:id/edit` to `App.tsx`.
- **Edge functions**
  - Reuse `create-scene-from-image` (vision analysis, already exists).
  - For "Generate from prompt", reuse the existing freestyle generation endpoint and store the result as the scene's reference image.
- **Sidebar** — already links to `/app/brand-scenes`; no nav changes.

## Out of scope

- Admin promotion of brand scenes to public Discover.
- Team sharing of brand scenes (single-user only for v1).
- Bulk import of multiple scenes at once.
