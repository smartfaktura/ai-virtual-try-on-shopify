

# Fixes: Auto Button UX, Default Behavior, and Results Image Display

## Issues from Screenshots

1. **"Auto (Recommended)" looks like a section header, not a button** — it's a full-width block with subtle styling that doesn't communicate clickability or selection state clearly. Users may not realize it's interactive.

2. **What happens if user clicks nothing?** — Currently if no chips are selected, `details` stays as `INITIAL_DETAILS` (only aspectRatio, quality, imageCount). The prompt builder's `isAuto()` check treats empty/undefined values as "auto" and skips them, meaning the prompt gets no aesthetic direction at all — just the raw scene template. This is actually fine behavior, but "Auto" should be pre-applied by default so users see a clear selected state.

3. **Results images are zoomed/cropped** — The Results step uses `object-cover` on `aspect-square` containers. Since generated images may not be 1:1 (could be 4:5, 3:4, etc.), `object-cover` crops them. Combined with `getOptimizedUrl({ width: 400 })` resizing, users see a cropped close-up instead of the full generated image.

## Plan

### 1. Make "Auto" pre-selected by default and look like a proper button

**File**: `src/components/app/product-images/ProductImagesStep3Refine.tsx`

- Apply `AUTO_AESTHETIC_DEFAULTS` to the initial detail state so "Auto" is pre-selected when users enter the Refine step
- Restyle `AutoAestheticButton` to look like a proper selectable chip/toggle — not a full-width banner. Use the same chip styling as other options, or add a clear checkbox/radio indicator

**File**: `src/pages/ProductImages.tsx`

- Change `INITIAL_DETAILS` to include the Auto defaults so the prompt always has sensible values even if the user never touches Refine

### 2. Fix Results step image display — show full image, not cropped

**File**: `src/components/app/product-images/ProductImagesStep6Results.tsx`

- Change `object-cover` to `object-contain` so full generated images are visible
- Add `bg-muted` or `bg-white` behind the image so the contain gaps look clean
- Remove `getOptimizedUrl` width constraint (or increase to 800+) so the image isn't downscaled to a 400px thumbnail
- Remove the forced `aspect-square` container — use the image's natural aspect ratio, or use a consistent `aspect-[4/5]` that won't crop most outputs

### 3. Pre-apply Auto aesthetic defaults

**File**: `src/pages/ProductImages.tsx`

- Merge `AUTO_AESTHETIC_DEFAULTS` into `INITIAL_DETAILS`:
```typescript
const INITIAL_DETAILS: DetailSettings = {
  aspectRatio: '1:1', quality: 'high', imageCount: '1',
  backgroundTone: 'auto', negativeSpace: 'auto',
  surfaceType: 'auto', lightingStyle: 'soft-diffused',
  shadowStyle: 'natural', mood: 'auto', brandingVisibility: 'none',
};
```

## Files to Update

| File | Change |
|------|--------|
| `src/pages/ProductImages.tsx` | Pre-apply Auto aesthetic defaults in INITIAL_DETAILS |
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Restyle AutoAestheticButton to look like a proper selectable option |
| `src/components/app/product-images/ProductImagesStep6Results.tsx` | Fix image display: object-contain, remove forced aspect-square, increase optimization width |

