# 5 New SEO Landing Pages

Build 5 public landing pages that feel like natural extensions of `/ai-product-photography` — same nav, footer, typography, spacing, gradients, card style, and conversion logic. Each page is configuration-driven so we keep one design system and avoid duplicate code.

## Pages & routes

| # | Route | H1 |
|---|---|---|
| 1 | `/shopify-product-photography-ai` | AI Product Photos for Shopify Stores |
| 2 | `/ai-product-photo-generator` | AI Product Photo Generator for E-commerce Brands |
| 3 | `/etsy-product-photography-ai` | AI Product Photos for Etsy Sellers |
| 4 | `/ai-product-photography-vs-photoshoot` | AI Product Photography vs Traditional Photoshoot |
| 5 | `/ai-product-photography-vs-studio` | VOVV.AI vs Product Photography Studio |

## Design approach — reuse, don't reinvent

We already have a polished section system under `src/components/seo/photography/` (Hero, VisualSystem, HowItWorks, SceneExamples, UseCases, Comparison, FAQ, FinalCTA, CategoryChooser). Rather than fork them per page, we extract a small set of **prop-driven shared sections** so all 5 pages render the homepage aesthetic with page-specific copy & visuals.

New shared section primitives (under `src/components/seo/landing/`):

- `LandingHeroSEO` — eyebrow, H1, sub, dual CTA, trust line, hero collage (reuses the gradient + glyph treatment from `PhotographyHero`).
- `LandingValueCards` — H2 + intro + responsive card grid (used for "Visual needs", "What VOVV.AI is built for", etc.).
- `LandingOneToManyShowcase` — input → outputs visual (reuses `PhotographyVisualSystem` look).
- `LandingHowItWorksSteps` — 3-step block (mirrors `PhotographyHowItWorks`).
- `LandingCategoryGrid` — compact category cards linking to the 10 hub category pages (subset configurable per page).
- `LandingComparisonTable` — two-column "Traditional vs VOVV.AI" / "Studio vs VOVV.AI" comparison (mirrors `PhotographyComparison` styling, accepts column titles + bullets).
- `LandingDecisionMatrix` — "Choose A if… / Choose B if…" two-column block (used by both vs-pages).
- `LandingFAQConfig` — wraps existing FAQ visual style, accepts Q/A array (also emits `FAQPage` JSON-LD).
- `LandingFinalCTASEO` — wraps `PhotographyFinalCTA` style with custom headline/copy/CTA.

Each page becomes a thin `pages/seo/*.tsx` file: `<LandingNav /> + sections + <LandingFooter />` plus a config object for copy.

## SEO scaffolding (every page)

- `SEOHead` with unique title/description/canonical/OG image/Twitter card.
- One H1 only.
- `JsonLd` for `BreadcrumbList` (Home → page).
- `JsonLd` for `FAQPage` (matches visible FAQs exactly).
- `SoftwareApplication` JSON-LD on pages 1, 2, 3 (reuse the shape from `AIProductPhotography.tsx`).
- Sitemap entry added to `public/sitemap.xml` for all 5 routes (priority 0.85, monthly).
- All internal links use crawlable `<a href>` (or `<Link>` from react-router which renders `<a href>`).
- Image alts: descriptive, no stuffing. Reuse `getOptimizedUrl` and `loading="lazy"` for below-fold imagery.

## Routing

Add 5 lazy routes in `src/App.tsx` (public section, alongside `/ai-product-photography`):

```text
/shopify-product-photography-ai      → ShopifyProductPhotography
/ai-product-photo-generator          → AIProductPhotoGenerator
/etsy-product-photography-ai         → EtsyProductPhotography
/ai-product-photography-vs-photoshoot → AIPhotographyVsPhotoshoot
/ai-product-photography-vs-studio     → AIPhotographyVsStudio
```

## Per-page section composition

**1. Shopify** — Hero · ValueCards (Shopify visual needs) · OneToManyShowcase · HowItWorksSteps · CategoryGrid (Fashion, Beauty, Jewelry, Footwear, Food, Home) · ValueCards (Use cases) · ComparisonTable (Traditional Shopify shoot vs VOVV.AI) · FAQ · FinalCTA.

**2. Generator** — Hero · ValueCards (More than one image) · OneToManyShowcase (before/after) · HowItWorksSteps · CategoryGrid (all 10) · ValueCards (Use cases) · ValueCards (Why VOVV.AI) · FAQ · FinalCTA.

**3. Etsy** — Hero · ValueCards (Etsy listing visuals) · OneToManyShowcase · CategoryGrid (Jewelry, Home, Fashion, Bags, Beauty, Food) · HowItWorksSteps · ValueCards (Etsy use cases) · Trust block (review-before-publish, soft tone) · FAQ · FinalCTA.

**4. vs Photoshoot** — Hero (split visual) · ComparisonTable · ValueCards (When AI is better) · ValueCards (When traditional still makes sense) · Workflow strip · ValueCards (Visual examples) · CategoryGrid · DecisionMatrix · FAQ · FinalCTA.

**5. vs Studio** — Hero (split visual) · ComparisonTable · ValueCards (What studios are great for) · ValueCards (What VOVV.AI is built for) · Workflow strip · ValueCards (Output examples) · CategoryGrid (all 10) · Cost/speed positioning block · FAQ · FinalCTA.

## Internal linking (crawlable `<a>` / `<Link to>`)

Each page footer block + inline links per the brief:

- Generator → hub, all 10 categories, Shopify page, vs-Photoshoot.
- Shopify → Generator, hub, relevant categories.
- Etsy → Generator, hub, Jewelry/Home/Fashion/Bags/Beauty.
- vs-Photoshoot → Generator, vs-Studio, hub, `/app/generate/product-images`.
- vs-Studio → Generator, vs-Photoshoot, hub, `/app/generate/product-images`.

All primary CTAs link to `/app/generate/product-images` (existing `ProtectedRoute` triggers auth flow when logged out — no change needed).

## Footer update

Update `LandingFooter.tsx`:
- **Product** column: add "AI Product Photo Generator" → `/ai-product-photo-generator`.
- **Solutions** column: add "Shopify Product Photos" → `/shopify-product-photography-ai` and "Etsy Product Photos" → `/etsy-product-photography-ai` near the top; keep the existing 10 category links but trim to the 4 highlighted ones (Fashion, Beauty, Jewelry, Food) per the brief's "don't overload" rule, and move the rest to the hub page (which already lists all 10). Mobile stays the same compact accordion.

## Sitemap

Append 5 `<url>` entries to `public/sitemap.xml` with `lastmod=2026-04-25`, `changefreq=monthly`, `priority=0.85`.

## Files

**New:**
- `src/components/seo/landing/LandingHeroSEO.tsx`
- `src/components/seo/landing/LandingValueCards.tsx`
- `src/components/seo/landing/LandingOneToManyShowcase.tsx`
- `src/components/seo/landing/LandingHowItWorksSteps.tsx`
- `src/components/seo/landing/LandingCategoryGrid.tsx`
- `src/components/seo/landing/LandingComparisonTable.tsx`
- `src/components/seo/landing/LandingDecisionMatrix.tsx`
- `src/components/seo/landing/LandingFAQConfig.tsx`
- `src/components/seo/landing/LandingFinalCTASEO.tsx`
- `src/components/seo/landing/LandingWorkflowStrip.tsx` (vs-pages)
- `src/pages/seo/ShopifyProductPhotography.tsx`
- `src/pages/seo/AIProductPhotoGenerator.tsx`
- `src/pages/seo/EtsyProductPhotography.tsx`
- `src/pages/seo/AIPhotographyVsPhotoshoot.tsx`
- `src/pages/seo/AIPhotographyVsStudio.tsx`

**Edited:**
- `src/App.tsx` — add 5 lazy routes
- `src/components/landing/LandingFooter.tsx` — refined Product/Solutions columns
- `public/sitemap.xml` — 5 new entries
- `public/version.json` — bump

## Final QA pass

After build, manually verify each page: one H1, canonical correct, FAQ JSON-LD matches DOM, all internal links are real `<a href>`, mobile spacing matches `/ai-product-photography`, hero/cards/CTAs visually consistent, no keyword stuffing in alts, lazy-loaded below-fold images.
