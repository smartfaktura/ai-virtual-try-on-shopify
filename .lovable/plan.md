## New SEO Hub Page: `/ai-product-photography`

Build the parent SEO hub page for "AI Product Photography" using the existing VOVV.AI `/home` aesthetic (LandingNav, `bg-[#FAFAF8]`, premium serif-tight headlines, rounded pill CTAs, soft cards with `border-[#f0efed]`, `[#1a1a2e]` headings, muted eyebrow labels). Page is fully crawlable (real `<a href>` links), single H1, schema-rich.

### Files

**New files**
- `src/pages/seo/AIProductPhotography.tsx` — page component, composes existing home shell pieces + new section components.
- `src/components/seo/photography/PhotographyHero.tsx`
- `src/components/seo/photography/PhotographyCategoryChooser.tsx`
- `src/components/seo/photography/PhotographyVisualSystem.tsx`
- `src/components/seo/photography/PhotographyHowItWorks.tsx`
- `src/components/seo/photography/PhotographySceneExamples.tsx`
- `src/components/seo/photography/PhotographyUseCases.tsx`
- `src/components/seo/photography/PhotographyComparison.tsx`
- `src/components/seo/photography/PhotographyFAQ.tsx` (with FAQPage JSON-LD)
- `src/components/seo/photography/PhotographyFinalCTA.tsx`
- `src/data/aiProductPhotographyCategories.ts` — the 10-category data array (name, slug, url, description, subcategories, previewImage, alt).

**Edited files**
- `src/App.tsx` — add lazy import + route `/ai-product-photography`.
- `public/sitemap.xml` — add the hub URL (priority 0.9).

### Route & metadata

- Route: `/ai-product-photography` (public, lazy-loaded).
- `SEOHead`:
  - title: `AI Product Photography Generator for E-commerce Brands | VOVV.AI`
  - description: `Upload one product photo and create product page images, lifestyle visuals, ads, social content, and campaign-ready product photography with AI.`
  - canonical: `${SITE_URL}/ai-product-photography`
  - ogImage: `DEFAULT_OG_IMAGE`
- `JsonLd` blocks (3 separate `<JsonLd>` instances):
  1. **BreadcrumbList**: Home → AI Product Photography
  2. **FAQPage** with the 7 Q/A
  3. **WebPage / SoftwareApplication** (matches the pattern in `Home.tsx`)

### Layout (in order)

1. `LandingNav` (reused)
2. `PhotographyHero` — H1 only, subhead, primary CTA `/app/generate/product-images` + secondary anchor `#categories` (smooth scroll), trust line, reuses the marquee/grid visual idiom from `HomeHero` (two reduced rows of category preview tiles labelled Product page / Lifestyle / Ad creative / Campaign / Detail shot / Banner using existing Supabase `scene-previews` URLs from `HomeTransformStrip`).
3. `PhotographyCategoryChooser` (anchor `#categories`) — section h2. Renders 10 cards from `aiProductPhotographyCategories.ts` in a `md:grid-cols-2 lg:grid-cols-3` premium grid. Each card is a real `<Link to={category.url}>` (anchor) wrapping image + name + description + subcategory chips + "Explore {name} →" CTA. Uses `[#f0efed]` border, `rounded-3xl`, `shadow-sm`, hover lift, `aspect-[4/3]` image with optimized URL via `getOptimizedUrl`. Descriptive alt text per spec. No JS-only filters.
4. `PhotographyVisualSystem` — h2 "One product photo. A full visual system." 8 short cards (Product page images, Lifestyle visuals, Social media content, Paid ad creatives, Campaign visuals, Detail shots, Website banners, Product launch assets). Reuses `HomeCreateCards` styling.
5. `PhotographyHowItWorks` — h2 "Create AI product photos in minutes" + 3-step layout mirroring `HomeHowItWorks` (numbered cards, ArrowRight separator).
6. `PhotographySceneExamples` — h2 "Explore hundreds of AI product photography scenes" + masonry-ish grid (10 examples, one per category, mapped to existing scene-preview Supabase URLs already used in `HomeTransformStrip`). Each tile shows image + label + category chip. Bottom CTA scrolls to `#categories`.
7. `PhotographyUseCases` — h2 "Built for the visuals e-commerce brands need every week" + 8 compact cards with lucide icons (ShoppingBag, Megaphone, Instagram, Mail, Calendar, Rocket, LayoutGrid, Sparkles).
8. `PhotographyComparison` — h2 "Create product visuals without planning a full photoshoot" + 2-column comparison (Traditional photoshoot vs VOVV.AI) with X/Check icons. Premium muted styling.
9. `PhotographyFAQ` — h2 "AI product photography FAQ" + Radix Accordion (same pattern as `LandingFAQ`) for the 7 questions; content stays in DOM via Accordion (crawlable).
10. `PhotographyFinalCTA` — h2 "Turn one product photo into your next visual campaign" + primary CTA `/app/generate/product-images` + secondary anchor `#categories`.
11. `LandingFooter` (reused)

### Data: 10 categories

Use the exact data from the spec. Each entry also gets `previewImage` (a Supabase scene-preview URL already proven to load on `/home`) and `alt` (from the alt-text spec). Cards link to future routes (`/ai-product-photography/{slug}`) — these will 404 today but are crawlable; that's fine for SEO and matches the spec ("Later, we will create category pages").

### Behavior details

- Single H1 (Hero only). Every other section uses `<h2>`.
- All category links: real `<Link to>` from `react-router-dom` rendering `<a href>`.
- "Explore categories" buttons use `<a href="#categories">` so smooth-scroll works without JS handlers.
- `bg-[#FAFAF8]` page background, alternating sections use `bg-background` / `bg-[#f5f5f3]` like home + landing FAQ.
- Lazy-load below-the-fold images via `loading="lazy"` + `getOptimizedUrl({ quality: 60 })`.
- Sitemap entry added with `priority=0.9`, `changefreq=monthly`.

### Out of scope

- The 10 child category pages (will be a follow-up).
- No new design tokens; reuse existing brand colors and components only.