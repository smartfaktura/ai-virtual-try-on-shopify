

# Fix Workflow Animation Background + Product Image Display

## Problem

The last change switched `WorkflowAnimatedThumbnail` background from `object-cover` to `object-contain`. This breaks the animated workflow cards on `/app/workflows` because:
- The animated overlay elements (product chips, model avatars, scene badges) are positioned relative to a **filled** background
- `object-contain` leaves empty space around the image, so overlays float over blank areas
- The animation system was designed around `object-cover` filling the container

The product images in the modal are a separate issue - they use `object-contain` which is correct.

## Changes

### 1. `src/components/app/WorkflowAnimatedThumbnail.tsx` (line 742)

**Revert** the background image back to `object-cover` (remove `bg-muted`). The animated cards need the background to fill the container so overlays align properly:

```tsx
// Revert to:
className={`absolute inset-0 w-full h-full object-cover transition-opacity ...`}
```

### 2. `src/components/app/WorkflowCardCompact.tsx` (line 57)

The **modal static images** (when `modalCompact` is true, no animation) stay as `object-contain bg-muted/50` - this is correct for the small modal cards where we want to show the full image without cropping.

No change needed here.

### Summary
- **Animated cards** (`/app/workflows`): `object-cover` (revert) - overlays need filled background
- **Modal static cards** (StartWorkflowModal): `object-contain` - show full image, no animation
- **Product thumbnails** (modal step 2): `object-contain` - show full product without cropping

### File
- `src/components/app/WorkflowAnimatedThumbnail.tsx` - line 742 only, revert to `object-cover`

