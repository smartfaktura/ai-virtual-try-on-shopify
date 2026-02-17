

## Fix Zoomed-In Hero Carousel Images

### Problem
The hero output images appear extremely zoomed in (showing only necks/chests instead of full model shots). This happens because `getOptimizedUrl` is called with `width: 250`, which makes Supabase resize the source image to 250px wide before serving it. When this small image is then displayed in a 150-180px card with `object-cover` and a 3:4 aspect ratio, the browser crops into the center of an already-small image, creating a "zoomed in" effect.

### Fix
Remove the width constraint from both `optimizeProduct` and `optimizeOutput` helpers. Use quality-only optimization instead, which preserves the original image dimensions and lets the browser's `object-cover` crop naturally from the full-resolution image.

### Technical Detail

**File: `src/components/landing/HeroSection.tsx`** (line 124-125)

Change:
```tsx
const optimizeProduct = (url: string) => getOptimizedUrl(url, { width: 200, quality: 70 });
const optimizeOutput = (url: string) => getOptimizedUrl(url, { width: 250, quality: 70 });
```

To:
```tsx
const optimizeProduct = (url: string) => getOptimizedUrl(url, { quality: 70 });
const optimizeOutput = (url: string) => getOptimizedUrl(url, { quality: 70 });
```

This follows the existing image optimization pattern documented in project memory: large gallery images use quality-only compression without width constraints to maintain correct aspect ratios and prevent distortion.

