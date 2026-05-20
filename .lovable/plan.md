## Scope
Bags page only. Add `CategoryMotionShowcase` section directly after `CategoryBuiltForEveryCategory` and before `CategoryFeedShowcase`.

## Source clips
6 uploaded mp4s, all 400×720 (9:16), H.264, ~5s, 480–735 KB → ship as static assets.

## Pixel-perfect spec (mirrors `CategoryFeedShowcase` & `CategoryBuiltForEveryCategory` exactly)

### Section shell
- `<section className="py-16 lg:py-32 bg-background overflow-hidden scroll-mt-24" id="motion-showcase">`
- Container: `max-w-[1400px] mx-auto px-6 lg:px-10` (matches FeedShowcase, not 1280)

### Header (centered, matches peer rhythm)
- Wrapper: `text-center max-w-2xl mx-auto mb-12 lg:mb-16 animate-in fade-in slide-in-from-bottom-2 duration-700`
- Eyebrow: `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4` → `Motion · Bags in movement`
- H2: `text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight` → `Your bag, brought to life`
- Subtitle: `mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto` → `Turn one product photo into scroll-stopping motion for ads, reels and PDP loops` (no terminal period, per core rule)

### Video grid — responsive
- Mobile (`<sm`, <640px): **2 cols × 2 rows = 4 videos**. Tiles 5 & 6 receive `hidden sm:block`.
- `sm` (≥640px): **3 cols × 2 rows = 6 videos**
- `lg` (≥1024px): **6 cols × 1 row = 6 videos** (cinematic strip)
- Grid: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5`

### Tile
- Wrapper `group relative aspect-[9/16] rounded-2xl overflow-hidden ring-1 ring-foreground/[0.06] bg-muted/30 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.22)] transition-transform duration-700 hover:scale-[1.015] motion-reduce:transition-none motion-reduce:hover:scale-100`
- Entrance: tiles stagger via inline `style={{ animationDelay: '${i * 60}ms' }}` on `animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-backwards`
- `<video>` attrs: `autoPlay muted loop playsInline preload={i === 0 ? 'auto' : 'metadata'}` + `disableRemotePlayback` + `aria-label="AI-generated bag motion clip"` + `className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"`
- Subtle top-right index chip on first tile only (matches FeedShowcase's "One upload" tag tone): `New` chip, `right-3 top-3 rounded-full bg-foreground/85 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-background` — keeps the section from feeling like a bare gallery while staying restrained.

### Performance + a11y guardrails
- `IntersectionObserver` (rootMargin `200px`): play when intersecting, pause when not — avoids 6 simultaneous decodes on mobile.
- Respect `prefers-reduced-motion`: do not autoplay, render first frame via `<video>` paused. Detect via `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- Save Data API: if `navigator.connection?.saveData`, do not autoplay (paused poster only).
- All videos `muted` + `playsInline` (iOS autoplay requirement).

### CTA row (under grid, matches FeedShowcase markup token-for-token)
- Wrapper: `mt-10 lg:mt-14 flex flex-col sm:flex-row gap-4 justify-center`
- Primary → `/app/generate/product-images`: `inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25` → label `Try it free` + `ArrowRight`
- Secondary → `getVisualLibraryHrefForCategory(page.slug)`: same height/padding, `border border-border text-foreground hover:bg-secondary` → label `Browse the visual library`

## Files

1. Copy 6 mp4s to `src/assets/seo/bags-motion-1.mp4` … `bags-motion-6.mp4` (keep upload order).
2. Create `src/components/seo/photography/category/CategoryMotionShowcase.tsx`:
   - `if (page.slug !== 'bags') return null;` gate
   - ES module imports for the 6 mp4s into a typed array `const clips = [v1, v2, …, v6]`
   - `useRef<HTMLVideoElement[]>` + single `IntersectionObserver` registering all tiles
   - One `useEffect` to honor `prefers-reduced-motion` + `saveData`
3. Edit `src/pages/seo/AIProductPhotographyCategory.tsx`:
   - Import `CategoryMotionShowcase`
   - Mount between `<CategoryBuiltForEveryCategory page={page} />` and `<CategoryFeedShowcase page={page} />`

## QA checklist (post-build)
- 320, 375, 414, 640, 768, 1024, 1280, 1440 viewports: tile aspect locked 9:16, no horizontal scroll.
- Mobile shows 4 tiles, sm shows 6 (3×2), lg shows 6 in a single row.
- Tiles play smoothly when section enters viewport; pause on scroll-away.
- Section vertical rhythm matches FeedShowcase / BuiltForEvery (py-16 lg:py-32).
- CTA buttons identical height/radius/shadow to FeedShowcase.

## Out of scope
- Other category pages
- No DB, hooks, admin overrides, video transcoding pipeline
- No new design tokens, no shared components
- No audio
