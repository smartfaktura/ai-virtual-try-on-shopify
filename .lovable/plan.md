# Restyle Feature Landing Pages to Match Home Aesthetic

Bring the 5 feature pages — **Virtual Try-On, Brand Profiles, Image Upscaling, Perspectives, Real Estate Staging** — onto the same premium design system as `Home.tsx` while tightening copy with current product info.

## What changes (visual system)

Apply this consistent template to all 5 pages, replacing the generic `bg-muted/30` + small icon-card layout currently in use:

| Element | Current pages | New (matches Home) |
|---|---|---|
| Page background | `bg-background` | `bg-[#FAFAF8]` |
| Section eyebrow | none | `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground` |
| H1/H2 | `text-2xl/4xl font-bold` | `text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight` |
| Subheads | `text-muted-foreground` | `text-base sm:text-lg leading-relaxed` |
| Cards | `bg-card border-border` | `bg-white rounded-3xl border border-[#f0efed] shadow-sm shadow-foreground/[0.04] p-7 sm:p-8 lg:p-10` |
| Icon chip | `w-10 h-10 rounded-xl bg-primary/10` | `w-11 h-11 rounded-xl bg-foreground/[0.06]` (light sections) / `bg-white/10` (dark sections) |
| Section rhythm | `py-16 / py-20` | `py-16 lg:py-32` |
| Primary CTA | unchanged shape | `h-[3.25rem] px-8 rounded-full shadow-lg shadow-primary/25` (matches HomeHero) |
| Reveal | none | `useScrollReveal()` on Benefits/How-It-Works/Use-Cases grids |

## Per-page section structure

Every page gets the same skeleton:

```text
1. Hero (light, FAFAF8)        — eyebrow chip + big serif-weight H1 + subhead + CTA
2. Benefits (light)            — 3 white rounded-3xl cards w/ scroll-reveal
3. How It Works (light)        — 3 numbered steps
4. [Page-specific section]     — Use-cases / FAQ / category strip (see below)
5. Why VOVV (dark #1a1a2e)     — mirrors HomeWhySwitch styling, page-specific 3 cards
6. Final CTA (dark #1a1a2e)    — mirrors HomeFinalCTA with blurred radial accents
```

`PageLayout` wrapper is kept (nav + footer + signup slide-up).

## Per-page content updates

### 1. Virtual Try-On (`VirtualTryOnFeature.tsx`)
- **Hero copy**: "See your products on diverse AI models — without the photoshoot." Bring in 40+ models, body types, multi-angle.
- **Benefits → 3 cards**: Diverse model library (40+), Realistic fitting (fabric drape, garment construction), Multiple angles & framings.
- **NEW Use Cases (light grid, 4 cards)**: Apparel brands · Lingerie/swimwear · Activewear · DTC catalog refresh.
- **NEW FAQ (3 Qs)**: Can I upload my own model? Does it preserve the garment exactly? What credit cost per shot?
- **Why VOVV (dark)**: Faster than booking a model · Cheaper than a studio day · Consistent across SKUs.
- **Final CTA (dark)**.

### 2. Brand Profiles (`BrandProfilesFeature.tsx`)
- **Hero copy**: "Your brand guidelines, built into every image."
- **Benefits → 3 cards**: Color & style consistency · Reusable across the studio · Team sharing.
- **NEW signature row (replicates HomeOnBrand layout, no new images)**: left = mocked "Visual direction" pill list (Brand tone, Lighting, Palette, Composition, "Do not" rules); right = explanatory copy block (no new gallery — bullets only, to honor "minimal new imagery").
- **NEW FAQ (3 Qs)**: What does a profile control? Does it work with Freestyle? How many profiles can I have?
- **Why VOVV (dark)**: No style guide drift · No per-shot prompt rewrites · One source of truth.
- **Final CTA (dark)**.

### 3. Image Upscaling (`UpscaleFeature.tsx`)
- **Hero copy**: "Upscale & enhance product images to 2K or 4K with AI texture recovery."
- **Benefits → 3 cards**: Fabric & texture recovery · 2K (10 cr) / 4K (15 cr) · Batch up to 10 images.
- **NEW Use Cases (4 cards)**: Hero banners · Print-ready assets · Marketplace listings (zoom) · Old catalog refresh.
- **NEW FAQ (3 Qs)**: What inputs work best? Will it change colors? Does it preserve text/labels?
- **Why VOVV (dark)**: One-click upscale · Texture-aware not just bigger · Works on generated + uploaded.
- **Final CTA (dark)**.

### 4. Perspectives (`PerspectivesFeature.tsx`)
- **Hero copy**: "One photo. Every angle. 8 perspective types from a single source."
- **Benefits → 3 cards**: 8 angle types · Scene-aware prompting · Matching lighting & backgrounds.
- **NEW Angle list strip (lightweight, no new imagery)**: pill row showing the 8 angles (Front, Back, Left, Right, Close-up, Full body, Upper body, Three-quarter) using the same chip group treatment as HomeTransformStrip pills.
- **NEW FAQ (3 Qs)**: Will the model/pose stay consistent? What credit cost per angle? Can I pick just one angle?
- **Why VOVV (dark)**: No reshoots for missing angles · Cohesive PDP gallery · Works with on-model + flat lay.
- **Final CTA (dark)**.

### 5. Real Estate Staging (`RealEstateStagingFeature.tsx`)
- **Keep** the existing interactive style-tabs + image showcase (it's already strong — only restyle wrapper to FAFAF8 + new card system).
- **Restyle** Benefits, How It Works, Use Cases to match new card spec; convert existing 4 use-case cards to the new white rounded-3xl style.
- **NEW FAQ (3 Qs)**: What rooms are supported? Can I keep existing furniture? MLS-ready output?
- **Why VOVV (dark)**: Faster than physical staging · 90%+ cost savings · Style A/B testing in seconds.
- **Final CTA (dark)** — replace the current grey final CTA with the dark navy version.

## Technical notes (for implementation)

- All edits scoped to: `src/pages/features/VirtualTryOnFeature.tsx`, `BrandProfilesFeature.tsx`, `UpscaleFeature.tsx`, `PerspectivesFeature.tsx`, `RealEstateStagingFeature.tsx`.
- No new shared components needed — sections are inlined per page (matches Home's pattern of section-per-component without over-abstracting).
- Scroll reveal: import `useScrollReveal` from `@/hooks/useScrollReveal` (already used by Home sections).
- FAQ pattern: simple stacked `<details>`-style or 3 inline Q/A blocks inside a white card — no Accordion component needed (keeps pages lightweight).
- Buttons: continue using `Button` from `@/components/ui/button` with the homepage's exact CTA spec (`h-[3.25rem] px-8 rounded-full shadow-lg shadow-primary/25`).
- Final dark CTA reuses HomeFinalCTA's blurred radial decoration (`absolute` `rounded-full bg-[#475569] blur-3xl`) for consistency.
- No new images uploaded; Real Estate Staging keeps its existing `/images/staging/*.png` assets.
- SEO: keep all current `SEOHead` props; only sharpen page descriptions if copy changes warrant it.

## Out of scope

- No new marquees, image grids, or fetched scene previews (per "minimal new imagery").
- No changes to `LandingNav`, `LandingFooter`, `PageLayout`, or routing.
- No copy changes to other feature pages (`AIModelsBackgroundsFeature`, `CreativeDropsFeature`, `WorkflowsFeature`, `ShopifyImageGenerator`, `RealEstateStagingFeature` interactive gallery logic).