## Goal

Make `/pricing` feel seamless and pixel-consistent by alternating surfaces, unifying tokens, and tightening the section rhythm.

## Files

- `src/components/landing/LandingPricing.tsx` — main edits
- `src/components/app/CompetitorComparison.tsx` — restyle to match page

## Structural changes (LandingPricing.tsx)

**1. Alternate surfaces between sub-sections**
Refactor the single `<section>` into a stack of full-width bands. Pattern:
```text
[off-white #FAFAF8]  Hero + pricing cards + trust microcopy
[white]              Compare every feature
[off-white]          Replaces a studio + Platform features
[white]              Cost comparison + How credits work
[off-white]          FAQ
[off-white]          Enterprise banner
[off-white]          Start-Free dark CTA  (page-ending crescendo)
```
Each band: `<section className="bg-{white|[#FAFAF8]} py-20 lg:py-28">` with inner `max-w-{6xl|3xl} mx-auto px-4 sm:px-6 lg:px-8`. Drop all the `mt-24 lg:mt-32` between sub-sections — the bands themselves create the rhythm.

**2. Reorder for crescendo (#13)**
New order at the bottom: FAQ → Enterprise banner → Start-Free dark CTA (last).

**3. Unify max-widths to two values (#4)**
- `max-w-6xl` → Compare table, Platform features, Studio replaces, Cost comparison
- `max-w-3xl` → FAQ, Start-Free CTA, Hero header, Credits intro
- Drop all uses of `max-w-7xl`, `max-w-4xl`, `max-w-2xl` from sub-sections.

**4. Hero h1 hierarchy (#2)**
Bump hero h1 to `text-[2.5rem] sm:text-5xl lg:text-[3.75rem]` so it dominates the sub-section h2s.

**5. Section header spacing (#3)**
All sub-section headers → `mb-12 lg:mb-16` (matches Home page sections).

## Token / color cleanup

**6. Replace hardcoded colors (#5)** across the file:
- `text-[#1a1a2e]` → `text-foreground` (headings + dark text)
- `text-[#6b7280]` → `text-muted-foreground` (body)
- `text-[#9ca3af]` → `text-muted-foreground/70`
- Keep `bg-[#1a1a2e]` only where it's an intentional dark-band surface (Start-Free CTA, Recommended badge, navy table accents).

**7. Borders (#8)**
Replace `border-border/50` and `border-border/40` on light surfaces with `border-[#f0efed]`.

**8. Eyebrow tracking (#9)**
Studio-replaces table header chip: `tracking-[0.12em]` → `tracking-[0.2em]`.

**9. Button heights (#7)**
Enterprise "Contact sales" button: `h-12` → `h-[3.25rem]`. Keep `h-12` only inside table rows.

**10. Subtitle widths (#14)**
All sub-section narrative subtitles → `max-w-xl`.

**11. Trust microcopy placement (#12)**
Move "Cancel anytime · No commitment · Secure checkout" inside the pricing-cards block, restyle to match site convention: `text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium mt-8 text-center`.

## CompetitorComparison.tsx restyle (#6)

Wrap output to match page convention:
```tsx
<>
  <div className="text-center mb-12 lg:mb-16">
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
      Cost comparison
    </p>
    <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] mb-4">
      Save 60–80% vs alternatives
    </h2>
    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
      Professional AI product visuals at a fraction of the cost.
    </p>
  </div>

  <div className="space-y-3 max-w-2xl mx-auto">
    {/* bars: replace bg-primary with bg-[#1a1a2e], muted bars stay */}
  </div>
</>
```
- Remove the inner `text-lg` heading + small subtitle (replaced by the page-standard block).
- Bars: `bg-primary` → `bg-[#1a1a2e]`, `text-primary` price color → `text-foreground`.
- Keep the disclaimer line.

Then in `LandingPricing.tsx`, the wrapping `<div className="mt-24 lg:mt-32 max-w-4xl mx-auto"><CompetitorComparison /></div>` becomes part of a `bg-white` band with `max-w-3xl`.

## Out of scope

- Pricing card internals (plan layout, pricing logic, recommended-badge design)
- Compare-feature table contents
- Annual/monthly toggle
- Stripe / checkout logic
- Copywriting changes beyond what's listed

## Acceptance check

After changes:
- 4 alternating bands visible on /pricing
- All headings render in `--foreground`, not the hex `#1a1a2e`, on light surfaces
- No more than 2 container widths used
- CompetitorComparison shares the same eyebrow/h2/navy palette as siblings
- Page ends on the dark navy "Start with 20 free credits" CTA
