

# SEO Landing Page: AI Product Photography for Ecommerce

Build a new production-grade SEO landing page at `/ai-product-photography-for-ecommerce` that dynamically pulls visuals from the discover_presets table.

---

## Architecture

Two new files:
1. **`src/pages/seo/AIProductPhotographyEcommerce.tsx`** — the full page component
2. **Route registration in `src/App.tsx`** — add lazy import + public route

The page uses existing infrastructure: `PageLayout`, `SEOHead`, `JsonLd`, `ShimmerImage`, `useDiscoverPresets`, `getOptimizedUrl`, design system components (Card, Tabs, Accordion, Button, Badge).

---

## Route

```
/ai-product-photography-for-ecommerce
```

Add to `App.tsx` as a public route alongside existing feature pages.

---

## Page Sections (in order)

### 1. Hero
- H1: "AI Product Photography for Ecommerce"
- Subheadline with primary keyword in first paragraph
- Primary CTA: "Start Free" → `/auth`
- Secondary CTA: "See Real Examples" → `/discover`
- Trust badges: "No credit card required", "20 free credits", "Start in seconds"
- Visual: 1-input → 6-output grid using discover presets (filtered by categories: lifestyle, commercial, ads, photography), showing white bg, PDP, lifestyle, ad, email, marketplace outputs

### 2. Quick Proof Bar
- 4-column icon/text strip: "One photo → multiple visuals", "Stores, ads, email, marketplaces", "Faster than photoshoots", "More scalable than editing"

### 3. Outcome Tabs (interactive)
- 6 tabs: White Background, PDP, Lifestyle, Ads, Email, Marketplace
- Each tab dynamically pulls 1 featured discover preset image by mapping to discover_categories
- Tab content: image + use-case title + short description + where it's used
- Category mapping: white bg → "commercial", PDP → "photography", Lifestyle → "lifestyle", Ads → "ads", Email → "campaign", Marketplace → "commercial"

### 4. "Why Ecommerce Brands Use VOVV.ai"
- 4 cards with icons (reuse pattern from ShopifyImageGenerator benefits grid)
- Topics: More content from one photo, Faster than photoshoots, Scale without bottlenecks, Visual consistency across channels

### 5. Comparison Section
- Side-by-side: Traditional Photography vs VOVV.ai
- Clean two-column layout with check/x icons
- Premium card styling

### 6. "Built for Shopify Brands" Section
- Headline: "Built for Shopify Brands and Modern Ecommerce Teams"
- Bullet points for use cases
- Internal link to `/features/shopify-image-generator`
- CTA: "Start Creating"

### 7. Discovery Visual Showcase
- Headline: "Explore Real Ecommerce Visual Styles"
- Premium grid of 8-12 discover preset images, filtered by product-relevant categories (beauty, jewelry, fashion, home, food, accessories)
- Each image with title overlay and category badge
- CTA: "Explore Discovery" → `/discover`

### 8. How It Works
- 4 steps: Upload → Choose direction → Generate → Export
- Icon + number + title + description pattern (matching existing HowItWorks style)

### 9. Use Cases Grid
- Headline: "Built for Ecommerce Workflows"
- 8 cards: PDP, Marketplace, Paid social ads, Email campaigns, Organic social, Product launches, Seasonal campaigns, Creative testing

### 10. SEO Content Block
- H2: "What Is AI Product Photography for Ecommerce?"
- Rich paragraph with natural keyword usage
- H3: "Why Ecommerce Brands Need More Than Basic Product Cutouts"
- Second paragraph explaining channel-specific needs

### 11. FAQ Section
- 8 FAQs as specified in the brief
- FAQ schema via JsonLd (reuse existing pattern from LandingFAQ)

### 12. Final CTA
- Headline: "Create Ecommerce-Ready Product Images from One Photo"
- Subheadline, primary + secondary CTAs
- Trust reinforcement

---

## SEO Implementation

- `SEOHead` with optimized title, description, canonical (`${SITE_URL}/ai-product-photography-for-ecommerce`)
- `JsonLd` for: FAQPage schema, WebPage schema, Organization schema
- Semantic heading hierarchy: single H1, logical H2/H3
- Descriptive alt text on all images with natural keyword variants
- Internal links to: `/discover`, `/features/shopify-image-generator`, `/pricing`, `/auth`

## Discovery Integration

- Uses `useDiscoverPresets()` hook to fetch all presets
- Filters by `discover_categories` array field to populate tabs and showcase grid
- Falls back gracefully if categories have fewer items (shows what's available)
- Images rendered via `ShimmerImage` + `getOptimizedUrl` for CDN optimization and lazy loading

## Performance

- Lazy-loaded route via `React.lazy` in App.tsx
- Below-fold images use `loading="lazy"`
- Hero images use `fetchPriority="high"`
- All images through Supabase CDN optimization pipeline

## Scalability for Future Pages

- Page data (hero copy, tab config, FAQ entries, metadata) defined as a config object at the top of the file
- Easy to duplicate and swap config for variant pages (e.g., "AI Skincare Product Photography")

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/seo/AIProductPhotographyEcommerce.tsx` | Create — full page |
| `src/App.tsx` | Add lazy import + route |

## Estimated Size

~600-700 lines for the page component. All sections use existing UI primitives — no new shared components needed.

