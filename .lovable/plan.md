

## Update Pricing Plan Features

### Problem
The current plan feature lists don't accurately reflect the intended feature tiers. Specific corrections needed:
- All plans should include high quality images
- Priority queue starts from Growth (not mentioned in Starter)
- Each plan should note it includes everything from the previous tier
- Free: 1 product upload, 1 brand profile
- Starter: up to 10 products
- Growth: up to 100 products
- Pro: unlimited products
- All plans include all workflows

### Changes

**File: `src/data/mockData.ts`** -- Update the `pricingPlans` feature arrays:

| Plan | Updated Features |
|---|---|
| Free | "All workflows", "High quality images", "1 Brand Profile", "1 product upload" |
| Starter | "Everything in Free", "All workflows and Try-On", "3 Brand Profiles", "Up to 10 products" |
| Growth | "Everything in Starter", "Priority queue", "10 Brand Profiles", "Up to 100 products" |
| Pro | "Everything in Growth", "Video Generation", "Creative Drops", "Unlimited profiles and products" |

**File: `src/components/app/BuyCreditsModal.tsx`** -- Increase the feature slice from 3 to 4 (`p.features.slice(0, 4)`) so the additional "Everything in..." line is visible in the modal.

**File: `src/components/landing/LandingPricing.tsx`** -- No structural changes needed; it already renders all features from the data.

### Technical Details

Only two files need edits:
1. `src/data/mockData.ts` (lines 1363-1416): Replace feature arrays for free, starter, growth, and pro plans
2. `src/components/app/BuyCreditsModal.tsx` (line 263): Change `.slice(0, 3)` to `.slice(0, 4)`

