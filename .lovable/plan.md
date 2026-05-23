# Surface saved brand scenes in Product Visuals + Freestyle pickers

## Goal

Today, saving a brand scene writes `category_collection = null`, so the new scene only lives on `/app/brand-scenes`. After this change, every saved brand scene appears inside its matching category in both pickers as a "Brand Scenes" sub-group, exactly like any other scene.

## Changes

### 1. `supabase/functions/save-brand-scene/index.ts`
On insert into `product_image_scenes`, set:
- `category_collection = answers.sub_family` (matches the schema invariant)
- `sub_category = 'Brand Scenes'`
- `sub_category_sort_order = -1000` (pins the group to the top of its category)

### 2. Backfill the user's one existing brand scene
Run a one-off SQL update so the already-saved row also gets `category_collection`, `sub_category`, and `sub_category_sort_order`. Only rows where `is_brand_scene = true AND category_collection IS NULL` are touched.

### 3. `src/hooks/useSceneCatalog.ts`
Add a read-only hook `useUserBrandScenes(family, categoryCollection, enabled)` that returns the caller's own active brand scenes, filtered by the same family/sub-family expansion the freestyle modal already uses. RLS already restricts visibility to the owner.

### 4. `src/components/app/freestyle/SceneCatalogModal.tsx`
Render a small "Brand Scenes" section above the existing grid. Hidden when the hook returns zero rows. Selecting a card reuses the existing `onSelect(CatalogScene)` path.

## Safety

- **No schema migration, no RLS change.** Every field already exists and policies already isolate brand scenes to their owner.
- **Fixes an existing invariant.** `src/features/brand-scenes/schema.ts` already requires `category_collection === answers.sub_family`; today's insert violates it.
- **Product Visuals picker needs no code change** — `useProductImageScenes` already groups by `category_collection → sub_category`. The negative `sub_category_sort_order` floats "Brand Scenes" to the top of its category.
- **Freestyle change is additive.** A new hook + a section header. No filter, taxonomy, or selection logic is altered.
- **Out of scope:** wizard, generation, credits, sidebar, admin scene library, public sharing.

## Files

- `supabase/functions/save-brand-scene/index.ts`
- One backfill via the insert tool
- `src/hooks/useSceneCatalog.ts`
- `src/components/app/freestyle/SceneCatalogModal.tsx`
