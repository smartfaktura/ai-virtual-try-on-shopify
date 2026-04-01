

# Fix Image Rendering on SEO Ecommerce Page

## Problem
Images are rendering at natural dimensions inside a CSS `columns` masonry layout. Since the source images are tall portraits (likely 1024x1536), each image becomes a massive vertical strip spanning the full viewport height. The middle image isn't even a product — it's a scene/background.

## Root Cause
The previous fix removed `object-cover` and forced aspect ratios, letting images render at natural ratio. But these AI-generated images are very tall portraits, so "natural ratio" = enormous vertical strips.

## Solution
Use a **standard CSS grid with controlled aspect-ratio cards** and `object-cover` — but use a less aggressive ratio than 3/4. Use `aspect-[4/5]` which works well for both portrait and landscape source images without extreme cropping. Add `object-top` to keep product/face visible.

Replace the CSS `columns` masonry layout with a regular `grid` for predictable, controlled sizing.

### Changes in `src/pages/seo/AIProductPhotographyEcommerce.tsx`

**Hero grid** (line ~201):
- Replace `columns-2 md:columns-3` masonry → `grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4`
- Remove `break-inside-avoid`, `space-y-*`
- Each card: `aspect-[4/5] rounded-2xl overflow-hidden` wrapper
- Image: remove `wrapperClassName="h-auto"`, add `className="w-full h-full object-cover object-top"`

**Outcome tabs** (line ~266-274):
- Wrap image in `aspect-[4/5]` container
- Image: `className="w-full h-full object-cover object-top"` instead of `h-auto`

**Showcase gallery** (line ~421):
- Replace `columns-2 md:columns-3 lg:columns-4` → `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3`
- Remove `space-y-3`, `break-inside-avoid`
- Each card: `aspect-[4/5]` wrapper with `object-cover object-top`

This is the standard ecommerce grid pattern — controlled card sizes with cover-fit images. No more viewport-height strips.

## Files
| File | Change |
|------|--------|
| `src/pages/seo/AIProductPhotographyEcommerce.tsx` | Replace masonry columns with grid + aspect-[4/5] cards |

