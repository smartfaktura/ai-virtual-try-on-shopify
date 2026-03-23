

# Fix Workflows Hub: Background Images Zoomed + Remove Try-On Badge

## Problems
1. **Background images for Product Listing Set and Virtual Try-On Set appear zoomed/cropped** on `/app/workflows` - the `WorkflowAnimatedThumbnail` uses `object-cover` which aggressively crops the result images inside `aspect-[3/4]` containers.
2. **Try-On badge** clutters the cards unnecessarily.

## Changes

### 1. `src/components/app/WorkflowAnimatedThumbnail.tsx` (line 742)

Change the background image from `object-cover` to `object-contain` with a `bg-muted` fallback so the full workflow result composition is visible without cropping:

```tsx
// From:
className={`absolute inset-0 w-full h-full object-cover ...`}

// To:
className={`absolute inset-0 w-full h-full object-contain bg-muted ...`}
```

This affects the default animated thumbnail renderer (the one used by Virtual Try-On Set and Product Listing Set). Carousel, Staging, and Upscale modes have their own renderers and won't be affected.

### 2. `src/components/app/WorkflowCardCompact.tsx` (lines 71-76)

Remove the Try-On badge block entirely.

### 3. `src/components/app/WorkflowCard.tsx` (lines 120-125)

Remove the Try-On badge block from the large card as well.

### Files
- `src/components/app/WorkflowAnimatedThumbnail.tsx` - line 742: `object-cover` → `object-contain bg-muted`
- `src/components/app/WorkflowCardCompact.tsx` - remove Try-On badge (lines 71-76)
- `src/components/app/WorkflowCard.tsx` - remove Try-On badge (lines 120-125)

