

# Fix Grey Bar on Discover Image Cards

## Problem
Images in the `/app/discover` masonry grid show a grey bar because the `ShimmerImage` wrapper enforces a `3/4` aspect ratio, but the `<img>` uses `h-auto` — leaving unfilled space that shows the `bg-muted` background.

## Fix
In `src/components/app/DiscoverCard.tsx`, line 63: change the image className from `w-full h-auto block` to `w-full h-full object-cover block`. This ensures the image fills the entire 3:4 container, cropping slightly if needed rather than leaving grey gaps.

**One line change, one file.**

