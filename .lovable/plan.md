

# Fix Incorrect "visuals/month" Label on Pricing Cards

## The Problem

The pricing cards display "1,000 visuals/month", "2,500 visuals/month", and "6,000 visuals/month" -- but these numbers are **credits**, not visuals. With the new inflated credit system where 1 standard image = 4 credits, the actual visual counts are much lower:

- Starter 1,000 credits = ~250 visuals
- Growth 2,500 credits = ~625 visuals
- Pro 6,000 credits = ~1,500 visuals

Saying "1,000 visuals" is misleading and inconsistent with the feature list below which correctly says "1,000 credits/month".

## The Fix

**File: `src/components/landing/LandingPricing.tsx` (line 80)**

Change the subtitle from `visuals/month` to `credits/month` so it matches the feature list and is accurate:

```
// Before:
{typeof plan.credits === 'number' ? `${plan.credits.toLocaleString()} visuals/month` : 'Unlimited visuals'}

// After:
{typeof plan.credits === 'number' ? `${plan.credits.toLocaleString()} credits/month` : 'Unlimited visuals'}
```

This is a single-line change. The "visual sets" approximation below (line 84) already uses the correct divisor of 40, which represents ~10 images per product set at 4 credits each = 40 credits per set. That math is correct (1,000 / 40 = 25 visual sets).

