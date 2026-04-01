

# Redesign SEO Landing Page — VOVV.ai Branded, 2026 Design

## Image Fix

The root cause: `ShimmerImage` without `aspectRatio` renders images at natural dimensions inside an `h-full` wrapper, causing tall images to dominate the viewport. The proven pattern from HeroSection uses `aspectRatio="3/4"` + `object-cover object-top` on `ShimmerImage` for controlled grids.

**Fix all three image sections:**
- **Hero grid**: Use `aspectRatio="3/4"` + `className="w-full h-full object-cover object-top"` (exact HeroSection pattern)
- **Outcome tabs**: Use `aspectRatio="3/4"` + `object-cover object-top`
- **Discovery showcase**: Use `aspectRatio="3/4"` + `object-cover object-top` in a masonry-style grid

This is what HeroSection does at line 318-327 — `aspectRatio="3/4"` inside a `div` with `aspect-[3/4]`, and `object-cover`. The `object-top` keeps faces/products visible instead of zooming into midsections.

## Design Overhaul

Rebuild the entire page to match VOVV.ai's premium aesthetic (HeroSection, HowItWorks, FinalCTA patterns):

### Brand alignment changes:
1. **Typography**: `font-semibold` max (not `font-bold`/`font-extrabold`) per brand memory. Use `tracking-tight` on headlines
2. **Spacing**: Match `py-20 sm:py-28` section rhythm from landing components
3. **Gradients**: Use `bg-gradient-to-b from-primary/5 via-background to-background` pattern from HeroSection
4. **Blur orbs**: Add `bg-primary/8 rounded-full blur-3xl` ambient elements like HeroSection/FinalCTA
5. **Animations**: Add `useInView` fade-in pattern from HowItWorks (`opacity-0 translate-y-8` → `opacity-100 translate-y-0`)
6. **CTAs**: Rounded-full buttons with `shadow-lg shadow-primary/25` matching HeroSection
7. **Cards**: Rounded-2xl with `border-border bg-card shadow-sm` matching HowItWorks cards
8. **Sections**: Use `bg-muted/20` alternation instead of `bg-card border-y border-border`

### Section-by-section redesign:
- **Hero**: Add blur orb background, refined typography, rounded-full CTAs with shadow, better trust badge styling
- **Proof bar**: Cleaner icon row with subtle separators
- **Outcome tabs**: Premium tab styling, image with rounded-2xl container
- **Why brands section**: Cards matching HowItWorks card style with animations
- **Comparison**: Side-by-side with refined card styling, subtle gradient on VOVV side
- **Shopify section**: Gradient background with blur orb like FinalCTA
- **Discovery showcase**: Proper masonry grid with hover effects matching DiscoverCard
- **How it works**: Step indicators with animated number badges
- **Use cases**: Refined card grid
- **SEO content**: Cleaner prose styling
- **FAQ**: Existing accordion, refined spacing
- **Final CTA**: Match FinalCTA component pattern exactly (gradient bg, blur orb, sparkles badge, team avatars if appropriate)

## Files to modify

| File | Action |
|------|--------|
| `src/pages/seo/AIProductPhotographyEcommerce.tsx` | Full rewrite with VOVV.ai design patterns |

Single file change, ~550-600 lines.

