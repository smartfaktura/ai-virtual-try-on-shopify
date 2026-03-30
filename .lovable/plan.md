

# Fix Broken Images in Product Category Showcase

## Problem
Fashion & Apparel and Beauty categories reference local paths like `/images/showcase/fashion-activewear-track.jpg` that don't exist in the project. These return 404, leaving the cards blank. Food & Drinks works because all its images use `s()` (Supabase storage). Home & Living starts with one broken local path but recovers when the timer cycles to the Supabase images.

## Changes

### File: `src/components/landing/ProductCategoryShowcase.tsx`

**1. Convert all local `/images/showcase/` paths to Supabase storage URLs using the `s()` helper**

Replace every `/images/showcase/...` path with `s('...')`, matching the filename pattern already used for the working images. All these assets should already exist in the `landing-assets/showcase/` bucket since they were originally uploaded there.

```ts
// Before:
'/images/showcase/fashion-activewear-track.jpg',
// After:
s('fashion-activewear-track.jpg'),
```

Apply to all 10 local paths across Fashion (5), Beauty (5), and Home (1).

**2. Add error fallback in CategoryCard**

If the current image errors out, auto-advance to the next image so the card never stays blank:

```tsx
<ShimmerImage
  ...
  onError={() => advance()}
/>
```

This ensures that on slow connections, if any single image fails, the card skips to the next one rather than showing a blank shimmer indefinitely.

## Files Changed
- `src/components/landing/ProductCategoryShowcase.tsx`

