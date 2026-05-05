## Brite Blood Orange Showcase Page

Create a private (noindex) showcase page at `/showcase/brite` displaying 36 AI-generated product visuals for the Brite Blood Orange Energy Drink, styled to match the homepage aesthetic.

### Data

- **36 images** from `generation_jobs` (product_name = "Brite Blood Orange Energy Drink")
- **Total generation time**: ~73 seconds for all 36 images
- **Quality**: All high quality, 4:5 ratio
- **Scenes used**: 18 unique scenes (Sport Flash Soda Energy, Ice-Crushed Cold Product Shot, Dynamic Splash Product, etc.)
- **Models used**: Freya, Zara, and product-only shots
- All image URLs are public from `workflow-previews` bucket

### Page Structure

1. **Nav**: Reuse `LandingNav`
2. **Hero section**: Dark bg matching homepage (`#1a1a2e`), headline "36 Campaign-Ready Visuals. One Product Photo. 73 Seconds.", subtitle explaining VOVV.AI generated these from a single product upload
3. **Stats strip**: 3 stats — "36 Visuals", "73 Seconds", "18 Unique Scenes" in a clean row
4. **Gallery section**: Masonry grid of all 36 images with lazy loading (`loading="lazy"`), optimized via `getOptimizedUrl` (quality-only, no width). Each image shows scene name on hover
5. **CTA section**: Reuse `HomeFinalCTA` component
6. **Footer**: Reuse `LandingFooter`

### Technical Details

**New files:**
- `src/pages/showcase/BriteShowcase.tsx` — Page component with hardcoded image data (no DB query needed since URLs are public and static)

**Modified files:**
- `src/App.tsx` — Add route: `<Route path="/showcase/brite" element={<BriteShowcase />} />`

**SEO:** `<SEOHead noindex={true}>` to prevent indexing. No sitemap entry.

**Image optimization:** All images use `getOptimizedUrl(url, { quality: 50 })` for fast loading. Native `loading="lazy"` on all images below the fold.

**No robots.txt changes needed** — `noindex` meta tag is sufficient.
