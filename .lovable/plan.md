

## New Google Ads Landing Page: Shopify Image Generator

Create a Shopify-focused landing page at `/features/shopify-image-generator` — same structure and vibe as the AI Models & Backgrounds page but with all content tailored to Shopify merchants.

### Content Strategy

- **SEO keywords**: "Shopify product image generator", "AI product photos for Shopify", "Shopify listing images"
- **Audience**: Shopify store owners looking to upgrade product imagery without photoshoots
- **All CTAs** → `/auth` (Try Free)

### Page Sections

1. **Hero** — Badge "Shopify Image Generator", H1 "Generate Stunning Product Images for Your Shopify Store", subtext about AI models + scenes for Shopify listings, CTA "Try Free"
2. **ModelShowcaseSection** — reused (show the diverse AI models available)
3. **EnvironmentShowcaseSection** — reused (show scene/background options)
4. **Mid CTA** — "Upgrade Every Listing. No Photoshoot Required."
5. **How It Works** — 3 steps: Upload from Shopify → Pick model & scene → Download store-ready images
6. **Benefits Grid** — 6 Shopify-specific cards: Shopify-Ready Formats, Diverse AI Models, Professional Scenes, Bulk Generation, Brand Consistency, No Photography Costs
7. **Stats Bar** — 10,000+ images, 50+ models, 30+ scenes, < 30s per image
8. **Final CTA** — "Start Generating — Free" with strong closing copy

### Files

- **Create** `src/pages/features/ShopifyImageGenerator.tsx` — new page component (follows AIModelsBackgroundsFeature pattern exactly)
- **Edit** `src/App.tsx` — add lazy import + route at `/features/shopify-image-generator`

