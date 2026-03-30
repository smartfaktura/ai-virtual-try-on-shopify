

## Fix: Hero Carousel Dots Not Tracking Scroll

### Root Cause

The mobile carousel container has `px-4` (16px padding) which offsets all scroll positions. The dot index calculation `Math.round(el.scrollLeft / itemWidth)` doesn't account for this padding, so the first item maps to index 0 only when scrollLeft is near 0, but subsequent items are off by the padding amount — causing dots to lag or not update correctly.

### Fix

**File: `src/components/landing/HeroSection.tsx`**

1. **`updateScrollState` function (line ~190)** — Subtract the container's left padding before calculating the dot index:
   ```
   const padding = parseFloat(getComputedStyle(el).paddingLeft) || 0;
   const idx = Math.round((el.scrollLeft - padding) / itemWidth);
   ```
   Clamped to `[0, outputs.length - 1]` as before.

2. **Dot click handler (line ~344)** — Add padding offset when scrolling to a specific dot:
   ```
   const padding = parseFloat(getComputedStyle(el).paddingLeft) || 0;
   el.scrollTo({ left: i * itemWidth + padding, behavior: 'smooth' });
   ```

These two changes ensure the scroll-position-to-dot mapping and the dot-click-to-scroll-position mapping are both correct regardless of container padding.

### Files
- `src/components/landing/HeroSection.tsx` (2 small edits in existing functions)

