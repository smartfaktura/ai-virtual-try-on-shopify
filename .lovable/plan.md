

# New Landing Page: /home

## Overview
Create a brand-new premium, conversion-focused landing page at `/home` with a warm white aesthetic, buyer-facing language, and 11 distinct sections. This is a completely separate page from the existing `/` landing page — different design system, different copy, different structure.

## Files to Create

### 1. `src/pages/Home.tsx`
Main page component that composes all 11 sections with lazy-loading for below-fold content. Includes SEO head, JSON-LD, and the new navbar. Uses a custom warm white color palette via inline CSS variables or Tailwind classes (not overriding the global theme).

### 2. `src/components/home/HomeNav.tsx`
Sticky navbar with: VOVV logo, anchor links (Examples, How it works, Pricing, FAQ), "Start free" CTA button. White/translucent blur background on scroll. Minimal, premium styling. Mobile hamburger menu.

### 3. `src/components/home/HomeHero.tsx`
Two-column hero: left = copy + CTAs, right = visual transformation concept (original product card surrounded by output cards with subtle shadows). Uses exact copy from spec. Floating layered card composition on the right.

### 4. `src/components/home/HomeTransformStrip.tsx`
Section 2 — Horizontal strip showing one product becoming 5 outputs (Original → Product page → Social ad → Lifestyle → Video). Each as a labeled card. Scroll-reveal animation.

### 5. `src/components/home/HomeCreateCards.tsx`
Section 3 — Three tall editorial cards: Product page images, Social & ad creatives, Product videos. Each with dominant preview area, title, description, CTA. Large rounded corners, soft shadows.

### 6. `src/components/home/HomeCategoryExamples.tsx`
Section 4 — Four category cards (Beauty, Fashion, Jewelry, Home) with example visuals. Image-heavy, minimal text, premium gallery layout.

### 7. `src/components/home/HomeHowItWorks.tsx`
Section 5 — Three staggered steps with large step numbers, alternating left/right layout. Upload → Choose → Generate. Clean visual mock/preview for each step.

### 8. `src/components/home/HomeWhySwitch.tsx`
Section 6 — Darker contrast section. Three comparison cards (Faster, Easier, More scalable). Slightly darker premium background for page rhythm.

### 9. `src/components/home/HomeOnBrand.tsx`
Section 7 — Two-column: left = brand settings panel mockup, right = grid of consistent outputs. Proves visual consistency without using internal "Brand Profiles" terminology.

### 10. `src/components/home/HomeQualityProof.tsx`
Section 8 — Trust section with before/after comparisons, detail crops, use-case placements. Modular editorial gallery layout.

### 11. `src/components/home/HomePricingTeaser.tsx`
Section 9 — Centered minimal panel. "Start free, upgrade when you're ready." Two buttons, reassurance row. Light, airy design.

### 12. `src/components/home/HomeFAQ.tsx`
Section 10 — Accordion with 6 buyer-focused questions (exact copy from spec). Premium spacing, minimal borders.

### 13. `src/components/home/HomeFinalCTA.tsx`
Section 11 — Darker/contrast background. "Try it on your product" headline, two CTAs, subtle background visual treatment.

### 14. `src/components/home/HomeFooter.tsx`
Simple, minimal footer matching the new page's warm white aesthetic.

## File to Modify

### `src/App.tsx`
- Add lazy import for `Home` page
- Add route: `<Route path="/home" element={<Home />} />`

## Design System (Page-Scoped)
All styling will use Tailwind utility classes with hardcoded color values scoped to this page, avoiding changes to the global theme:
- Background: `bg-[#FAFAF8]` (warm porcelain)
- Cards: `bg-white` with `shadow-sm` or `shadow-md`
- Text: `text-[#1a1a2e]` (charcoal), `text-[#6b7280]` (muted gray)
- Accent: `text-[#475569]` (slate blue-gray), used sparingly
- Darker sections: `bg-[#1a1a2e]` or `bg-[#f1f0ee]`
- Rounded: `rounded-2xl` or `rounded-3xl`
- Spacing: `py-24 lg:py-32` between sections

## Animation
- CSS-only fade-in-up on scroll using Intersection Observer
- Subtle hover transforms on cards (`hover:-translate-y-1 transition-transform`)
- No external animation libraries

## Images
- Use placeholder divs with gradient backgrounds initially (can be replaced with real assets later)
- Where possible, reference existing landing assets from Supabase storage via `getLandingAssetUrl()`

## Responsive
- Mobile-first with clean stacking
- Hero: single column on mobile, two columns on `lg:`
- Cards: stack vertically on mobile, grid on desktop
- Strong CTA visibility at all breakpoints

