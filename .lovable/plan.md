

# Fix Discover Masonry: Show Natural Image Sizes

## Problem
The previous fix forced all images to a `3/4` aspect ratio via `ShimmerImage`, making them all the same height. The Discover page uses a masonry layout where images should display at their natural aspect ratio for visual variety.

## Fix
In `src/components/app/DiscoverCard.tsx`, remove the hardcoded `aspectRatio="3/4"` from the non-override `ShimmerImage` branch (line 65). Without a fixed aspect ratio, each image will load at its natural dimensions, and the masonry column layout will flow correctly.

The `aspectRatioOverride` branch (used by Dashboard's uniform grid) stays unchanged — it correctly forces `3/4` there.

**One line removal, one file.**

### Technical Detail
- **File**: `src/components/app/DiscoverCard.tsx`, line 65
- **Change**: Remove `aspectRatio="3/4"` prop from `ShimmerImage`
- The `object-cover` + `h-full` classes become irrelevant without a fixed container height — change to `w-full h-auto` so the image sizes naturally, eliminating both the grey bar and the forced uniform sizing

