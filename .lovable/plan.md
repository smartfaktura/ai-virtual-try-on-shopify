## Why category hubs only show 9–13 slots

Each category page (Fashion, Footwear, Beauty…) currently registers only:
- 1 hero main + collage tiles (1–4)
- Scene examples (~8)

That's why Fashion = 13, Beauty = 9, etc.

But the live category page actually renders images in **4 sections**, not 2:

| Section (component) | Images | Currently registered? |
|---|---|---|
| `CategoryHero` (hero + collage) | 1 + N | ✅ Yes |
| `CategoryBuiltForEveryCategory` (chip rail + 8-tile grid per subcategory) | up to 8 × #subcategories (~40+) | ❌ **No** |
| `CategorySceneExamples` | ~8 | ✅ Yes |
| `CategoryRelatedCategories` (3 thumbs × 3 related) | 9 | ❌ **No** |

So 30–50 image slots per category page are not editable today.

## Fix

Extend `buildCategorySlots()` in `src/data/seoPageVisualSlots.ts` so the registry matches what's actually on screen:

1. **`buildBuiltForGridSlots(page)`** — read `BUILT_FOR_GRIDS[page.slug]`, emit one slot per card:
   - key: `builtFor_{subCategorySlug}_{i+1}` (1–8 per subcategory)
   - section: `"Built for every {category} shot"`
   - label: `"{subCategory} · tile {i+1} — {card.label}"`
   - tags: page tags + subcategory + card label tokens
2. **`buildRelatedCategorySlots(page)`** — for each of `page.relatedCategories`, emit 3 thumb slots:
   - key: `related_{relatedSlug}_{i+1}` (1–3)
   - section: `"Related product photography categories"`
   - fallback id resolved with the same `getRelatedThumbs()` logic the component uses (hero collage → scene examples → hero), so the admin sees the exact tile that's currently rendering.

Update `buildCategorySlots(page)` to concatenate: `[heroMain, ...collage, ...scenes, ...builtFor, ...related]`.

## Wire components to read overrides

Both newly-registered sections currently render only fallback IDs. Add the same `useSeoVisualOverridesMap(pageRoute) + resolveSlotImageUrl(...)` pattern already used by other components:

- **`CategoryBuiltForEveryCategory.tsx`** — resolve each `card.imageId` against `builtFor_{subSlug}_{i+1}`
- **`CategoryRelatedCategories.tsx`** — resolve each thumb against `related_{relSlug}_{i+1}` (passing the **current** page route, not the related page's route, so admins manage thumbs from the page they're viewing)

Both components already receive `page`, so the route is `page.url`. No prop drilling needed.

## Expected result in `/app/admin/seo-page-visuals`

After this change, each Category Hub jumps from 9–13 slots to roughly:
- Fashion: ~70+ (was 13)
- Footwear: ~60+ (was 13)
- Beauty & Skincare: ~50+ (was 9)
- …same for the remaining 7 hubs

Every image visible on a category page becomes overridable, with no change to fallback rendering when no override exists.

## Files to edit

- `src/data/seoPageVisualSlots.ts` — add 2 builder functions, extend `buildCategorySlots`
- `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx` — read overrides
- `src/components/seo/photography/category/CategoryRelatedCategories.tsx` — read overrides

No DB migration needed — slots are stored in code; the `seo_page_visuals` table already accepts arbitrary `(route, slot_key)` pairs.
