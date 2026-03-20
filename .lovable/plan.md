

# Update Pricing Feature Labels

## Changes

**File: `src/data/mockData.ts`**

1. **Free plan** — add a new feature line: `'Workflows single generations'` (to communicate that free users can only generate one at a time, implying paid plans offer bulk)

2. **Starter, Growth, Pro plans** — replace `'Batch generation (3 scenes)'` with `'Workflows bulk generations'`

This is a single-file, 4-line text change. No logic or component changes needed — both `LandingPricing` and `PlanCard`/Settings render features from this array.

