

# Homepage Repositioning: Visual Studio with Creative Drops

This plan updates all landing page copy, structure, and imagery to reposition the homepage from an "AI image generator" into a **Visual Studio for e-commerce brands** focused on upload-once-generate-many, brand memory, automation, and delegation.

**No layout redesigns** -- we keep the existing Tailwind + shadcn/ui structure and only change content, copy, data, and add two new sections.

---

## 1. Navigation (LandingNav.tsx)

**Changes:**
- Rename nav link "Features" to "Workflows" (keep `#features` anchor)
- Add a subtle badge next to desktop links: a small pill reading "Monthly Creative Drops" with a sparkle icon
- CTA stays "Start Free"
- Logo and brand name stay as-is

---

## 2. Hero Section (HeroSection.tsx) -- Most Important

**Copy changes:**
- Badge: keep "AI-powered visual studio for brands"
- Headline: keep "Create New Product Visuals / Without New Photoshoots"
- Subheadline changes to: *"Upload one product photo and get 20 brand-ready visuals for ads, website, and campaigns -- automatically."*
- Primary CTA: "Create My First Visual Set" (with arrow)
- Secondary CTA: "See How It Works" (scrolls to `#how-it-works`)
- Trust badges become: "No credit card required", "5 free visuals", "Cancel anytime" (already close, keep as-is)

**Hero image restructure:**
Replace the two before/after ShowcaseCards with a single "Visual Set" showcase:
- Left side: one uploaded product image (serum-vitamin-c.jpg) with a small "Your Upload" label
- Right side: 2x2 grid of 4 generated contexts using existing template images:
  - cosmetics-luxury.jpg labeled "Ad Creative (4:5)"
  - cosmetics-pastel.jpg labeled "Product Listing (1:1)"
  - cosmetics-water.jpg labeled "Lifestyle Scene"
  - universal-clean.jpg labeled "Website Hero (16:9)"
- Below the grid, a subtle caption: "Same product -- 4 visual contexts -- 12 seconds"

This communicates "upload once, get many" in one glance.

---

## 3. Social Proof Bar (SocialProofBar.tsx)

**Metric copy changes (keep layout/icons):**
- "50,000+" / "Visuals generated" (was "Images generated")
- "12s" / "Avg. delivery time" (was "Avg. generation time")
- "Monthly" / "Visuals refreshed automatically" (replace "84% cost savings" -- avoids cheap-per-image framing)
- "2,000+" / "E-commerce brands" (was "Brands using nanobanna")

Replace the DollarSign icon with a Calendar/RefreshCw icon for the "Monthly" metric.

---

## 4. Features Section renamed to Workflows (FeatureGrid.tsx)

**Section heading changes:**
- Title: "Visual Workflows Built for E-commerce"
- Subtitle: "Choose an outcome. Your studio team handles the rest."
- Section `id` stays `features` (so nav anchor still works)

**Replace 4 feature cards with workflow-oriented cards:**

| Card | Title | Description | Badge | Image |
|------|-------|-------------|-------|-------|
| 1 | Ad Refresh Sets | Never run ads with the same images again. Fresh creatives every month, automatically. | 20 images | clothing-streetwear.jpg |
| 2 | Product Listing Sets | Marketplace-ready visuals, consistent every time. Clean backgrounds, perfect sizing. | 10 images | cosmetics-luxury.jpg |
| 3 | Website & Hero Sets | Wide compositions with space for copy. Built for landing pages and banners. | 6 images | universal-clean.jpg |
| 4 | Brand Memory | Your lighting, tone, and style -- remembered forever. Every visual stays on-brand. | Always on | clothing-studio.jpg |

Icons change to: RefreshCw, ShoppingBag, Monitor, Fingerprint (from lucide-react).

---

## 5. How It Works (HowItWorks.tsx)

**Step copy changes:**
- Step 01: "Upload Your Product" -- keep description as-is
- Step 02: "Choose What You're Creating" -- description: *"Pick a visual goal -- Ad Refresh, Product Listing, Hero Set -- and your studio team takes it from there."*
- Step 03: "Get a Visual Set" -- description: *"Receive 6-20 brand-ready images in seconds. Or schedule Creative Drops and get fresh visuals every month, automatically."*

Icons: Upload, Target, Images (from lucide-react).

CTA button: "Create My First Visual Set" (replace "Try It Free -- Takes 30 Seconds").

---

## 6. Before/After Gallery (BeforeAfterGallery.tsx)

**Reposition from industry filters to context filters:**
- Filter categories change from: All, Cosmetics, Fashion, Food, Health, Home
- To: All, Ads, Website, Listing, Seasonal, Lifestyle

**Update comparison data with new category assignments:**
- Skincare serum: "Ads" category
- Hoodie: "Website" category
- Granola: "Listing" category
- Collagen: "Seasonal" category
- Candle: "Lifestyle" category
- Leggings: "Ads" category

**Caption under each card changes to:** "Same product -- new visual context" (replaces product name + category).

Section heading: "Same Product. Endless Contexts." / Subheading: "One upload creates visuals for every channel and campaign."

---

## 7. Studio Team Section (StudioTeamSection.tsx) -- Major Update

**Heading changes:**
- Title: "A Full Studio Team -- Working in Seconds"
- Subtitle: "Photographers, designers, and CRO experts collaborate behind the scenes to create brand-ready visuals. You just choose what you're making."

**Expand from 6 to 8 team member cards**, each with an "Active" indicator (green dot):

| Role | Description | Icon |
|------|-------------|------|
| Product Photographer | Clean listing visuals | Camera |
| Lifestyle Photographer | Real-world context shots | Tent |
| Campaign Art Director | Seasonal and promo visuals | Clapperboard |
| Ad Creative Specialist | Scroll-stopping ad formats | Megaphone |
| CRO Visual Optimizer | Compositions that convert | BarChart3 |
| Brand Consistency Manager | Locks your look | Shield |
| Retouch Specialist | Cleans and sharpens details | Sparkles |
| Export Assistant | Perfect sizes for every platform | FileOutput |

**Add a micro-interaction row below the cards:**
A styled inline example showing task delegation:

```
Task: Create Monthly Ad Refresh
[check] Product Photographer  [check] Ad Creative Specialist
[check] CRO Optimizer  [check] Export Assistant
Completed in ~12 seconds
```

This is a simple styled div with check icons and muted text, reinforcing the "delegation" metaphor.

Grid changes from 3-column to 4-column on large screens (lg:grid-cols-4) to fit 8 cards.

---

## 8. New Section: Creative Drops (CreativeDropsSection.tsx)

**New component** inserted between StudioTeamSection and IntegrationSection in Landing.tsx.

**Content:**
- Title: "Your Visuals. Updated Automatically."
- Subtitle: "Schedule monthly Creative Drops and receive fresh visuals for your products -- without doing anything."
- Three bullet points with check icons:
  - "Choose your products once"
  - "Pick your visual workflows"
  - "Fresh visuals arrive every month"
- CTA button: "Set Up Monthly Creative Drops" (navigates to /auth)
- Right side visual: a stylized "calendar card" UI mockup built with Tailwind showing month name + thumbnail grid of 4 product images, suggesting automated delivery

---

## 9. Integration Section (IntegrationSection.tsx)

**Reframe to export destinations:**
- Title: "Export Everywhere. Perfect Sizes."
- Subtitle: "Your visuals are delivered in the right format for every platform."
- Add micro-copy: "Exported in perfect sizes for every platform."

**Replace 4 cards with platform destinations:**
- Shopify (ShoppingBag icon)
- Meta Ads (Megaphone icon)
- Google Ads (Search icon)
- Amazon (Package icon)
- Any Platform (Globe icon)

Layout: 5 items in a row on desktop (lg:grid-cols-5), simple icon + label cards.

---

## 10. Pricing (LandingPricing.tsx)

**Copy-only changes (keep structure):**
- Section subtitle: "Start free. Automate as you grow. Creative Drops included on Growth and above."
- Update plan features to mention Creative Drops and Workflows instead of raw credits/templates:
  - Starter: "100 visuals/month", "All workflows", "Standard delivery", "Email support"
  - Growth: "500 visuals/month", "All Starter features", "Virtual Try-On", "Monthly Creative Drops", "Brand Profiles", "Priority support"
  - Pro: "2,000 visuals/month", "All Growth features", "API access", "Weekly Creative Drops", "Dedicated support"
  - Enterprise: keep as-is

**Remove the competitor price comparison box** at the bottom (avoids per-image price framing per the brief). Replace with a simple line: "All plans include unlimited Brand Profiles and workflow access."

---

## 11. FAQ (LandingFAQ.tsx)

**Update FAQ content to match new positioning:**
- Replace "What are credits" with "What is a Visual Set?" -- explains workflow-based output
- Replace "Do I need a Shopify store" with "What are Creative Drops?" -- explains automated scheduling
- Keep image quality question, update to mention brand consistency
- Replace "Can I generate images in bulk" with "How does Brand Memory work?" -- explains brand profiles
- Keep formats/sizes question
- Keep free trial question, update to say "5 free visuals"
- Keep Virtual Try-On question
- Keep cancellation question

---

## 12. Final CTA (FinalCTA.tsx)

**Copy changes:**
- Badge: keep "Start for free today"
- Title: "Stop Planning Photoshoots. Start Receiving Visuals."
- Subtitle: "Upload your products, choose your workflows, and let your studio team deliver fresh visuals every month."
- CTA: "Create My First Visual Set"
- Sub-badges: "Free to try", "No prompts", "Cancel anytime"

---

## 13. Footer (LandingFooter.tsx)

**Minor link updates:**
- Product column: "Workflows", "Pricing", "Virtual Try-On", "Creative Drops", "Brand Profiles"
- Description: "Your automated visual studio for e-commerce. Professional product visuals, delivered monthly."

---

## 14. Landing.tsx Section Order

Updated order with the new Creative Drops section inserted:

1. LandingNav
2. HeroSection
3. SocialProofBar
4. FeatureGrid (renamed to "Workflows" visually)
5. HowItWorks
6. BeforeAfterGallery
7. StudioTeamSection
8. **CreativeDropsSection (NEW)**
9. IntegrationSection
10. LandingPricing
11. LandingFAQ
12. FinalCTA
13. LandingFooter

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/landing/CreativeDropsSection.tsx` | New automation/Creative Drops marketing section |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/landing/LandingNav.tsx` | Rename "Features" to "Workflows", add Creative Drops badge |
| `src/components/landing/HeroSection.tsx` | New subheadline, CTAs, replace before/after with Visual Set showcase |
| `src/components/landing/SocialProofBar.tsx` | Update metric labels and icons |
| `src/components/landing/FeatureGrid.tsx` | New workflow-oriented cards, title, icons |
| `src/components/landing/HowItWorks.tsx` | Updated step copy and CTA |
| `src/components/landing/BeforeAfterGallery.tsx` | Context-based filters, updated captions |
| `src/components/landing/StudioTeamSection.tsx` | 8 cards with active dots, micro-interaction row |
| `src/components/landing/IntegrationSection.tsx` | Export platform cards |
| `src/components/landing/LandingPricing.tsx` | Updated plan features, remove price comparison |
| `src/components/landing/LandingFAQ.tsx` | Rewritten FAQ entries |
| `src/components/landing/FinalCTA.tsx` | Updated headline, subtitle, CTA |
| `src/components/landing/LandingFooter.tsx` | Updated links and description |
| `src/pages/Landing.tsx` | Insert CreativeDropsSection |
| `src/data/mockData.ts` | Update pricing plan feature lists |

---

## Technical Notes

- All changes are copy/content/data updates to existing React components -- no new dependencies needed
- One new component (CreativeDropsSection) follows the exact same pattern as existing landing sections
- All images use existing assets from `src/assets/products/` and `src/assets/templates/`
- No database or backend changes required
- The `#features` anchor ID stays unchanged so existing nav links continue to work

