Strict re-audit of `/ai-product-photography` against the 10 contra-questions. Most checks pass; below are the issues found and the targeted fixes I'll make.

## Audit results

1. **Crawlability** — Pass. All 10 cards in `PhotographyCategoryChooser` use real `<Link to=…>` → `<a href>`. No tabs/filters/JS gating.
2. **Sitemap + canonical consistency** — Pass. Slugs in `aiProductPhotographyCategories.ts`, sitemap.xml, route paths and canonicals match exactly. All `https`, no trailing slashes, no www mismatch.
3. **Schema validity** — Pass. Hub renders one BreadcrumbList, one SoftwareApplication, one FAQPage. FAQ questions are visible in the on-page accordion and match JSON-LD exactly. No duplicates on this route.
4. **Content uniqueness** — Pass. Hero marquee, VisualSystem (6 outputs with images), HowItWorks, SceneExamples (10 scenes), Comparison, UseCases (8), FAQ (7), final CTA. Not thin.
5. **Internal anchor text** — **Weak.** Cards say "Explore Fashion" instead of a descriptive, keyword-aligned phrase. Fix.
6. **Mobile UX** — **Weak.** On mobile the chooser is single-column with full descriptions = 10 tall cards = directory feel. Fix to 2-column denser layout on mobile.
7. **Image SEO** — Pass. Alts are natural and category-specific.
8. **Performance / CLS** — Pass. All chooser/scene images are lazy + async, aspect-ratio containers prevent CLS, quality-only optimization (no width crop).
9. **Footer strategy** — **Improvement worth making.** Add a small "Solutions" column with 4 strongest category links + an "All categories" link. Keeps it useful without becoming a link dump.
10. **Conversion clarity** — Pass. Primary CTA "Create your first visuals free" + secondary "Explore categories" anchor link in hero, repeated in HowItWorks and FinalCTA.

## Fixes I'll apply

### A. `src/components/seo/photography/PhotographyCategoryChooser.tsx`
- Mobile layout: change `grid-cols-1 sm:grid-cols-2` → `grid-cols-2 lg:grid-cols-3`. Tighter gaps and padding on small screens. Hide the long description on mobile (keep title + collage + CTA) so the section feels scannable instead of like a directory.
- Anchor text: render descriptive SEO anchor on desktop ("Explore AI fashion product photography"), keep short "Explore Fashion" label visually on mobile, and apply the descriptive text as `aria-label` and `title` on every card so it's the link's accessible name everywhere.
- Hide "{shotCount}+ shots" badge on mobile to reduce noise; keep on sm+.

### B. `src/components/landing/LandingFooter.tsx`
- Add a new "Solutions" column with 4 strongest category links + "All categories":
  - Fashion Photography → /ai-product-photography/fashion
  - Footwear Photography → /ai-product-photography/footwear
  - Beauty & Skincare → /ai-product-photography/beauty-skincare
  - Bags & Accessories → /ai-product-photography/bags-accessories
  - All categories → /ai-product-photography
- Keep the existing "AI Product Photography" entry inside Product so the hub still appears in two natural contexts without becoming a dump.

No other files change. No content/feature regressions.