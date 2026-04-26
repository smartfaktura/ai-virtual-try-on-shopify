## Goal

Make every image on the tool and comparison SEO pages controllable from `/app/admin/seo-page-visuals`, matching what's already done for `/ai-product-photography`.

Currently those pages still show "0/9" / "0/13" because the registry only lists their hero marquee. Their other image-bearing sections render through shared `Landing*` components that don't read overrides yet.

## Pages to cover

- `/ai-product-photo-generator`
- `/shopify-product-photography-ai`
- `/etsy-product-photography-ai`
- `/ai-product-photography-vs-photoshoot`
- `/ai-product-photography-vs-studio`

(`LandingValueCards`, `LandingComparisonTable`, `LandingWorkflowStrip`, `LandingDecisionMatrix`, `LandingFinalCTASEO`, `LandingFAQConfig` contain no images — nothing to wire there.)

## Image-bearing sections per page

| Section | Component | # images | Tool pages | Comparison pages |
|---|---|---|---|---|
| Hero marquee | `LandingHeroSEO` | 12 | already wired | already wired |
| "One product photo. A full visual system." | `LandingOneToManyShowcase` | 6 cards × 3 = 18 | Generator, Shopify, Etsy | — (not used) |
| "Built for every product category" | `LandingCategoryGrid` | up to 10 cards × 3 = 30 | all 3 | both |

So total slots per page after wiring:
- Generator / Shopify / Etsy: 12 + 18 + 30 = **60 slots**
- Vs Photoshoot / Vs Studio: 12 + 30 = **42 slots**

## Approach

### 1. Registry expansion (`src/data/seoPageVisualSlots.ts`)

- Add a `buildOneToManyShowcaseSlots()` factory (6 fixed cards × 3 thumbs, keys `oneToMany_{cardSlug}_{1..3}`, section `"One product photo. A full visual system."`).
- Add a `buildCategoryGridSlots()` factory (iterates `aiProductPhotographyCategories`, keys `categoryGrid_{slug}_{1..3}`, section `"Built for every product category"`).
- Update each tool/comparison page entry in `SEO_PAGES` to include the new factories (with appropriate per-page tags).
- Each page gets its **own** override scope — the same Shopify thumb override won't bleed into the Etsy page.

### 2. Component wiring

Update three shared components to optionally read from the override map when given a `pageRoute` prop:

- `LandingHeroSEO` — already reads overrides; verify it accepts `pageRoute` and uses the same `heroTile{i+1}` keys we use on the hub. If it currently uses a different key scheme, normalize it.
- `LandingOneToManyShowcase` — accept optional `pageRoute`, resolve each `imageIds[idx]` via `resolveSlotImageUrl(overrides, pageRoute, oneToMany_{slug}_{idx+1}, fallback)`.
- `LandingCategoryGrid` — accept optional `pageRoute`, resolve each `thumbs[idx]` via `resolveSlotImageUrl(overrides, pageRoute, categoryGrid_{cat.slug}_{idx+1}, fallback)`.

All three use `useSeoVisualOverridesMap(pageRoute)` (already exists). When `pageRoute` is omitted, behavior stays exactly as today (pure fallback) — no risk to other consumers.

### 3. Page-level prop pass

Add a single `pageRoute="/..."` prop to each `<LandingHeroSEO>`, `<LandingOneToManyShowcase>`, `<LandingCategoryGrid>` usage on the 5 pages.

## Behavior guarantees

- If no override exists, every page renders pixel-identical to today.
- Overrides are **scoped per route** — admin can give Etsy a craft-style category thumb without affecting Shopify.
- Slot keys are stable strings; safe for future rename of card titles.
- Admin counts will jump from `0/9` and `0/13` to `0/60` (tool pages) and `0/42` (comparison pages) until images are assigned.

## Files to edit

- `src/data/seoPageVisualSlots.ts` — add 2 factories, expand 5 page entries
- `src/components/seo/landing/LandingHeroSEO.tsx` — verify override wiring + slot keys
- `src/components/seo/landing/LandingOneToManyShowcase.tsx` — add override resolution
- `src/components/seo/landing/LandingCategoryGrid.tsx` — add override resolution
- `src/pages/seo/AIProductPhotoGenerator.tsx` — pass `pageRoute`
- `src/pages/seo/ShopifyProductPhotography.tsx` — pass `pageRoute`
- `src/pages/seo/EtsyProductPhotography.tsx` — pass `pageRoute`
- `src/pages/seo/AIPhotographyVsPhotoshoot.tsx` — pass `pageRoute`
- `src/pages/seo/AIPhotographyVsStudio.tsx` — pass `pageRoute`

No DB migration needed — uses existing `seo_page_visuals` table and existing helpers.
