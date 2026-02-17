

## Update Quality Selection and Credit Pricing Across All Generation Modes

### What Changes

1. **Add quality selector to Virtual Try-On** -- replace the static "uses High quality by default" text with an actual Standard/High dropdown, same as workflows
2. **Update credit pricing** to Standard = 8 credits, High (Pro model) = 16 credits
3. **Add explanations** for each quality level so users understand the difference

### New Pricing

| Quality | Model Used | Credits/Image | Description |
|---------|-----------|---------------|-------------|
| Standard | Gemini 2.5 Flash | 8 credits | Fast generation, great for testing and iteration |
| High | Gemini 3 Pro | 16 credits | Pro model, best quality, slower (~60-120s) |

### Files to Change

**`src/pages/Generate.tsx`**

- Line 833: Update credit cost formula -- Standard from 4 to 8, High from 10 to 16
- Lines 1489-1492: Update workflow quality dropdown labels with descriptions and new prices
- Line 2174: Replace static "uses High quality" text with actual Quality dropdown (same as workflows)
- Lines 2183-2184: Update try-on credit display to use dynamic quality pricing instead of hardcoded 8

**`supabase/functions/enqueue-generation/index.ts`**

- Line 21-22: Update `calculateCreditCost` -- try-on uses quality-based pricing (not flat 8), standard = 8, high = 16

**`src/lib/dropCreditCalculator.ts`**

- Update `getCostPerImage` pricing to match new rates (base 8, model 16, model+scene 20)

### Quality Dropdown Labels

```
Standard -- Fast generation, good quality (8 credits/img)
High (Pro Model) -- Best quality, ~60-120s per image (16 credits/img)
```

### Technical Notes

- The `enqueue-generation` edge function needs redeployment after the pricing change
- Try-on will no longer be hardcoded to 8 credits -- it will follow the same Standard/High pricing
- The `dropCreditCalculator` costs are updated proportionally to keep the same relative complexity tiers

