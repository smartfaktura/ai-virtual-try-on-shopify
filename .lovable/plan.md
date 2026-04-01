

# Fix Zoomed-In Images on SEO Landing Page

## Problem
All images are forced into `aspect-[3/4]` containers with `object-cover`, cropping images that have different native aspect ratios (1:1, 16:9, 4:5, etc.) — making them appear zoomed in on faces/details.

## Solution
Match the pattern used by `DiscoverCard` default rendering: use `object-contain` on a neutral background instead of `object-cover` in forced containers, or remove the forced aspect ratio and let images render at natural dimensions.

## Changes in `src/pages/seo/AIProductPhotographyEcommerce.tsx`

### 1. Hero Grid (lines ~154-166)
- Remove forced `aspect-[3/4]` from wrapper
- Use each preset's own `aspect_ratio` field for the `ShimmerImage` `aspectRatio` prop (converting `3:4` → `3/4`)
- Change `object-cover` → `object-contain` with a subtle `bg-muted` background, OR keep `object-cover` but use the image's actual aspect ratio instead of forcing 3:4

### 2. Outcome Tabs Image (lines ~216-223)
- Same fix: use the matched preset's `aspect_ratio` instead of forcing `aspect-[3/4]`
- Switch to `object-contain` so the full product is visible

### 3. Discovery Showcase Grid (lines ~366-384)
- Remove forced `aspect-[3/4]` from the card wrapper
- Let images render at natural dimensions with `w-full h-auto` (masonry-like), or use `object-contain` with a uniform container

### Approach
Use `object-contain` inside a consistent container (keeps the grid tidy) with `bg-muted` as backdrop for any letterbox areas. This matches how premium product imagery is typically shown — full product visible, no cropping.

