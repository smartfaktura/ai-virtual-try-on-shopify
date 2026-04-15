

# Make Brand Models card always clickable and navigate to /app/models

## Problem
The Brand Models card in the model selector popover is `disabled={!isPaidPlan}`, preventing free-plan users from clicking it. The user wants it to always navigate to `/app/models`.

## Changes

**File: `src/components/app/freestyle/ModelSelectorChip.tsx`**

1. **Update `handleBrandModelClick`** (line 79-84): Remove the `isPaidPlan` guard — always navigate to `/app/models`
2. **Remove `disabled={!isPaidPlan}`** (line 119): Make the button always enabled
3. **Update card styling** (lines 120-125): Remove the `cursor-not-allowed` / `opacity-50` / `grayscale` conditional — always use the clickable style (`border-dashed border-primary/30 hover:border-primary/50 cursor-pointer`)

