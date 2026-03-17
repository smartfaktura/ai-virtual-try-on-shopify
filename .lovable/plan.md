

## Optimize Library Empty State for Mobile

### Problem
On mobile, the two CTA buttons ("Explore Workflows" and "Freestyle Generation") sit side-by-side and overflow the screen width.

### Changes

**`src/components/app/EmptyStateCard.tsx`**

1. Change the actions container from `flex items-center gap-3` to `flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto` in the `teamMember` branch (line 56)
2. Make each button full-width on mobile: add `w-full sm:w-auto` to Button className (line 63)
3. Reduce vertical padding on mobile: change `py-20 sm:py-28` to `py-12 sm:py-28` (line 44)

This stacks the buttons vertically on small screens and keeps them side-by-side on tablet/desktop.

