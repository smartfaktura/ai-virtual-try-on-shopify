## Goal

Make `/app/admin/seo-page-visuals` a true single source of control for **every image** rendered on every public SEO page — grouped by the same section names the user sees on the live page (Hero, Categories, Visual System, Scene examples, etc.). Today only the Hero marquee on `/ai-product-photography` is wired through; everything else still renders hardcoded image IDs.

## Pages covered

1. `/ai-product-photography` (hub)
2. `/ai-product-photo-generator`
3. `/shopify-product-photography-ai`
4. `/etsy-product-photography-ai`
5. `/ai-product-photography-vs-photoshoot`
6. `/ai-product-photography-vs-studio`
7. All `/ai-product-photography/{category}` pages (fashion, footwear, beauty-skincare, etc.)

## What's missing today (gap analysis)

For the hub `/ai-product-photography` the live page renders these image groups, but only **Hero (12 tiles)** is editable. Everything else is hardcoded:

| Section on live page | # images | Editable today? |
|---|---|---|
| Hero banner marquee | 12 | Yes |
| Choose your product category (collage thumbs) | 10 categories × 3 thumbs = **30** | No |
| One product photo. A full visual system. | 6 cards × 3 thumbs = **18** | No |
| Every scene your store needs | 10 | No (registry exists but component reads hardcoded array) |

Same pattern on the 3 tool pages and 2 comparison pages (they re-use the same hub components).

## Plan

### 1. Expand the slot registry (`src/data/seoPageVisualSlots.ts`)

Add new slot factories so every image becomes a registered slot, grouped under the **exact section titles users see on the page**:

- **HERO BANNER IMAGES** — already exists (12 tiles), just rename section label
- **Choose your product category** — new factory `buildCategoryChooserSlots()` producing 30 slots keyed `categoryThumb_{slug}_{1|2|3}` with the category name in the label (e.g. "Fashion · thumb 1")
- **One product photo. A full visual system.** — replace the current 6-slot factory with `buildVisualSystemSlots()` producing **18 slots** keyed `visualSystem_{cardSlug}_{1|2|3}` (3 per card)
- **Every scene your store needs — already styled.** — keep existing `sceneExample{1..10}` slots

Section labels in the registry will match the live page headings 1:1 so the admin UI mirrors what users see.

For the 3 tool pages and 2 comparison pages: same expanded slot set (they share components).

For category pages (`/ai-product-photography/{slug}`): keep existing per-page builder but verify section names match the live page.

### 2. Wire the live components to consume overrides

Update each component to call `useSeoVisualOverridesMap()` and `resolveSlotImageUrl()` per image, the same pattern `PhotographyHero.tsx` already uses:

- `src/components/seo/photography/PhotographyCategoryChooser.tsx` — pass `pageRoute` prop, resolve each of the 3 thumbs per category through `categoryThumb_{slug}_{n}`
- `src/components/seo/photography/PhotographyVisualSystem.tsx` — pass `pageRoute` prop, resolve all 18 thumbs through `visualSystem_{cardSlug}_{n}`
- `src/components/seo/photography/PhotographySceneExamples.tsx` — pass `pageRoute` prop, resolve 10 tiles through `sceneExample{n}`

Each component accepts an optional `pageRoute` prop (defaults to `/ai-product-photography`) so the same component can render with different overrides on tool pages and comparison pages.

Update the page files (`AIProductPhotography.tsx`, `AIProductPhotoGenerator.tsx`, `ShopifyProductPhotography.tsx`, `EtsyProductPhotography.tsx`, `AIPhotographyVsPhotoshoot.tsx`, `AIPhotographyVsStudio.tsx`) to pass their own route into these shared components.

For category pages, audit `category/CategorySceneExamples.tsx` and `CategoryHero.tsx` to confirm they already consume overrides; wire any that don't.

### 3. Admin UI polish (`src/pages/admin/SeoPageVisuals.tsx`)

The page already groups slots by `section` and renders them — no structural change needed. Just confirm:

- Section headers display the **live page wording** ("Choose your product category", "One product photo. A full visual system.", "Every scene your store needs — already styled.", "HERO BANNER IMAGES").
- Slot order matches the visual order on the live page (top to bottom, left to right).
- Each card's `whereItAppears` text says exactly which tile/card/category it controls (e.g. "Fashion category card · thumbnail 2 of 3").

No new DB schema, no new API surface — the existing `seo_page_visuals` table + `useSeoVisualOverridesMap` already handle arbitrary slot keys.

## Files touched

**Edited**
- `src/data/seoPageVisualSlots.ts` — expand factories, rename sections to match live wording
- `src/components/seo/photography/PhotographyCategoryChooser.tsx` — read overrides
- `src/components/seo/photography/PhotographyVisualSystem.tsx` — read overrides
- `src/components/seo/photography/PhotographySceneExamples.tsx` — read overrides, accept `pageRoute` prop
- `src/components/seo/photography/PhotographyHero.tsx` — accept `pageRoute` prop (currently hardcodes hub route)
- `src/pages/seo/AIProductPhotography.tsx` + 5 sibling pages — pass `pageRoute` to shared components
- `src/components/seo/photography/category/CategorySceneExamples.tsx` (only if not already wired)

**Unchanged**
- DB schema, RLS, `useSeoVisualOverrides.ts`, `useAdminSeoVisuals.ts`, `ScenePickerModal.tsx`, `resolveSlotImage.ts`

## Result

After this change, opening `/app/admin/seo-page-visuals` and selecting any page shows every image from the live page, organized under the same headings the user sees, each replaceable from the Product Visuals library — with the live SEO page falling back to the existing hardcoded image whenever no override is set (so SEO never breaks).
