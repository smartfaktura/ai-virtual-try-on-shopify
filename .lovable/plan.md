## Goal

Improve the SEO category pages under `/ai-product-photography/{slug}` with three changes:

1. **Multi-category hero collage** — when a page covers multiple subcategories (e.g. Bags · Accessories · Eyewear · Watches), show a 4-image collage in the hero (one image per subcategory) instead of a single image.
2. **Modern, breathing breadcrumbs** — restyled and repositioned for a more premium feel.
3. **"One photo · Every shot" section** — moved to be the **second** section of the page (right after the hero), retitled per category, and rebuilt to match the homepage's `HomeTransformStrip` pattern: chip rail of subcategories, each chip reveals an 8-image grid.

---

## 1. Hero collage for multi-category pages

In `src/data/aiProductPhotographyCategoryPages.ts`:
- Add an optional `heroCollage?: { subCategory: string; imageId: string; alt: string }[]` field on `CategoryPage` (4 entries when used).
- Populate it for the 4 multi-group pages where the hero eyebrow lists multiple categories:
  - **bags-accessories** → Bags, Accessories, Eyewear, Watches
  - **footwear** → Shoes, Sneakers, Boots, High Heels
  - **beauty-skincare** → Skincare, Cosmetics, Makeup, Lipsticks
  - **home-furniture** → Home Decor, Furniture, Lighting, Styled Interiors
  - (also fashion if it makes sense: Apparel, Activewear, Swimwear, Jackets)
- All `imageId`s pulled from existing `sceneExamples` IDs already verified against `product_image_scenes`.

In `src/components/seo/photography/category/CategoryHero.tsx`:
- If `page.heroCollage` exists, render a 2×2 collage in the hero image slot using the same rounded-3xl container, with subtle gaps and a single subtle gradient label across the bottom listing the four subcategory names. Each tile keeps `object-cover` and aspect square; the outer container retains the existing `aspect-[5/6]` for layout consistency.
- Otherwise, render the single hero image as today.

## 2. Breadcrumbs redesign

Extract breadcrumbs out of `CategoryHero` into a new component `src/components/seo/photography/category/CategoryBreadcrumbs.tsx` and mount it in `AIProductPhotographyCategory.tsx` **above** the hero, inside a slim full-width band:
- Background: `bg-[#FAFAF8]` with a hairline `border-b border-border/40`.
- Inner container `max-w-[1200px] mx-auto px-6 lg:px-10 py-4 lg:py-5`.
- Pills/links style: muted text, `gap-2`, separators using a small `/` or `ChevronRight` with reduced opacity, current page in foreground weight-medium with `bg-muted/50 px-2.5 py-1 rounded-full` chip treatment.
- Generous spacing, premium typography matching the rest of the site.

Remove the inline breadcrumb block from `CategoryHero.tsx` and reduce its top padding accordingly (`pt-10 lg:pt-14`).

## 3. Rebuild "One photo · Every shot" as second section

Replace `CategoryBuiltForEveryCategory.tsx` with a homepage-style implementation:

- **Position**: mount right after `CategoryHero` (move above `CategorySubcategoryChips`, `CategoryVisualOutputs`, etc.).
- **Title/subtitle adapts per category**:
  - Eyebrow: `One {category-noun} · Every shot` (e.g. "One bag · Every shot", "One shoe · Every shot", "One bottle · Every shot").
  - H2: `Built for every {groupName.toLowerCase()} shot.` (e.g. "Built for every bags & accessories shot.").
  - Add `heroNoun` field on `CategoryPage` to drive the eyebrow noun cleanly.
- **Chip rail = page subcategories** (e.g. Bags-Accessories page → chips: Bags, Handbags, Backpacks, Eyewear, Watches…). Uses the same chip styling as `HomeTransformStrip` (mobile scrollable rail with edge fades + desktop centered chip group inside a `bg-muted/60` pill container).
- **Grid = 8 images per subcategory** (mobile shows 6, desktop shows 8 in a `sm:grid-cols-4 grid-cols-3 gap-3 lg:gap-4`, square cards with rounded corners, label gradient on hover — same `GridCard` pattern as home).
- **Data**: extend `CategoryPage` with:
  ```ts
  builtForGrids: { subCategory: string; cards: { label: string; imageId: string }[] }[]
  ```
  Populate 8 cards per subcategory per page (10 pages × ~6 subcategories × 8 = ~480 image IDs). All IDs sourced from the live `product_image_scenes` catalog matching the page's category collection (same source of truth used by `/product-visual-library`).
- Bottom CTA mirrors home: small caption (`{N}+ scenes for {groupName.toLowerCase()} · one upload`) + two buttons (`Create your first visuals free` → `/app/generate/product-images`, `Browse the visual library` → `/product-visual-library`).

The old single-active-image variant of this section is removed entirely.

## Page section order (after changes)

```text
LandingNav
CategoryBreadcrumbs            ← NEW slim band
CategoryHero                   ← collage when multi-category
CategoryBuiltForEveryCategory  ← MOVED UP, now homepage-style 8-image grid
CategorySubcategoryChips
CategoryVisualOutputs
CategoryPainPoints
CategorySceneExamples
PhotographyHowItWorks
CategoryUseCases
CategoryRelatedCategories
CategoryFAQ
PhotographyFinalCTA
LandingFooter
```

## Files touched

- `src/data/aiProductPhotographyCategoryPages.ts` — add `heroCollage`, `heroNoun`, `builtForGrids`; populate for all 10 pages with verified scene IDs.
- `src/components/seo/photography/category/CategoryBreadcrumbs.tsx` — NEW.
- `src/components/seo/photography/category/CategoryHero.tsx` — collage support, breadcrumb removed, padding adjusted.
- `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx` — rewritten to match `HomeTransformStrip` (chip rail + 8-image grid, adaptive title).
- `src/pages/seo/AIProductPhotographyCategory.tsx` — mount `CategoryBreadcrumbs`, reorder sections.

No DB, routing, or sitemap changes required.
