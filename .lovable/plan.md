

# Add Badge Pills to Virtual Try-On Set Workflow Animation

## Problem
The "Virtual Try-On Set" workflow card has no overlay badge/pill elements, while "Product Listing Set" has "30+ Scenes" and "1 Click", and "Selfie / UGC Set" has product and "UGC Style" badges. This makes Virtual Try-On look inconsistent.

## Change

### `src/components/app/workflowAnimationData.tsx`

Add two badge elements to the `'Virtual Try-On Set'` scene's `elements` array, matching the style of other workflows:

- **Top-left badge**: `"40+ Models"` with `Users` icon — highlights the diverse model library
- **Bottom-left badge**: `"Auto Fit"` with `Shirt` icon (or `ScanFace`) — highlights the realistic fitting feature

```tsx
elements: [
  {
    type: 'badge', label: '40+ Models', icon: <Users className="w-3 h-3" />,
    position: { top: '10%', left: '6%' }, enterDelay: 0, animation: 'slide-left',
  },
  {
    type: 'badge', label: 'Auto Fit', icon: <Maximize2 className="w-3 h-3" />,
    position: { bottom: '18%', left: '6%' }, enterDelay: 0, animation: 'slide-up',
  },
],
```

This mirrors the exact pattern used by Product Listing Set and keeps the visual rhythm consistent across all three top workflow cards.

