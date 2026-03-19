

# Restore Quality Control (Standard / Pro)

## What changed

The Quality chip was previously removed, hardcoding everything to `'high'` (6 credits). The pricing logic in `enqueue-generation` already supports tiered pricing — `quality === 'high'` costs 6 credits, otherwise 4 credits (when no model/scene selected). We just need to re-expose the control.

## Changes

### 1. `src/components/app/freestyle/FreestyleSettingsChips.tsx`
- Add a `quality` prop (`'standard' | 'high'`) and `onQualityChange` callback
- Add a new Quality chip (similar to the Camera Style chip) with two options:
  - **Standard** — 4 credits/image, faster
  - **Pro** — 6 credits/image, higher detail
- Place it in Group 3 (Output settings) next to Aspect Ratio and Camera Style chips

### 2. `src/pages/Freestyle.tsx`
- Add `quality` state back: `useState<'standard' | 'high'>('standard')`
- Pass `quality` to `FreestyleSettingsChips`
- Use the `quality` value in the generation payload and enqueue call instead of hardcoded `'high'`
- Note: when a model or scene is selected, pricing is always 6 credits regardless of quality setting (existing logic in `calculateCreditCost`)

### 3. No backend changes needed
The `enqueue-generation` function already handles quality-based pricing at line 36:
```
perImage = (hasModel || hasScene || quality === 'high') ? 6 : 4;
```

