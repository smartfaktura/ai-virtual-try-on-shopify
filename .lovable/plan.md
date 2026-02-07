

# Landing Page Critical Fixes -- Repositioning as "Your AI Photography Team"

This plan addresses the 11 issues identified in the critical review. The goal: a visitor should understand in 10 seconds that brandframe.ai is an AI photography team that works for them, not a tool they operate.

---

## Priority 1: Fix the Narrative Order

The "AI team" concept is buried at section 6. Move it up immediately after the hero so the page tells a clear story.

**New section order in Landing.tsx:**
1. LandingNav
2. HeroSection (repositioned as "team" intro)
3. SocialProofBar (keep, but improve)
4. StudioTeamSection (MOVE UP from position 7 to position 4)
5. FeatureGrid / Workflows
6. HowItWorks
7. BeforeAfterGallery
8. CreativeDropsSection
9. IntegrationSection
10. LandingPricing
11. LandingFAQ
12. FinalCTA
13. LandingFooter

**Why:** The story becomes: "Meet your team" -> "Here's what they produce" -> "Here's how it works" -> "See examples" -> "It runs automatically" -> "Pricing."

---

## Priority 2: Rewrite the Hero to Lead with "Team"

**Current headline:** "Create New Product Visuals Without New Photoshoots"
**Problem:** Transactional. Describes a tool, not a team.

**New headline:**
"Your AI Photography Team. Ready When You Are."

**New subheadline:**
"Upload a product photo. Your team of photographers, art directors, and retouchers delivers 20 brand-ready visuals in seconds -- for ads, listings, and campaigns."

**Why this works:** It immediately frames the product as a *team* (not a tool), names specific roles, and sets the outcome expectation.

**Hero image area -- keep the same layout** (left upload, right 2x2 grid) but add:
- A small "arrow" or "flow" indicator between the left and right to visually connect "upload" to "output"
- Labels on the right-side images should feel more like deliverables: "Ad Ready", "Listing Ready", "Lifestyle", "Hero Banner" (drop the aspect ratio jargon like "4:5" and "1:1" -- visitors don't care)

**Trust badges update:**
- Keep: "No credit card required", "5 free visuals", "Cancel anytime"

**CTA stays:** "Create My First Visual Set" + "See How It Works"

---

## Priority 3: Strengthen the Studio Team Section

**Current:** 8 identical small cards -- feels like filler.

**Changes:**
- Reduce to 6 cards (cut "Retouch Specialist" and "Export Assistant" -- these are internal/trivial and dilute the impact of the real roles)
- Make the "Example Task" delegation box significantly larger and move it ABOVE the cards -- it should be the first thing people see in this section, not an afterthought
- Add a second example task so it feels like a pattern, not a one-off:
  - Task 1: "Monthly Ad Refresh" -- Product Photographer, Ad Creative Specialist, CRO Optimizer (completed in ~12s)
  - Task 2: "Launch Product Listing Set" -- Product Photographer, Brand Manager, Export Assistant (completed in ~8s)
- Change the "Active" dot label to something more meaningful like the specialist's current status, e.g., "Ready" -- "Active" on every card is meaningless

---

## Priority 4: Fix the Before/After Gallery

**Current problem:** The "before" and "after" images are visually unrelated. The serum photo next to a luxury scene doesn't show a transformation -- it shows two random images.

**Fix approach:**
- Change section title to: "One Product. Every Channel."
- Change the card layout: instead of side-by-side before/after, show a **single "after" image per card** (the generated visual) with a tiny inset thumbnail of the original product in the corner (like a PiP / picture-in-picture overlay)
- This way the focus is on the OUTPUT (the beautiful generated image) with the original product visible for reference
- Each card caption becomes the use case: "Instagram Ad", "Amazon Listing", "Website Hero", "Seasonal Campaign", "Lifestyle Blog"
- Remove the "ORIGINAL" and "GENERATED" badges -- they're confusing when images don't match

---

## Priority 5: Make Workflows Concrete

**Current:** 4 generic cards with template images that don't show actual output.

**Changes:**
- Keep 4 workflow cards but improve descriptions to be more outcome-focused
- Change "Brand Memory" icon from Fingerprint (suggests security) to Palette or Paintbrush (suggests creative identity)
- Add a micro-stat under each card description:
  - Ad Refresh: "20 images, refreshed monthly"
  - Product Listing: "10 images, marketplace-optimized"
  - Website & Hero: "6 wide compositions"
  - Brand Memory: "Applied to every generation"
- Move the badge ("20 images") from top-right overlay to inline below the title -- overlays on dark images are hard to read

---

## Priority 6: Upgrade Creative Drops Visual

**Current:** Static calendar mockup with 4 product thumbnails -- doesn't communicate automation.

**Changes:**
- Add a timeline/sequence feel: show 3 small "drop" cards stacked vertically labeled "January Drop," "February Drop," "March Drop" with a subtle opacity gradient (older = more faded), suggesting recurring delivery
- Add a status indicator: "Next drop in 12 days" to make it feel alive
- Keep the bullets and CTA as-is -- the copy is good

---

## Priority 7: Strengthen Social Proof

**Current:** 4 generic metrics with no verification.

**Changes:**
- Keep the 4 metrics but add a thin row of grayscale brand logos below (even if placeholder -- "Trusted by brands like" with 5-6 logo placeholders)
- Change "2,000+ E-commerce brands" to "2,000+ brands trust brandframe.ai" -- the word "trust" adds weight
- Add one short testimonial quote inline (can be a placeholder for now): "We replaced 3 monthly photoshoots. Our ad creative is fresher than ever." -- gives a human voice

---

## Priority 8: Fix Pricing Clarity

**Changes:**
- Add a one-liner under each plan's credit count explaining what it means:
  - "100 visuals = ~5 visual sets" (Starter)
  - "500 visuals = ~25 visual sets" (Growth)
  - "2,000 visuals = ~100 visual sets" (Pro)
- This removes ambiguity about what a "visual" is

---

## Priority 9: Vary the CTAs

**Current:** "Create My First Visual Set" appears 4+ times.

**Changes:**
- Hero CTA: "Create My First Visual Set" (keep -- it's the entry point)
- How It Works CTA: "Try It Free" (shorter, less repetitive)
- Creative Drops CTA: "Set Up Monthly Creative Drops" (keep -- it's specific)
- Final CTA: "Get Started Free" (different from hero, still action-oriented)

---

## Priority 10: Address Real Objections in FAQ

**Add 2 new FAQ entries at the top:**
1. "Will the images look AI-generated?" -- Answer: No. Our AI generates studio-quality images indistinguishable from professional photography. Combined with Brand Memory, every image maintains consistent, realistic lighting and composition.
2. "Can I really stop doing photoshoots?" -- Answer: For most e-commerce visual needs, yes. Brands use brandframe.ai to replace recurring product shoots for ads, listings, and campaigns. You may still want photoshoots for flagship campaigns, but your day-to-day visual output is fully automated.

---

## Priority 11: Integration Section -- Add Context

**Changes:**
- Add a one-line description under each platform icon:
  - Shopify: "Auto-sized for your store"
  - Meta Ads: "1:1, 4:5, 9:16 ready"
  - Google Ads: "Display & Performance Max"
  - Amazon: "Main image compliant"
  - Any Platform: "Custom export sizes"
- This turns a thin section into a useful one

---

## Summary of File Changes

| File | What changes |
|------|-------------|
| `src/pages/Landing.tsx` | Reorder sections (move StudioTeamSection to position 4) |
| `src/components/landing/HeroSection.tsx` | New headline, subheadline, image labels, flow arrow between upload and outputs |
| `src/components/landing/StudioTeamSection.tsx` | Reduce to 6 cards, enlarge and move delegation example above cards, add second task example |
| `src/components/landing/BeforeAfterGallery.tsx` | New PiP card layout (output image + inset original), rename title, update captions to channel names |
| `src/components/landing/FeatureGrid.tsx` | Change Brand Memory icon, move badges inline, add micro-stats |
| `src/components/landing/CreativeDropsSection.tsx` | Replace single calendar with 3-month timeline stack, add "Next drop" indicator |
| `src/components/landing/SocialProofBar.tsx` | Add placeholder testimonial, add logo row, update "brands" copy |
| `src/components/landing/IntegrationSection.tsx` | Add one-line descriptions under each platform |
| `src/components/landing/LandingPricing.tsx` | Add "= ~X visual sets" explainer under each plan |
| `src/components/landing/LandingFAQ.tsx` | Add 2 new objection-handling FAQs at top |
| `src/components/landing/FinalCTA.tsx` | Change CTA text to "Get Started Free" |
| `src/components/landing/HowItWorks.tsx` | Change CTA text to "Try It Free" |
| `src/data/mockData.ts` | No changes needed |

---

## Technical Notes

- No new dependencies required
- No database or backend changes
- All changes are copy, layout order, and component-level restructuring
- Existing Tailwind + shadcn/ui patterns are maintained
- All existing image assets are reused

