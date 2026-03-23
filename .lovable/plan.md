

# Fix Animation Overlaps in Modal + Product Image Zoom

## Problems
1. **Workflow card animations overlap the background** - In the small `aspect-square` modal cards, the floating chips (Product, Model, Scene, badges) cover most of the background image, making it hard to see what the workflow actually produces.
2. **Product images zoomed/cropped** - Step 2 product grid uses `object-cover` on `aspect-square`, which crops non-square product images (e.g. tall bottles get zoomed into the middle).

## Solution

### 1. `src/components/app/WorkflowCardCompact.tsx` (~2 lines)

When `modalCompact` is true, **don't show animated overlays** - just show the static background image. The cards are too small in the modal for the floating elements to be readable anyway.

```tsx
// Change the thumbnail rendering for modalCompact
{scene && !modalCompact ? (
  <WorkflowAnimatedThumbnail scene={scene} isActive={isVisible} compact mobileCompact={mobileCompact} />
) : (
  <img
    src={scene?.background || workflow.preview_image_url || imgFallback}
    alt={workflow.name}
    className="w-full h-full object-cover"
  />
)}
```

This shows the workflow result image (the background from animation data) as a clean static preview - no overlapping chips.

### 2. `src/components/app/StartWorkflowModal.tsx` (~1 line)

Change product image grid from `object-cover` to `object-contain` with a subtle background so products display fully without cropping:

```tsx
// Line 224: change object-cover to object-contain
className="w-full h-full object-contain p-1"
```

### Files
- `src/components/app/WorkflowCardCompact.tsx` - static image for `modalCompact` instead of animated overlays
- `src/components/app/StartWorkflowModal.tsx` - `object-contain` for product thumbnails

