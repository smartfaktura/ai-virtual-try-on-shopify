

## Fix Landing Page Pricing Section

### Issues

1. **Free plan CTA says "Current Plan"** — misleading for non-logged-in visitors. Should say "Get Started Free" or similar.
2. **"Save 20%" label** is cramped inside the Annual toggle button — hard to notice. Should be a separate badge/pill outside the toggle.
3. **Bottom footnote** "All plans include unlimited Brand Profiles and workflow access" — remove as requested.
4. **Feature lists** need review — Free plan shows generic features, Growth doesn't mention Creative Drops, and the features don't differentiate tiers clearly enough.

### Changes

**`src/data/mockData.ts`** — Update `pricingPlans` array:
- Change Free plan `ctaText` from `"Current Plan"` to `"Get Started Free"`
- Refine feature lists per tier to better differentiate:
  - **Free**: All workflows, High quality images, 1 Brand Profile, 1 product
  - **Starter**: Everything in Free + Try-On mode, 3 Brand Profiles, Up to 10 products
  - **Growth**: Everything in Starter + Priority queue, Creative Drops, 10 Brand Profiles, Up to 100 products
  - **Pro**: Everything in Growth + Video Generation, Unlimited profiles, Unlimited products

**`src/components/landing/LandingPricing.tsx`**:
- Move "Save 20%" out of the Annual button into a separate green badge/pill positioned next to the toggle
- Remove the bottom footnote paragraph (lines 144-148)
- Keep everything else as-is

