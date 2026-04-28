# Redesign 404 page in homepage aesthetic

The 404 page currently has visual noise that doesn't match the homepage:
- Random radial gradients + grid overlay background
- Gigantic gradient "404" numerals
- A red destructive dot next to "VOVV.AI" in the header (the "random circle near logo")
- Mismatched header / different button styles / 4-column busy quick-link grid

Align it with the homepage and the just-redesigned PaymentSuccess page.

## Changes — `src/pages/NotFound.tsx` only

### Remove
- Decorative radial gradient + grid mask backgrounds
- Custom header with the bullet dot beside the logo and the "Pricing" link
- Giant gradient `404` text
- The destructive red dot in the path-echo pill
- The 4-link icon-only grid (Pricing duplicate, etc.)
- Three-button cluster (Home + Go to App + back link)

### New layout (same skeleton as PaymentSuccess)
Background `bg-[#FAFAF8]`, container `max-w-3xl px-6 pt-24 pb-20 lg:pt-32 lg:pb-28`, single fade-in.

1. **Hero block, centered**
   - Eyebrow `404 — PAGE NOT FOUND` in `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground`
   - Headline `This page took a wrong turn` in `text-[2rem] sm:text-5xl lg:text-[3.5rem] font-semibold tracking-[-0.03em] leading-[1.08]`
   - Subline `text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed`, no terminal period
   - Quiet path echo pill: `font-mono text-xs text-muted-foreground/70 bg-foreground/[0.04] px-3 py-1.5 rounded-full` (no red dot)

2. **Where to next** — 3 cards (drop Pricing duplicate)
   - `Product Images`, `Video Studio`, `Explore`
   - White rounded-3xl cards with `border-[#f0efed]`, icon tile `w-9 h-9 rounded-xl bg-foreground/[0.04]`, title + one-line description — identical to PaymentSuccess `NextStep`
   - Eyebrow `WHERE TO NEXT`

3. **Footer actions**
   - Primary pill CTA `Back to home` → `/` matching homepage hero CTA: `h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25`
   - Quiet text link below: `Or go back` → `navigate(-1)` styled with the eyebrow microcopy treatment

### Keep
- `useEffect` console.error log for debugging
- `SEOHead` with `noindex`

## Files touched
- `src/pages/NotFound.tsx` — full visual rewrite, no routing changes
