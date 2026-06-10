## Goal

Add 3 SEO-optimized, engaging blog posts to `src/data/blogPosts.ts` — one per category landing page — using real scene-library images from those pages so each post visually showcases what VOVV produces.

## Posts

Each follows the existing `BlogPost` schema (slug, title, metaDescription, publishDate `2026-06-10`, author `VOVV.AI Team`, readTime, category, excerpt, tags, coverImage, markdown `content`). All link back to their category page and to relevant internal posts/features, and embed 4–6 inline scene images via the `PREVIEW(imageId)` URL pattern.

### 1. Swimwear → `/blog/ai-swimwear-photography-resort-campaigns`
- **Angle**: How DTC swimwear brands ditch the Mykonos shoot for AI resort campaigns
- **Target keywords**: AI swimwear photography, swimwear product photos, resort campaign photography, swimwear lookbook AI, beach product photography
- **Hero + inline images** from new swimwear batch: Maldives It Girl, White Lotus Glow, Aegean Deck Siren, Villa Espresso Walk, Poolside Fever Dream, Cape Town Siren
- **Links**: `/ai-product-photography/swimwear`, `/features/virtual-try-on`, `/blog/automated-product-listing-images-at-scale`
- **Sections**: Resort-shoot cost reality → 8 swimwear shots every brand needs → Editorial vs UGC vs Stills → Aesthetic Color stories → ROI table → FAQs

### 2. Bags & Accessories → `/blog/ai-bag-photography-product-pages`
- **Angle**: PDP-ready bag photography — 360° angles, on-body, flat-lay, lifestyle — without a studio
- **Target keywords**: AI bag photography, handbag product photography, accessories photography AI, leather goods photography, PDP product images bags
- **Hero + inline images** from bags category (will pick from existing `bags` grid in `aiProductPhotographyBuiltForGrids.ts`)
- **Links**: `/ai-product-photography/bags-accessories`, `/features/brand-profiles`, `/blog/brand-consistency-ai-generated-visuals`
- **Sections**: Why bag photography is uniquely hard → Essential PDP angles → Lifestyle context shots → Texture & material fidelity → Seasonal campaign reuse → FAQs

### 3. Fashion → `/blog/ai-fashion-photography-ecommerce-brands`
- **Angle**: How fashion DTC brands cut campaign costs 90%+ with AI editorial, on-model, and lifestyle imagery
- **Target keywords**: AI fashion photography, fashion product images AI, on-model fashion photography, AI fashion editorial, fashion ecommerce photography
- **Hero + inline images** from fashion category (will pick from existing `fashion` grid)
- **Links**: `/ai-product-photography/fashion`, `/features/virtual-try-on`, `/blog/ai-model-photography-diverse-representation`
- **Sections**: The $50k editorial vs the $50 generation → On-model PDP → Editorial campaigns → Lifestyle/UGC → Brand consistency → FAQs

## Content quality bar

- ~900–1,200 words per post
- Engaging hook, narrative tone matching existing posts (specific dollar examples, blind-test framing, ROI table)
- Single H1 (post title rendered by template), H2/H3 hierarchy, one comparison table, FAQ block, internal links
- Inline images use `![descriptive alt with keyword](https://…/scene-previews/{imageId}.jpg)` — alt text optimized for image search
- No terminal periods in H2/H3 headings (per project core memory)

## Files touched

- `src/data/blogPosts.ts` — append 3 new `BlogPost` objects to the `blogPosts` array

No new components, routes, or backend changes — the existing `/blog` and `/blog/:slug` pages render new entries automatically. Sitemap regeneration: the existing `scripts/generate-sitemap.ts` already picks up `blogPosts`, so the next build refresh includes the new URLs.

## Verification

- `bunx tsc --noEmit` passes
- Visit `/blog` — 3 new cards appear
- Visit each new `/blog/<slug>` — content renders, images load, internal links work
