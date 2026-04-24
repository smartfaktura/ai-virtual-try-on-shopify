## New landing section — `OneImageToVisualLibrarySection`

A scroll-driven "1 product → 16 outputs" grand reveal placed right after the hero. Visually proves the core promise in a single, premium scroll moment using the existing design system, no new dependencies, no new typography.

### ⚠️ Important honesty up front: redundancy with the hero

The current `HeroSection` already shows a 1 → 8 product transformation (Crop Top / Ring / Headphones carousel). Dropping another "1 → many" section directly after it risks feeling repetitive.

**My recommendation: place it AFTER `ProductCategoryShowcase`, not directly after the hero.** Flow becomes:

```text
Hero (1 → 8 carousel, fast intro)
  ↓
ProductCategoryShowcase (proves we work for many categories)
  ↓
🆕 OneImageToVisualLibrarySection (the "library reveal" — slows down, expands to 16, lands the value)
  ↓
StudioTeamSection → HowItWorks → ...
```

This way the new section is the **emotional payoff** ("look how much you actually get") rather than a duplicate of the hero. If you'd rather keep your spec literal and put it right after the hero, I'll do that — just say.

### Insertion (literal)

`src/pages/Landing.tsx` line 59 area — add one `<Suspense>` wrapper. One-line change.

### Component

`src/components/landing/OneImageToVisualLibrarySection.tsx` — single file, self-contained.

```tsx
interface Props {
  eyebrow?: string;       // default 'One image. Many outcomes.'
  title?: string;         // default 'Turn one product photo into a full visual library'
  description?: string;   // default copy from your spec
  ctaLabel?: string;      // default 'Start creating visuals'
  ctaHref?: string;       // default '/auth?mode=signup'
  microcopy?: string;     // default 'No studio. No models. No complex setup.'
  sourceImage?: string;   // default crop-top hero asset
  outputImages?: string[];// default 16 curated landing-asset URLs
  categoryLabel?: string; // future: 'fragrance' | 'sneaker' to swap copy/assets
}
```

Props-first so the same component powers `/category/fragrance`, `/category/sneakers`, etc. later.

### Content (matches spec verbatim)

- **Eyebrow** — `One image. Many outcomes.` (uses existing eyebrow style: `text-xs uppercase tracking-[0.2em] text-muted-foreground`)
- **Heading** — `Turn one product photo into a full visual library` (uses existing landing h2 style — `text-3xl md:text-5xl font-semibold tracking-tight`)
- **Paragraph** — your provided copy verbatim, `text-base md:text-lg text-muted-foreground max-w-2xl mx-auto`
- **Primary CTA** — existing `<Button size="lg">` with `ArrowRight` icon, identical to hero CTA
- **Microcopy** — `text-xs text-muted-foreground` below CTA

### Visual layout

```text
┌──────────────────────────────────────────────────────┐
│         One image. Many outcomes. (eyebrow)          │
│                                                      │
│   Turn one product photo into a full visual library  │
│                                                      │
│            short paragraph text here                 │
│                                                      │
│              [ Start creating visuals → ]            │
│              No studio. No models. No setup.         │
│                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                      │
│        ╔══════════════════════════════════╗          │
│        ║                                  ║          │
│        ║  ┌──┬──┬──┬──┐                  ║          │
│        ║  ├──┼──┼──┼──┤   ← 4×4 grid     ║          │
│        ║  ├──┼──┼──┼──┤   reveals as     ║          │
│        ║  └──┴──┴──┴──┘   you scroll     ║          │
│        ║                                  ║          │
│        ╚══════════════════════════════════╝          │
└──────────────────────────────────────────────────────┘
```

### Animation — pure CSS + IntersectionObserver (no libraries)

**No Framer Motion is installed and the project rule is don't add libraries.** I'll use the same pattern already used across the landing — `IntersectionObserver` flips a `revealed` boolean; CSS handles the rest with staggered `transition-delay`.

**Choreography (one-shot, not scroll-scrubbed):**

```text
Step 0 (before viewport):
  - Only the source image is visible, large, centered, scale-95, opacity-0 → fades in to scale-100

Step 1 (intersection ratio > 0.25, ~200ms after section enters):
  - Source image stays as cell (0,0) of an invisible 4×4 grid
  - It animates from "centered & oversized" to "top-left grid cell" over 700ms (transform + width)

Step 2 (200ms after Step 1):
  - The 15 output cards fade + scale-in with stagger
  - Stagger order: spiral outward from the source (cells 0,1 → 1,0 → 1,1 → 0,2 → 2,0 → ...) so it feels like the source is "growing" the library
  - Each card: opacity 0 → 1, scale 0.92 → 1, transition 500ms ease-out
  - Stagger delay: 40ms × cell-index → total reveal ~750ms
  - Source cell gets a subtle ring/border (`ring-1 ring-primary/30`) for ~1.5s then fades to match the rest, marking it as "the original"

Step 3 (after grid lands):
  - Optional: micro caption appears under the grid: `1 photo · 16 outputs · ~2 minutes`
```

**Performance guards:**
- Single `IntersectionObserver` with `threshold: 0.25`, fires once, then disconnects (no scroll-thrashing)
- Animations use `transform` and `opacity` only (GPU-composited, no layout)
- `will-change: transform, opacity` set only during the animation window, removed after
- `prefers-reduced-motion: reduce` → skip the animation entirely, render the final 4×4 grid statically
- Each card uses the existing `<ShimmerImage>` component with `loading="lazy"` and the existing `getOptimizedUrl(url, { quality: 55 })` pattern from sibling sections
- Fixed aspect ratio `aspect-[4/5]` on every cell prevents layout shift
- Source image uses higher quality (`{ quality: 70 }`), outputs use lower (`{ quality: 50 }`)

### Card style (reuse existing tokens)

Same as `FreestyleShowcaseSection` result cards:
```text
rounded-2xl overflow-hidden bg-muted/30 border border-border/40
shadow-[0_1px_2px_rgba(0,0,0,0.04)]
```

### Labels — skip them

Your spec allowed skipping labels if they make it crowded. **I recommend skipping for the 4×4 grid** — 16 small cells with 16 labels is visually busy and would steal attention from the "many outputs" gestalt. The output type variety reads visually. We can add hover tooltips later if needed.

### Responsive

| Breakpoint | Grid | Source image start |
|---|---|---|
| Desktop (≥1024px) | 4 × 4 (16 cells) | centered, ~360px wide → animates to top-left cell |
| Tablet (768–1023px) | 4 × 4 (16 cells, smaller) | centered, ~280px → top-left |
| Mobile (<768px) | **2 × 8 (16 cells)** | centered, full-width-minus-padding → top-left of 2-col grid |

Mobile uses the same staggered fade-in but **skips the "source shrinks into grid" transform** (it would feel cramped). Source just fades down to its final cell while outputs fade in around it. Same emotional beat, simpler motion.

### Image assets (reuse what's already there)

All 16 outputs reuse hero assets already loaded by `HeroSection.tsx`:

```text
Source (cell 0,0): hero/hero-product-croptop.jpg

Outputs (cells 0,1 through 3,3) — mix of all 3 hero categories for output-type variety:
  Lookbook, Golden Hour, Café Lifestyle, Studio Lounge, Basketball, Urban Edge,
  Pilates, Studio Portrait,  ← from croptop set (8)
  Linen Close-Up, Hand Detail, Stone, Floating Studio, ← from ring set (4)
  Desert, Elevator UGC, Cozy Knit, Home Lifestyle ← from headphones set (4)
```

Browser cache hits — these are already preloaded by the hero, so the new grid renders nearly instantly. **Zero new assets uploaded.** When you have real "16 outputs from 1 source" assets later, swap the array — no other code changes.

### Section spacing

Match siblings: `py-24 md:py-32`, `max-w-7xl mx-auto px-4 md:px-6`. Identical to `FreestyleShowcaseSection`.

### Files touched

```text
NEW   src/components/landing/OneImageToVisualLibrarySection.tsx   ~180 lines
EDIT  src/pages/Landing.tsx   (+2 lines: lazy import + Suspense entry)
```

That's it. No CSS file changes, no Tailwind config changes, no new dependencies, no new design tokens.

### Acceptance check

A visitor scrolling through `/` will:
1. See the eyebrow + heading + CTA in the existing landing typography (no foreign element).
2. Watch one product image expand into 16 outputs in a single smooth ~1.5s reveal.
3. Land on a clean 4×4 grid that stays put — no looping, no jitter, no parallax.
4. Read the three claims (catalog, lifestyle, social, ad, UGC, campaign) as a visual gestalt without label clutter.
5. Have a clear primary CTA in the same button style as the rest of the page.

Mobile gets the same beat in 2×8 with reduced motion. Reduced-motion users get the static final grid.

### Open question (one)

Do you want me to insert it **right after the hero (your literal spec)**, or **after `ProductCategoryShowcase` (my recommendation, less redundant with the hero carousel)**? I'll go with your call.

Approve and I'll build it in one pass.
