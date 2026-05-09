## Goal
Hide all `category_collection = 'bundle'` scenes from every general scene listing (Freestyle scene catalog modal, Product Images Step 2, Public Scenes Library, recommended rails, scene-counts) — while keeping them available on the **Bundle Visuals** page (which intentionally only shows bundle scenes) and in admin scene management screens.

## Where bundle scenes leak in today
A search for `from('product_image_scenes')` + `category_collection` shows six entry points and **none** of them currently exclude the `bundle` collection:

| Hook / file | Used by | Currently excludes bundle? |
|---|---|---|
| `src/hooks/useProductImageScenes.ts` (`fetchAllScenes`, `fetchScenesByCategories`, `fetchScenesExcludingCategories`) | Freestyle catalog, Product Images wizard, Bundle Visuals, admin pages | No |
| `src/hooks/useSceneCatalog.ts` (`applyFilters`, `useInterleavedSceneCatalog`) | Freestyle scene catalog grid + interleaved default view | No (`bundle` lands in `tail` so it still appears) |
| `src/hooks/useSceneCounts.ts` | Sidebar counts in Freestyle modal | No |
| `src/hooks/usePublicSceneLibrary.ts` | Public `/app/scenes` library page + admin SEO scene picker | No |
| `src/hooks/useRecommendedScenes.ts` | Freestyle "Recommended" rail | No |

Only `src/pages/BundleVisuals.tsx` actually wants bundle scenes — it currently filters them client-side via `allScenes.filter(s => s.categoryCollection === 'bundle')`, which is why bundle scenes are loaded at all.

## Plan

### 1. Add an `includeBundle` opt-in to `useProductImageScenes`

**File:** `src/hooks/useProductImageScenes.ts`

- Add `includeBundle?: boolean` (default `false`) to `UseProductImageScenesOptions`.
- Thread it into `fetchAllScenes`, `fetchScenesByCategories`, and `fetchScenesExcludingCategories`. When `false`, append `.neq('category_collection', 'bundle')` to each query.
- Bake the flag into `cacheVariant` so React Query caches don't collide between `bundle on` and `bundle off` modes.

**Opt back in (must pass `{ includeBundle: true }`):**
- `src/pages/BundleVisuals.tsx` — line 89: `useProductImageScenes({ includeBundle: true })`. This is the only end-user surface that needs bundle scenes.
- `src/pages/AdminBulkPreviewUpload.tsx` — line 145, already passes `includeInactive: true`. Add `includeBundle: true` so admins can still upload previews for bundle scenes.
- `src/pages/AdminProductImageScenes.tsx` — line 193, same reasoning.

All other callers (`ProductImages.tsx`, `ProductImagesStep2Scenes.tsx`, `ProductImagesStep3Refine.tsx`, `ProductImagesStep4Review.tsx`, `ProductImagesStep6Results.tsx`, `ImportProductScenesModal.tsx`, `ImportFromScenesModal.tsx`) keep the default and automatically stop seeing bundle scenes.

### 2. Exclude bundle from `useSceneCatalog`

**File:** `src/hooks/useSceneCatalog.ts`

- In `applyFilters` (line 49): when neither `filters.categoryCollection === 'bundle'` nor `filters.collections` explicitly contains `'bundle'`, append `.neq('category_collection', 'bundle')`. This protects all three queries (`useSceneCatalog`, `useSceneRail`, search/filter mode).
- In `useInterleavedSceneCatalog` (line 180): add `.neq('category_collection', 'bundle')` to the supabase select. Bundle slugs aren't in `CATEGORY_FAMILY_MAP`, so today they fall into the `tail` array and appear at the bottom of the default scene grid — this query change kills that.

### 3. Exclude bundle from sidebar counts

**File:** `src/hooks/useSceneCounts.ts`

- Add `.neq('category_collection', 'bundle')` to the `.select(...)` query so sidebar counts (subjects / shot styles / settings / collections / sub-categories) never tally bundle scenes.

### 4. Exclude bundle from the public scenes library

**File:** `src/hooks/usePublicSceneLibrary.ts`

- Add `.neq('category_collection', 'bundle')` to the main scene query. This removes bundle scenes from `/app/scenes`, the public deep-link picker, and the admin SEO scene picker (`ScenePickerModal.tsx`).

### 5. Exclude bundle from the Recommended rail

**File:** `src/hooks/useRecommendedScenes.ts`

- Add `.neq('category_collection', 'bundle')` to both queries (line ~123 and line ~160) so admin-starred bundle scenes never surface in the Freestyle "Recommended" rail.

### Verification
- Open Freestyle (`/app/freestyle`) → scene catalog modal: confirm no bundle thumbnails appear in the default interleaved grid, in the search results, in the Recommended rail, or in the sidebar count badges.
- Open `/app/scenes` (Public Scene Library): confirm bundle scenes are gone.
- Open `/app/bundle-visuals`: confirm bundle scenes still load and are selectable.
- Open `/app/admin/product-image-scenes` and `/app/admin/bulk-preview-upload`: confirm bundle scenes are still listed for admin management.

## Out of scope
- No DB or schema changes.
- No edit to the bundle scene records themselves (`is_active` stays `true`).
- No UI copy or layout changes.
- The taxonomy file `src/lib/sceneTaxonomy.ts` does not need to learn about `bundle`; we filter it out at the data layer.
