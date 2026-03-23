

# Zoom Out Workflow Backgrounds + Taller Portrait Containers

## Problem
Virtual Try-On Set and Product Listing Set background images are too zoomed in because `object-cover` crops aggressively in the current aspect ratios. The containers are too square-ish (modal: `aspect-square`, desktop: `aspect-[3/4]`). User wants more portrait-like proportions showing more of the image.

## Changes

### 1. `src/components/app/WorkflowCardCompact.tsx` (line 52)

Make containers taller/more portrait-like across all contexts:

```tsx
// From:
modalCompact ? "aspect-square" : mobileCompact ? "aspect-[2/3]" : "aspect-[3/4]"

// To:
modalCompact ? "aspect-[3/4]" : mobileCompact ? "aspect-[2/3]" : "aspect-[2/3]"
```

- **Modal**: `aspect-square` → `aspect-[3/4]` (taller, more portrait)
- **Desktop hub**: `aspect-[3/4]` → `aspect-[2/3]` (even taller, matching mobile)
- **Mobile**: stays `aspect-[2/3]` (already good)

This gives the background images more vertical space so `object-cover` crops less.

### 2. `src/components/app/workflowAnimationData.tsx`

Adjust `objectPosition` to show more of the full composition:

- **Virtual Try-On Set** (line 41): `'center'` → `'center 30%'` — shifts crop window up slightly to show more of the outfit/body
- **Product Listing Set** (line 66): add `objectPosition: 'center 40%'` — shows more of the full bottle from top

### Files
- `src/components/app/WorkflowCardCompact.tsx` — line 52, taller aspect ratios
- `src/components/app/workflowAnimationData.tsx` — lines 41, 66, adjust objectPosition

