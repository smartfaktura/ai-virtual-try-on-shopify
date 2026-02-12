
## Limit Discover Grid to 4 Columns Maximum

### Problem
The Discover page masonry grid currently shows up to 5 columns on screens wider than 1280px. The user wants a maximum of 4 columns.

### Change

**File: `src/pages/Discover.tsx`** -- Update the `useColumnCount` hook:
- Remove the 5-column breakpoint entirely
- Cap the maximum at 4 columns for screens >= 1024px
- Keep 2 columns on mobile (<640px) and 3 columns on tablet (640-1023px)

Updated breakpoints:
- < 640px: 2 columns
- 640px - 1023px: 3 columns  
- >= 1024px: 4 columns (was previously 4 at 1024-1279px, then 5 at 1280px+)
