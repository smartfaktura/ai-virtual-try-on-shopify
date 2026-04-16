

# Move Badge Pills Lower on Workflow Cards

## Problem
The badge pills ("1000+ Scenes", "Full Control", "40+ Models", "Auto Fit") on the Product Visuals and Virtual Try-On cards sit too high on the image. User wants them closer to the bottom with a more spacious but not overly gapped feel.

## Changes

### File: `src/components/app/workflowAnimationData.tsx`

Adjust the `position` values for all badge elements across the main workflow scenes. Move them from `bottom: 28%/16%` to `bottom: 14%/4%` so they sit near the bottom of the card image with comfortable spacing between them (~10% gap instead of 12%).

**Product Visuals** (lines 80-86):
- "1000+ Scenes": `bottom: '28%'` → `bottom: '14%'`
- "Full Control": `bottom: '16%'` → `bottom: '4%'`

**Virtual Try-On Set** (lines 102-108):
- "40+ Models": `bottom: '28%'` → `bottom: '14%'`
- "Auto Fit": `bottom: '16%'` → `bottom: '4%'`

**Product Listing Set** (lines 123-129):
- "30+ Scenes": `bottom: '28%'` → `bottom: '14%'`
- "1 Click": `bottom: '16%'` → `bottom: '4%'`

Apply the same pattern to any remaining workflow scenes with badge elements at the old positions.

### Files
- `src/components/app/workflowAnimationData.tsx` — update badge position values

