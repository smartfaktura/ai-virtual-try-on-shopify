## What's broken

On category pages like `/ai-product-photography/fashion`, the **"Fashion scenes built for e-commerce"** grid (and the same section on every other category page — boots, eyewear, etc.) ignores admin overrides from `/app/admin/seo-page-visuals`.

The admin UI happily saves values for the `sceneExample1`…`sceneExampleN` slots and writes them to the `seo_page_visuals` table, but the live component still renders only the static `page.sceneExamples[*].imageId` values. That's why your edits don't appear in the preview, even immediately.

## Why only this one

I audited every image-bearing section across the SEO system. Everything else is already wired correctly:

| Component | Status |
|---|---|
| `CategoryHero` (hero + collage) | wired (last fix) |
| `CategoryBuiltForEveryCategory` | wired |
| `CategoryRelatedCategories` | wired |
| `PhotographyHero` / `VisualSystem` / `SceneExamples` / `CategoryChooser` (hub + tool pages) | wired |
| `LandingHeroSEO` / `LandingOneToManyShowcase` / `LandingCategoryGrid` | wired |
| **`CategorySceneExamples`** | **NOT wired — bug** |

`CategoryVisualOutputs` has no images (icons only), so it's not in scope.

## Fix

Update `src/components/seo/photography/category/CategorySceneExamples.tsx` to:

1. Import `useSeoVisualOverridesMap` and `resolveSlotImageUrl` / `resolveSlotAlt`.
2. Read overrides for the current `page.url` route.
3. For each scene tile at index `i`, compute `slotKey = `sceneExample${i + 1}`` and resolve `src` and `alt` against overrides, falling back to `PREVIEW(ex.imageId)` and `ex.alt`.
4. Pass the resolved URL through `getOptimizedUrl(..., { quality: 55 })` exactly like today, so optimization behavior is unchanged.

This mirrors the exact pattern already used in `CategoryBuiltForEveryCategory.tsx` and `CategoryRelatedCategories.tsx` — no new utilities, no schema changes, no migration.

## After the fix

- Preview at `/ai-product-photography/fashion` will reflect admin edits to the scene grid immediately (cache TTL ~30s in the overrides hook).
- Live site (`vovv.ai`) still requires **Publish → Update** to ship the new component code.

No DB changes. No new files. One component edited.
