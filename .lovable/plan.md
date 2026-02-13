

## Smart Quality Auto-Upgrade and Model Reference Credit Pricing

### Problem

1. The quality selector shows "Standard - 4 credits/image" even when a model is selected, but the backend always uses the expensive Pro AI model for model-reference generations. This is misleading.
2. Credits charged don't reflect the actual cost of model-reference generations, which use 3-5x more compute.
3. Users don't understand why generation takes longer when they see "Standard" selected.

### Changes

**1. Auto-upgrade quality indicator when model is selected** (`FreestyleSettingsChips.tsx`)

When a model reference is active:
- The quality chip automatically shows "Pro Model" with a lock icon and primary styling
- The dropdown is disabled with a tooltip on hover: "Pro model is required for model-reference generations to preserve identity"
- When the model is removed, quality reverts to whatever the user had selected before

**2. Update credit pricing to reflect model reference cost** (`CreditContext.tsx` + `Freestyle.tsx`)

New pricing structure:

| Scenario | Credits per image |
|----------|------------------|
| Standard (no model) | 4 |
| High quality (no model) | 10 |
| With model reference (any quality) | 12 |
| With model + scene references | 15 |
| Video | 30 |

Update `calculateCost` to accept an optional `hasModel` and `hasScene` parameter, and update the Freestyle page's local `creditCost` calculation to match.

**3. Show credit breakdown in Generate button tooltip** (`Freestyle.tsx`)

The Generate button already shows the total cost like "Generate (12)". Add a hover tooltip that breaks down the cost: "12 credits: Model reference (12/image) x 1 image"

### Technical Details

**Files changed:**

- `src/components/app/freestyle/FreestyleSettingsChips.tsx`
  - Accept `hasModelSelected: boolean` prop
  - When true: override quality chip to show "Pro Model" with lock icon, disable dropdown, add tooltip explaining why
  - Visual: primary-colored chip with lock icon instead of chevron

- `src/contexts/CreditContext.tsx`
  - Extend `calculateCost` signature: `(settings: { count: number; quality: ImageQuality; mode: GenerationMode; hasModel?: boolean; hasScene?: boolean }) => number`
  - New logic: if `hasModel`, base cost = 12/image; if `hasModel && hasScene`, base cost = 15/image; otherwise keep existing 4/10 standard/high logic

- `src/pages/Freestyle.tsx`
  - Update `creditCost` calculation (line 136) to use model/scene-aware pricing instead of just quality-based
  - Pass `hasModelSelected={!!selectedModel}` to `FreestyleSettingsChips`
  - Add tooltip to Generate button showing cost breakdown

- `src/pages/Generate.tsx`
  - Update `calculateCost` call to pass `hasModel` when in virtual-try-on mode (already charges 8, but should be consistent)

### No other changes
- No database changes
- No edge function changes
- No new dependencies
