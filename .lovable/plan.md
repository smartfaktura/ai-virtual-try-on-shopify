## 10 SEO Category Hub Pages under `/ai-product-photography`

Build a single reusable category template, drive all 10 pages from one data file, register one dynamic route, and update the parent hub + sitemap. Visual language matches the existing `/ai-product-photography` page exactly (same `LandingNav`, `LandingFooter`, `#FAFAF8`/`#f5f5f3`/white section rhythm, `#1a1a2e` headings, eyebrow + H2 + lede, white rounded cards with `#f0efed` borders, primary pill CTA).

### Routes added

```
/ai-product-photography/fashion
/ai-product-photography/footwear
/ai-product-photography/beauty-skincare
/ai-product-photography/fragrance
/ai-product-photography/jewelry
/ai-product-photography/bags-accessories
/ai-product-photography/home-furniture
/ai-product-photography/food-beverage
/ai-product-photography/supplements-wellness
/ai-product-photography/electronics-gadgets
```

### Files

**New**
- `src/data/aiProductPhotographyCategoryPages.ts` — single source of truth: array of 10 entries with `slug`, `url`, `groupName`, `seoTitle`, `metaDescription`, `h1`, `heroSubheadline`, `heroEyebrow`, `primaryKeyword`, `secondaryKeywords[]`, `longTailKeywords[]`, `subcategories[]` (chip + anchor target), `painPoints[]` (4 items), `visualOutputs[]` (8 items with title/text/icon-key), `sceneExamples[]` (8 items with label/category/previewImageId/alt), `useCases[]` (6–8 items), `faqs[]` (5 items), `relatedCategories[]` (slugs), `heroImageId` + `heroAlt`. Reuses `PREVIEW(id)` helper pointing at the same Supabase `scene-previews` bucket used elsewhere.
- `src/pages/seo/AIProductPhotographyCategory.tsx` — single dynamic page. Reads `:slug` from `useParams`, looks up the entry, renders all sections in order. 404 (Navigate to `/ai-product-photography`) if slug unknown.
- `src/components/seo/photography/category/CategoryHero.tsx` — eyebrow + H1 + subheadline + primary CTA (`/app/generate/product-images`) + secondary CTA (`#scenes`) + breadcrumb (`Home › AI Product Photography › {groupName}`) + hero image. Mirrors `PhotographyHero` typography/spacing.
- `src/components/seo/photography/category/CategorySubcategoryChips.tsx` — pill chips that anchor-scroll to in-page sections.
- `src/components/seo/photography/category/CategoryPainPoints.tsx` — 2×2 white card grid, matching `PhotographyVisualSystem` card style.
- `src/components/seo/photography/category/CategoryVisualOutputs.tsx` — 4-col card grid (reuses `PhotographyVisualSystem` look) with category-specific outputs.
- `src/components/seo/photography/category/CategorySceneExamples.tsx` — 8 image cards in a 2/3/4-col grid, identical card style to `PhotographySceneExamples`.
- `src/components/seo/photography/category/CategoryRelatedCategories.tsx` — 3-up crawlable `<Link>` cards back to sibling category pages + a link back to `/ai-product-photography`.
- `src/components/seo/photography/category/CategoryFAQ.tsx` — Accordion + per-page `FAQPage` JSON-LD (mirrors `PhotographyFAQ`).
- Reuses existing `PhotographyHowItWorks`, `PhotographyFinalCTA` (no edits) for sections 7 and 11.

**Edited**
- `src/App.tsx` — add `const AIProductPhotographyCategory = lazy(...)` and route `/ai-product-photography/:slug`.
- `src/pages/seo/AIProductPhotography.tsx` — `PhotographyCategoryChooser` already links to these URLs, no logic change needed; just confirm.
- `public/sitemap.xml` — add 10 new `<url>` entries with `priority 0.8`, `changefreq monthly`.

### Page section order (template)

1. Hero (eyebrow, H1, subheadline, dual CTA, breadcrumb, hero tile)
2. Subcategory chips (anchors)
3. Visual outputs grid ("What VOVV creates for {category}")
4. Pain points ("Why {category} visuals are hard")
5. Scene examples (8 image cards)
6. `PhotographyHowItWorks` (reused)
7. Use cases grid
8. Related categories (crawlable links)
9. FAQ (accordion + FAQPage schema)
10. `PhotographyFinalCTA` (reused)

### SEO per page

- `SEOHead` with unique title, meta description, canonical `https://vovv.ai/ai-product-photography/{slug}`, OG + Twitter card, default OG image.
- Two `JsonLd` blocks per page: `BreadcrumbList` (Home → AI Product Photography → Category) and `FAQPage`.
- Single `<h1>`, semantic `<h2>` per section, descriptive `alt` on every image, lazy-loaded below-the-fold images via existing `getOptimizedUrl` + `loading="lazy"`.
- All inter-page navigation uses `<Link to>` (renders `<a href>`) so crawlers follow.

### Content sourcing

All 10 entries use the exact SEO title, meta description, H1, hero subhead, subcategories, pain points, visual outputs, scene example labels, FAQs, and related categories from your spec. Hero + scene-example images are picked from the existing `scene-previews` bucket (same image pool used in the hero/library/category chooser) and tagged with descriptive alts following your image-SEO naming convention. Filenames stay in the bucket; alt text matches your spec.

### Notes

- No backend changes. All data is static TS.
- No new dependencies.
- Visual aesthetic is enforced by reusing the same Tailwind classes, color tokens, card radii, and section padding rhythm already defined in the `PhotographySection` components.
