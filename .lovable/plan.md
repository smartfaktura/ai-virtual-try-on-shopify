## Goal
Shorten every CTA button label across the SEO hub pages so both buttons fit nicely (max 3 words), while staying meaningful and on-brand. No layout, routing, tracking, or component logic changes.

## Final CTA vocabulary

**Primary** = the action (go generate). **Secondary** = the lateral move (explore / compare / examples).

### Main hub: `/ai-product-photography`
- `PhotographyHero.tsx`
  - Primary: `Create your first visuals free` → **`Try it free`**
  - Secondary: `Explore categories` → **`See examples`**
- `PhotographyHowItWorks.tsx`
  - CTA: `Create your first visuals free` → **`Try it free`**
- `PhotographyFinalCTA.tsx`
  - Primary: `Create your first visuals free` → **`Try it free`**
  - Secondary: `Explore categories` → **`See categories`**

### Category pages: `/ai-product-photography/[slug]`
- `category/CategoryHero.tsx`
  - Primary: `Create your first visuals free` → **`Try it free`**
  - Secondary: `See examples` → **`See examples`** (kept)
- `category/CategoryBuiltForEveryCategory.tsx`
  - CTA: `Create your first visuals free` → **`Try it free`**

### Shopify hub: `/shopify-product-photography`
- Hero
  - Primary: `Create your first Shopify visuals free` → **`Try it free`**
  - Secondary: `Explore AI product photography` → **`See examples`**
- Final CTA
  - Primary: `Create your first Shopify visuals free` → **`Try it free`**
  - Secondary: `Try the AI product photo generator` → **`Open generator`**

### Etsy hub: `/etsy-product-photography`
- Hero
  - Primary: `Create Etsy product visuals free` → **`Try it free`**
  - Secondary: `Explore AI product photography` → **`See examples`**
- Final CTA
  - Primary: `Create Etsy product visuals free` → **`Try it free`**
  - Secondary: `Try the AI product photo generator` → **`Open generator`**

### Generator hub: `/ai-product-photo-generator`
- Hero
  - Primary: `Generate product photos free` → **`Generate free`**
  - Secondary: `Explore AI product photography` → **`See examples`**
- Final CTA
  - Primary: `Generate product photos free` → **`Generate free`**
  - Secondary: `Compare AI vs photoshoot` → **`vs Photoshoot`**

### Comparison hub: `/ai-product-photography-vs-studio`
- Hero
  - Primary: `Create visuals with VOVV.AI` → **`Try VOVV.AI free`** (3 words)
  - Secondary: `Compare AI vs photoshoot` → **`vs Photoshoot`**
- Final CTA
  - Primary: `Create visuals with VOVV.AI` → **`Try VOVV.AI free`**
  - Secondary: `Try the AI product photo generator` → **`Open generator`**

### Comparison hub: `/ai-product-photography-vs-photoshoot`
- Hero
  - Primary: `Try AI product photography free` → **`Try VOVV.AI free`**
  - Secondary: `Explore AI product photography` → **`See examples`**
- Final CTA
  - Primary: `Try AI product photography free` → **`Try VOVV.AI free`**
  - Secondary: `Compare VOVV.AI vs studio` → **`vs Studio`**

## Reasoning (why this set)
- **`Try it free`** beats `Start free` — it specifies a low-commitment action and keeps "free" as the sales hook. Used on all hubs that aren't the comparison/generator pages.
- **`Generate free`** stays only on the generator page — matches the page intent + search term.
- **`Try VOVV.AI free`** on comparison pages — the brand needs to be visible against "Studio"/"Photoshoot" framing.
- **`See examples`** beats `Explore categories` / `Explore hub` — concrete, scannable, no jargon.
- **`See categories`** kept on the main hub final CTA only, because that page actually has a `#categories` anchor.
- **`Open generator`** beats `Try the AI product photo generator` — short, clear it leads to a tool.
- **`vs Studio`** / **`vs Photoshoot`** — uses each page's own SEO term, instantly recognizable, ultra-short.

## Files to edit
- `src/components/seo/photography/PhotographyHero.tsx`
- `src/components/seo/photography/PhotographyHowItWorks.tsx`
- `src/components/seo/photography/PhotographyFinalCTA.tsx`
- `src/components/seo/photography/category/CategoryHero.tsx`
- `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx`
- `src/pages/seo/ShopifyProductPhotography.tsx`
- `src/pages/seo/EtsyProductPhotography.tsx`
- `src/pages/seo/AIProductPhotoGenerator.tsx`
- `src/pages/seo/AIPhotographyVsStudio.tsx`
- `src/pages/seo/AIPhotographyVsPhotoshoot.tsx`
- `public/version.json` (patch bump)

Out of scope: routes, `data-cta` tracking attributes, `LandingHeroSEO` / `LandingFinalCTASEO` component internals (only consumer labels change).
