# Save to Public Scenes — Pick Category & Sub-Category

## Why "Coastal cliff" never showed under Supplements & Wellness

The current "Save to Public Scenes" flow inserts into `scene_recipes`. That table is the **trend-watch / drafts staging area** — it does not power the Visual Studio scene picker.

The picker the user actually browses (with families like *Wellness → Supplements & Wellness*) reads from `public.product_image_scenes`, filtered by `category_collection` and grouped by `sub_category`. A row in `scene_recipes` will never show up there until someone explicitly publishes it via `publishToProductImages` (which today is hard-coded to `scene_type='lifestyle'`, no category, no sub-category — also wrong).

So we need to (a) let the admin pick a category + sub-category at save time, and (b) insert directly into `product_image_scenes` with those values.

## Scope

Admin-only change. No new tables, no RLS changes (existing `product_image_scenes` admin write policy already covers this). No credit / billing impact.

## UX

On Step 6 of `/app/brand-scenes/new`, when an admin clicks **Save to Public Scenes**, open a small dialog:

- **Category** — single-select dropdown. Options = distinct `category_collection` values currently in `product_image_scenes` (e.g. `supplements-wellness`, `fragrance`, `activewear`, `eyewear`, …) rendered with their human label from the existing `CATEGORY_FAMILY_MAP` / `getSubFamilyLabel` helpers. Default to the wizard's `answers.sub_family` slug if it matches an existing collection, else unset.
- **Sub-category** — combobox: when a category is picked, list distinct `sub_category` values for that category (e.g. for `supplements-wellness`: *Essential Shots*, *Aesthetic Color Stories*, …). Admin can also type a brand-new sub-category name (free text) to create a new bucket.
- **Scene title** — pre-filled with the wizard name, editable.
- **Confirm** button is disabled until category + sub_category + title are all set.

On confirm we call the edge function with `{ answers, name, previewImageUrl, categoryCollection, subCategory }`.

After success, toast: `Saved to {Category Label} → {Sub-category}` with a "View in Visual Studio" link that deep-links to that category.

## Files to change

### 1. `supabase/functions/save-brand-scene-as-public/index.ts` (rewrite body)
- Keep JWT + admin guard exactly as today.
- Validate new fields: `categoryCollection` (required, string, 1–60 chars), `subCategory` (required, string, 1–80 chars), plus existing `name` and `previewImageUrl`.
- Generate `scene_id` as `brand-{shortid}` (lowercase, hyphenated) — must be unique; retry once on collision.
- Insert into `public.product_image_scenes` with:
  - `scene_id`, `title=name`, `description=base.notes` (truncated 280), `prompt_template = assembled directive` (compile via the same prompt the wizard already uses — passed in from client to avoid re-running prompt assembly server-side, OR rebuild from `answers` using the existing `assembleSceneDirective` logic; recommend client passes the compiled `prompt_template` string already shown in Step 6's "Show prompt" panel).
  - `category_collection`, `sub_category` from the request.
  - `scene_type = base.scene_type || 'lifestyle'`.
  - `preview_image_url`.
  - `is_active = true`, `sort_order = 999`, `sub_category_sort_order = 999`.
  - `trigger_blocks`, `suggested_colors`, `outfit_hint` left default/null.
- Also keep the existing `scene_recipes` insert as a side-effect audit row (optional — drop it if we want a single source of truth). **Recommendation: drop the `scene_recipes` insert** to avoid two stale copies.
- Return `{ scene: { id, scene_id, title, category_collection, sub_category } }`.

### 2. `src/features/brand-scenes/api/brandSceneApi.ts`
- Extend `saveBrandSceneAsPublicRecipe` signature to accept `categoryCollection`, `subCategory`, and `compiledPrompt`.
- Rename to `saveBrandSceneAsPublicScene` and update the return type to `{ scene: { id; scene_id; title; category_collection; sub_category } }`.

### 3. New file `src/features/brand-scenes/wizard/components/SaveToPublicScenesDialog.tsx`
- Controlled dialog (shadcn `Dialog`) with the three fields described above.
- Loads category + sub-category options via a one-shot query against `product_image_scenes` (`select category_collection, sub_category`, distinct client-side). Cached with React Query under key `['public-scene-buckets']`.
- Sub-category combobox built from shadcn `Command` + `Popover` (same pattern already used elsewhere in admin pages). Allow free-text entry.
- Calls `saveBrandSceneAsPublicScene` on confirm; on success closes dialog and bubbles up the result so Step 6 can show the toast.

### 4. `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`
- Replace the inline `handleSaveAsPublic` direct-call with: open `SaveToPublicScenesDialog` instead.
- Pass `answers`, default `name`, `selectedUrl`, and the already-assembled `directive` (so the dialog can forward `compiledPrompt`).
- Keep the admin gate (`isAdmin`) and the existing `"saving-public"` phase for the button spinner while the dialog is mid-submit.
- After success, toast as described and (optionally) navigate to `/app/workflows?category=<collection>` deep link.

## Out of scope

- No changes to `scene_recipes` schema or RLS.
- No bulk migration of previously "saved to public" rows (those 4 rows in `scene_recipes` stay where they are — admin can re-save them through the new flow if they want them live).
- No editing of an existing public scene from this dialog (use `/app/admin/product-image-scenes` for that).

## Open question (will ask before implementing)

Should the dialog also expose **scene_type** (`lifestyle` / `product` / `editorial` / `flat`) as a small selector, or auto-derive it from `base.scene_type`? Auto-derive keeps the dialog simpler; manual selector gives admins finer control. Recommend auto-derive with a fallback to `lifestyle`.
