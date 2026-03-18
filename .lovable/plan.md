

## Optimize Perspectives Mobile Sticky Bar

### Problem
The sticky generate bar at the bottom of the Perspectives page doesn't fit well on mobile. The layout uses `flex items-center justify-between` with the stats/badge on the left and button on the right, causing text overflow and cramped spacing on narrow screens (visible in the screenshot: "1 source × 0 angles × 1 ratio" badge gets squished).

### Changes

**`src/pages/Perspectives.tsx`** (lines 1024-1049):
- Stack the bar vertically on mobile: `flex flex-col sm:flex-row`
- Compact the left info section on mobile: hide the badge on mobile (`hidden sm:inline-flex`), fold the breakdown text into the button area
- Reduce padding on mobile: `p-3 sm:p-4`
- Show a condensed single-line summary on mobile instead of separate stats + badge: e.g. "3 images · 24 credits" only, with the full breakdown badge visible on desktop
- Make the button full-width on mobile: `w-full sm:w-auto`
- Reduce bottom offset on mobile for better thumb reach: `bottom-2 sm:bottom-4`

