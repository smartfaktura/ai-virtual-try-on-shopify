

# Recent Creations: 4-Column Grid, Clean Hover

## Changes

### `src/components/app/RecentCreationsGallery.tsx`

1. **4 items per row grid instead of horizontal scroll**: Replace the `flex overflow-x-auto` carousel with a `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3` layout. Remove the gradient edge overlays and `flex-shrink-0 w-[180px]` sizing. Limit to 8 items max (2 rows of 4 on desktop).

2. **Remove label/date/subtitle from the bottom overlay** (lines 227-231): Delete the gradient overlay with `item.label`, `item.subtitle`, and `item.date`. On hover, show only the "View" button — no text metadata.

3. **Update skeleton** to match 4-column grid layout instead of horizontal flex.

4. **Remove** the `handleContainerClick` wrapper div and gradient overlays since there's no carousel anymore.

### File
- `src/components/app/RecentCreationsGallery.tsx`

