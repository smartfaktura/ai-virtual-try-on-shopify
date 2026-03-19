

# Add Credit Calculation Summary to Each Workflow Config Step

## Problem
On the per-workflow configuration steps (step 3+), users have no visibility into how many images will be generated or how many credits it will cost. The credit estimate only appears on the Schedule step. Users selecting products (1, 2, 3, 4...) and formats (1:1, 4:5, etc.) have no feedback on cost impact.

## Solution
Add a compact credit/image summary card at the bottom of each per-workflow config step showing:
- Number of selected products
- Number of selected formats
- Images per product (from `imagesPerDrop`)
- Total images and credit cost for this workflow

Also add a running total across all workflows.

## Changes

**File: `src/components/app/CreativeDropWizard.tsx`**

At the bottom of the per-workflow config section (just before the closing `</div>` around line 1260), add a compact info banner showing:

```
┌──────────────────────────────────────────────┐
│ 📊 This workflow                             │
│ 3 products × 10 images × 2 formats = 60 img │
│ 60 × 6 credits = 360 credits                │
│                                              │
│ All workflows total: 720 credits             │
└──────────────────────────────────────────────┘
```

Implementation details:
1. Inside the `isConfigStep && configWorkflow` block (line ~878-1262), after the last settings section (~line 1259), insert a `Card` component
2. Calculate per-workflow cost using: `selectedProductIds.size × imagesPerDrop × formatCount × 6`
3. Show the total across all selected workflows using the existing `costEstimate.totalCredits`
4. Use the existing `costEstimate.breakdown` to find the current workflow's breakdown entry
5. Style as a subtle muted card matching the existing Credit Estimate card on the schedule step

This gives users immediate feedback as they toggle formats on/off and see the cost impact of their product selection count.

