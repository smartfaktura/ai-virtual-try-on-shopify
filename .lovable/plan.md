

## New Google Ads Landing Page: AI Models & Backgrounds

Create a dedicated, conversion-optimized landing page at `/features/ai-models-backgrounds` for Google Ads traffic. Follows the same pattern as existing feature pages (PageLayout, SEOHead, CTA buttons → `/auth`).

### Page Structure

1. **Hero** — Badge "AI Models & Backgrounds", headline "Add Models and Scenes with AI", subtext about creating premium brand visuals without photoshoots, primary CTA "Get Started Free"

2. **Visual Showcase** — Two-column grid showing AI Models (reuse model images from `ModelShowcaseSection`) and Backgrounds/Scenes (reuse scene images from `EnvironmentShowcaseSection`). Small image grid or marquee strip for each, with counts ("40+ AI Models", "30+ Scenes")

3. **How It Works** — 3-step flow: Upload product → Choose model & scene → Get brand-ready visuals

4. **Benefits Grid** — 6 cards covering: Diverse Model Library, Scene Variety, No Photoshoots Needed, Brand Consistency, Any Product Category, All Aspect Ratios

5. **Social Proof / Stats Bar** — Quick stats like "10,000+ images generated", "40+ models", "30+ scenes"

6. **Mid-page CTA** — Secondary conversion section

7. **Final CTA** — Strong closing CTA with "Start Creating — Free" button

### Files to Create/Modify

- **`src/pages/features/AIModelsBackgroundsFeature.tsx`** — New page component following VirtualTryOnFeature pattern (PageLayout, SEOHead, sections with CTAs)
- **`src/App.tsx`** — Add lazy import and route at `/features/ai-models-backgrounds` (public, NOT in `/app/*`)

### Notes
- Page will NOT be added to the nav or sitemap — Google Ads linking only
- All CTAs navigate to `/auth` for signup
- SEO meta with noindex since it's an ads-only page (or indexed — your call, but ads pages typically benefit from indexing)
- Reuses existing asset URLs from `getLandingAssetUrl` for model/scene images

