

## New Google Ads Landing Page: Try VOVV AI Free

Create a general-purpose "Try VOVV AI Free" landing page at `/try` — the broadest conversion page for Google Ads, combining the best visual assets from across the site with Discover gallery examples.

### Route
`/try` — short, clean, perfect for ad URLs

### Page Sections

1. **Hero** — Badge "Try Free", H1 "Create Stunning Product Visuals with AI", subtext about uploading one photo and getting brand-ready visuals. Primary CTA "Try VOVV AI Free". Trust badges (No credit card, 20 free credits, Cancel anytime) reused from HeroSection pattern.

2. **Results Gallery** — Grid of real Discover-feed images fetched from the database (public discover_presets table). Show 6-8 images in a masonry/grid layout with shimmer loading. This is the "See what others are creating" social proof.

3. **Before → After Showcase** — Reuse `BeforeAfterGallery` component showing product-to-output transformations.

4. **How It Works** — 3 steps: Upload → Customize → Download. Clean card layout.

5. **Visual Capabilities Strip** — Horizontal showcase: AI Models (reuse `ModelShowcaseSection`), Scenes (reuse `EnvironmentShowcaseSection`).

6. **Use Cases Grid** — 4 cards: E-commerce Listings, Social Media Ads, Brand Campaigns, Lifestyle Content — each with a relevant icon and short copy.

7. **Stats Bar** — 10,000+ images, 50+ models, 30+ scenes, < 30s per image.

8. **Final CTA** — "Start Creating for Free" with strong closing copy and CTA button.

### Files

- **Create** `src/pages/TryFree.tsx` — new page with all sections, fetches discover images from the database
- **Edit** `src/App.tsx` — add lazy import + public route at `/try`

### Technical Details

- Discover images: query `discover_presets` table (same as PublicDiscover) limited to 8 featured/recent items with `is_public = true`
- All CTAs → `/auth`
- SEO: Full meta tags, canonical at `https://vovv.ai/try`
- Reuses: `PageLayout`, `SEOHead`, `BeforeAfterGallery`, `ModelShowcaseSection`, `EnvironmentShowcaseSection`, `ShimmerImage`, `getLandingAssetUrl`

