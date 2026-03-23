

# Zoom Out Workflow Background Images

## Problem
The workflow card backgrounds are too zoomed/cropped because `object-cover` on `aspect-[2/3]` containers aggressively crops the images. The user wants to see more of each background image.

## Solution
Change the aspect ratio from `aspect-[2/3]` (very tall) back to `aspect-[3/4]` for desktop/non-modal cards, giving the backgrounds more room. For mobile compact, keep `aspect-[2/3]` but add `object-position` adjustments. Also add a slight scale-down transform on the background image to show more content.

## Changes

### 1. `src/components/app/WorkflowCardCompact.tsx` (line 52)

Change aspect ratios to be less tall/aggressive:

```
// From:
modalCompact ? "aspect-[3/4]" : mobileCompact ? "aspect-[2/3]" : "aspect-[2/3]"

// To:
modalCompact ? "aspect-[3/4]" : mobileCompact ? "aspect-[3/4]" : "aspect-[4/5]"
```

- **Desktop hub**: `aspect-[2/3]` → `aspect-[4/5]` (wider, less cropping)
- **Mobile hub**: `aspect-[2/3]` → `aspect-[3/4]` (slightly wider)
- **Modal**: stays `aspect-[3/4]`

### 2. `src/components/app/WorkflowAnimatedThumbnail.tsx` (line 746)

Add a slight scale-down transform to show more of the image within the container:

```tsx
// From:
transform: 'translateZ(0)',

// To:
transform: 'translateZ(0) scale(0.95)',
```

This effectively "zooms out" by 5%, showing more of the background without changing the layout.

### Files
- `src/components/app/WorkflowCardCompact.tsx` — line 52
- `src/components/app/WorkflowAnimatedThumbnail.tsx` — line 749

