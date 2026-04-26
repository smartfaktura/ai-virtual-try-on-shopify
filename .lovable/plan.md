## Audit summary

All 5 pages pass the SEO foundation check: unique H1, title, meta description, canonical, OG/Twitter tags (via `SEOHead`), `BreadcrumbList` and `FAQPage` JSON-LD, and sitemap entries. Each page targets distinct search intent with unique copy, value cards, FAQs, and CTAs. Design matches the existing VOVV.AI premium aesthetic on desktop and mobile. All internal links are real `<a href>` (react-router `<Link>`), no 404s, slugs/canonicals/sitemap aligned.

## Targeted fixes to apply

**1. Add `Article` JSON-LD to the two comparison pages**
Comparison pages currently only ship `BreadcrumbList` + `FAQPage`. Adding a lightweight `Article` schema (with `headline`, `author: { @type: Organization, name: VOVV.AI }`, `about`) helps Google classify them as comparison/topical content rather than thin landing pages.

**2. Strengthen internal cross-linking inside the cluster**
- `/ai-product-photo-generator`: add a contextual link block (or update an existing CTA) pointing to Shopify and Etsy pages so the generator hub feeds traffic to vertical pages.
- `/ai-product-photography-vs-photoshoot`: change secondary CTA from `/ai-product-photography` to `/ai-product-photography-vs-studio` (sister comparison) and add a small "See also" link to the generator.
- `/ai-product-photography-vs-studio`: add a "See also" link to `/ai-product-photo-generator` near the final CTA.
- `/shopify-product-photography-ai` and `/etsy-product-photography-ai`: add a small text link to `/ai-product-photography-vs-photoshoot` in the FAQ intro or final CTA secondary slot, so commercial pages link to the comparison pages and vice versa.

**3. Tighten the Generator page final CTA secondary**
Currently goes to `/ai-product-photo-generator` (the same page) on Etsy — confirmed harmless but on Generator final CTA the secondary should go to a vertical (e.g., Shopify) for conversion lift.

**4. No design or copy regressions**
No layout, typography, spacing, or component-level changes. Only schema + 4–6 link/href adjustments + 2 CTA `to` value tweaks.

### Files to edit
- `src/pages/seo/AIPhotographyVsPhotoshoot.tsx` — add `articleJsonLd`, update secondary CTA target, add see-also link.
- `src/pages/seo/AIPhotographyVsStudio.tsx` — add `articleJsonLd`, add see-also link to generator.
- `src/pages/seo/AIProductPhotoGenerator.tsx` — adjust final CTA secondary, add inline links to Shopify/Etsy.
- `src/pages/seo/ShopifyProductPhotography.tsx` — small cross-link to comparison page.
- `src/pages/seo/EtsyProductPhotography.tsx` — small cross-link to comparison page.
- `public/version.json` — bump.

No changes to shared components, footer, sitemap, routes, or design system.
