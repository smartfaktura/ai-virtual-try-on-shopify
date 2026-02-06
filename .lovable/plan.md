

# Public Landing Page for nanobanna - CRO Optimized

## Overview
Create a standalone, public-facing marketing landing page at `/landing` that targets a broader audience beyond Shopify users. This page will NOT use Shopify Polaris components -- instead it will use pure Tailwind CSS for a modern, conversion-optimized design that appeals to anyone needing AI product images (photographers, marketers, DTC brands, social media managers, etc.).

## Architecture

The landing page will live outside the `AppShell` (no Shopify admin sidebar/topbar) and will be a standalone route with its own layout and components.

**Routing change in `App.tsx`:**
- Add `/landing` route that renders OUTSIDE the `AppShell` wrapper
- The landing page will have its own navbar and footer

## Page Sections (Top to Bottom)

### 1. Navigation Bar
- Logo + brand name "nanobanna"
- Nav links: Features, How It Works, Pricing, FAQ
- CTA button: "Start Free" (smooth scroll or link to signup)
- Sticky on scroll with backdrop blur

### 2. Hero Section
- Bold headline: "AI Product Photography in Seconds"
- Subheadline addressing pain points (expensive studios, slow turnaround)
- Two CTAs: "Start Free - 5 Credits" (primary) and "See Examples" (secondary)
- Before/after product image showcase (using existing product assets)
- Trust badges: "No credit card required", "5 free credits", "Cancel anytime"

### 3. Social Proof Bar
- Logo cloud of use-case types: "Trusted by 2,000+ brands"
- Key metrics: images generated, avg. time saved, cost savings

### 4. Feature Grid - "What You Can Create"
- Product Photography card (using template images)
- Virtual Try-On card (using model/pose images)
- Bulk Generation card
- Each card with image preview, title, description

### 5. How It Works - 3 Steps
- Step 1: Upload your product image (or connect your shop)
- Step 2: Choose a style template
- Step 3: Get professional images in seconds
- Visual flow with numbered steps and connecting elements

### 6. Before/After Gallery
- Side-by-side comparisons showing raw product photo vs AI-generated result
- Multiple examples across categories (clothing, cosmetics, food, supplements)
- Interactive slider or toggle

### 7. Integration Section
- "Works With Your Existing Tools"
- Shopify, WooCommerce, upload icons
- Emphasis on "No ecommerce store needed - just upload any image"

### 8. Pricing Section
- Reuse existing pricing data from `mockData.ts` (pricingPlans + creditPacks)
- Monthly/Annual toggle
- Highlight the Growth plan
- Competitor comparison (reuse data from CompetitorComparison)

### 9. FAQ Accordion
- Common questions about credits, image quality, integrations, etc.
- Using Radix accordion component

### 10. Final CTA Section
- "Ready to Transform Your Product Images?"
- Email capture or "Start Free" button
- Trust reinforcement

### 11. Footer
- Links: Product, Company, Legal, Support
- Social media links
- Copyright

## New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Landing.tsx` | Main landing page composing all sections |
| `src/components/landing/LandingNav.tsx` | Sticky navigation bar |
| `src/components/landing/HeroSection.tsx` | Hero with headline, CTAs, image showcase |
| `src/components/landing/SocialProofBar.tsx` | Trust metrics and brand logos |
| `src/components/landing/FeatureGrid.tsx` | Feature cards grid |
| `src/components/landing/HowItWorks.tsx` | 3-step process visualization |
| `src/components/landing/BeforeAfterGallery.tsx` | Product comparison gallery |
| `src/components/landing/IntegrationSection.tsx` | Platform integrations |
| `src/components/landing/LandingPricing.tsx` | Pricing section with plans |
| `src/components/landing/LandingFAQ.tsx` | FAQ accordion |
| `src/components/landing/FinalCTA.tsx` | Bottom CTA with email capture |
| `src/components/landing/LandingFooter.tsx` | Footer with links |

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/landing` route outside `AppShell` |

## Technical Approach

### Styling
- Pure Tailwind CSS (NO Polaris components on this page)
- Uses existing CSS variables and design tokens from `index.css`
- Responsive: mobile-first, optimized for all breakpoints
- Smooth scroll behavior for anchor links
- Intersection Observer for scroll-triggered animations

### CRO Best Practices
- Single clear CTA repeated throughout the page
- Social proof near every CTA
- Specific numbers (cost per image, time saved, percentage savings)
- Urgency/scarcity elements ("5 free credits to start")
- Minimal friction: no signup form on landing, just "Start Free" buttons
- Fast loading: uses existing imported assets, no external image fetches

### Data Reuse
- Pricing plans from `mockData.ts` (pricingPlans, creditPacks)
- Product images from `src/assets/products/`
- Template images from `src/assets/templates/`
- Model images from `src/assets/models/`
- Pose images from `src/assets/poses/`

### Accessibility
- Semantic HTML (header, main, section, footer)
- Proper heading hierarchy
- Alt text on all images
- Keyboard navigation for interactive elements

